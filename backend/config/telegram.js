// Telegram Bot 설정
module.exports = {
  // 봇 토큰 (BotFather에서 발급)
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  
  // 허용된 사용자 ID 목록 (보안)
  ALLOWED_USERS: process.env.ALLOWED_TELEGRAM_USERS?.split(',') || [],
  
  // 웹훅 설정 (선택사항)
  WEBHOOK: {
    enabled: process.env.USE_WEBHOOK === 'true',
    url: process.env.WEBHOOK_URL,
    port: process.env.WEBHOOK_PORT || 3001,
    secretPath: process.env.WEBHOOK_SECRET_PATH || `/telegram/${process.env.TELEGRAM_BOT_TOKEN}`
  },
  
  // 봇 설정
  BOT_CONFIG: {
    // 폴링 설정
    polling: {
      interval: 1000,
      autoStart: true,
      params: {
        timeout: 30
      }
    },
    
    // 파일 업로드 제한
    fileOptions: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      fileTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
  },
  
  // 명령어 정의
  COMMANDS: [
    { command: 'start', description: '봇 시작 및 소개' },
    { command: 'browse', description: '웹사이트 방문 - /browse [URL]' },
    { command: 'task', description: '자유 작업 수행 - /task [설명]' },
    { command: 'analyze', description: '페이지 분석 - /analyze [URL]' },
    { command: 'screenshot', description: '현재 페이지 스크린샷' },
    { command: 'status', description: '현재 작업 상태 확인' },
    { command: 'stop', description: '진행 중인 작업 중지' },
    { command: 'help', description: '도움말 표시' }
  ],
  
  // 메시지 템플릿
  MESSAGES: {
    WELCOME: `
🤖 *AI 웹 자동화 에이전트*

웹사이트를 탐색하고 다양한 작업을 수행할 수 있습니다.

*주요 기능:*
• 웹페이지 자동 탐색
• 콘텐츠 분석 및 요약
• 폼 자동 작성
• 데이터 수집 및 모니터링

/help 명령어로 전체 기능을 확인하세요.
    `,
    
    UNAUTHORIZED: '❌ 접근 권한이 없습니다. 관리자에게 문의하세요.',
    
    ERROR_GENERIC: '❌ 작업 중 오류가 발생했습니다. 다시 시도해주세요.',
    
    TASK_STARTED: '🚀 작업을 시작합니다...',
    TASK_ANALYZING: '🔍 페이지를 분석 중입니다...',
    TASK_PROCESSING: '⚙️ 작업을 처리 중입니다...',
    TASK_COMPLETED: '✅ 작업이 완료되었습니다!',
    
    HELP: `
📚 *도움말*

*기본 명령어:*
• /browse [URL] - 웹사이트 방문
• /task [설명] - 자유 형식 작업
• /analyze [URL] - 페이지 심층 분석

*고급 기능:*
• /monitor [URL] [간격] - 페이지 모니터링
• /extract [URL] [선택자] - 데이터 추출
• /automate [시나리오] - 자동화 시나리오 실행

*예시:*
\`/task AI 트렌드 사이트에서 오늘의 뉴스 요약\`
\`/browse https://techcrunch.com\`
\`/analyze https://openai.com 새로운 기능 찾기\`

*팁:*
• 자연어로 작업을 설명하면 AI가 이해합니다
• 스크린샷은 자동으로 전송됩니다
• 복잡한 작업도 단계별로 수행합니다
    `
  },
  
  // 작업 제한 설정
  LIMITS: {
    MAX_CONCURRENT_TASKS: 3,
    MAX_TASK_DURATION: 5 * 60 * 1000, // 5분
    MAX_SCREENSHOTS_PER_TASK: 10,
    RATE_LIMIT_PER_USER: {
      window: 60 * 1000, // 1분
      max: 10 // 최대 10개 요청
    }
  },
  
  // 보안 설정
  SECURITY: {
    // 차단할 URL 패턴
    BLOCKED_URLS: [
      'localhost',
      '127.0.0.1',
      '192.168.',
      'file://',
      'chrome://',
      'about:'
    ],
    
    // 허용할 도메인 (비어있으면 모두 허용)
    ALLOWED_DOMAINS: [],
    
    // 민감한 정보 마스킹
    MASK_SENSITIVE_DATA: true,
    
    // 세션 타임아웃
    SESSION_TIMEOUT: 30 * 60 * 1000 // 30분
  }
};