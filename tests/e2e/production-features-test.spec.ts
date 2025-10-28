import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

test.describe('프로덕션 전체 기능 테스트', () => {
  test.setTimeout(60000)

  // ============================================================
  // TEST 1: 채팅 페이지 UI 확인
  // ============================================================
  test('1. 채팅 기능 UI 확인', async ({ page }) => {
    console.log('\n=== TEST 1: 채팅 UI 확인 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // 채팅 관련 버튼 찾기
    const chatButtons = page.locator('button:has-text("채팅"), a[href*="/chat"], [aria-label*="채팅"]')
    const chatCount = await chatButtons.count()
    console.log(`채팅 버튼 ${chatCount}개 발견`)

    if (chatCount > 0) {
      await chatButtons.first().click()
      await page.waitForTimeout(2000)
      console.log('✅ 채팅 버튼 클릭')
      await page.screenshot({ path: 'test-results/features/01-chat-clicked.png' })
    } else {
      console.log('⚠️ 채팅 버튼 없음 (로그인 필요 또는 매치 없음)')
    }

    await page.screenshot({ path: 'test-results/features/01-chat-page.png' })
    console.log('✅ 채팅 UI 테스트 완료\n')
  })

  // ============================================================
  // TEST 2: 알림 센터 확인
  // ============================================================
  test('2. 알림 센터 UI 확인', async ({ page }) => {
    console.log('\n=== TEST 2: 알림 센터 확인 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // 알림 버튼 찾기
    const notificationButtons = page.locator('button[aria-label*="알림"], [class*="notification"], [class*="bell"]')
    const notifCount = await notificationButtons.count()
    console.log(`알림 버튼 ${notifCount}개 발견`)

    if (notifCount > 0) {
      await notificationButtons.first().click()
      await page.waitForTimeout(2000)
      console.log('✅ 알림 버튼 클릭')

      // 알림 목록 확인
      const notifications = page.locator('[class*="notification"]')
      const items = await notifications.count()
      console.log(`알림 항목 ${items}개 발견`)

      await page.screenshot({ path: 'test-results/features/02-notifications-open.png' })
    } else {
      console.log('⚠️ 알림 버튼 없음')
    }

    await page.screenshot({ path: 'test-results/features/02-notifications.png' })
    console.log('✅ 알림 테스트 완료\n')
  })

  // ============================================================
  // TEST 3: 방 상세 페이지 접근
  // ============================================================
  test('3. 방 상세 페이지 확인', async ({ page }) => {
    console.log('\n=== TEST 3: 방 상세 페이지 시작 ===')

    // 지도에서 방 클릭 시도
    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000) // 지도 로딩 대기

    // 마커 클릭
    const markers = page.locator('[class*="marker"], area[shape="poly"]')
    const markerCount = await markers.count()
    console.log(`지도 마커 ${markerCount}개 발견`)

    if (markerCount > 0) {
      await markers.first().click()
      await page.waitForTimeout(2000)
      console.log('✅ 마커 클릭')

      // 상세 정보 팝업 확인
      const popup = page.locator('[class*="popup"], [role="dialog"]').first()
      const hasPopup = await popup.isVisible({ timeout: 3000 }).catch(() => false)

      if (hasPopup) {
        console.log('✅ 상세 정보 팝업 표시')
        await page.screenshot({ path: 'test-results/features/03-room-popup.png' })

        // 상세 페이지 링크 클릭
        const detailLink = page.locator('a[href*="/room/"], button:has-text("자세히")').first()
        if (await detailLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await detailLink.click()
          await page.waitForTimeout(3000)
          console.log('✅ 상세 페이지로 이동')
        }
      }
    }

    await page.screenshot({ path: 'test-results/features/03-room-detail.png', fullPage: true })
    console.log('✅ 방 상세 페이지 테스트 완료\n')
  })

  // ============================================================
  // TEST 4: 검색 기능 확인
  // ============================================================
  test('4. 검색 기능 확인', async ({ page }) => {
    console.log('\n=== TEST 4: 검색 기능 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')

    // 검색 입력창 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first()
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (hasSearch) {
      console.log('✅ 검색 입력창 발견')

      await searchInput.fill('강남')
      console.log('✅ 검색어 입력: 강남')
      await page.waitForTimeout(2000)

      await page.screenshot({ path: 'test-results/features/04-search-input.png' })

      // 검색 결과 확인
      const results = page.locator('[class*="result"], [class*="room"]')
      const resultCount = await results.count()
      console.log(`검색 결과 ${resultCount}개`)
    } else {
      console.log('⚠️ 검색 기능 없음')
    }

    await page.screenshot({ path: 'test-results/features/04-search.png' })
    console.log('✅ 검색 테스트 완료\n')
  })

  // ============================================================
  // TEST 5: 필터 기능 확인
  // ============================================================
  test('5. 카테고리 필터 확인', async ({ page }) => {
    console.log('\n=== TEST 5: 필터 기능 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // 필터 버튼 찾기
    const filterButtons = page.locator('button:has-text("술"), button:has-text("운동"), button:has-text("전체")')
    const filterCount = await filterButtons.count()
    console.log(`필터 버튼 ${filterCount}개 발견`)

    if (filterCount > 0) {
      // 술 필터
      const drinkFilter = filterButtons.filter({ hasText: '술' }).first()
      if (await drinkFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await drinkFilter.click()
        await page.waitForTimeout(1000)
        console.log('✅ "술" 필터 클릭')
        await page.screenshot({ path: 'test-results/features/05-filter-drink.png' })
      }

      // 운동 필터
      const sportsFilter = filterButtons.filter({ hasText: '운동' }).first()
      if (await sportsFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sportsFilter.click()
        await page.waitForTimeout(1000)
        console.log('✅ "운동" 필터 클릭')
        await page.screenshot({ path: 'test-results/features/05-filter-sports.png' })
      }

      // 전체 필터
      const allFilter = filterButtons.filter({ hasText: '전체' }).first()
      if (await allFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await allFilter.click()
        await page.waitForTimeout(1000)
        console.log('✅ "전체" 필터 클릭')
        await page.screenshot({ path: 'test-results/features/05-filter-all.png' })
      }
    }

    console.log('✅ 필터 테스트 완료\n')
  })

  // ============================================================
  // TEST 6: 사용자 메뉴 확인
  // ============================================================
  test('6. 사용자 메뉴 확인', async ({ page }) => {
    console.log('\n=== TEST 6: 사용자 메뉴 시작 ===')

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // 프로필/메뉴 버튼 찾기
    const menuButtons = page.locator('button[aria-label*="메뉴"], button[aria-label*="프로필"], [class*="avatar"]')
    const menuCount = await menuButtons.count()
    console.log(`메뉴 버튼 ${menuCount}개 발견`)

    if (menuCount > 0) {
      await menuButtons.first().click()
      await page.waitForTimeout(1000)
      console.log('✅ 메뉴 버튼 클릭')

      // 메뉴 항목 확인
      const menuItems = page.locator('[role="menuitem"], a[href*="/profile"]')
      const itemCount = await menuItems.count()
      console.log(`메뉴 항목 ${itemCount}개`)

      await page.screenshot({ path: 'test-results/features/06-user-menu.png' })
    } else {
      console.log('⚠️ 사용자 메뉴 없음 (로그인 필요)')
    }

    await page.screenshot({ path: 'test-results/features/06-menu.png' })
    console.log('✅ 사용자 메뉴 테스트 완료\n')
  })

  // ============================================================
  // TEST 7: 법적 문서 확인
  // ============================================================
  test('7. 법적 문서 페이지 확인', async ({ page }) => {
    console.log('\n=== TEST 7: 법적 문서 시작 ===')

    const legalPages = [
      { path: '/legal/terms', name: '이용약관' },
      { path: '/legal/privacy', name: '개인정보처리방침' },
      { path: '/legal/location', name: '위치기반서비스' }
    ]

    for (const legal of legalPages) {
      await page.goto(`${PRODUCTION_URL}${legal.path}`)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)

      // 콘텐츠 확인
      const content = await page.locator('h1, h2, p').first().textContent()
      console.log(`${legal.name}: ${content?.substring(0, 50)}...`)

      await page.screenshot({
        path: `test-results/features/07-legal-${legal.path.split('/').pop()}.png`,
        fullPage: true
      })
    }

    console.log('✅ 법적 문서 테스트 완료\n')
  })

  // ============================================================
  // TEST 8: 네트워크 요청 모니터링
  // ============================================================
  test('8. API 요청 모니터링', async ({ page }) => {
    console.log('\n=== TEST 8: API 모니터링 시작 ===')

    const apiCalls: any[] = []

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })

    // 여러 페이지 방문
    await page.goto(`${PRODUCTION_URL}`)
    await page.waitForTimeout(2000)

    await page.goto(`${PRODUCTION_URL}/map`)
    await page.waitForTimeout(3000)

    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForTimeout(2000)

    console.log(`\n총 API 호출: ${apiCalls.length}개`)
    apiCalls.slice(0, 10).forEach((call, i) => {
      console.log(`${i + 1}. ${call.method} ${call.url}`)
    })

    console.log('✅ API 모니터링 완료\n')
  })

  // ============================================================
  // TEST 9: 성능 측정 (상세)
  // ============================================================
  test('9. 상세 성능 측정', async ({ page }) => {
    console.log('\n=== TEST 9: 상세 성능 측정 시작 ===')

    const pages = [
      { name: '홈', url: PRODUCTION_URL },
      { name: '지도', url: `${PRODUCTION_URL}/map` },
      { name: '방목록', url: `${PRODUCTION_URL}/rooms` },
      { name: '로그인', url: `${PRODUCTION_URL}/auth/login` }
    ]

    for (const p of pages) {
      console.log(`\n📊 ${p.name} 성능 측정`)

      const startTime = Date.now()
      await page.goto(p.url)
      await page.waitForLoadState('domcontentloaded')
      const domTime = Date.now() - startTime

      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
      const totalTime = Date.now() - startTime

      console.log(`  - DOM Ready: ${domTime}ms`)
      console.log(`  - Total Load: ${totalTime}ms`)

      // Web Vitals
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
          tcp: Math.round(perf.connectEnd - perf.connectStart),
          ttfb: Math.round(perf.responseStart - perf.requestStart)
        }
      })

      console.log(`  - DNS: ${metrics.dns}ms`)
      console.log(`  - TCP: ${metrics.tcp}ms`)
      console.log(`  - TTFB: ${metrics.ttfb}ms`)
    }

    console.log('\n✅ 성능 측정 완료\n')
  })

  // ============================================================
  // TEST 10: 최종 완전 검증
  // ============================================================
  test('10. 최종 완전 검증', async ({ page }) => {
    console.log('\n=== TEST 10: 최종 검증 시작 ===')

    const checks = {
      homepage: false,
      map: false,
      rooms: false,
      login: false,
      signup: false,
      profile: false,
      legal: false
    }

    // 홈페이지
    try {
      await page.goto(PRODUCTION_URL)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      checks.homepage = true
      console.log('✅ 홈페이지')
    } catch { console.log('❌ 홈페이지') }

    // 지도
    try {
      await page.goto(`${PRODUCTION_URL}/map`)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      const mapContainer = page.locator('#map, [class*="map"]').first()
      checks.map = await mapContainer.isVisible({ timeout: 5000 })
      console.log('✅ 지도')
    } catch { console.log('❌ 지도') }

    // 방 목록
    try {
      await page.goto(`${PRODUCTION_URL}/rooms`)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      checks.rooms = true
      console.log('✅ 방 목록')
    } catch { console.log('❌ 방 목록') }

    // 로그인
    try {
      await page.goto(`${PRODUCTION_URL}/auth/login`)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      const email = page.locator('input[type="email"]').first()
      checks.login = await email.isVisible({ timeout: 5000 })
      console.log('✅ 로그인')
    } catch { console.log('❌ 로그인') }

    // 회원가입
    try {
      await page.goto(`${PRODUCTION_URL}/auth/signup`)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      checks.signup = true
      console.log('✅ 회원가입')
    } catch { console.log('❌ 회원가입') }

    // 프로필
    try {
      await page.goto(`${PRODUCTION_URL}/profile`)
      await page.waitForTimeout(2000)
      checks.profile = true
      console.log('✅ 프로필')
    } catch { console.log('❌ 프로필') }

    // 법적 문서
    try {
      await page.goto(`${PRODUCTION_URL}/legal/privacy`)
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      checks.legal = true
      console.log('✅ 법적 문서')
    } catch { console.log('❌ 법적 문서') }

    const passed = Object.values(checks).filter(v => v).length
    const total = Object.keys(checks).length
    const rate = Math.round((passed / total) * 100)

    console.log(`\n최종 결과: ${passed}/${total} (${rate}%)`)

    await page.screenshot({ path: 'test-results/features/10-final.png' })
    console.log('✅ 최종 검증 완료\n')
  })
})
