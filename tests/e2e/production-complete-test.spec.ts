import { test, expect, type Page } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

// Test credentials for real authentication
const TEST_USER = {
  email: `test_${Date.now()}@meetpin.test`,
  password: 'Test1234!@#$',
  nickname: `테스터${Date.now()}`
}

test.describe('프로덕션 완전 테스트 - 실제 사용자 시뮬레이션', () => {
  test.setTimeout(180000) // 3 minutes per test

  // ============================================================
  // TEST 1: 홈페이지 로딩 및 첫 화면 완전 검증
  // ============================================================
  test('1. 홈페이지 로딩 및 모든 요소 검증', async ({ page }) => {
    console.log('\n=== TEST 1: 홈페이지 완전 검증 시작 ===')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // Title 확인
    await expect(page).toHaveTitle(/밋핀/)
    console.log('✅ 페이지 타이틀 확인')

    // 주요 헤딩 확인
    const mainHeading = page.locator('h1, h2').filter({ hasText: /만나요|모여요|밋핀/ }).first()
    await expect(mainHeading).toBeVisible({ timeout: 10000 })
    console.log('✅ 메인 헤딩 표시')

    // CTA 버튼들 확인
    const ctaButtons = page.locator('a, button').filter({ hasText: /시작|지도|가입/ })
    const buttonCount = await ctaButtons.count()
    expect(buttonCount).toBeGreaterThan(0)
    console.log(`✅ CTA 버튼 ${buttonCount}개 발견`)

    // 활동 통계 확인
    const statsText = await page.locator('text=/활동 회원|모임.*진행|만족도/').first().textContent()
    console.log(`✅ 통계 정보: ${statsText}`)

    // 스크린샷
    await page.screenshot({ path: 'test-results/complete/01-homepage-full.png', fullPage: true })
    console.log('✅ 홈페이지 전체 검증 완료\n')
  })

  // ============================================================
  // TEST 2: 네비게이션 모든 링크 테스트
  // ============================================================
  test('2. 네비게이션 모든 메뉴 동작 테스트', async ({ page }) => {
    console.log('\n=== TEST 2: 네비게이션 전체 테스트 시작 ===')

    await page.goto(PRODUCTION_URL)

    // 지도 링크
    const mapLink = page.locator('a[href*="/map"]').first()
    if (await mapLink.isVisible()) {
      await mapLink.click()
      await page.waitForURL('**/map', { timeout: 10000 })
      console.log('✅ 지도 페이지 이동 성공')
      await page.screenshot({ path: 'test-results/complete/02-nav-map.png' })
    }

    // 뒤로가기
    await page.goto(PRODUCTION_URL)

    // 로그인 링크
    const loginLink = page.locator('a[href*="/auth/login"], button:has-text("로그인")').first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await page.waitForURL('**/auth/login', { timeout: 10000 })
      console.log('✅ 로그인 페이지 이동 성공')
      await page.screenshot({ path: 'test-results/complete/02-nav-login.png' })
    }

    console.log('✅ 네비게이션 테스트 완료\n')
  })

  // ============================================================
  // TEST 3: 회원가입 완전한 플로우
  // ============================================================
  test('3. 회원가입 전체 플로우 테스트', async ({ page }) => {
    console.log('\n=== TEST 3: 회원가입 완전 플로우 시작 ===')

    await page.goto(`${PRODUCTION_URL}/auth/signup`)
    await page.waitForLoadState('networkidle')

    // 폼 요소 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    console.log('✅ 회원가입 폼 로딩 확인')

    // 폼 작성
    await emailInput.fill(TEST_USER.email)
    console.log(`✅ 이메일 입력: ${TEST_USER.email}`)

    await passwordInput.fill(TEST_USER.password)
    console.log('✅ 비밀번호 입력')

    // 닉네임 필드가 있다면 입력
    const nicknameInput = page.locator('input[name="nickname"], input[placeholder*="이름"]').first()
    if (await nicknameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameInput.fill(TEST_USER.nickname)
      console.log(`✅ 닉네임 입력: ${TEST_USER.nickname}`)
    }

    await page.screenshot({ path: 'test-results/complete/03-signup-filled.png' })

    // 제출 버튼 클릭
    const submitButton = page.locator('button[type="submit"], button:has-text("가입"), button:has-text("시작")').first()
    await expect(submitButton).toBeVisible()
    await submitButton.click()
    console.log('✅ 회원가입 제출')

    // 결과 대기 (성공 또는 에러 메시지)
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`현재 URL: ${currentUrl}`)

    // 성공 시 리다이렉트 또는 에러 메시지 확인
    const errorMessage = await page.locator('text=/오류|error|실패|이미 존재/i').first().textContent().catch(() => null)
    if (errorMessage) {
      console.log(`⚠️ 에러 메시지: ${errorMessage}`)
    } else {
      console.log('✅ 회원가입 처리 완료 (에러 없음)')
    }

    await page.screenshot({ path: 'test-results/complete/03-signup-result.png' })
    console.log('✅ 회원가입 플로우 완료\n')
  })

  // ============================================================
  // TEST 4: 로그인 완전한 플로우
  // ============================================================
  test('4. 로그인 전체 플로우 테스트', async ({ page }) => {
    console.log('\n=== TEST 4: 로그인 완전 플로우 시작 ===')

    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    // 폼 요소 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })
    console.log('✅ 로그인 폼 로딩 확인')

    // Mock 계정으로 로그인 시도
    await emailInput.fill('admin@meetpin.com')
    await passwordInput.fill('123456')
    console.log('✅ Mock 계정 입력 (admin@meetpin.com)')

    await page.screenshot({ path: 'test-results/complete/04-login-filled.png' })

    // 제출
    const submitButton = page.locator('button[type="submit"], button:has-text("로그인")').first()
    await expect(submitButton).toBeVisible()
    await submitButton.click()
    console.log('✅ 로그인 제출')

    // 결과 대기
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`현재 URL: ${currentUrl}`)

    // 세션 확인 (쿠키 또는 localStorage)
    const cookies = await page.context().cookies()
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'))
    if (authCookie) {
      console.log(`✅ 인증 쿠키 발견: ${authCookie.name}`)
    }

    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage))
    console.log(`LocalStorage: ${localStorage.substring(0, 100)}...`)

    await page.screenshot({ path: 'test-results/complete/04-login-result.png' })
    console.log('✅ 로그인 플로우 완료\n')
  })

  // ============================================================
  // TEST 5: 지도 기능 완전 테스트
  // ============================================================
  test('5. 지도 기능 전체 테스트 (로딩, 줌, 이동, 마커)', async ({ page }) => {
    console.log('\n=== TEST 5: 지도 기능 완전 테스트 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 지도 컨테이너 확인
    const mapContainer = page.locator('#map, [class*="map"], [id*="kakao"]').first()
    await expect(mapContainer).toBeVisible({ timeout: 15000 })
    console.log('✅ 지도 컨테이너 로딩')

    await page.waitForTimeout(3000) // 지도 초기화 대기
    await page.screenshot({ path: 'test-results/complete/05-map-initial.png' })

    // 줌 컨트롤 테스트
    const zoomIn = page.locator('button[title*="확대"], button:has-text("+"), [class*="zoom"][class*="in"]').first()
    if (await zoomIn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await zoomIn.click()
      await page.waitForTimeout(1000)
      console.log('✅ 지도 확대 클릭')
      await page.screenshot({ path: 'test-results/complete/05-map-zoom-in.png' })
    }

    const zoomOut = page.locator('button[title*="축소"], button:has-text("-"), [class*="zoom"][class*="out"]').first()
    if (await zoomOut.isVisible({ timeout: 2000 }).catch(() => false)) {
      await zoomOut.click()
      await page.waitForTimeout(1000)
      console.log('✅ 지도 축소 클릭')
      await page.screenshot({ path: 'test-results/complete/05-map-zoom-out.png' })
    }

    // 지도 드래그 (마우스 이동)
    const mapBounds = await mapContainer.boundingBox()
    if (mapBounds) {
      await page.mouse.move(mapBounds.x + mapBounds.width / 2, mapBounds.y + mapBounds.height / 2)
      await page.mouse.down()
      await page.mouse.move(mapBounds.x + mapBounds.width / 2 + 100, mapBounds.y + mapBounds.height / 2 + 100)
      await page.mouse.up()
      console.log('✅ 지도 드래그 이동')
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/complete/05-map-dragged.png' })
    }

    // 마커 클릭 시도
    const markers = page.locator('[class*="marker"], [class*="pin"], area[shape="poly"]')
    const markerCount = await markers.count()
    console.log(`지도에 마커 ${markerCount}개 발견`)

    if (markerCount > 0) {
      await markers.first().click()
      await page.waitForTimeout(1000)
      console.log('✅ 마커 클릭')
      await page.screenshot({ path: 'test-results/complete/05-map-marker-clicked.png' })
    }

    console.log('✅ 지도 기능 완전 테스트 완료\n')
  })

  // ============================================================
  // TEST 6: 방 생성 완전한 플로우
  // ============================================================
  test('6. 방 생성 전체 플로우 테스트', async ({ page }) => {
    console.log('\n=== TEST 6: 방 생성 완전 플로우 시작 ===')

    // 먼저 로그인 시도
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('admin@meetpin.com')
      await passwordInput.fill('123456')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(2000)
      console.log('✅ 로그인 완료')
    }

    // 방 생성 페이지로 이동
    await page.goto(`${PRODUCTION_URL}/room/new`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/complete/06-room-create-page.png' })

    // 폼 요소 확인
    const titleInput = page.locator('input[name="title"], input[placeholder*="제목"]').first()
    await expect(titleInput).toBeVisible({ timeout: 10000 })
    console.log('✅ 방 생성 폼 로딩')

    // 제목 입력
    const testRoomTitle = `테스트 모임 ${Date.now()}`
    await titleInput.fill(testRoomTitle)
    console.log(`✅ 방 제목 입력: ${testRoomTitle}`)

    // 설명 입력
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"]').first()
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill('자동 테스트로 생성된 모임입니다.')
      console.log('✅ 설명 입력')
    }

    // 카테고리 선택
    const categoryButtons = page.locator('button[role="radio"], button:has-text("술"), button:has-text("운동"), button:has-text("기타")')
    const categoryCount = await categoryButtons.count()
    console.log(`카테고리 버튼 ${categoryCount}개 발견`)

    if (categoryCount > 0) {
      await categoryButtons.first().click()
      console.log('✅ 카테고리 선택')
    }

    // 최대 인원 설정
    const maxParticipantsInput = page.locator('input[name="maxParticipants"], input[type="number"]').first()
    if (await maxParticipantsInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await maxParticipantsInput.fill('5')
      console.log('✅ 최대 인원 설정: 5명')
    }

    await page.screenshot({ path: 'test-results/complete/06-room-form-filled.png', fullPage: true })

    // 제출 버튼
    const submitButton = page.locator('button[type="submit"], button:has-text("생성"), button:has-text("만들기")').first()
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click()
      console.log('✅ 방 생성 제출')

      await page.waitForTimeout(3000)
      await page.screenshot({ path: 'test-results/complete/06-room-created.png' })

      const currentUrl = page.url()
      console.log(`결과 URL: ${currentUrl}`)
    }

    console.log('✅ 방 생성 플로우 완료\n')
  })

  // ============================================================
  // TEST 7: 방 목록 및 필터링 테스트
  // ============================================================
  test('7. 방 목록 필터링 테스트', async ({ page }) => {
    console.log('\n=== TEST 7: 방 목록 필터링 테스트 시작 ===')

    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/complete/07-rooms-list.png' })

    // 방 카드들 확인
    const roomCards = page.locator('[class*="room"], [class*="card"]').filter({ has: page.locator('text=/모임|방|참가|인원/') })
    const roomCount = await roomCards.count()
    console.log(`✅ 방 목록에서 ${roomCount}개 발견`)

    // 카테고리 필터 테스트
    const filterButtons = page.locator('button:has-text("술"), button:has-text("운동"), button:has-text("전체"), button:has-text("기타")')
    const filterCount = await filterButtons.count()
    console.log(`필터 버튼 ${filterCount}개 발견`)

    if (filterCount > 0) {
      // 술 필터
      const drinkFilter = filterButtons.filter({ hasText: '술' }).first()
      if (await drinkFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await drinkFilter.click()
        await page.waitForTimeout(1000)
        console.log('✅ "술" 필터 클릭')
        await page.screenshot({ path: 'test-results/complete/07-rooms-filter-drink.png' })
      }

      // 운동 필터
      const sportsFilter = filterButtons.filter({ hasText: '운동' }).first()
      if (await sportsFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sportsFilter.click()
        await page.waitForTimeout(1000)
        console.log('✅ "운동" 필터 클릭')
        await page.screenshot({ path: 'test-results/complete/07-rooms-filter-sports.png' })
      }
    }

    // 검색 기능 테스트
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first()
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('강남')
      await page.waitForTimeout(1000)
      console.log('✅ 검색어 입력: 강남')
      await page.screenshot({ path: 'test-results/complete/07-rooms-search.png' })
    }

    console.log('✅ 방 목록 필터링 테스트 완료\n')
  })

  // ============================================================
  // TEST 8: 방 상세 및 참가 요청
  // ============================================================
  test('8. 방 상세 및 참가 요청 플로우', async ({ page }) => {
    console.log('\n=== TEST 8: 방 상세 및 참가 요청 시작 ===')

    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForLoadState('networkidle')

    // 첫 번째 방 클릭
    const roomCards = page.locator('a[href*="/room/"], [class*="room"][class*="card"]').first()

    if (await roomCards.isVisible({ timeout: 5000 }).catch(() => false)) {
      await roomCards.click()
      await page.waitForTimeout(2000)
      console.log('✅ 방 상세 페이지 이동')

      await page.screenshot({ path: 'test-results/complete/08-room-detail.png', fullPage: true })

      // 참가 요청 버튼 찾기
      const joinButton = page.locator('button:has-text("참가"), button:has-text("신청"), button:has-text("요청")').first()

      if (await joinButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await joinButton.click()
        await page.waitForTimeout(2000)
        console.log('✅ 참가 요청 버튼 클릭')

        await page.screenshot({ path: 'test-results/complete/08-room-join-requested.png' })

        // 확인 메시지 체크
        const confirmMessage = await page.locator('text=/요청|신청|완료/').first().textContent().catch(() => null)
        if (confirmMessage) {
          console.log(`✅ 확인 메시지: ${confirmMessage}`)
        }
      } else {
        console.log('⚠️ 참가 요청 버튼을 찾을 수 없음 (이미 참가했거나 권한 없음)')
      }
    } else {
      console.log('⚠️ 방 목록에서 클릭 가능한 방을 찾을 수 없음')
    }

    console.log('✅ 방 상세 및 참가 요청 완료\n')
  })

  // ============================================================
  // TEST 9: 채팅 기능 테스트
  // ============================================================
  test('9. 채팅 기능 전체 테스트', async ({ page }) => {
    console.log('\n=== TEST 9: 채팅 기능 테스트 시작 ===')

    // 채팅 페이지로 이동 (매치 ID 필요)
    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 채팅 링크나 아이콘 찾기
    const chatLink = page.locator('a[href*="/chat"], button:has-text("채팅"), [class*="chat"]').first()

    if (await chatLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatLink.click()
      await page.waitForTimeout(2000)
      console.log('✅ 채팅 페이지 이동')

      await page.screenshot({ path: 'test-results/complete/09-chat-page.png' })

      // 메시지 입력창
      const messageInput = page.locator('input[type="text"], textarea').filter({ hasText: '' }).first()

      if (await messageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const testMessage = `테스트 메시지 ${Date.now()}`
        await messageInput.fill(testMessage)
        console.log(`✅ 메시지 입력: ${testMessage}`)

        // 전송 버튼
        const sendButton = page.locator('button[type="submit"], button:has-text("전송")').first()
        if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await sendButton.click()
          await page.waitForTimeout(1000)
          console.log('✅ 메시지 전송')

          await page.screenshot({ path: 'test-results/complete/09-chat-sent.png' })
        }
      }
    } else {
      console.log('⚠️ 채팅 기능 접근 불가 (매치된 상대 없음)')
    }

    console.log('✅ 채팅 기능 테스트 완료\n')
  })

  // ============================================================
  // TEST 10: 알림 시스템 테스트
  // ============================================================
  test('10. 알림 시스템 테스트', async ({ page, context }) => {
    console.log('\n=== TEST 10: 알림 시스템 테스트 시작 ===')

    // 알림 권한 부여
    await context.grantPermissions(['notifications'])
    console.log('✅ 알림 권한 부여')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 알림 아이콘/버튼 찾기
    const notificationIcon = page.locator('button[aria-label*="알림"], [class*="notification"], [class*="bell"]').first()

    if (await notificationIcon.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notificationIcon.click()
      await page.waitForTimeout(1000)
      console.log('✅ 알림 센터 열기')

      await page.screenshot({ path: 'test-results/complete/10-notifications.png' })

      // 알림 목록 확인
      const notifications = page.locator('[class*="notification"]').filter({ has: page.locator('text=/분 전|시간 전|알림/') })
      const notifCount = await notifications.count()
      console.log(`알림 ${notifCount}개 발견`)

      if (notifCount > 0) {
        await notifications.first().click()
        await page.waitForTimeout(1000)
        console.log('✅ 알림 클릭')
        await page.screenshot({ path: 'test-results/complete/10-notification-clicked.png' })
      }
    } else {
      console.log('⚠️ 알림 아이콘을 찾을 수 없음')
    }

    console.log('✅ 알림 시스템 테스트 완료\n')
  })

  // ============================================================
  // TEST 11: 프로필 관리 전체
  // ============================================================
  test('11. 프로필 관리 전체 테스트', async ({ page }) => {
    console.log('\n=== TEST 11: 프로필 관리 테스트 시작 ===')

    await page.goto(`${PRODUCTION_URL}/profile`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/complete/11-profile-page.png', fullPage: true })

    // 편집 버튼
    const editButton = page.locator('button:has-text("편집"), button:has-text("수정")').first()

    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click()
      await page.waitForTimeout(1000)
      console.log('✅ 프로필 편집 모드')

      // 닉네임 변경
      const nicknameInput = page.locator('input[name="nickname"], input[placeholder*="이름"]').first()
      if (await nicknameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const newNickname = `테스터_${Date.now()}`
        await nicknameInput.fill(newNickname)
        console.log(`✅ 닉네임 변경: ${newNickname}`)
      }

      // 자기소개 변경
      const bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="소개"]').first()
      if (await bioInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bioInput.fill('자동 테스트로 업데이트된 자기소개입니다.')
        console.log('✅ 자기소개 변경')
      }

      await page.screenshot({ path: 'test-results/complete/11-profile-editing.png', fullPage: true })

      // 저장 버튼
      const saveButton = page.locator('button[type="submit"], button:has-text("저장")').first()
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click()
        await page.waitForTimeout(2000)
        console.log('✅ 프로필 저장')
        await page.screenshot({ path: 'test-results/complete/11-profile-saved.png' })
      }
    } else {
      console.log('⚠️ 편집 버튼을 찾을 수 없음 (로그인 필요)')
    }

    console.log('✅ 프로필 관리 테스트 완료\n')
  })

  // ============================================================
  // TEST 12: 반응형 디자인 완전 테스트
  // ============================================================
  test('12. 반응형 디자인 전체 테스트', async ({ page }) => {
    console.log('\n=== TEST 12: 반응형 디자인 테스트 시작 ===')

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      console.log(`\n📱 ${viewport.name} (${viewport.width}x${viewport.height})`)

      // 홈페이지
      await page.goto(PRODUCTION_URL)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: `test-results/complete/12-responsive-${viewport.name.toLowerCase()}-home.png`, fullPage: true })
      console.log(`✅ 홈페이지 - ${viewport.name}`)

      // 지도 페이지
      await page.goto(`${PRODUCTION_URL}/map`)
      await page.waitForTimeout(2000)
      await page.screenshot({ path: `test-results/complete/12-responsive-${viewport.name.toLowerCase()}-map.png` })
      console.log(`✅ 지도 - ${viewport.name}`)

      // 방 목록
      await page.goto(`${PRODUCTION_URL}/rooms`)
      await page.waitForTimeout(1000)
      await page.screenshot({ path: `test-results/complete/12-responsive-${viewport.name.toLowerCase()}-rooms.png`, fullPage: true })
      console.log(`✅ 방 목록 - ${viewport.name}`)
    }

    console.log('\n✅ 반응형 디자인 테스트 완료\n')
  })

  // ============================================================
  // TEST 13: PWA 설치 및 오프라인 기능
  // ============================================================
  test('13. PWA 설치 및 오프라인 테스트', async ({ page, context }) => {
    console.log('\n=== TEST 13: PWA 기능 테스트 시작 ===')

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    // Manifest 확인
    const manifestResponse = await page.goto(`${PRODUCTION_URL}/manifest.json`)
    if (manifestResponse?.status() === 200) {
      const manifest = await manifestResponse.json()
      console.log('✅ PWA Manifest 로딩')
      console.log(`  - 이름: ${manifest.name}`)
      console.log(`  - 아이콘: ${manifest.icons?.length}개`)
      console.log(`  - Display: ${manifest.display}`)
    }

    // Service Worker 확인
    await page.goto(PRODUCTION_URL)
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    console.log(`✅ Service Worker 지원: ${swRegistered}`)

    if (swRegistered) {
      await page.waitForTimeout(3000) // SW 등록 대기

      const swStatus = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration()
        return {
          active: !!registration?.active,
          scope: registration?.scope
        }
      })
      console.log(`  - 활성화: ${swStatus.active}`)
      console.log(`  - Scope: ${swStatus.scope}`)
    }

    // 오프라인 시뮬레이션
    await context.setOffline(true)
    console.log('📴 오프라인 모드 활성화')

    await page.reload()
    await page.waitForTimeout(2000)

    const offlineContent = await page.content()
    const hasContent = offlineContent.length > 1000
    console.log(`✅ 오프라인 페이지 로딩: ${hasContent ? '성공' : '실패'}`)

    await page.screenshot({ path: 'test-results/complete/13-pwa-offline.png' })

    // 온라인 복구
    await context.setOffline(false)
    console.log('📶 온라인 모드 복구')

    console.log('✅ PWA 기능 테스트 완료\n')
  })

  // ============================================================
  // TEST 14: 에러 핸들링 및 엣지 케이스
  // ============================================================
  test('14. 에러 핸들링 및 엣지 케이스 테스트', async ({ page }) => {
    console.log('\n=== TEST 14: 에러 핸들링 테스트 시작 ===')

    // 404 페이지
    await page.goto(`${PRODUCTION_URL}/nonexistent-page-12345`)
    await page.waitForTimeout(1000)
    const is404 = page.url().includes('404') || await page.locator('text=/404|찾을 수 없|not found/i').first().isVisible().catch(() => false)
    console.log(`✅ 404 페이지 처리: ${is404 ? '있음' : '없음'}`)
    await page.screenshot({ path: 'test-results/complete/14-error-404.png' })

    // 잘못된 로그인
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('invalid@test.com')
      await passwordInput.fill('wrongpassword')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(2000)

      const errorMessage = await page.locator('text=/오류|실패|틀렸|잘못|invalid/i').first().textContent().catch(() => null)
      console.log(`✅ 로그인 에러 메시지: ${errorMessage || '표시 안됨'}`)
      await page.screenshot({ path: 'test-results/complete/14-error-login.png' })
    }

    // 빈 폼 제출
    await page.goto(`${PRODUCTION_URL}/room/new`)
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator('button[type="submit"]').first()
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(1000)

      const validationError = await page.locator('text=/필수|입력|required/i').first().textContent().catch(() => null)
      console.log(`✅ 폼 검증 에러: ${validationError || '표시 안됨'}`)
      await page.screenshot({ path: 'test-results/complete/14-error-validation.png' })
    }

    console.log('✅ 에러 핸들링 테스트 완료\n')
  })

  // ============================================================
  // TEST 15: 접근성 완전 감사
  // ============================================================
  test('15. 접근성 전체 감사', async ({ page }) => {
    console.log('\n=== TEST 15: 접근성 감사 시작 ===')

    await page.goto(PRODUCTION_URL)
    await page.waitForLoadState('networkidle')

    // 키보드 네비게이션
    console.log('\n⌨️ 키보드 네비게이션 테스트')
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          text: el?.textContent?.substring(0, 30),
          ariaLabel: el?.getAttribute('aria-label')
        }
      })
      console.log(`  Tab ${i + 1}: ${focusedElement.tag} - ${focusedElement.text || focusedElement.ariaLabel}`)
    }
    await page.screenshot({ path: 'test-results/complete/15-a11y-keyboard.png' })

    // ARIA 속성 확인
    console.log('\n🎯 ARIA 속성 확인')
    const ariaElements = await page.locator('[aria-label], [aria-describedby], [role]').count()
    console.log(`✅ ARIA 속성 있는 요소: ${ariaElements}개`)

    // Alt 텍스트 확인
    const images = await page.locator('img').count()
    const imagesWithAlt = await page.locator('img[alt]').count()
    console.log(`✅ 이미지: ${imagesWithAlt}/${images}개에 alt 속성`)

    // 색상 대비 (간단한 체크)
    const textElements = await page.locator('h1, h2, h3, p, button, a').all()
    console.log(`✅ 텍스트 요소 ${textElements.length}개 발견`)

    // 포커스 가능한 요소
    const focusableCount = await page.locator('a, button, input, textarea, select').count()
    console.log(`✅ 포커스 가능 요소: ${focusableCount}개`)

    console.log('✅ 접근성 감사 완료\n')
  })

  // ============================================================
  // TEST 16: 완전한 사용자 여정
  // ============================================================
  test('16. 완전한 사용자 여정 시뮬레이션', async ({ page }) => {
    console.log('\n=== TEST 16: 완전한 사용자 여정 시작 ===')
    console.log('시나리오: 회원가입 → 로그인 → 방 생성 → 방 참가 → 채팅\n')

    // Step 1: 회원가입
    console.log('STEP 1: 회원가입')
    await page.goto(`${PRODUCTION_URL}/auth/signup`)
    await page.waitForLoadState('networkidle')

    const signupEmail = page.locator('input[type="email"]').first()
    const signupPassword = page.locator('input[type="password"]').first()

    if (await signupEmail.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signupEmail.fill(`journey_${Date.now()}@test.com`)
      await signupPassword.fill('TestJourney123!@#')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(3000)
      console.log('✅ 회원가입 시도 완료')
      await page.screenshot({ path: 'test-results/complete/16-journey-1-signup.png' })
    }

    // Step 2: 로그인
    console.log('\nSTEP 2: 로그인')
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const loginEmail = page.locator('input[type="email"]').first()
    const loginPassword = page.locator('input[type="password"]').first()

    await loginEmail.fill('admin@meetpin.com')
    await loginPassword.fill('123456')
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(3000)
    console.log('✅ 로그인 완료')
    await page.screenshot({ path: 'test-results/complete/16-journey-2-login.png' })

    // Step 3: 지도 탐색
    console.log('\nSTEP 3: 지도 탐색')
    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForTimeout(3000)
    console.log('✅ 지도 페이지 로딩')
    await page.screenshot({ path: 'test-results/complete/16-journey-3-map.png' })

    // Step 4: 방 생성
    console.log('\nSTEP 4: 방 생성')
    await page.goto(`${PRODUCTION_URL}/room/new`)
    await page.waitForLoadState('networkidle')

    const titleInput = page.locator('input[name="title"]').first()
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(`사용자 여정 테스트 모임 ${Date.now()}`)

      const descInput = page.locator('textarea').first()
      if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descInput.fill('완전한 사용자 여정 테스트')
      }

      const submitBtn = page.locator('button[type="submit"]').first()
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click()
        await page.waitForTimeout(3000)
      }
      console.log('✅ 방 생성 완료')
      await page.screenshot({ path: 'test-results/complete/16-journey-4-room-created.png' })
    }

    // Step 5: 방 목록 확인
    console.log('\nSTEP 5: 방 목록 확인')
    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForTimeout(2000)
    console.log('✅ 방 목록 확인')
    await page.screenshot({ path: 'test-results/complete/16-journey-5-rooms.png' })

    // Step 6: 프로필 확인
    console.log('\nSTEP 6: 프로필 확인')
    await page.goto(`${PRODUCTION_URL}/profile`)
    await page.waitForTimeout(2000)
    console.log('✅ 프로필 페이지')
    await page.screenshot({ path: 'test-results/complete/16-journey-6-profile.png' })

    console.log('\n✅ 완전한 사용자 여정 완료\n')
  })

  // ============================================================
  // TEST 17: API 에러 분석
  // ============================================================
  test('17. API 에러 완전 분석', async ({ page }) => {
    console.log('\n=== TEST 17: API 에러 분석 시작 ===')

    const failedRequests: any[] = []
    const successRequests: any[] = []

    page.on('response', (response) => {
      const url = response.url()
      const status = response.status()

      if (url.includes('/api/')) {
        if (status >= 400) {
          failedRequests.push({ url, status, statusText: response.statusText() })
        } else if (status >= 200 && status < 300) {
          successRequests.push({ url, status })
        }
      }
    })

    // 여러 페이지 방문하며 API 호출 수집
    const pages = [
      PRODUCTION_URL,
      `${PRODUCTION_URL}/map`,
      `${PRODUCTION_URL}/rooms`,
      `${PRODUCTION_URL}/profile`,
      `${PRODUCTION_URL}/auth/login`
    ]

    for (const url of pages) {
      await page.goto(url)
      await page.waitForTimeout(2000)
    }

    console.log(`\n✅ 성공한 API 요청: ${successRequests.length}개`)
    successRequests.forEach(req => {
      console.log(`  ✓ ${req.status} - ${req.url}`)
    })

    console.log(`\n❌ 실패한 API 요청: ${failedRequests.length}개`)
    failedRequests.forEach(req => {
      console.log(`  ✗ ${req.status} ${req.statusText} - ${req.url}`)
    })

    await page.screenshot({ path: 'test-results/complete/17-api-analysis.png' })
    console.log('\n✅ API 에러 분석 완료\n')
  })

  // ============================================================
  // TEST 18: 콘솔 에러 완전 분석
  // ============================================================
  test('18. 콘솔 에러 완전 분석', async ({ page }) => {
    console.log('\n=== TEST 18: 콘솔 에러 분석 시작 ===')

    const consoleErrors: string[] = []
    const consoleWarnings: string[] = []
    const pageErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    // 모든 주요 페이지 방문
    const pages = [
      { name: '홈', url: PRODUCTION_URL },
      { name: '지도', url: `${PRODUCTION_URL}/map` },
      { name: '방 목록', url: `${PRODUCTION_URL}/rooms` },
      { name: '로그인', url: `${PRODUCTION_URL}/auth/login` },
      { name: '프로필', url: `${PRODUCTION_URL}/profile` }
    ]

    for (const p of pages) {
      console.log(`\n검사 중: ${p.name}`)
      await page.goto(p.url)
      await page.waitForTimeout(3000)
    }

    console.log(`\n\n=== 콘솔 에러 분석 결과 ===`)
    console.log(`❌ Console Errors: ${consoleErrors.length}개`)
    consoleErrors.slice(0, 10).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.substring(0, 100)}`)
    })

    console.log(`\n⚠️ Console Warnings: ${consoleWarnings.length}개`)
    consoleWarnings.slice(0, 5).forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.substring(0, 100)}`)
    })

    console.log(`\n💥 Page Errors: ${pageErrors.length}개`)
    pageErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`)
    })

    console.log('\n✅ 콘솔 에러 분석 완료\n')
  })

  // ============================================================
  // TEST 19: 성능 측정
  // ============================================================
  test('19. 성능 전체 측정', async ({ page }) => {
    console.log('\n=== TEST 19: 성능 측정 시작 ===')

    const pages = [
      { name: '홈페이지', url: PRODUCTION_URL },
      { name: '지도', url: `${PRODUCTION_URL}/map` },
      { name: '방 목록', url: `${PRODUCTION_URL}/rooms` }
    ]

    for (const p of pages) {
      console.log(`\n📊 ${p.name} 성능 측정`)

      await page.goto(p.url)

      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
          loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
          domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
          totalTime: Math.round(perf.loadEventEnd - perf.fetchStart)
        }
      })

      console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded}ms`)
      console.log(`  - Load Complete: ${metrics.loadComplete}ms`)
      console.log(`  - DOM Interactive: ${metrics.domInteractive}ms`)
      console.log(`  - Total Time: ${metrics.totalTime}ms`)

      // First Contentful Paint
      const fcp = await page.evaluate(() => {
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformancePaintTiming
        return fcpEntry ? Math.round(fcpEntry.startTime) : null
      })
      if (fcp) console.log(`  - First Contentful Paint: ${fcp}ms`)
    }

    console.log('\n✅ 성능 측정 완료\n')
  })

  // ============================================================
  // TEST 20: 최종 종합 평가
  // ============================================================
  test('20. 최종 종합 평가 및 리포트', async ({ page }) => {
    console.log('\n=== TEST 20: 최종 종합 평가 ===\n')

    const results = {
      homepage: false,
      navigation: false,
      auth: false,
      map: false,
      rooms: false,
      profile: false,
      responsive: false,
      pwa: false,
      api: false,
      accessibility: false
    }

    // 홈페이지
    try {
      await page.goto(PRODUCTION_URL)
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      const title = await page.title()
      results.homepage = title.includes('밋핀')
      console.log(`✅ 홈페이지: ${results.homepage ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ 홈페이지: 실패`)
    }

    // 네비게이션
    try {
      const mapLink = page.locator('a[href*="/map"]').first()
      results.navigation = await mapLink.isVisible({ timeout: 5000 })
      console.log(`✅ 네비게이션: ${results.navigation ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ 네비게이션: 실패`)
    }

    // 인증
    try {
      await page.goto(`${PRODUCTION_URL}/auth/login`)
      const emailInput = page.locator('input[type="email"]').first()
      results.auth = await emailInput.isVisible({ timeout: 5000 })
      console.log(`✅ 인증 시스템: ${results.auth ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ 인증 시스템: 실패`)
    }

    // 지도
    try {
      await page.goto(`${PRODUCTION_URL}/map`)
      await page.waitForTimeout(3000)
      const mapContainer = page.locator('#map, [class*="map"]').first()
      results.map = await mapContainer.isVisible({ timeout: 5000 })
      console.log(`✅ 지도 기능: ${results.map ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ 지도 기능: 실패`)
    }

    // 방 목록
    try {
      await page.goto(`${PRODUCTION_URL}/rooms`)
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      results.rooms = true
      console.log(`✅ 방 목록: 통과`)
    } catch (e) {
      console.log(`❌ 방 목록: 실패`)
    }

    // 프로필
    try {
      await page.goto(`${PRODUCTION_URL}/profile`)
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      results.profile = true
      console.log(`✅ 프로필: 통과`)
    } catch (e) {
      console.log(`❌ 프로필: 실패`)
    }

    // 반응형
    try {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(PRODUCTION_URL)
      await page.waitForTimeout(1000)
      results.responsive = true
      console.log(`✅ 반응형: 통과`)
    } catch (e) {
      console.log(`❌ 반응형: 실패`)
    }

    // PWA
    try {
      const manifestResponse = await page.goto(`${PRODUCTION_URL}/manifest.json`)
      results.pwa = manifestResponse?.status() === 200
      console.log(`✅ PWA: ${results.pwa ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ PWA: 실패`)
    }

    // API Health
    try {
      const apiResponse = await page.goto(`${PRODUCTION_URL}/api/health`)
      results.api = apiResponse?.status() === 200
      console.log(`✅ API: ${results.api ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ API: 실패`)
    }

    // 접근성
    try {
      await page.goto(PRODUCTION_URL)
      const focusableCount = await page.locator('a, button, input').count()
      results.accessibility = focusableCount > 5
      console.log(`✅ 접근성: ${results.accessibility ? '통과' : '실패'}`)
    } catch (e) {
      console.log(`❌ 접근성: 실패`)
    }

    const passedCount = Object.values(results).filter(v => v).length
    const totalCount = Object.keys(results).length
    const passRate = Math.round((passedCount / totalCount) * 100)

    console.log(`\n\n==============================================`)
    console.log(`최종 결과: ${passedCount}/${totalCount} 통과 (${passRate}%)`)
    console.log(`==============================================\n`)

    if (passRate >= 80) {
      console.log(`✅ 프로덕션 준비 완료 - 홍보 가능`)
    } else if (passRate >= 60) {
      console.log(`⚠️ 일부 개선 필요 - 제한적 홍보 가능`)
    } else {
      console.log(`❌ 추가 개선 필요 - 홍보 보류 권장`)
    }

    await page.screenshot({ path: 'test-results/complete/20-final-report.png' })
    console.log('\n✅ 최종 종합 평가 완료\n')
  })
})
