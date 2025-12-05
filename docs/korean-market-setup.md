# 한국 AI 시장 데이터 수집 설정 가이드

## 개요
이 문서는 AI Trends Platform의 한국 시장 데이터 수집 기능 설정 방법을 설명합니다.

## 데이터 수집 소스

### 1. RSS 피드 (기본)
별도 API 키 없이 사용 가능한 소스들:
- AI타임스
- ZDNet Korea AI
- 블로터 AI

### 2. 웹 스크래핑
Cheerio를 사용하여 스크래핑:
- 전자신문 AI 섹션
- 네이버 D2

### 3. API 기반 수집 (선택사항)

#### 네이버 뉴스 검색 API
1. [네이버 개발자 센터](https://developers.naver.com) 접속
2. 애플리케이션 등록
3. 검색 API 사용 신청
4. Client ID와 Secret 발급
5. `.env` 파일에 추가:
```
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

#### 카카오 검색 API
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 애플리케이션 생성
3. REST API 키 발급
4. `.env` 파일에 추가:
```
KAKAO_API_KEY=your_kakao_api_key
```

## 데이터베이스 설정

### 테이블 생성
```bash
# Supabase SQL 에디터에서 실행
# backend/migrations/korean_market_tables.sql 파일 내용 복사하여 실행
```

## 데이터 수집 실행

### 자동 수집
서버 시작 시 자동으로:
- 매 시간마다 데이터 수집
- 서버 시작 시 초기 수집

### 수동 수집 (관리자)
```bash
# API 엔드포인트로 수집 트리거
curl -X POST http://localhost:5000/api/korean-market/collect \
  -H "Authorization: Bearer your_admin_token"
```

## 프론트엔드 사용법

### 한국 AI 시장 페이지
- URL: `/korean`
- 탭 구성:
  - 최신 뉴스: AI 관련 최신 뉴스
  - 적용 사례: 산업별 AI 도입 사례
  - 주요 기업: 한국 AI 기업 정보

### 필터 기능
- 산업별 필터링 (금융, 의료, 제조 등)
- 키워드 검색
- 페이지네이션

## 추가 개발 계획

### Phase 1 (현재)
- [x] RSS 피드 수집
- [x] 웹 스크래핑 기본 구현
- [x] 프론트엔드 UI
- [x] API 엔드포인트

### Phase 2
- [ ] 네이버/카카오 API 통합
- [ ] 정부 공공데이터 연동
- [ ] AI 기업 뉴스룸 크롤링
- [ ] 실시간 알림 기능

### Phase 3
- [ ] AI 트렌드 분석 리포트
- [ ] 산업별 인사이트 생성
- [ ] 투자 동향 추적
- [ ] 이메일 뉴스레터

## 문제 해결

### RSS 피드 수집 실패
- 네트워크 연결 확인
- RSS 피드 URL 유효성 검증
- 타임아웃 설정 증가

### 스크래핑 차단
- User-Agent 헤더 확인
- 요청 간격 조정 (현재 2초)
- 프록시 사용 고려

### API 한도 초과
- API 요청 수 모니터링
- 캐싱 전략 구현
- 요청 최적화