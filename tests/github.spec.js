const { test, expect } = require('@playwright/test')

test.describe('GitHub 오픈소스 탐색 페이지', () => {
  test('핵심 UI 요소와 탭 인터랙션 확인', async ({ page }) => {
    await page.goto('/github')

    // 기본 헤더와 설명 문구 확인
    await expect(page.getByRole('heading', { name: 'GitHub 오픈소스 탐색' })).toBeVisible()
    await expect(page.getByText('트렌딩 프로젝트부터 코드 검색까지')).toBeVisible()

    // DeepWiki 탭의 입력 필드와 버튼 확인
    await expect(page.getByPlaceholder('예: facebook/react')).toBeVisible()
    await expect(page.getByRole('button', { name: '깊이 이해하기' })).toBeEnabled()

    // GitIngest 탭 전환 후 안내 문구 확인
    await page.getByRole('button', { name: 'GitIngest' }).click()
    await expect(page.getByText('GitIngest 단계 · 저장소 경로')).toBeVisible()
    await expect(page.getByPlaceholder('예: vercel/next.js')).toBeVisible()

    // GitMCP 탭 전환 후 설치 안내 확인
    await page.getByRole('button', { name: 'GitMCP' }).click()
    await expect(page.getByText('Playwright MCP와 같은 MCP 서버를 등록하면', { exact: false })).toBeVisible()

    // Git Analytics 탭 전환 후 섹션 제목 확인
    await page.getByRole('button', { name: 'Git Analytics' }).click()
    await expect(page.getByText('언어별 트렌딩 저장소')).toBeVisible()
    await expect(page.getByText('토픽 기반 인사이트')).toBeVisible()
  })
})
