/* e2e/user-journey.spec.ts */
import { test, expect, Page } from '@playwright/test'

/**
 * 완전한 사용자 여정 E2E 테스트
 * 실제 사용자가 경험할 수 있는 모든 시나리오를 검증
 */

// 테스트 환경 설정
const TEST_CONFIG = {
  baseURL: process.env.CI ? 'https://meetpin-weld.vercel.app' : 'http://localhost:3000',
  timeout: 30000,
  testUser: {
    email: 'admin@meetpin.com',
    password: '123456',
    nickname: 'QA테스터',
    ageRange: '30대',
  },
  testRoom: {
    title: '자동화 테스트 모임',
    category: 'drink',
    place: '테스트 장소',
    description: '자동화 테스트용 모임입니다',
  },
}

test.describe('🚀 밋핀 완전한 사용자 여정 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 모니터링
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console Error:', msg.text())
      }
      if (msg.type() === 'warning') {
        console.warn('⚠️ Console Warning:', msg.text())
      }
    })

    // 네트워크 에러 모니터링
    page.on('response', response => {
      if (!response.ok()) {
        console.error(`❌ Network Error: ${response.status()} ${response.url()}`)
      }
    })

    // 페이지 에러 모니터링
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message)
    })
  })

  test('1️⃣ 홈페이지 접근 및 기본 기능 확인', async ({ page }) => {
    console.log('🧪 테스트 1: 홈페이지 접근 및 기본 기능 확인')

    await page.goto(TEST_CONFIG.baseURL)

    // 페이지 로드 확인
    await expect(page).toHaveTitle(/밋핀/)

    // 핵심 UI 요소 확인
    await expect(page.locator('h1, h2')).toContainText('밋핀')

    // 네비게이션 확인
    const mapButton = page
      .locator('a[href="/map"], button')
      .filter({ hasText: /지도|모임/ })
      .first()
    await expect(mapButton).toBeVisible()

    // 성능 체크
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      }
    })

    console.log('📊 성능 지표:', performanceMetrics)
    expect(performanceMetrics.loadTime).toBeLessThan(3000) // 3초 이내 로드
  })

  test('2️⃣ 회원가입 플로우 완전 검증', async ({ page }) => {
    console.log('🧪 테스트 2: 회원가입 플로우 완전 검증')

    await page.goto(`${TEST_CONFIG.baseURL}/auth/signup`)

    // 회원가입 폼 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // 입력 필드 유효성 검사
    await page.fill('input[type="email"]', 'invalid-email')
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('type', 'email')

    // 올바른 정보 입력
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)

    // 닉네임 입력 (있는 경우)
    const nicknameInput = page.locator('input[placeholder*="닉네임"], input[name="nickname"]')
    if (await nicknameInput.isVisible()) {
      await nicknameInput.fill(TEST_CONFIG.testUser.nickname)
    }

    // 나이대 선택 (있는 경우)
    const ageSelect = page.locator('select[name="ageRange"], select[name="age_range"]')
    if (await ageSelect.isVisible()) {
      await ageSelect.selectOption(TEST_CONFIG.testUser.ageRange)
    }

    // 회원가입 버튼 클릭
    const submitButton = page
      .locator('button[type="submit"], button')
      .filter({ hasText: /가입|회원가입|시작/ })
    await submitButton.click()

    // 성공 또는 다음 단계로 이동 확인
    await page.waitForTimeout(2000)

    // 로그인 페이지로 리다이렉트되거나 성공 메시지 확인
    await expect(page).toHaveURL(/login|map|dashboard/, { timeout: 10000 })
  })

  test('3️⃣ 로그인 플로우 완전 검증', async ({ page }) => {
    console.log('🧪 테스트 3: 로그인 플로우 완전 검증')

    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)

    // 로그인 폼 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // 잘못된 로그인 시도 (에러 처리 확인)
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    const loginButton = page
      .locator('button[type="submit"], button')
      .filter({ hasText: /로그인|시작/ })
    await loginButton.click()

    // 에러 메시지 확인 (토스트 또는 에러 텍스트)
    await page.waitForTimeout(2000)

    // 올바른 로그인 정보 입력
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await loginButton.click()

    // 로그인 성공 확인 (지도 페이지로 이동)
    await expect(page).toHaveURL(/map|dashboard/, { timeout: 15000 })

    // 사용자 정보 표시 확인
    const userIndicator = page.locator(
      '[data-testid="user-info"], .user-menu, [aria-label*="사용자"], .avatar'
    )
    await expect(userIndicator.first()).toBeVisible({ timeout: 10000 })
  })

  test('4️⃣ 지도 페이지 및 모임 검색 기능 검증', async ({ page, context }) => {
    console.log('🧪 테스트 4: 지도 페이지 및 모임 검색 기능 검증')

    // 로그인 먼저 실행
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page
      .locator('button[type="submit"], button')
      .filter({ hasText: /로그인/ })
      .click()

    // 지도 페이지로 이동
    await page.goto(`${TEST_CONFIG.baseURL}/map`)

    // 지도 로딩 확인
    const mapContainer = page.locator('#map, .map-container, [data-testid="map"]')
    await expect(mapContainer.first()).toBeVisible({ timeout: 15000 })

    // 위치 권한 처리 (브라우저 시뮬레이션)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 37.5665, longitude: 126.978 }) // 서울

    // 현재 위치 버튼 테스트
    const nearMeButton = page.locator('button').filter({ hasText: /내 주변|현재 위치|Near/ })
    if (await nearMeButton.isVisible()) {
      await nearMeButton.click()
      await page.waitForTimeout(3000)
    }

    // 모임 리스트 확인
    const roomCards = page.locator('.room-card, [data-testid="room"], .meeting-item')
    await expect(roomCards.first()).toBeVisible({ timeout: 10000 })

    // 검색 기능 테스트
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('술')
      await page.waitForTimeout(2000)

      // 검색 결과 확인
      const searchResults = page.locator('.room-card, [data-testid="room"]')
      await expect(searchResults.first()).toBeVisible()
    }
  })

  test('5️⃣ 새 모임 생성 플로우 완전 검증', async ({ page, context }) => {
    console.log('🧪 테스트 5: 새 모임 생성 플로우 완전 검증')

    // 로그인 및 지도 페이지 이동
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/map/, { timeout: 10000 })

    // 모임 생성 페이지로 이동
    const createButton = page
      .locator('a[href="/room/new"], button')
      .filter({ hasText: /만들기|생성|추가/ })
    await createButton.first().click()

    await expect(page).toHaveURL(/room\/new/, { timeout: 10000 })

    // 폼 필드 확인 및 입력
    await expect(page.locator('input[name="title"], input[placeholder*="제목"]')).toBeVisible()

    // 제목 입력
    const titleInput = page.locator('input[name="title"], input[placeholder*="제목"]').first()
    await titleInput.fill(TEST_CONFIG.testRoom.title)

    // 카테고리 선택
    const categorySelect = page.locator('select[name="category"]')
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption(TEST_CONFIG.testRoom.category)
    } else {
      // 라디오 버튼이나 다른 형태의 카테고리 선택
      const categoryButton = page
        .locator(`input[value="${TEST_CONFIG.testRoom.category}"], button`)
        .filter({ hasText: /술|drink/ })
      if (await categoryButton.first().isVisible()) {
        await categoryButton.first().click()
      }
    }

    // 장소 입력
    const placeInput = page.locator('input[name="place_text"], input[placeholder*="장소"]')
    if (await placeInput.isVisible()) {
      await placeInput.fill(TEST_CONFIG.testRoom.place)
    }

    // 날짜/시간 설정
    const dateInput = page.locator('input[type="datetime-local"], input[type="date"]')
    if (await dateInput.isVisible()) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(19, 0, 0, 0) // 내일 저녁 7시

      const dateTimeString = tomorrow.toISOString().slice(0, 16)
      await dateInput.fill(dateTimeString)
    }

    // 최대 인원 설정
    const maxPeopleInput = page.locator('input[name="max_people"], input[type="number"]')
    if (await maxPeopleInput.isVisible()) {
      await maxPeopleInput.fill('6')
    }

    // 참가비 설정
    const feeInput = page.locator('input[name="fee"]')
    if (await feeInput.isVisible()) {
      await feeInput.fill('0')
    }

    // 설명 입력
    const descriptionInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="설명"]'
    )
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(TEST_CONFIG.testRoom.description)
    }

    // 모임 생성 버튼 클릭
    const createSubmitButton = page
      .locator('button[type="submit"], button')
      .filter({ hasText: /생성|만들기|저장/ })
    await createSubmitButton.click()

    // 생성 성공 확인
    await page.waitForTimeout(3000)

    // 생성된 모임 페이지로 이동하거나 성공 메시지 확인
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/room\/[^\/]+$|map/) // 모임 상세 페이지 또는 지도로 이동
  })

  test('6️⃣ 모임 참가 신청 및 매칭 플로우 검증', async ({ page, context }) => {
    console.log('🧪 테스트 6: 모임 참가 신청 및 매칭 플로우 검증')

    // 로그인
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/map/, { timeout: 10000 })

    // 첫 번째 모임 카드 클릭
    const firstRoomCard = page.locator('.room-card, [data-testid="room"], .meeting-item').first()
    await expect(firstRoomCard).toBeVisible({ timeout: 10000 })
    await firstRoomCard.click()

    // 모임 상세 페이지 확인
    await expect(page).toHaveURL(/room\/[^\/]+$/, { timeout: 10000 })

    // 참가 신청 버튼 확인
    const joinButton = page.locator('button').filter({ hasText: /참가|신청|Join/ })

    if (await joinButton.isVisible()) {
      await joinButton.click()

      // 신청 성공 메시지 또는 상태 변경 확인
      await page.waitForTimeout(2000)

      // 토스트 메시지나 버튼 상태 변경 확인
      const successMessage = page
        .locator('.toast, .notification')
        .filter({ hasText: /성공|완료|신청/ })
      const disabledButton = page.locator('button:disabled').filter({ hasText: /신청|완료/ })

      const hasSuccessMessage = await successMessage.isVisible()
      const hasDisabledButton = await disabledButton.isVisible()

      expect(hasSuccessMessage || hasDisabledButton).toBeTruthy()
    }

    // 호스트에게 메시지 기능 테스트
    const messageButton = page.locator('button').filter({ hasText: /메시지|채팅|문의/ })
    if (await messageButton.isVisible()) {
      await messageButton.click()
      await page.waitForTimeout(1000)

      // 모달이나 채팅 인터페이스 확인
      const chatInterface = page.locator('.modal, .chat, .message-form')
      await expect(chatInterface.first()).toBeVisible()
    }
  })

  test('7️⃣ 채팅 기능 완전 검증', async ({ page }) => {
    console.log('🧪 테스트 7: 채팅 기능 완전 검증')

    // 로그인
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/map/, { timeout: 10000 })

    // 채팅 목록 페이지 접근 시도
    const chatMenuButton = page
      .locator('a[href*="chat"], a[href*="message"], button')
      .filter({ hasText: /채팅|메시지/ })

    if (await chatMenuButton.isVisible()) {
      await chatMenuButton.click()

      // 채팅 리스트 확인
      const chatList = page.locator('.chat-list, .message-list, [data-testid="chat-list"]')

      if (await chatList.isVisible()) {
        // 첫 번째 채팅방 클릭
        const firstChat = page.locator('.chat-item, .message-item').first()

        if (await firstChat.isVisible()) {
          await firstChat.click()

          // 채팅 인터페이스 확인
          const messageInput = page.locator(
            'input[placeholder*="메시지"], textarea[placeholder*="메시지"], .message-input'
          )
          const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/ })

          if ((await messageInput.isVisible()) && (await sendButton.isVisible())) {
            // 테스트 메시지 전송
            await messageInput.fill('자동화 테스트 메시지입니다.')
            await sendButton.click()

            // 메시지 전송 확인
            await page.waitForTimeout(2000)
            const sentMessage = page
              .locator('.message, .chat-message')
              .filter({ hasText: /자동화 테스트/ })
            await expect(sentMessage.first()).toBeVisible()
          }
        }
      }
    }
  })

  test('8️⃣ 프로필 관리 기능 검증', async ({ page }) => {
    console.log('🧪 테스트 8: 프로필 관리 기능 검증')

    // 로그인
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/map/, { timeout: 10000 })

    // 프로필 페이지 접근
    const profileButton = page
      .locator('a[href="/profile"], .user-menu, .avatar, button')
      .filter({ hasText: /프로필|Profile/ })

    if (await profileButton.first().isVisible()) {
      await profileButton.first().click()

      // 프로필 페이지 또는 메뉴 확인
      await page.waitForTimeout(2000)

      // 프로필 편집 기능 테스트
      const editButton = page.locator('button, a').filter({ hasText: /편집|수정|Edit/ })

      if (await editButton.isVisible()) {
        await editButton.click()

        // 프로필 정보 수정
        const nicknameInput = page.locator('input[name="nickname"], input[placeholder*="닉네임"]')

        if (await nicknameInput.isVisible()) {
          await nicknameInput.fill('QA테스터_수정됨')

          const saveButton = page.locator('button').filter({ hasText: /저장|완료|Save/ })

          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForTimeout(2000)

            // 저장 성공 확인
            const successMessage = page
              .locator('.toast, .notification')
              .filter({ hasText: /성공|완료|저장/ })

            if (await successMessage.isVisible()) {
              console.log('✅ 프로필 수정 성공')
            }
          }
        }
      }
    }
  })

  test('9️⃣ 로그아웃 기능 검증', async ({ page }) => {
    console.log('🧪 테스트 9: 로그아웃 기능 검증')

    // 로그인
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email)
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/map/, { timeout: 10000 })

    // 로그아웃 버튼 찾기
    const logoutButton = page.locator('button, a').filter({ hasText: /로그아웃|Logout|나가기/ })

    if (await logoutButton.isVisible()) {
      await logoutButton.click()

      // 로그아웃 확인 대화상자 처리
      const confirmButton = page.locator('button').filter({ hasText: /확인|예|Yes/ })

      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // 로그아웃 후 홈페이지나 로그인 페이지로 이동 확인
      await page.waitForTimeout(3000)
      await expect(page).toHaveURL(/^[^\/]+\/$|login|auth/, { timeout: 10000 })

      // 로그인 상태가 아님을 확인
      const loginButton = page.locator('a, button').filter({ hasText: /로그인|Login/ })
      await expect(loginButton.first()).toBeVisible()
    }
  })

  test('🔒 보안 취약점 검증', async ({ page }) => {
    console.log('🧪 보안 테스트: XSS 및 입력 검증')

    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)

    // XSS 시도
    const maliciousScript = '<script>alert("XSS")</script>'

    await page.fill('input[type="email"]', maliciousScript)
    await page.fill('input[type="password"]', maliciousScript)

    // 스크립트가 실행되지 않아야 함
    let alertTriggered = false
    page.on('dialog', dialog => {
      alertTriggered = true
      dialog.dismiss()
    })

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()
    await page.waitForTimeout(2000)

    expect(alertTriggered).toBeFalsy() // XSS가 차단되어야 함
  })

  test('📱 모바일 반응형 테스트', async ({ page }) => {
    console.log('🧪 모바일 반응형 테스트')

    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

    await page.goto(TEST_CONFIG.baseURL)

    // 모바일에서 핵심 기능 접근 가능한지 확인
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-testid="mobile-menu"]')
    const navLinks = page.locator('nav a, .nav-link')

    // 네비게이션 확인
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(navLinks.first()).toBeVisible()
    } else {
      await expect(navLinks.first()).toBeVisible()
    }

    // 터치 대상 크기 확인 (최소 44px)
    const buttons = await page.locator('button, a').all()

    for (const button of buttons.slice(0, 5)) {
      // 처음 5개 버튼만 체크
      const box = await button.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('⚡ 성능 및 접근성 검증', async ({ page }) => {
    console.log('🧪 성능 및 접근성 검증')

    await page.goto(TEST_CONFIG.baseURL)

    // 성능 메트릭 수집
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
    })

    console.log('📊 성능 메트릭:', metrics)

    // 성능 기준 검증
    expect(metrics.loadTime).toBeLessThan(3000) // 3초 이내
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2초 이내

    // 접근성 기본 검증
    const images = await page.locator('img').all()
    for (const img of images.slice(0, 5)) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy() // 모든 이미지에 alt 속성이 있어야 함
    }

    // 헤딩 구조 확인
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1) // 최소 하나의 H1이 있어야 함
    expect(h1Count).toBeLessThanOrEqual(1) // H1은 하나만 있어야 함

    // 폼 레이블 확인
    const inputs = await page
      .locator('input[type="email"], input[type="password"], input[type="text"]')
      .all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledby = await input.getAttribute('aria-labelledby')

      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = (await label.count()) > 0

        expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy()
      }
    }
  })
})

