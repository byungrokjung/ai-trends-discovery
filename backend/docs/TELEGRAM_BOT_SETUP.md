# 텔레그램 AI 웹 자동화 봇 설정 가이드

## 🚀 빠른 시작

### 1. 텔레그램 봇 생성

1. Telegram에서 [@BotFather](https://t.me/botfather) 검색
2. `/newbot` 명령어 입력
3. 봇 이름 입력 (예: AI Trend Agent)
4. 봇 사용자명 입력 (예: ai_trend_agent_bot)
5. 봇 토큰 저장 (예: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)

### 2. 환경 변수 설정

```bash
# .env 파일에 추가
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ALLOWED_USERS=123456789,987654321  # 텔레그램 사용자 ID (선택사항)
TELEGRAM_BOT_PORT=3001
```

### 3. 필요한 패키지 설치

```bash
npm install node-telegram-bot-api puppeteer
```

### 4. 봇 실행

```bash
# 개발 모드
npm run telegram-bot:dev

# 프로덕션 모드
npm run telegram-bot
```

## 📱 사용법

### 기본 명령어

- `/start` - 봇 시작 및 도움말
- `/analyze` - AI 트렌드 사이트 뉴스 분석
- `/visit [URL]` - 특정 웹사이트 방문
- `/task [설명]` - 자유로운 작업 요청
- `/stop` - 브라우저 세션 종료

### GitHub 명령어

- `/github trending [언어]` - GitHub 트렌딩 저장소 조회 (예: `/github trending python`)
- `/github analyze [owner/repo]` - 저장소 상세 분석 (예: `/github analyze facebook/react`)
- `/github search [쿼리]` - 코드 검색 (예: `/github search useEffect hook`)
- `/github topic [토픽]` - 토픽별 탐색 (예: `/github topic machine-learning`)

### 사용 예시

1. **AI 트렌드 뉴스 요약**
   ```
   /analyze
   ```
   봇이 AI 트렌드 사이트를 방문하여 최신 뉴스를 수집하고 GPT로 분석한 요약을 제공합니다.

2. **웹사이트 방문**
   ```
   /visit https://techcrunch.com
   ```
   지정한 웹사이트를 방문하고 스크린샷을 전송합니다.

3. **복잡한 작업 수행**
   ```
   /task TechCrunch에서 OpenAI 관련 최신 기사 3개 찾아서 요약해줘
   ```
   AI가 작업을 분석하고 단계별로 수행합니다.

4. **GitHub 트렌딩 조회**
   ```
   /github trending javascript
   ```
   JavaScript 언어의 트렌딩 저장소를 보여줍니다.

5. **저장소 분석**
   ```
   /github analyze vercel/next.js
   ```
   Next.js 저장소를 AI로 상세 분석합니다.

6. **코드 검색**
   ```
   /github search async await example
   ```
   GitHub에서 async/await 예제 코드를 검색합니다.

7. **토픽 탐색**
   ```
   /github topic artificial-intelligence
   ```
   AI 관련 인기 프로젝트와 트렌드를 분석합니다.

## 🔐 보안 설정

### 사용자 인증

1. 자신의 텔레그램 ID 확인:
   - [@userinfobot](https://t.me/userinfobot)에게 메시지 전송
   - 받은 ID를 `TELEGRAM_ALLOWED_USERS`에 추가

2. 여러 사용자 허용:
   ```
   TELEGRAM_ALLOWED_USERS=123456789,987654321,555555555
   ```

### Rate Limiting

기본적으로 다음과 같은 제한이 적용됩니다:
- 사용자당 분당 10회 요청
- 초과 시 5분간 차단

## 🛠️ 고급 기능

### 1. 자동 로그인

```javascript
// credentials.json 파일 생성
{
  "mysite": {
    "url": "https://mysite.com/login",
    "username": "myusername",
    "password": "mypassword"
  }
}
```

사용:
```
/task mysite에 로그인해서 대시보드 보여줘
```

### 2. 데이터 추출

```
/task 현재 페이지의 모든 테이블 데이터를 CSV로 추출해줘
```

### 3. 폼 자동 작성

```
/task 문의 폼에 "AI 도입 문의"로 메시지 작성해줘
```

## 📊 모니터링

### 봇 상태 확인

```bash
# 헬스체크
curl http://localhost:3001/health
```

### 로그 확인

```bash
# PM2를 사용하는 경우
pm2 logs telegram-bot

# Docker를 사용하는 경우
docker logs ai-trend-telegram-bot
```

## 🐛 문제 해결

### 일반적인 문제

1. **봇이 응답하지 않음**
   - 토큰이 올바른지 확인
   - 네트워크 연결 확인
   - 봇이 실행 중인지 확인

2. **Puppeteer 실행 오류**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # Docker
   RUN apt-get update && apt-get install -y \
     chromium \
     fonts-liberation \
     libappindicator3-1 \
     libasound2 \
     libatk-bridge2.0-0 \
     libatk1.0-0 \
     libcups2 \
     libdbus-1-3 \
     libgconf-2-4 \
     libgtk-3-0 \
     libnspr4 \
     libnss3 \
     libx11-6 \
     libx11-xcb1 \
     libxcb1 \
     libxcomposite1 \
     libxcursor1 \
     libxdamage1 \
     libxext6 \
     libxfixes3 \
     libxi6 \
     libxrandr2 \
     libxrender1 \
     libxss1 \
     libxtst6
   ```

3. **메모리 부족**
   - 브라우저 세션을 주기적으로 종료 (`/stop`)
   - 서버 메모리 증설 고려

## 🚀 배포

### Docker 배포

```dockerfile
FROM node:18-slim

# Puppeteer 의존성 설치
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "telegramBotServer.js"]
```

### PM2 배포

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: './telegramBotServer.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## 📝 추가 개발 아이디어

1. **스케줄링 기능**
   - 정기적인 웹사이트 모니터링
   - 일일 리포트 자동 생성

2. **멀티 브라우저 지원**
   - Chrome, Firefox 등 다양한 브라우저 지원
   - 모바일 뷰 시뮬레이션

3. **팀 협업 기능**
   - 채널/그룹 지원
   - 작업 히스토리 공유

4. **AI 기능 확장**
   - Claude API 통합
   - 이미지 생성 (DALL-E)
   - 음성 인식 지원

## 🤝 기여하기

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

---

**주의사항**: 이 봇은 개인 연구 및 자동화 목적으로만 사용하세요. 웹사이트의 이용 약관과 robots.txt를 준수하세요.