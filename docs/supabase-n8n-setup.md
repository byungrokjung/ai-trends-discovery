# Supabase + n8n 설정 가이드

## 1. Supabase 설정

### 1.1 테이블 생성
1. Supabase 대시보드에서 SQL Editor 열기
2. `/supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 테이블이 정상적으로 생성되었는지 확인

### 1.2 API 키 확인
1. Settings > API 메뉴로 이동
2. Project URL 복사
3. `anon` public key 복사
4. `.env.local` 파일에 입력

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. n8n 워크플로우 설정

### 2.1 필요한 노드
- Schedule: 1시간마다 실행
- RSS Feed Read: AI 뉴스 피드 읽기
- OpenAI: 요약 및 한국어 번역
- Code: 데이터 변환
- Supabase: 데이터 저장

### 2.2 Supabase 연결
1. n8n에서 Supabase 노드 추가
2. Credentials 설정:
   - URL: Supabase 프로젝트 URL
   - Service Role Key: Supabase service_role key (Settings > API)

### 2.3 데이터 매핑
```javascript
{
  title: "뉴스 제목",
  summary: "요약 내용",
  summary_korean: "한국어 요약",
  korea_relevance: "한국 시장 영향",
  source: "출처",
  category: "카테고리",
  published_at: "발행일시",
  original_url: "원본 URL",
  importance: 1-10, // 중요도 점수
  tags: ["태그1", "태그2"],
  image_url: "이미지 URL"
}
```

## 3. 프론트엔드 설정

### 3.1 환경변수 설정
`.env.local` 파일 생성 후 Supabase 정보 입력

### 3.2 개발 서버 실행
```bash
npm install
npm run dev
```

### 3.3 Supabase 연결 테스트
브라우저 콘솔에서 확인:
- 네트워크 탭에서 Supabase API 호출 확인
- 데이터가 정상적으로 표시되는지 확인

## 4. 추가 RSS 소스

### 한국 소스
- AI타임스: https://www.aitimes.com/rss
- 테크M: https://techm.kr/rss
- ZDNet Korea: https://zdnet.co.kr/rss/news.xml

### 해외 소스
- The Information: 스크래핑 필요
- Anthropic Blog: https://www.anthropic.com/rss.xml
- Google AI Blog: https://ai.googleblog.com/feeds/posts/default

## 5. 트러블슈팅

### CORS 에러
Supabase 대시보드 > Authentication > URL Configuration에서 
Site URL과 Redirect URLs에 로컬 개발 서버 주소 추가:
- http://localhost:5173
- http://localhost:5174

### 데이터가 안 보일 때
1. Supabase 테이블에 데이터가 있는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 환경변수가 제대로 설정되었는지 확인

### n8n 에러
1. OpenAI API 키 확인
2. Supabase service_role key 권한 확인
3. RSS 피드 URL이 유효한지 확인