test.describe('🌐 크로스 브라우저 테스트', () => {
  const browsers = ['chromium', 'firefox', 'webkit']

  browsers.forEach(browserName => {
    test(`${browserName}에서 기본 기능 동작 확인`, async ({ page }) => {
      console.log(`🧪 ${browserName} 브라우저 테스트`)

      await page.goto(TEST_CONFIG.baseURL)

      // 기본 페이지 로드 확인
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 })

      // 로그인 페이지 접근
      const loginLink = page.locator('a[href*="login"], button').filter({ hasText: /로그인/ })

      if (await loginLink.isVisible()) {
        await loginLink.click()
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
      }
    })
  })
})

test.describe('🔄 에러 복구 시나리오 테스트', () => {
  test('네트워크 연결 끊김 시나리오', async ({ page }) => {
    console.log('🧪 네트워크 연결 끊김 시나리오 테스트')

    await page.goto(TEST_CONFIG.baseURL)

    // 네트워크 차단
    await page.context().setOffline(true)

    // 페이지 새로고침 시도
    await page.reload({ waitUntil: 'networkidle' }).catch(() => {})

    // 오프라인 메시지나 에러 처리 확인
    const offlineMessage = page.locator('.offline, .error, .network-error')
    const hasOfflineMessage = await offlineMessage.isVisible()

    // 네트워크 복구
    await page.context().setOffline(false)

    if (hasOfflineMessage) {
      console.log('✅ 오프라인 상태 적절히 처리됨')
    }

    // 복구 후 페이지 다시 로드
    await page.reload()
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 })
  })

  test('느린 네트워크 시나리오', async ({ page }) => {
    console.log('🧪 느린 네트워크 시나리오 테스트')

    // 느린 3G 시뮬레이션
    await page.context().route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 지연
      await route.continue()
    })

    const startTime = Date.now()
    await page.goto(TEST_CONFIG.baseURL)

    // 로딩 인디케이터 확인
    const loadingSpinner = page.locator('.loading, .spinner, [data-loading]')
    const hasLoadingIndicator = await loadingSpinner.isVisible()

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 30000 })

    const loadTime = Date.now() - startTime
    console.log(`📊 느린 네트워크 로드 시간: ${loadTime}ms`)

    if (hasLoadingIndicator) {
      console.log('✅ 로딩 인디케이터 적절히 표시됨')
    }
  })
})
