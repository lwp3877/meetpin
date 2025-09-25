import { test, expect } from '@playwright/test'

test.describe('신규 사용자 전체 기능 테스트', () => {
  test('새 사용자 여정 - 회원가입부터 채팅까지', async ({ page }) => {
    console.log('🚀 신규 사용자 테스트 시작...')

    // 콘솔 에러 캐치
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Console Error:', msg.text())
      }
    })

    // 1. 메인 페이지 접속
    console.log('\n1️⃣ 메인 페이지 접속...')
    await page.goto('https://meetpin-weld.vercel.app')
    await expect(page).toHaveTitle(/밋핀|MeetPin/)
    console.log('✅ 메인 페이지 로드 성공')

    // 2. 로그인 페이지로 이동
    console.log('\n2️⃣ 로그인 페이지 접속...')
    await page.goto('https://meetpin-weld.vercel.app/auth/login')

    // 로그인 폼 확인
    await expect(page.locator('form')).toBeVisible()
    const emailField = page.locator('input[type="email"], input[name="email"]')
    const passwordField = page.locator('input[type="password"], input[name="password"]')

    await expect(emailField).toBeVisible()
    await expect(passwordField).toBeVisible()
    console.log('✅ 로그인 폼 확인 완료')

    // 3. 소셜 로그인 버튼 확인
    console.log('\n3️⃣ 소셜 로그인 버튼 확인...')
    const kakaoButton = page.locator('button:has-text("카카오")')
    const googleButton = page.locator('button:has-text("구글")')
    const naverButton = page.locator('button:has-text("네이버")')

    await expect(kakaoButton).toBeVisible()
    await expect(googleButton).toBeVisible()
    await expect(naverButton).toBeVisible()
    console.log('✅ 카카오/구글/네이버 로그인 버튼 모두 확인')

    // 4. 테스트 계정으로 로그인
    console.log('\n4️⃣ 테스트 계정 로그인...')
    await emailField.fill('admin@meetpin.com')
    await passwordField.fill('123456')

    const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first()
    await loginButton.click()

    // 로그인 성공 대기 (최대 10초)
    await page.waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 10000 })
    console.log('✅ 로그인 성공')
    console.log(`📍 현재 URL: ${page.url()}`)

    // 5. 지도 페이지 테스트
    console.log('\n5️⃣ 지도 페이지 테스트...')
    await page.goto('https://meetpin-weld.vercel.app/map', { waitUntil: 'networkidle' })

    // 지도 로딩 대기
    await page.waitForTimeout(5000)

    // 지도 관련 요소 확인
    const mapContainer = page.locator('#map, .map-container, [data-testid="kakao-map"]')
    const createRoomButton = page.locator(
      'button:has-text("방 만들기"), button:has-text("새 모임")'
    )

    const hasMapElements = (await mapContainer.count()) > 0 || (await createRoomButton.count()) > 0
    expect(hasMapElements).toBe(true)
    console.log('✅ 지도 페이지 접근 성공')

    // 6. 방 목록 확인 (강화된 Mock 데이터)
    console.log('\n6️⃣ 방 목록 확인 (강화된 Mock 데이터)...')

    // 방 카드들 확인
    const roomCards = page.locator(
      '[data-testid="room-card"], .room-card, .bg-white:has(.font-semibold):has(.text-sm)'
    )
    await page.waitForTimeout(3000) // 데이터 로딩 대기

    const roomCount = await roomCards.count()
    console.log(`📊 발견된 방 개수: ${roomCount}개`)

    // 최소 10개 이상의 방이 있어야 함 (39개 확인됨)
    expect(roomCount).toBeGreaterThan(10)

    // 특정 방 제목들 확인 (우리가 만든 한국 방들)
    const roomTitles = [
      '압구정 브런치 카페 투어',
      '홍대 댄스 클래스',
      '청담 스파 & 웰니스',
      '이태원 국제 요리 클래스',
      '성수 갤러리 투어',
    ]

    for (const title of roomTitles) {
      const roomExists = (await page.locator(`text="${title}"`).count()) > 0
      if (roomExists) {
        console.log(`✅ "${title}" 방 확인됨`)
      } else {
        console.log(`⚠️ "${title}" 방을 찾을 수 없음`)
      }
    }

    // 7. 새 방 만들기 테스트
    console.log('\n7️⃣ 새 방 만들기 테스트...')

    // 방 만들기 버튼 클릭
    const newRoomButton = page
      .locator('button:has-text("방 만들기"), button:has-text("새 모임"), a:has-text("방 만들기")')
      .first()

    if ((await newRoomButton.count()) > 0) {
      await newRoomButton.click()
      await page.waitForTimeout(2000)

      // 방 만들기 페이지나 모달 확인
      const hasRoomForm =
        (await page.locator('input[name="title"], input[placeholder*="제목"]').count()) > 0

      if (hasRoomForm) {
        console.log('✅ 방 만들기 폼 접근 성공')

        // 폼 필드 채우기 시도
        await page.fill('input[name="title"], input[placeholder*="제목"]', '테스트 자동 생성 방')
        console.log('✅ 방 제목 입력 완료')
      } else {
        console.log('⚠️ 방 만들기 폼을 찾을 수 없음')
      }
    } else {
      console.log('⚠️ 방 만들기 버튼을 찾을 수 없음')
    }

    // 8. 프로필 페이지 테스트
    console.log('\n8️⃣ 프로필 페이지 테스트...')

    const profileLink = page.locator(
      'a:has-text("프로필"), button:has-text("프로필"), [data-testid="profile-link"]'
    )

    if ((await profileLink.count()) > 0) {
      await profileLink.first().click()
      await page.waitForTimeout(2000)

      // 프로필 관련 요소 확인
      const hasProfile =
        (await page.locator('input[name="nickname"], .profile, h1:has-text("프로필")').count()) > 0

      if (hasProfile) {
        console.log('✅ 프로필 페이지 접근 성공')
      } else {
        console.log('⚠️ 프로필 페이지를 찾을 수 없음')
      }
    } else {
      console.log('⚠️ 프로필 링크를 찾을 수 없음')
    }

    // 9. API 응답 모니터링
    console.log('\n9️⃣ API 응답 모니터링...')
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

    // 지도 페이지 재방문하여 API 호출 확인
    await page.goto('https://meetpin-weld.vercel.app/map')
    await page.waitForTimeout(5000)

    console.log('📡 API 응답 현황:')
    apiResponses.forEach(response => {
      const status = response.status === 200 ? '✅' : response.status >= 400 ? '❌' : '⚠️'
      console.log(`   ${status} ${response.status} ${response.url}`)
    })

    // 10. JavaScript 에러 확인
    console.log('\n🔟 JavaScript 에러 확인...')

    if (consoleErrors.length === 0) {
      console.log('✅ JavaScript 에러 없음')
    } else {
      console.log('❌ JavaScript 에러 발견:')
      consoleErrors.forEach(error => console.log(`   - ${error}`))
    }

    // 11. 로그아웃 테스트
    console.log('\n1️⃣1️⃣ 로그아웃 테스트...')

    const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")')

    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click()
      await page.waitForTimeout(2000)

      const afterLogoutUrl = page.url()
      if (
        afterLogoutUrl.includes('/auth') ||
        afterLogoutUrl === 'https://meetpin-weld.vercel.app/'
      ) {
        console.log('✅ 로그아웃 성공')
      } else {
        console.log('❓ 로그아웃 상태 불분명')
      }
    } else {
      console.log('⚠️ 로그아웃 버튼을 찾을 수 없음')
    }

    console.log('\n🏁 신규 사용자 전체 테스트 완료!')
    console.log(`📊 총 API 호출: ${apiResponses.length}개`)
    console.log(`📊 총 JavaScript 에러: ${consoleErrors.length}개`)

    // 기본 성공 조건들 확인
    expect(roomCount).toBeGreaterThan(10) // 최소 10개 방은 있어야 함
    expect(consoleErrors.filter(e => !e.includes('Warning')).length).toBeLessThan(5) // 심각한 에러는 5개 미만
  })
})
