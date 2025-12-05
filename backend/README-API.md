# AI API 설정 가이드

## 필요한 API 키

1. **OpenAI API Key**
   - [OpenAI Platform](https://platform.openai.com/api-keys) 에서 생성
   - GPT-3.5/GPT-4 모델 사용

2. **Anthropic API Key**
   - [Anthropic Console](https://console.anthropic.com/) 에서 생성
   - Claude 3 모델 사용

## 설정 방법

1. `backend` 폴더에 `.env` 파일 생성:
```bash
cd backend
cp .env.example .env
```

2. `.env` 파일 편집:
```env
# Supabase (기존 설정 유지)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI API
OPENAI_API_KEY=sk-... # 여기에 실제 키 입력

# Anthropic (Claude) API  
ANTHROPIC_API_KEY=sk-ant-... # 여기에 실제 키 입력

# Server
PORT=5000
NODE_ENV=development
```

3. 서버 재시작:
```bash
npm start
```

## 사용 방법

1. HuggingFace 페이지에서 작업 설명 입력
2. "GPT 추천" 또는 "Claude 추천" 버튼 클릭
3. 추천받은 모델 확인 및 검색

## API 키 없이 사용하기

API 키가 없어도 기본 추천 기능이 작동합니다:
- 키워드 기반 추천 (한국어, 이미지, 음성 등)
- 인기 모델 추천

## 요금 정보

- **OpenAI GPT-3.5**: 약 $0.002/1K 토큰
- **Anthropic Claude 3 Sonnet**: 약 $0.003/1K 토큰

각 추천당 약 500-1000 토큰 사용 (약 1-3원)