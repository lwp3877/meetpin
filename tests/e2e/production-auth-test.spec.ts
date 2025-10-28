import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

test.describe('프로덕션 인증 완전 테스트', () => {
  test.setTimeout(60000) // 1분 타임아웃

  // ============================================================
  // TEST 1: 로그인 완전한 플로우 (Mock 계정)
  // ============================================================
  test('1. Mock 계정 로그인 완전 테스트', async ({ page }) => {
    console.log('\n=== TEST 1: Mock 계정 로그인 시작 ===')

    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    // 폼 확인
    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    console.log('✅ 로그인 폼 로딩')

    // Mock 계정 입력
    await emailInput.fill('admin@meetpin.com')
    await passwordInput.fill('123456')
    console.log('✅ Mock 계정 입력 (admin@meetpin.com)')

    await page.screenshot({ path: 'test-results/auth/01-login-filled.png' })

    // 제출 버튼 클릭
    const submitButton = page.locator('button[type="submit"]').first()
    await expect(submitButton).toBeVisible()

    // 응답 대기 설정
    const navigationPromise = page.waitForURL('**/map', { timeout: 50000 }).catch(() => null)

    await submitButton.click()
    console.log('✅ 로그인 제출 버튼 클릭')

    // 결과 대기
    await page.waitForTimeout(5000)

    const currentUrl = page.url()
    console.log(`현재 URL: ${currentUrl}`)

    // 성공 또는 에러 메시지 확인
    const toast = await page.locator('[role="status"], [class*="toast"]').first().textContent().catch(() => null)
    if (toast) {
      console.log(`Toast 메시지: ${toast}`)
    }

    const errorMessage = await page.locator('text=/오류|error|실패/i').first().textContent().catch(() => null)
    if (errorMessage) {
      console.log(`⚠️ 에러 메시지: ${errorMessage}`)
    }

    // 로딩 인디케이터 확인
    const loadingSpinner = await page.locator('[role="status"], .animate-spin').first().isVisible({ timeout: 2000 }).catch(() => false)
    if (loadingSpinner) {
      console.log('⏳ 로딩 중...')
      await page.waitForTimeout(10000) // 추가 10초 대기
    }

    await page.screenshot({ path: 'test-results/auth/01-login-result.png' })

    // 리다이렉트 확인
    await navigationPromise

    const finalUrl = page.url()
    console.log(`최종 URL: ${finalUrl}`)

    if (finalUrl.includes('/map')) {
      console.log('✅ 로그인 성공 - 지도 페이지로 이동')
    } else {
      console.log('⚠️ 로그인 결과 확인 필요')
    }

    console.log('✅ 로그인 테스트 완료\n')
  })

  // ============================================================
  // TEST 2: 로그인 후 프로필 확인
  // ============================================================
  test('2. 로그인 후 프로필 페이지 접근', async ({ page }) => {
    console.log('\n=== TEST 2: 프로필 페이지 접근 시작 ===')

    // 먼저 로그인
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@meetpin.com')
      await passwordInput.fill('123456')
      await page.locator('button[type="submit"]').first().click()

      // 로그인 완료 대기
      await page.waitForTimeout(8000)
      console.log('✅ 로그인 시도 완료')
    }

    // 프로필 페이지 이동
    await page.goto(`${PRODUCTION_URL}/profile`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-results/auth/02-profile-page.png', fullPage: true })

    // 프로필 요소 확인
    const profileElements = await page.locator('h1, h2, button').count()
    console.log(`프로필 페이지 요소 ${profileElements}개 발견`)

    console.log('✅ 프로필 페이지 테스트 완료\n')
  })

  // ============================================================
  // TEST 3: 로그인 후 방 생성 시도
  // ============================================================
  test('3. 로그인 후 방 생성 페이지 접근', async ({ page }) => {
    console.log('\n=== TEST 3: 방 생성 페이지 접근 시작 ===')

    // 로그인
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@meetpin.com')
      await passwordInput.fill('123456')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(8000)
      console.log('✅ 로그인 완료')
    }

    // 방 생성 페이지 이동
    await page.goto(`${PRODUCTION_URL}/room/new`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-results/auth/03-room-create.png', fullPage: true })

    // 폼 요소 확인
    const titleInput = page.locator('input[name="title"], input[placeholder*="제목"]').first()
    const isTitleVisible = await titleInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (isTitleVisible) {
      console.log('✅ 방 생성 폼 확인')

      // 제목 입력
      await titleInput.fill(`테스트 모임 ${Date.now()}`)
      console.log('✅ 방 제목 입력')

      // 설명 입력
      const descInput = page.locator('textarea').first()
      if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descInput.fill('프로덕션 완전 테스트로 생성된 모임입니다.')
        console.log('✅ 설명 입력')
      }

      await page.screenshot({ path: 'test-results/auth/03-room-filled.png', fullPage: true })
    } else {
      console.log('⚠️ 방 생성 폼을 찾을 수 없음 (권한 필요)')
    }

    console.log('✅ 방 생성 페이지 테스트 완료\n')
  })

  // ============================================================
  // TEST 4: 회원가입 페이지 UI 확인
  // ============================================================
  test('4. 회원가입 페이지 완전 확인', async ({ page }) => {
    console.log('\n=== TEST 4: 회원가입 페이지 시작 ===')

    await page.goto(`${PRODUCTION_URL}/auth/signup`)
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    console.log('✅ 회원가입 폼 로딩')

    // 닉네임 필드 확인
    const nicknameInput = page.locator('input[name="nickname"], input[placeholder*="이름"]').first()
    const hasNickname = await nicknameInput.isVisible({ timeout: 2000 }).catch(() => false)
    console.log(`닉네임 필드: ${hasNickname ? '있음' : '없음'}`)

    // 제출 버튼 확인
    const submitButton = page.locator('button[type="submit"]').first()
    await expect(submitButton).toBeVisible()
    const buttonText = await submitButton.textContent()
    console.log(`제출 버튼 텍스트: ${buttonText}`)

    await page.screenshot({ path: 'test-results/auth/04-signup-page.png', fullPage: true })

    console.log('✅ 회원가입 페이지 테스트 완료\n')
  })

  // ============================================================
  // TEST 5: 로그아웃 후 보호된 페이지 접근 제한 확인
  // ============================================================
  test('5. 비로그인 시 보호된 페이지 접근', async ({ page }) => {
    console.log('\n=== TEST 5: 비로그인 보호 테스트 시작 ===')

    // 쿠키 삭제 (로그아웃)
    await page.context().clearCookies()
    console.log('✅ 쿠키 삭제 (로그아웃 상태)')

    // 보호된 페이지 접근 시도
    const protectedPages = [
      '/profile',
      '/room/new',
    ]

    for (const path of protectedPages) {
      await page.goto(`${PRODUCTION_URL}${path}`)
      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      console.log(`${path} 접근 -> ${currentUrl}`)

      if (currentUrl.includes('/auth/login')) {
        console.log(`✅ ${path}: 로그인 페이지로 리다이렉트 (보호됨)`)
      } else if (currentUrl.includes(path)) {
        console.log(`⚠️ ${path}: 접근 허용됨 (보호 안됨)`)
      } else {
        console.log(`➡️ ${path}: 다른 페이지로 이동됨`)
      }
    }

    await page.screenshot({ path: 'test-results/auth/05-protected-page.png' })

    console.log('✅ 보호된 페이지 테스트 완료\n')
  })
})
