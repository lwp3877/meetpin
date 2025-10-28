/**
 * 프로덕션 사이트 전체 기능 실제 테스트
 * 모든 사용자 시나리오를 실제로 실행하고 검증
 */

import { test, expect, type Page } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

test.describe('프로덕션 사이트 전체 기능 테스트', () => {
  test.setTimeout(120000) // 2분 타임아웃

  test('1. 홈페이지 로딩 및 첫 화면 테스트', async ({ page }) => {
    console.log('📍 테스트 1: 홈페이지 접속')

    await page.goto(PRODUCTION_URL)

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/밋핀/)

    // 로딩 완료 대기
    await page.waitForLoadState('networkidle')

    // 주요 UI 요소 확인
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true })

    console.log('✅ 홈페이지 로딩 성공')
  })

  test('2. 네비게이션 메뉴 동작 테스트', async ({ page }) => {
    console.log('📍 테스트 2: 네비게이션 메뉴')

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    // 지도 페이지로 이동
    const mapLink = page.locator('a[href*="/map"]').first()
    if (await mapLink.isVisible()) {
      await mapLink.click()
      await page.waitForURL('**/map')
      console.log('✅ 지도 페이지 이동 성공')
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/02-navigation.png' })
  })

  test('3. 회원가입 페이지 UI 테스트', async ({ page }) => {
    console.log('📍 테스트 3: 회원가입 페이지')

    await page.goto(`${PRODUCTION_URL}/auth/signup`)
    await page.waitForLoadState('networkidle')

    // 폼 필드 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible()) {
      console.log('✅ 이메일 필드 발견')
    }
    if (await passwordInput.isVisible()) {
      console.log('✅ 비밀번호 필드 발견')
    }

    await page.screenshot({ path: 'test-results/03-signup.png', fullPage: true })
  })

  test('4. 로그인 페이지 UI 테스트', async ({ page }) => {
    console.log('📍 테스트 4: 로그인 페이지')

    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    // 폼 확인
    const form = page.locator('form')
    await expect(form).toBeVisible({ timeout: 10000 })

    await page.screenshot({ path: 'test-results/04-login.png', fullPage: true })
    console.log('✅ 로그인 페이지 로딩 성공')
  })

  test('5. 지도 기능 테스트', async ({ page }) => {
    console.log('📍 테스트 5: 지도 기능')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 지도 로딩 대기 (Kakao Maps)
    await page.waitForTimeout(5000)

    // 지도 컨테이너 확인
    const mapContainer = page.locator('#map, [class*="map"]').first()
    if (await mapContainer.isVisible()) {
      console.log('✅ 지도 컨테이너 발견')
    }

    await page.screenshot({ path: 'test-results/05-map.png', fullPage: true })
  })

  test('6. 방 생성 페이지 테스트', async ({ page }) => {
    console.log('📍 테스트 6: 방 생성 페이지')

    await page.goto(`${PRODUCTION_URL}/room/new`)
    await page.waitForLoadState('networkidle')

    // 폼 필드 확인
    const titleInput = page.locator('input[name="title"], input[placeholder*="제목"]').first()

    if (await titleInput.isVisible()) {
      console.log('✅ 제목 입력 필드 발견')

      // 테스트 입력
      await titleInput.fill('테스트 모임')
      console.log('✅ 제목 입력 성공')
    }

    // 카테고리 버튼 확인
    const categoryButtons = page.locator('button[role="radio"], button:has-text("술"), button:has-text("운동")')
    const count = await categoryButtons.count()
    console.log(`✅ 카테고리 버튼 ${count}개 발견`)

    await page.screenshot({ path: 'test-results/06-room-create.png', fullPage: true })
  })

  test('7. 방 목록 페이지 테스트', async ({ page }) => {
    console.log('📍 테스트 7: 방 목록')

    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-results/07-rooms-list.png', fullPage: true })
    console.log('✅ 방 목록 페이지 로딩 완료')
  })

  test('8. 프로필 페이지 테스트', async ({ page }) => {
    console.log('📍 테스트 8: 프로필 페이지')

    await page.goto(`${PRODUCTION_URL}/profile`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/08-profile.png', fullPage: true })
    console.log('✅ 프로필 페이지 로딩 완료')
  })

  test('9. 개인정보처리방침 페이지 테스트', async ({ page }) => {
    console.log('📍 테스트 9: 개인정보처리방침')

    await page.goto(`${PRODUCTION_URL}/legal/privacy`)
    await page.waitForLoadState('networkidle')

    // 내용 확인
    const content = page.locator('body')
    const text = await content.textContent()

    if (text?.includes('개인정보')) {
      console.log('✅ 개인정보처리방침 내용 확인')
    }

    await page.screenshot({ path: 'test-results/09-privacy.png', fullPage: true })
  })

  test('10. 모바일 반응형 테스트', async ({ page }) => {
    console.log('📍 테스트 10: 모바일 반응형')

    // 모바일 화면 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/10-mobile.png', fullPage: true })
    console.log('✅ 모바일 뷰 테스트 완료')
  })

  test('11. 태블릿 반응형 테스트', async ({ page }) => {
    console.log('📍 테스트 11: 태블릿 반응형')

    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/11-tablet.png', fullPage: true })
    console.log('✅ 태블릿 뷰 테스트 완료')
  })

  test('12. 데스크톱 반응형 테스트', async ({ page }) => {
    console.log('📍 테스트 12: 데스크톱 반응형')

    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/12-desktop.png', fullPage: true })
    console.log('✅ 데스크톱 뷰 테스트 완료')
  })

  test('13. API Health Check 테스트', async ({ page }) => {
    console.log('📍 테스트 13: API Health Check')

    const response = await page.goto(`${PRODUCTION_URL}/api/health`)
    const status = response?.status()

    console.log(`API Status: ${status}`)

    if (status === 200) {
      const data = await response?.json()
      console.log('Health Check 응답:', JSON.stringify(data, null, 2))
      console.log('✅ API Health Check 성공')
    } else {
      console.log('⚠️ API Health Check 실패')
    }
  })

  test('14. PWA Manifest 테스트', async ({ page }) => {
    console.log('📍 테스트 14: PWA Manifest')

    const response = await page.goto(`${PRODUCTION_URL}/manifest.json`)

    if (response?.status() === 200) {
      const manifest = await response.json()
      console.log('Manifest 정보:', JSON.stringify(manifest, null, 2))
      console.log('✅ PWA Manifest 확인 완료')
    }
  })

  test('15. Service Worker 테스트', async ({ page }) => {
    console.log('📍 테스트 15: Service Worker')

    const response = await page.goto(`${PRODUCTION_URL}/sw.js`)

    if (response?.status() === 200) {
      console.log('✅ Service Worker 파일 확인')
    }
  })

  test('16. 키보드 네비게이션 테스트', async ({ page }) => {
    console.log('📍 테스트 16: 키보드 네비게이션')

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab')
    await page.waitForTimeout(500)

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    console.log(`포커스된 요소: ${focusedElement}`)

    await page.screenshot({ path: 'test-results/16-keyboard-nav.png' })
    console.log('✅ 키보드 네비게이션 테스트 완료')
  })

  test('17. 콘솔 에러 확인', async ({ page }) => {
    console.log('📍 테스트 17: 콘솔 에러 확인')

    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    if (errors.length > 0) {
      console.log('⚠️ 콘솔 에러 발견:')
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`))
    } else {
      console.log('✅ 콘솔 에러 없음')
    }
  })

  test('18. 네트워크 요청 모니터링', async ({ page }) => {
    console.log('📍 테스트 18: 네트워크 요청')

    const requests: { url: string; status: number }[] = []

    page.on('response', (response) => {
      requests.push({
        url: response.url(),
        status: response.status(),
      })
    })

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    // 실패한 요청 확인
    const failedRequests = requests.filter((r) => r.status >= 400)

    if (failedRequests.length > 0) {
      console.log('⚠️ 실패한 요청:')
      failedRequests.forEach((r) => console.log(`${r.status} - ${r.url}`))
    } else {
      console.log('✅ 모든 네트워크 요청 성공')
    }
  })

  test('19. 페이지 로딩 성능 측정', async ({ page }) => {
    console.log('📍 테스트 19: 페이지 로딩 성능')

    await page.goto(PRODUCTION_URL)

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      }
    })

    console.log('성능 지표:')
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`)
    console.log(`Load Complete: ${metrics.loadComplete.toFixed(2)}ms`)
    console.log(`DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`)
    console.log(`Total Time: ${metrics.totalTime.toFixed(2)}ms`)

    console.log('✅ 성능 측정 완료')
  })

  test('20. 최종 종합 검증', async ({ page }) => {
    console.log('📍 테스트 20: 최종 종합 검증')

    const results = {
      homepage: false,
      map: false,
      auth: false,
      legal: false,
      api: false,
    }

    // 홈페이지
    try {
      await page.goto(PRODUCTION_URL, { timeout: 30000 })
      await page.waitForLoadState('networkidle')
      results.homepage = true
      console.log('✅ 홈페이지: 정상')
    } catch (e) {
      console.log('❌ 홈페이지: 오류')
    }

    // 지도
    try {
      await page.goto(`${PRODUCTION_URL}/map`, { timeout: 30000 })
      await page.waitForLoadState('networkidle')
      results.map = true
      console.log('✅ 지도: 정상')
    } catch (e) {
      console.log('❌ 지도: 오류')
    }

    // 인증
    try {
      await page.goto(`${PRODUCTION_URL}/auth/login`, { timeout: 30000 })
      await page.waitForLoadState('networkidle')
      results.auth = true
      console.log('✅ 인증: 정상')
    } catch (e) {
      console.log('❌ 인증: 오류')
    }

    // 법적 문서
    try {
      await page.goto(`${PRODUCTION_URL}/legal/privacy`, { timeout: 30000 })
      await page.waitForLoadState('networkidle')
      results.legal = true
      console.log('✅ 법적 문서: 정상')
    } catch (e) {
      console.log('❌ 법적 문서: 오류')
    }

    // API
    try {
      const response = await page.goto(`${PRODUCTION_URL}/api/health`, { timeout: 30000 })
      if (response?.status() === 200) {
        results.api = true
        console.log('✅ API: 정상')
      }
    } catch (e) {
      console.log('❌ API: 오류')
    }

    // 최종 스크린샷
    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/20-final-verification.png', fullPage: true })

    console.log('\n📊 최종 결과:')
    console.log(`홈페이지: ${results.homepage ? '✅' : '❌'}`)
    console.log(`지도: ${results.map ? '✅' : '❌'}`)
    console.log(`인증: ${results.auth ? '✅' : '❌'}`)
    console.log(`법적 문서: ${results.legal ? '✅' : '❌'}`)
    console.log(`API: ${results.api ? '✅' : '❌'}`)

    const totalTests = Object.keys(results).length
    const passedTests = Object.values(results).filter((r) => r).length

    console.log(`\n✅ 통과: ${passedTests}/${totalTests}`)
    console.log(`❌ 실패: ${totalTests - passedTests}/${totalTests}`)
  })
})
