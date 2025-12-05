const crypto = require('crypto');
const { SECURITY, ALLOWED_USERS } = require('../config/telegram');

class SecurityManager {
  constructor() {
    this.activeSessions = new Map();
    this.rateLimitMap = new Map();
  }

  // 사용자 인증
  authenticateUser(userId) {
    if (ALLOWED_USERS.length === 0) {
      // 허용 목록이 비어있으면 모든 사용자 허용 (개발 모드)
      console.warn('⚠️ 경고: 사용자 허용 목록이 비어있습니다. 프로덕션에서는 반드시 설정하세요.');
      return true;
    }
    
    return ALLOWED_USERS.includes(userId.toString());
  }

  // 세션 관리
  createSession(userId) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const session = {
      userId,
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      tasks: []
    };
    
    this.activeSessions.set(userId, session);
    return sessionId;
  }

  // 세션 유효성 검사
  validateSession(userId) {
    const session = this.activeSessions.get(userId);
    if (!session) return false;
    
    const now = Date.now();
    if (now - session.lastActivity > SECURITY.SESSION_TIMEOUT) {
      this.activeSessions.delete(userId);
      return false;
    }
    
    session.lastActivity = now;
    return true;
  }

  // Rate Limiting
  checkRateLimit(userId) {
    const now = Date.now();
    const userLimits = this.rateLimitMap.get(userId) || { requests: [], blockedUntil: 0 };
    
    // 차단 상태 확인
    if (userLimits.blockedUntil > now) {
      return {
        allowed: false,
        resetIn: userLimits.blockedUntil - now,
        reason: 'Rate limit exceeded'
      };
    }
    
    // 시간 윈도우 내 요청 필터링
    const window = SECURITY.RATE_LIMIT_PER_USER?.window || 60000;
    const maxRequests = SECURITY.RATE_LIMIT_PER_USER?.max || 10;
    
    userLimits.requests = userLimits.requests.filter(timestamp => now - timestamp < window);
    
    if (userLimits.requests.length >= maxRequests) {
      // 차단 설정 (5분)
      userLimits.blockedUntil = now + 5 * 60 * 1000;
      this.rateLimitMap.set(userId, userLimits);
      
      return {
        allowed: false,
        resetIn: 5 * 60 * 1000,
        reason: 'Too many requests'
      };
    }
    
    // 요청 기록
    userLimits.requests.push(now);
    this.rateLimitMap.set(userId, userLimits);
    
    return {
      allowed: true,
      remaining: maxRequests - userLimits.requests.length
    };
  }

  // URL 검증
  validateUrl(url) {
    try {
      const parsedUrl = new URL(url);
      
      // 프로토콜 검사
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { valid: false, reason: 'Invalid protocol' };
      }
      
      // 차단된 URL 패턴 검사
      for (const pattern of SECURITY.BLOCKED_URLS) {
        if (url.includes(pattern)) {
          return { valid: false, reason: 'Blocked URL pattern' };
        }
      }
      
      // 허용된 도메인 검사 (설정된 경우)
      if (SECURITY.ALLOWED_DOMAINS && SECURITY.ALLOWED_DOMAINS.length > 0) {
        const domain = parsedUrl.hostname;
        const isAllowed = SECURITY.ALLOWED_DOMAINS.some(allowed => 
          domain === allowed || domain.endsWith(`.${allowed}`)
        );
        
        if (!isAllowed) {
          return { valid: false, reason: 'Domain not allowed' };
        }
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  // 민감한 정보 마스킹
  maskSensitiveData(text) {
    if (!SECURITY.MASK_SENSITIVE_DATA) return text;
    
    // 이메일 마스킹
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
    
    // 전화번호 마스킹 (한국 번호 형식)
    text = text.replace(/010-?\d{4}-?\d{4}/g, '010-****-****');
    text = text.replace(/\d{2,3}-\d{3,4}-\d{4}/g, '***-****-****');
    
    // 주민등록번호 패턴
    text = text.replace(/\d{6}-?\d{7}/g, '******-*******');
    
    // 신용카드 번호 패턴
    text = text.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '****-****-****-****');
    
    // API 키 패턴
    text = text.replace(/[a-zA-Z0-9]{32,}/g, (match) => {
      if (match.length > 32) {
        return match.substring(0, 8) + '...' + match.substring(match.length - 8);
      }
      return match;
    });
    
    return text;
  }

  // 작업 권한 검사
  checkTaskPermission(userId, taskType) {
    const permissions = {
      browse: true,
      analyze: true,
      screenshot: true,
      automate: this.isAdminUser(userId),
      monitor: this.isAdminUser(userId),
      extract: true
    };
    
    return permissions[taskType] || false;
  }

  // 관리자 권한 확인
  isAdminUser(userId) {
    // 환경 변수에서 관리자 목록 확인
    const adminUsers = process.env.ADMIN_TELEGRAM_USERS?.split(',') || [];
    return adminUsers.includes(userId.toString());
  }

  // 로그 기록
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId,
      action: event.action,
      result: event.result,
      details: event.details
    };
    
    // 실제 환경에서는 데이터베이스나 로그 서비스에 저장
    console.log('[SECURITY]', JSON.stringify(logEntry));
    
    // 의심스러운 활동 감지
    if (event.type === 'suspicious_activity') {
      this.handleSuspiciousActivity(event);
    }
  }

  // 의심스러운 활동 처리
  handleSuspiciousActivity(event) {
    // 3회 이상 의심스러운 활동 시 차단
    const userId = event.userId;
    const violations = this.getViolationCount(userId);
    
    if (violations >= 3) {
      // 사용자 차단
      this.blockUser(userId, '의심스러운 활동 감지');
    }
  }

  // 위반 횟수 조회
  getViolationCount(userId) {
    // 실제로는 데이터베이스에서 조회
    return 0;
  }

  // 사용자 차단
  blockUser(userId, reason) {
    // 차단 목록에 추가
    console.error(`사용자 차단: ${userId} - ${reason}`);
    // 실제로는 데이터베이스에 저장
  }

  // 작업 검증
  validateTask(task) {
    // SQL Injection 방지
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
      /(--|\/\*|\*\/|;|'|")/
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(task)) {
        return { valid: false, reason: 'Potential SQL injection detected' };
      }
    }
    
    // XSS 방지
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(task)) {
        return { valid: false, reason: 'Potential XSS detected' };
      }
    }
    
    // 명령어 주입 방지
    const cmdPatterns = [
      /[;&|`$()]/,
      /\b(rm|del|format|shutdown|reboot)\b/i
    ];
    
    for (const pattern of cmdPatterns) {
      if (pattern.test(task)) {
        return { valid: false, reason: 'Potential command injection detected' };
      }
    }
    
    return { valid: true };
  }
}

module.exports = new SecurityManager();