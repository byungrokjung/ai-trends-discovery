# Repository Guidelines

## Project Structure & Module Organization
- `src/`는 실사용 Vite SPA이며 한국 시장 인사이트 탭(`src/pages/KoreanMarketPage.jsx`)처럼 국내 특화 뷰가 다수 포함됩니다. 공통 UI는 `src/components`, Zustand 상태는 `src/store`, 데이터 훅은 `src/hooks`·`src/services`에 둡니다.
- 실시간 트렌드 수집·요약 파이프라인은 `backend/`에서 동작합니다. `routes/`가 자동 큐레이션 API, `services/`가 RSS/투자/한국 소스 파서, `telegramBotServer.js`가 커뮤니티 통지 챗봇입니다.
- `docs/`에는 claude.md의 사업 비전 요약, MCP 자동화, Supabase 연동 매뉴얼이 있으며, SQL은 `supabase/`에 버전 관리합니다. E2E 자산은 `tests/` + `playwright.config.js`에 모여 있습니다.

## Build, Test, and Development Commands
- `npm run dev` / `npm run build` / `npm run preview`: Vite 앱 개발·배포 파이프라인.
- `npm run start:backend` 또는 `cd backend && npm run dev`: Express 크롤러·분석 서버 기동 (전자는 prod env, 후자는 nodemon).
- `npm run lint`: React+Hooks ESLint 규칙으로 포맷·품질 체크.
- `npx playwright test` (필요 시 `--headed`): GitHub 탐색, 한국 시장 대시보드 등 핵심 시나리오 회귀 테스트.

## Coding Style & Naming Conventions
- 2칸 들여쓰기, 세미콜론 생략, ES Module import를 유지합니다. 컴포넌트/페이지는 PascalCase, 훅은 `use` 접두어, Zustand 스토어는 의도 기반 (`useAuthStore`)으로 작성합니다.
- Tailwind CSS + `clsx`를 기본 스타일 도구로 삼고, 공용 보조 클래스를 `src/styles/`에 정리합니다.

## Testing Guidelines
- Playwright 스펙당 한 워크플로를 담고, 접근성 셀렉터(`getByRole`, `getByText`)를 사용합니다. 새로운 국내 인사이트 카드나 투자 시그널 뷰를 만들면 해당 섹션을 검증하는 어설션을 반드시 추가합니다.
- 백엔드 크롤러 변경 시에는 눈에 띄는 UI 플래그(예: "실시간 투자" 배지) 또는 API 응답 diff를 Playwright로 확인하거나 PR 설명에 수동 검증 절차를 명시합니다.

## Commit & Pull Request Guidelines
- Conventional Commits(`feat(korea-insight)`, `fix(collector)`)를 따라 claude.md에서 정의한 로드맵 단계(MVP→Growth→B2B)를 추적합니다.
- PR에는 변경 요약, 관련 이슈/OKR, 환경 변수 추가 여부, `npm run lint`와 `npx playwright test` 결과, UI 변경 캡처 또는 API 응답 예시를 포함합니다.

## Security & Configuration Tips
- 루트와 `backend/` 각각에서 `.env.example`을 복사해 `SUPABASE_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, Telegram 토큰, `PLAYWRIGHT_BASE_URL`을 설정합니다. 비밀키는 git에 올리지 말고 Vercel/Supabase에 저장하세요.
- MCP 자동 설치는 `npm run mcp:install`로 수행하고 `docs/mcp-auto-install.md`의 검증 절차(`$env:RUST_LOG="codex=debug"; codex "/mcp"`)를 그대로 따릅니다.
