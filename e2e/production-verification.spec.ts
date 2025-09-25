import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

test.describe('Production Site Verification', () => {
  test('홈페이지 로딩 및 기본 UI 확인', async ({ page }) => {
    await page.goto(PRODUCTION_URL)

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/밋핀/)

    // 로딩 완료 대기
    await page.waitForTimeout(3000)

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/homepage.png' })
  })

  test('지도 페이지 접근 및 API 데이터 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/map`)

    // 지도 로딩 대기
    await page.waitForTimeout(5000)

    // API 호출 모니터링
    const apiResponse = await page.waitForResponse(
      response => response.url().includes('/api/rooms') && response.status() === 200
    )

    // API 응답 데이터 확인
    const responseData = await apiResponse.json()
    console.log('API Response:', JSON.stringify(responseData, null, 2))

    // Mock 데이터인지 실제 데이터인지 확인
    if (responseData.data && responseData.data.length > 0) {
      console.log('데이터 개수:', responseData.data.length)
      console.log('첫 번째 방 데이터:', responseData.data[0])
    }

    await page.screenshot({ path: 'test-results/map-page.png' })
  })

  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/login`)

    // 로그인 폼 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    await page.screenshot({ path: 'test-results/login-page.png' })
  })

  test('회원가입 페이지 접근', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/signup`)

    // 회원가입 폼 확인
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="nickname"]')).toBeVisible()

    await page.screenshot({ path: 'test-results/signup-page.png' })
  })

  test('API 엔드포인트 직접 테스트', async ({ page }) => {
    // 헬스 체크 API
    const healthResponse = await page.request.get(`${PRODUCTION_URL}/api/health`)
    console.log('Health Check Status:', healthResponse.status())

    if (healthResponse.ok()) {
      const healthData = await healthResponse.json()
      console.log('Health Data:', healthData)
    }

    // 방 목록 API (서울 지역)
    const roomsResponse = await page.request.get(
      `${PRODUCTION_URL}/api/rooms?bbox=37.4,126.8,37.6,127.1`
    )
    console.log('Rooms API Status:', roomsResponse.status())

    if (roomsResponse.ok()) {
      const roomsData = await roomsResponse.json()
      console.log('Rooms Data Length:', roomsData.data?.length || 0)
      console.log('Is Mock Data?', roomsData.data?.[0]?.id?.includes('mock') ? 'YES' : 'NO')
    }
  })

  test('환경변수 확인을 위한 클라이언트 사이드 체크', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/map`)

    // 브라우저 콘솔에서 환경변수 확인
    const useMockData = await page.evaluate(() => {
      return (
        (window as any).__NEXT_PUBLIC_USE_MOCK_DATA ||
        (process.env as any).NEXT_PUBLIC_USE_MOCK_DATA ||
        (window as any).localStorage?.getItem?.('NEXT_PUBLIC_USE_MOCK_DATA')
      )
    })

    console.log('Client-side NEXT_PUBLIC_USE_MOCK_DATA:', useMockData)

    // 로컬 스토리지 확인
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          items[key] = window.localStorage.getItem(key) || ''
        }
      }
      return items
    })

    console.log('LocalStorage:', localStorage)
  })
})
