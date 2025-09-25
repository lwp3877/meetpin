import { test, expect } from '@playwright/test'

test.describe('배포된 사이트 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 캐치
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text())
      }
    })
  })

  test('1. 메인 페이지 로드 테스트', async ({ page }) => {
    // 배포된 사이트 접속
    await page.goto('https://meetpin-weld.vercel.app')

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/밋핀|MeetPin/)
    console.log('✅ 메인 페이지 로드 성공')
  })

  test('2. 로그인 페이지 테스트', async ({ page }) => {
    // 로그인 페이지 접속
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    // 로그인 폼 요소 확인
    await expect(page.locator('form')).toBeVisible()

    // 이메일/비밀번호 필드 확인
    const emailField = page.locator('input[type="email"], input[name="email"]')
    const passwordField = page.locator('input[type="password"], input[name="password"]')

    await expect(emailField).toBeVisible()
    await expect(passwordField).toBeVisible()

    console.log('✅ 로그인 폼 요소 확인 완료')
  })

  test('3. 소셜 로그인 버튼 테스트', async ({ page }) => {
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    // 소셜 로그인 버튼들 확인
    const kakaoButton = page.locator('button:has-text("카카오")')
    const googleButton = page.locator('button:has-text("구글")')
    const naverButton = page.locator('button:has-text("네이버")')

    await expect(kakaoButton).toBeVisible()
    await expect(googleButton).toBeVisible()
    await expect(naverButton).toBeVisible()

    console.log('✅ 소셜 로그인 버튼 확인 완료')
  })

  test('4. 이메일 로그인 기능 테스트', async ({ page }) => {
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    // 로그인 정보 입력
    await page.fill('input[type="email"], input[name="email"]', 'admin@meetpin.com')
    await page.fill('input[type="password"], input[name="password"]', '123456')

    // 로그인 버튼 클릭
    const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first()
    await loginButton.click()

    // 페이지 리다이렉션 대기 (최대 10초)
    await page.waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 10000 })

    console.log('✅ 이메일 로그인 성공')
    console.log(`📍 현재 URL: ${page.url()}`)
  })

  test('5. 소셜 로그인 클릭 테스트', async ({ page }) => {
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    // 카카오 로그인 버튼 클릭 테스트
    const kakaoButton = page.locator('button:has-text("카카오")').first()
    await kakaoButton.click()

    // 성공 메시지나 페이지 변화 대기
    await page.waitForTimeout(3000)

    console.log('✅ 카카오 로그인 버튼 클릭 완료')
  })

  test('6. 지도 페이지 테스트', async ({ page }) => {
    // 먼저 로그인
    await page.goto('https://meetpin-weld.vercel.app/auth/login')
    await page.fill('input[type="email"], input[name="email"]', 'admin@meetpin.com')
    await page.fill('input[type="password"], input[name="password"]', '123456')
    await page.locator('button[type="submit"], button:has-text("로그인")').first().click()

    // 로그인 후 지도 페이지로 이동
    await page.goto('https://meetpin-weld.vercel.app/map', { waitUntil: 'networkidle' })

    // 지도 관련 요소 확인
    await page.waitForTimeout(5000) // 카카오 지도 로딩 대기

    const mapContainer = page.locator('#map, .map-container, [data-testid="kakao-map"]')
    const createRoomButton = page.locator(
      'button:has-text("방 만들기"), button:has-text("새 모임")'
    )

    // 지도나 방 만들기 버튼 중 하나는 있어야 함
    const hasMapElements = (await mapContainer.count()) > 0 || (await createRoomButton.count()) > 0
    expect(hasMapElements).toBe(true)

    console.log('✅ 지도 페이지 접근 성공')
  })

  test('7. API 응답 테스트', async ({ page }) => {
    // API 응답 모니터링
    let apiResponses: any[] = []

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        })
      }
    })

    // 로그인 후 지도 페이지 접속
    await page.goto('https://meetpin-weld.vercel.app/auth/login')
    await page.fill('input[type="email"], input[name="email"]', 'admin@meetpin.com')
    await page.fill('input[type="password"], input[name="password"]', '123456')
    await page.locator('button[type="submit"], button:has-text("로그인")').first().click()

    await page.goto('https://meetpin-weld.vercel.app/map')
    await page.waitForTimeout(5000)

    // API 응답 확인
    console.log('📡 API 응답 현황:')
    apiResponses.forEach(response => {
      const status = response.status === 200 ? '✅' : response.status === 401 ? '❌' : '⚠️'
      console.log(`   ${status} ${response.status} ${response.url}`)
    })

    // 401 에러가 없는지 확인
    const unauthorizedResponses = apiResponses.filter(r => r.status === 401)
    expect(unauthorizedResponses.length).toBe(0)
  })
})
