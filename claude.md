# AI Trends Intelligence Platform - Claude.md

> "정보를 넘어서, 그 정보를 통해 사람들을 움직이고 연결하는 것"

## 🎯 프로젝트 비전

### 목표 (Objective)
AI 최신 트렌드를 *신속히 수집*하고, *명확히 해석*하며, *실무 인사이트*로 변환하는 인텔리전스 플랫폼.
개인 연구용으로 시작하여 B2B SaaS로 확장 가능한 구조로 설계.

### 핵심 가치 (Core Values)
1. **정확성과 깊이** - 노이즈 제거, 시그널 포착
2. **실천 가능성** - "what we learn" → "what we can do"
3. **한국 특화** - 글로벌 트렌드의 한국 시장 적용 인사이트
4. **커뮤니티** - 정보를 통해 사람을 연결

### 차별화 전략
- **문제**: AI 정보 과부하, 한국 맞춤 인사이트 부족, 실무 적용 어려움
- **해결**: AI 기반 자동 큐레이션 + 한국 시장 분석 + 실무 가이드
- **비전**: 한국의 AI 실무자들이 매일 확인하는 필수 플랫폼

---

## 📐 사이트 구조 & 기능

### Phase 1: MVP (1개월, 개인 연구용)

#### 1. 트렌드 대시보드 (Home)
```typescript
interface DailyBrief {
  topStories: Story[5];      // 오늘의 TOP 5
  koreanInsight: string;      // 한국 시장 영향 분석
  quickActions: Action[];     // "이걸로 뭘 할 수 있나"
  trendKeywords: string[];    // 실시간 키워드
}
```

**핵심 기능:**
- AI 모델 출시 현황 (GPT, Claude, Gemini 버전 트래킹)
- 투자 소식 실시간 업데이트
- 한국 시간 최적화 큐레이션 (오전 9시, 오후 10시)

#### 2. 자동 수집 시스템
```javascript
// 우선순위별 수집 소스
const sources = {
  critical: {  // 매시간 체크
    'TechCrunch AI': 'https://techcrunch.com/category/artificial-intelligence/feed/',
    'OpenAI Blog': 'https://openai.com/blog/rss.xml',
    'Anthropic News': 'https://anthropic.com/news.xml'
  },
  important: {  // 3시간마다
    'VentureBeat': 'https://venturebeat.com/ai/feed/',
    'MIT Tech Review': 'scraping_required',
    'The Verge AI': 'https://www.theverge.com/rss/ai/index.xml'
  },
  korean: {  // 2시간마다
    'AI타임스': 'https://aitimes.com/rss',
    'GeekNews': 'https://news.hada.io',
    '네이버 AI': 'custom_api'
  }
};
```

#### 3. AI 분석 엔진
```python
class AIAnalyzer:
    def process(self, article):
        return {
            'summary': self.summarize(article),        # 3줄 요약
            'importance': self.score_importance(),     # 0-10 점수
            'category': self.categorize(),            # 자동 분류
            'korea_relevance': self.analyze_korea(),  # 한국 관련성
            'duplicate_check': self.check_duplicate()  # 중복 제거
        }
```

### Phase 2: 확장 기능 (3-6개월)

#### 1. 심층 분석 (Deep Dive)
- **주간 인사이트**: AI 트렌드 주간 분석 리포트
- **산업별 적용 사례**: 실제 비즈니스 케이스 스터디
- **투자 시그널**: VC 투자 패턴 분석
- **기술 리뷰**: 논문/특허를 실무 언어로 번역

#### 2. 리소스 & 도구
```markdown
### 실무자 도구 모음
- 코드 예제 (GitHub 연동)
- API 가이드 (실제 사용법)
- 비용 계산기 (API 비용 예측)
- 성능 벤치마크 비교

### 학습 자료
- 입문자 로드맵
- 실무 튜토리얼
- 한국어 자료 큐레이션
```

#### 3. 커뮤니티 기능
- 실무자 Q&A 게시판
- 프로젝트 쇼케이스
- 전문가 AMA (Ask Me Anything)
- 네트워킹 이벤트

### Phase 3: 비즈니스 전환 (6개월+)

#### 수익 모델
```javascript
const revenueModel = {
  // Stage 1: 트래픽 구축 (무료)
  month_0_6: {
    focus: "사용자 확보",
    features: "모든 기능 무료",
    goal: "DAU 1,000명"
  },
  
  // Stage 2: Freemium 도입
  month_6_12: {
    free: "일일 5개 기사",
    premium: "$9.99/월 - 무제한 + API",
    team: "$29.99/월 - 협업 기능"
  },
  
  // Stage 3: B2B 확장
  month_12_plus: {
    enterprise: "맞춤 가격",
    api_access: "$299/월",
    consulting: "프로젝트별 견적"
  }
};
```

