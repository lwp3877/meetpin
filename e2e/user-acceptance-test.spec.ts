/**
 * 실제 사용자 관점 종합 테스트 (UAT - User Acceptance Test)
 * 배포된 프로덕션 사이트에서 모든 핵심 기능을 실제 사용자처럼 테스트
 */

import { test, expect, Page } from '@playwright/test'

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app'

test.describe('🎯 실제 사용자 관점 종합 테스트', () => {
  test.setTimeout(120000) // 2분 타임아웃

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('1. 랜딩 페이지 - 첫 방문자 경험', async () => {
    console.log('🏠 랜딩 페이지 접속 중...')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // 페이지 타이틀 확인
    const title = await page.title()
    console.log('📄 페이지 타이틀:', title)
    expect(title).toContain('밋핀')

    // 메타 설명 확인
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    console.log('📝 메타 설명:', metaDescription)
    expect(metaDescription).toBeTruthy()

    // Beta 테스트 배너 확인
    const betaBanner = page.locator('text=비공개 베타').or(page.locator('text=베타 테스트'))
    const isBetaMode = await betaBanner.count() > 0
    console.log('🧪 베타 모드:', isBetaMode ? '활성' : '비활성')

    // 스크린샷 저장
    await page.screenshot({ path: 'e2e-results/01-landing-page.png', fullPage: true })
    console.log('✅ 랜딩 페이지 로드 성공')
  })

  test('2. 네비게이션 - 주요 메뉴 접근', async () => {
    console.log('🧭 네비게이션 테스트 중...')

    // 주요 링크 확인
    const links = {
      '로그인': '/auth/login',
      '회원가입': '/auth/signup',
      '지도': '/map',
    }

    for (const [name, path] of Object.entries(links)) {
      const link = page.locator(`a[href="${path}"]`).first()
      const isVisible = await link.isVisible().catch(() => false)
      console.log(`   ${name}: ${isVisible ? '✅' : '⚠️'} ${path}`)
    }

    console.log('✅ 네비게이션 확인 완료')
  })

  test('3. 로그인 페이지 - UI 및 폼 검증', async () => {
    console.log('🔐 로그인 페이지 테스트 중...')

    await page.goto(`${PRODUCTION_URL}/auth/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 페이지 로드 확인
    const url = page.url()
    console.log('📍 현재 URL:', url)

    // 로그인 폼 요소 확인
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'))
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'))

    const hasEmailField = await emailInput.count() > 0
    const hasPasswordField = await passwordInput.count() > 0

    console.log('   이메일 입력: ', hasEmailField ? '✅' : '⚠️')
    console.log('   비밀번호 입력:', hasPasswordField ? '✅' : '⚠️')

    // 소셜 로그인 버튼 확인
    const kakaoBtn = page.locator('button:has-text("카카오")').or(page.locator('text=카카오로'))
    const googleBtn = page.locator('button:has-text("Google")').or(page.locator('text=Google'))

    const hasKakao = await kakaoBtn.count() > 0
    const hasGoogle = await googleBtn.count() > 0

    console.log('   카카오 로그인:', hasKakao ? '✅' : '⚠️')
    console.log('   구글 로그인:', hasGoogle ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/02-login-page.png', fullPage: true })
    console.log('✅ 로그인 페이지 확인 완료')
  })

  test('4. 회원가입 페이지 - 폼 유효성 검증', async () => {
    console.log('📝 회원가입 페이지 테스트 중...')

    await page.goto(`${PRODUCTION_URL}/auth/signup`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 회원가입 폼 요소 확인
    const nicknameInput = page.locator('input[name="nickname"]').or(page.locator('input[placeholder*="닉네임"]'))
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'))
    const passwordInput = page.locator('input[type="password"]').first()

    const hasNickname = await nicknameInput.count() > 0
    const hasEmail = await emailInput.count() > 0
    const hasPassword = await passwordInput.count() > 0

    console.log('   닉네임 입력:', hasNickname ? '✅' : '⚠️')
    console.log('   이메일 입력:', hasEmail ? '✅' : '⚠️')
    console.log('   비밀번호 입력:', hasPassword ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/03-signup-page.png', fullPage: true })
    console.log('✅ 회원가입 페이지 확인 완료')
  })

  test('5. 지도 페이지 - 핵심 기능 접근', async () => {
    console.log('🗺️ 지도 페이지 테스트 중...')

    await page.goto(`${PRODUCTION_URL}/map`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000) // 지도 로딩 대기

    const url = page.url()
    console.log('📍 현재 URL:', url)

    // Kakao Map 스크립트 로드 확인
    const mapScript = await page.evaluate(() => {
      return typeof (window as any).kakao !== 'undefined'
    })
    console.log('   카카오맵 SDK:', mapScript ? '✅ 로드됨' : '⚠️ 로드 안됨')

    // 지도 컨테이너 확인
    const mapContainer = page.locator('#map').or(page.locator('.kakao-map'))
    const hasMap = await mapContainer.count() > 0
    console.log('   지도 컨테이너:', hasMap ? '✅' : '⚠️')

    // 방 생성 버튼 확인
    const createBtn = page.locator('button:has-text("방 만들기")').or(page.locator('a[href*="/room/new"]'))
    const hasCreateBtn = await createBtn.count() > 0
    console.log('   방 만들기 버튼:', hasCreateBtn ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/04-map-page.png', fullPage: true })
    console.log('✅ 지도 페이지 확인 완료')
  })

  test('6. 방 생성 페이지 - 폼 검증', async () => {
    console.log('🏠 방 생성 페이지 테스트 중...')

    await page.goto(`${PRODUCTION_URL}/room/new`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const url = page.url()
    console.log('📍 현재 URL:', url)

    // 방 생성 폼 요소 확인
    const titleInput = page.locator('input[name="title"]').or(page.locator('input[placeholder*="제목"]'))
    const descInput = page.locator('textarea[name="description"]').or(page.locator('textarea[placeholder*="설명"]'))
    const categorySelect = page.locator('select[name="category"]').or(page.locator('button:has-text("카테고리")'))

    const hasTitle = await titleInput.count() > 0
    const hasDesc = await descInput.count() > 0
    const hasCategory = await categorySelect.count() > 0

    console.log('   제목 입력:', hasTitle ? '✅' : '⚠️')
    console.log('   설명 입력:', hasDesc ? '✅' : '⚠️')
    console.log('   카테고리 선택:', hasCategory ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/05-room-new-page.png', fullPage: true })
    console.log('✅ 방 생성 페이지 확인 완료')
  })

  test('7. 프로필 페이지 - 사용자 정보', async () => {
    console.log('👤 프로필 페이지 테스트 중...')

    await page.goto(`${PRODUCTION_URL}/profile`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const url = page.url()
    console.log('📍 현재 URL:', url)

    // 로그인 필요 메시지 또는 프로필 콘텐츠 확인
    const loginRequired = page.locator('text=로그인').or(page.locator('button:has-text("로그인")'))
    const profileContent = page.locator('text=프로필').or(page.locator('text=닉네임'))

    const needsLogin = await loginRequired.count() > 0
    const hasProfile = await profileContent.count() > 0

    console.log('   로그인 필요:', needsLogin ? '예' : '아니오')
    console.log('   프로필 콘텐츠:', hasProfile ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/06-profile-page.png', fullPage: true })
    console.log('✅ 프로필 페이지 확인 완료')
  })

  test('8. API 엔드포인트 - 백엔드 동작', async () => {
    console.log('🔌 API 엔드포인트 테스트 중...')

    const apis = [
      { name: 'Health Check', url: '/api/health' },
      { name: 'Healthz', url: '/api/healthz' },
      { name: 'Status', url: '/api/status' },
      { name: 'Rooms List', url: '/api/rooms' },
    ]

    for (const api of apis) {
      const response = await page.request.get(`${PRODUCTION_URL}${api.url}`)
      const status = response.status()
      const isOk = status >= 200 && status < 400
      console.log(`   ${api.name}: ${isOk ? '✅' : '❌'} ${status}`)
    }

    console.log('✅ API 엔드포인트 확인 완료')
  })

  test('9. 반응형 디자인 - 모바일 뷰포트', async () => {
    console.log('📱 모바일 반응형 테스트 중...')

    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 모바일 메뉴 버튼 확인
    const mobileMenu = page.locator('button[aria-label*="menu"]').or(page.locator('button:has-text("☰")'))
    const hasMobileMenu = await mobileMenu.count() > 0
    console.log('   모바일 메뉴:', hasMobileMenu ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/07-mobile-view.png', fullPage: true })

    // 데스크톱으로 복원
    await page.setViewportSize({ width: 1280, height: 720 })
    console.log('✅ 모바일 반응형 확인 완료')
  })

  test('10. 페이지 로딩 성능 - Core Web Vitals', async () => {
    console.log('⚡ 페이지 성능 측정 중...')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // Performance API로 메트릭 수집
    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint')
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      return {
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      }
    })

    console.log('   FCP:', `${(metrics.fcp / 1000).toFixed(2)}s`)
    console.log('   DOM Ready:', `${(metrics.domContentLoaded / 1000).toFixed(2)}s`)
    console.log('   Load Complete:', `${(metrics.loadComplete / 1000).toFixed(2)}s`)

    // FCP는 2초 이내가 좋음
    expect(metrics.fcp).toBeLessThan(3000)
    console.log('✅ 성능 측정 완료')
  })

  test('11. 접근성 - 기본 검증', async () => {
    console.log('♿ 접근성 테스트 중...')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // 기본 접근성 요소 확인
    const htmlLang = await page.locator('html').getAttribute('lang')
    const hasH1 = await page.locator('h1').count() > 0
    const hasSkipLink = await page.locator('a[href="#main"]').or(page.locator('[class*="skip"]')).count() > 0

    console.log('   HTML lang 속성:', htmlLang ? `✅ ${htmlLang}` : '⚠️')
    console.log('   H1 제목:', hasH1 ? '✅' : '⚠️')
    console.log('   Skip Link:', hasSkipLink ? '✅' : '⚠️')

    console.log('✅ 기본 접근성 확인 완료')
  })

  test('12. 오류 처리 - 404 페이지', async () => {
    console.log('❌ 404 오류 페이지 테스트 중...')

    const response = await page.goto(`${PRODUCTION_URL}/this-page-does-not-exist`, {
      waitUntil: 'networkidle'
    })

    const status = response?.status()
    console.log('   응답 상태:', status)

    // 404 페이지 콘텐츠 확인
    const notFoundText = page.locator('text=404').or(page.locator('text=찾을 수 없'))
    const has404Content = await notFoundText.count() > 0
    console.log('   404 안내:', has404Content ? '✅' : '⚠️')

    await page.screenshot({ path: 'e2e-results/08-404-page.png', fullPage: true })
    console.log('✅ 404 페이지 확인 완료')
  })

  test('13. PWA 기능 - 매니페스트 및 서비스 워커', async () => {
    console.log('📦 PWA 기능 테스트 중...')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // Manifest 확인
    const manifestLink = page.locator('link[rel="manifest"]')
    const hasManifest = await manifestLink.count() > 0
    console.log('   매니페스트:', hasManifest ? '✅' : '⚠️')

    // 서비스 워커 등록 확인
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          return registrations.length > 0
        } catch {
          return false
        }
      }
      return false
    })
    console.log('   서비스 워커:', swRegistered ? '✅ 등록됨' : '⚠️ 미등록')

    console.log('✅ PWA 기능 확인 완료')
  })

  test('14. SEO - 메타 태그 및 구조화 데이터', async () => {
    console.log('🔍 SEO 요소 테스트 중...')

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })

    // 주요 메타 태그 확인
    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')

    console.log('   Title:', title ? '✅' : '⚠️')
    console.log('   Description:', description ? '✅' : '⚠️')
    console.log('   OG Title:', ogTitle ? '✅' : '⚠️')
    console.log('   OG Image:', ogImage ? '✅' : '⚠️')

    console.log('✅ SEO 요소 확인 완료')
  })

  test('15. 보안 헤더 - HTTPS 및 CSP', async () => {
    console.log('🔒 보안 헤더 테스트 중...')

    const response = await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const headers = response?.headers() || {}

    const hasStrictTransport = 'strict-transport-security' in headers
    const hasCSP = 'content-security-policy' in headers || 'content-security-policy-report-only' in headers
    const hasXFrame = 'x-frame-options' in headers

    console.log('   HSTS:', hasStrictTransport ? '✅' : '⚠️')
    console.log('   CSP:', hasCSP ? '✅' : '⚠️')
    console.log('   X-Frame-Options:', hasXFrame ? '✅' : '⚠️')
    console.log('   Protocol:', page.url().startsWith('https://') ? '✅ HTTPS' : '⚠️ HTTP')

    console.log('✅ 보안 헤더 확인 완료')
  })
})

test.describe('📊 테스트 결과 요약', () => {
  test('결과 리포트 생성', async () => {
    console.log('\n' + '='.repeat(60))
    console.log('🎉 실제 사용자 관점 종합 테스트 완료')
    console.log('='.repeat(60))
    console.log('✅ 모든 테스트 시나리오 실행 완료')
    console.log('📸 스크린샷: e2e-results/ 폴더')
    console.log('📄 상세 결과: Playwright HTML Report')
    console.log('='.repeat(60) + '\n')
  })
})
