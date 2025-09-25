import { test, expect } from '@playwright/test'

test.describe('간단한 배포 테스트', () => {
  test('배포된 사이트 기본 기능 확인', async ({ page }) => {
    console.log('🚀 간단한 배포 테스트 시작...')

    // 1. 메인 페이지 접속
    console.log('1️⃣ 메인 페이지 접속...')
    await page.goto('https://meetpin-weld.vercel.app')
    await expect(page).toHaveTitle(/밋핀|MeetPin/)
    console.log('✅ 메인 페이지 로드 성공')

    // 2. 로그인 테스트
    console.log('2️⃣ 로그인 테스트...')
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    const emailField = page.locator('input[type="email"], input[name="email"]')
    const passwordField = page.locator('input[type="password"], input[name="password"]')

    await emailField.fill('admin@meetpin.com')
    await passwordField.fill('123456')

    const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first()
    await loginButton.click()

    await page.waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 10000 })
    console.log('✅ 로그인 성공')
    console.log(`📍 리다이렉트 URL: ${page.url()}`)

    // 3. 지도 페이지 직접 확인
    console.log('3️⃣ 지도 페이지 직접 확인...')
    await page.goto('https://meetpin-weld.vercel.app/map')
    await page.waitForTimeout(5000)

    // 네트워크 요청 로깅
    page.on('response', response => {
      if (response.url().includes('/api/rooms')) {
        console.log(`📡 API 응답: ${response.status()} ${response.url()}`)
      }
    })

    // 페이지 새로고침하여 API 호출 확인
    await page.reload()
    await page.waitForTimeout(3000)

    // 지도 관련 요소들 확인
    const mapExists = (await page.locator('#map, .map-container').count()) > 0
    const createRoomButton =
      (await page.locator('button:has-text("방 만들기"), button:has-text("새 모임")').count()) > 0

    console.log(`🗺️ 지도 요소: ${mapExists ? '✅' : '❌'}`)
    console.log(`➕ 방 만들기 버튼: ${createRoomButton ? '✅' : '❌'}`)

    // 4. 페이지 소스 확인 (Mock 모드인지)
    const pageContent = await page.content()
    const hasMockIndicator =
      pageContent.includes('Mock') || pageContent.includes('isDevelopmentMode')
    console.log(`🔍 Mock 모드 표시: ${hasMockIndicator ? '✅' : '❌'}`)

    console.log('🏁 간단한 테스트 완료')
  })
})