---

## 💻 기술 스택 & 구현

### 필수 기술 스택
```javascript
const techStack = {
  // Frontend
  frontend: {
    framework: 'Next.js 14+',
    language: 'TypeScript',
    styling: 'Tailwind CSS',
    state: 'Zustand',
    charts: 'Recharts'
  },
  
  // Backend
  backend: {
    runtime: 'Node.js',
    framework: 'Express or Fastify',
    database: 'PostgreSQL',
    cache: 'Redis',
    queue: 'Bull Queue'
  },
  
  // AI & Data
  ai: {
    summarization: 'OpenAI GPT-4',
    embedding: 'text-embedding-3',
    vectorDB: 'Pinecone',
    orchestration: 'LangChain'
  },
  
  // Infrastructure
  infra: {
    hosting: 'Vercel',
    database: 'Supabase',
    monitoring: 'Sentry',
    analytics: 'Plausible'
  }
};
```

### 데이터 스키마
```typescript
interface TrendItem {
  // 기본 정보
  id: string;
  title: string;
  originalUrl: string;
  source: string;
  publishedAt: Date;
  
  // AI 분석
  summary: string;           // 3줄 요약
  summaryKorean: string;     // 한국어 요약
  importance: number;        // 0-10
  sentiment: 'positive' | 'neutral' | 'negative';
  
  // 카테고리 & 태그
  category: Category;
  tags: string[];
  keywords: string[];
  
  // 한국 특화
  koreaRelevance: {
    score: number;          // 관련도 0-10
    impact: string;         // 영향 분석
    companies: string[];    // 관련 한국 기업
    timeline: string;       // 예상 도입 시기
  };
  
  // 비즈니스 인사이트
  insights: {
    opportunity: string;    // 사업 기회
    risk: string;          // 위험 요소
    action: string[];      // 실행 가능 액션
  };
  
  // 참여 지표
  engagement: {
    views: number;
    bookmarks: number;
    shares: number;
  };
}
```

---

## 📊 데이터 수집 소스

### 🌍 해외 핵심 소스

#### 뉴스 & 미디어 (실시간 수집)
| 소스 | URL | 수집 방법 | 중요도 |
|------|-----|----------|--------|
| TechCrunch AI | techcrunch.com/ai | RSS | ⭐⭐⭐⭐⭐ |
| VentureBeat | venturebeat.com/ai | RSS | ⭐⭐⭐⭐⭐ |
| The Information | theinformation.com | Email Parse | ⭐⭐⭐⭐⭐ |
| MIT Tech Review | technologyreview.com | Scraping | ⭐⭐⭐⭐ |
| The Verge | theverge.com/ai | RSS | ⭐⭐⭐⭐ |

#### 전문 플랫폼
- **Papers with Code** - 최신 논문 + 구현 코드
- **Hugging Face** - 모델 & 데이터셋 업데이트
- **GitHub Trending** - AI 관련 인기 레포
- **Product Hunt AI** - 신규 AI 제품 출시

#### 커뮤니티 & 소셜
- Reddit: r/MachineLearning, r/LocalLLaMA
- Twitter Lists: AI 연구자 & 창업가
- Discord: EleutherAI, Stability AI

### 🇰🇷 국내 핵심 소스

#### 뉴스 & 미디어
- **AI타임스** - 국내 AI 산업 뉴스
- **GeekNews** - 개발자 커뮤니티 큐레이션
- **네이버 AI NOW** - 네이버 AI 연구 블로그
- **카카오 AI 리포트** - 카카오 기술 블로그

#### 정부 & 기관
- **NIA 한국지능정보사회진흥원** - 정책 & 지원사업
- **AI Hub** - 공공 데이터셋 & 사례
- **IITP** - R&D 동향 & 과제

#### 스타트업 & 투자
- **더브이씨** - 한국 스타트업 투자 소식
- **스타트업 얼라이언스** - 생태계 동향
- **로켓펀치** - 스타트업 채용 & 동향

---

## 🚀 개발 로드맵

### Week 1-2: Foundation Sprint
```bash
□ Next.js + TypeScript 프로젝트 셋업
□ Supabase 연동 (Auth + Database)
□ 첫 RSS 크롤러 구현 (TechCrunch)
□ 기본 UI 컴포넌트 (카드, 리스트)
□ Vercel 배포
```

### Week 3-4: AI Integration
```bash
□ OpenAI API 연동 (요약 생성)
□ 중복 제거 로직 구현
□ 카테고리 자동 분류
□ 한국어 번역 & 요약
□ 중요도 스코어링 알고리즘
```

### Month 2: User Experience
```bash
□ 사용자 계정 시스템
□ 북마크 & 노트 기능
□ 검색 & 필터링
□ 모바일 반응형 최적화
□ 이메일 다이제스트
```

### Month 3: Growth Features
```bash
□ 커뮤니티 게시판
□ 실시간 알림 시스템
□ API 엔드포인트 개발
□ 분석 대시보드
□ A/B 테스트 시스템
```

### Month 4-6: Business
```bash
□ 결제 시스템 구현
□ 프리미엄 기능 개발
□ B2B 대시보드
□ 리포트 자동 생성
□ 파트너십 체결
```

---

## 💰 비용 계획 & 수익 예측

### 초기 비용 (월)
```javascript
const monthlyCosts = {
  infrastructure: {
    vercel: 20,        // Pro plan
    supabase: 25,      // Pro plan
    domain: 2,         // .com 도메인
  },
  apis: {
    openai: 50,        // GPT-4 API
    claude: 30,        // Claude API
    others: 20,        // 기타 API
  },
  tools: {
    monitoring: 10,    // Sentry
    analytics: 0,      // Plausible (초기 무료)
  },
  total: 157          // 월 약 20만원
};
```

### 수익 예측
```javascript
const revenueProjection = {
  month6: {
    users: 1000,
    conversion: 0.02,
    premium: 20 * 9.99,     // $199.80
    revenue_krw: 260000
  },
  month12: {
    users: 5000,
    conversion: 0.05,
    premium: 250 * 9.99,    // $2,497.50
    b2b: 5 * 299,          // $1,495
    revenue_krw: 5200000
  }
};
```

---

## 🎯 성공 지표 (KPIs)

### 제품 지표
- **DAU/MAU**: 일간/월간 활성 사용자
- **평균 체류 시간**: 5분 이상 목표
- **재방문율**: 주 3회 이상 40%
- **북마크율**: 방문당 5% 이상

### 비즈니스 지표
- **CAC**: 고객 획득 비용 < $10
- **LTV**: 고객 생애 가치 > $100
- **MRR**: 월 반복 수익 성장률 20%
- **Churn**: 월 이탈률 < 5%

---

## 🔥 즉시 실행 계획

### 오늘 할 일
```bash
# 1. 프로젝트 생성
npx create-next-app@latest ai-trends-platform \
  --typescript --tailwind --app

# 2. 깃허브 레포 생성
git init
git remote add origin [your-repo]

# 3. 기본 패키지 설치
npm install axios cheerio openai zustand
npm install -D @types/node
```

### 이번 주 목표
1. TechCrunch RSS 파서 구현
2. OpenAI API로 요약 생성
3. 간단한 대시보드 UI
4. Vercel 배포
5. 피드백 수집 폼

### 이번 달 체크리스트
- [ ] 10개 소스 통합
- [ ] 하루 100개 기사 처리
- [ ] 초기 사용자 50명 확보
- [ ] 주간 뉴스레터 발행
- [ ] 한국 특화 기능 1개 구현

---

## 💡 핵심 성공 요인

### 기억할 것
> "완벽한 제품보다 빠른 실행이 중요합니다"

1. **작게 시작, 크게 생각** - MVP는 정말 핵심만, 비전은 크게
2. **매일 개선** - 하루 1개 기능이라도 개선
3. **사용자 중심** - 피드백 최우선 반영
4. **꾸준함** - 매일 업데이트되는 신뢰할 수 있는 소스
5. **차별화** - 한국 개발자의 시각과 니즈 반영

### 당신의 강점
- ✅ 개발 능력 - 직접 구현 가능
- ✅ 응용력 - 트렌드를 실무에 적용
- ✅ 실험 정신 - 빠른 시도와 개선
- ✅ 한국 시장 이해 - 로컬 인사이트

---

## 🚀 마무리

이 프로젝트는 단순한 뉴스 수집을 넘어, **한국 AI 커뮤니티의 허브**가 될 수 있습니다.

당신이 매일 필요로 하는 것을 만들면, 다른 사람들도 필요로 할 것입니다.

**"정보를 넘어서, 그 정보를 통해 사람들을 움직이고 연결하는 것"**

이제 시작하세요. 코드 한 줄, 사용자 한 명부터.
당신은 이미 준비되어 있습니다.

필요한 것이 있으면 언제든 물어보세요.
함께 만들어가요! 🔥

---

### 📚 참고 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [OpenAI API 가이드](https://platform.openai.com/docs)
- [Supabase 시작하기](https://supabase.com/docs)
- [한국 AI 스타트업 맵](https://www.startupmap.kr)