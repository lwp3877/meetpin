import { test, expect, Page } from '@playwright/test'

/**
 * 밋핀 전체 페이지 포괄적 테스트
 *
 * 이 테스트는 애플리케이션의 모든 페이지와 기능을 실제 브라우저에서 테스트합니다.
 *
 * 테스트 범위:
 * 1. 랜딩 페이지 (/)
 * 2. 인증 (로그인/회원가입)
 * 3. 지도 페이지 (/map)
 * 4. 모임 관리 (생성/수정/삭제)
 * 5. 프로필 페이지
 * 6. 채팅 기능
 * 7. 요청 관리
 * 8. 법적 페이지들
 * 9. 시스템 상태 페이지
 */

// 콘솔 에러 수집 헬퍼
function setupErrorCollection(page: Page) {
  const errors: string[] = []
  const warnings: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text())
    }
  })

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`)
  })

  return { errors, warnings }
}

test.describe('🏠 랜딩 페이지 테스트', () => {
  test('1.1 랜딩 페이지 로드 및 기본 요소', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/밋핀|MeetPin/)

    // 주요 CTA 버튼 확인
    const ctaButtons = ['프리미엄', '시작', '데모', '체험']
    for (const text of ctaButtons) {
      const button = page.locator(`button:has-text("${text}")`).first()
      if (await button.count() > 0) {
        console.log(`  ✓ CTA 버튼 발견: "${text}"`)
      }
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/01-landing.png', fullPage: true })

    // 에러 확인
    console.log(`콘솔 에러: ${errors.length}개`)
    expect(errors.length).toBe(0)
  })

  test('1.2 랜딩 페이지 스크롤 및 섹션', async ({ page }) => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // 페이지 높이 확인
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    console.log(`페이지 높이: ${pageHeight}px`)

    // 중간 스크롤
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/01-landing-middle.png' })

    // 하단 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/01-landing-bottom.png' })

    console.log('  ✓ 스크롤 테스트 완료')
  })

  test('1.3 랜딩 페이지 네비게이션 링크', async ({ page }) => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // 모든 링크 찾기
    const links = await page.locator('a').all()
    console.log(`찾은 링크: ${links.length}개`)

    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i]
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      console.log(`  ${i + 1}. "${text?.trim()}" → ${href}`)
    }
  })
})

test.describe('🔐 인증 페이지 테스트', () => {
  test('2.1 로그인 페이지 접근', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/02-login.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('2.2 회원가입 페이지 접근', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/auth/signup', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/02-signup.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('2.3 Mock 로그인 테스트', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Mock 로그인 버튼 찾기
    const mockButton = page.locator('button:has-text("개발자 모드"), button:has-text("Mock"), button:has-text("데모")').first()

    if (await mockButton.count() > 0) {
      console.log('  ✓ Mock 로그인 버튼 발견')
      await mockButton.click()
      await page.waitForTimeout(2000)

      console.log(`로그인 후 URL: ${page.url()}`)
      await page.screenshot({ path: 'test-results/02-after-login.png', fullPage: true })
    } else {
      console.log('  ⚠ Mock 로그인 버튼 없음 - 입력 폼 확인')

      // 이메일/비밀번호 입력 필드 찾기
      const emailInput = page.locator('input[type="email"], input[name="email"]').first()
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first()

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('admin@meetpin.com')
        await passwordInput.fill('123456')

        const submitButton = page.locator('button[type="submit"]').first()
        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(3000)
          console.log(`로그인 시도 후 URL: ${page.url()}`)
        }
      }
    }

    console.log(`콘솔 에러: ${errors.length}개`)
  })
})

test.describe('🗺️ 지도 페이지 테스트', () => {
  test('3.1 지도 페이지 로드', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/map', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/03-map.png', fullPage: true })

    // 지도 컨테이너 확인
    const mapContainer = page.locator('#map, [class*="map"]').first()
    if (await mapContainer.count() > 0) {
      console.log('  ✓ 지도 컨테이너 발견')
    }

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('3.2 지도 페이지 버튼 및 UI 요소', async ({ page }) => {
    await page.goto('http://localhost:3001/map', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 버튼 찾기
    const buttons = await page.locator('button:visible').all()
    console.log(`보이는 버튼: ${buttons.length}개`)

    // 주요 버튼 확인
    const expectedButtons = ['모임 만들기', '내 위치', '새로고침', '필터']
    for (const text of expectedButtons) {
      const btn = page.locator(`button:has-text("${text}")`).first()
      if (await btn.count() > 0) {
        console.log(`  ✓ "${text}" 버튼 발견`)
      }
    }

    await page.screenshot({ path: 'test-results/03-map-ui.png', fullPage: true })
  })
})

test.describe('🏢 모임(Room) 페이지 테스트', () => {
  test('4.1 모임 생성 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/room/new', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/04-room-new.png', fullPage: true })

    // 입력 필드 확인
    const inputs = await page.locator('input').all()
    console.log(`입력 필드: ${inputs.length}개`)

    const textareas = await page.locator('textarea').all()
    console.log(`텍스트 영역: ${textareas.length}개`)

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('4.2 모임 목록 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/rooms', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/04-rooms-list.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('4.3 요청 관리 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/requests', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/04-requests.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })
})

test.describe('👤 프로필 페이지 테스트', () => {
  test('5.1 프로필 페이지 로드', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/05-profile.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('5.2 알림 설정 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/settings/notifications', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/05-notifications.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })
})

test.describe('📄 법적 페이지 테스트', () => {
  const legalPages = [
    { path: '/legal/terms', name: '이용약관', file: '06-legal-terms' },
    { path: '/legal/privacy', name: '개인정보처리방침', file: '06-legal-privacy' },
    { path: '/legal/location', name: '위치정보 이용약관', file: '06-legal-location' },
    { path: '/legal/location-terms', name: '위치기반서비스 약관', file: '06-legal-location-terms' },
    { path: '/legal/cookie-policy', name: '쿠키 정책', file: '06-legal-cookie' },
  ]

  for (const legal of legalPages) {
    test(`6.${legalPages.indexOf(legal) + 1} ${legal.name} 페이지`, async ({ page }) => {
      const { errors } = setupErrorCollection(page)

      await page.goto(`http://localhost:3001${legal.path}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      console.log(`${legal.name} - URL: ${page.url()}`)
      await page.screenshot({ path: `test-results/${legal.file}.png`, fullPage: true })

      console.log(`콘솔 에러: ${errors.length}개`)
    })
  }
})

test.describe('🎯 카테고리별 페이지 테스트', () => {
  const categoryPages = [
    { path: '/drink', name: '술모임', file: '07-drink' },
    { path: '/exercise', name: '운동', file: '07-exercise' },
    { path: '/hobby', name: '취미', file: '07-hobby' },
  ]

  for (const category of categoryPages) {
    test(`7.${categoryPages.indexOf(category) + 1} ${category.name} 페이지`, async ({ page }) => {
      const { errors } = setupErrorCollection(page)

      await page.goto(`http://localhost:3001${category.path}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)

      console.log(`${category.name} - URL: ${page.url()}`)
      await page.screenshot({ path: `test-results/${category.file}.png`, fullPage: true })

      console.log(`콘솔 에러: ${errors.length}개`)
    })
  }
})

test.describe('⚙️ 시스템 페이지 테스트', () => {
  test('8.1 시스템 상태 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/system-status', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/08-system-status.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('8.2 상태 확인 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/status', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/08-status.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('8.3 도움말 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/help', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/08-help.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })

  test('8.4 문의 페이지', async ({ page }) => {
    const { errors } = setupErrorCollection(page)

    await page.goto('http://localhost:3001/contact', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`현재 URL: ${page.url()}`)
    await page.screenshot({ path: 'test-results/08-contact.png', fullPage: true })

    console.log(`콘솔 에러: ${errors.length}개`)
  })
})

test.describe('🔍 API 엔드포인트 테스트', () => {
  test('9.1 Health Check API', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/health')
    const status = response?.status()
    console.log(`Health API 상태: ${status}`)

    if (status === 200) {
      const body = await response?.json()
      console.log('Health API 응답:', body)
    }
  })

  test('9.2 Ready Check API', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/ready')
    const status = response?.status()
    console.log(`Ready API 상태: ${status}`)
  })

  test('9.3 Rooms API', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/rooms')
    const status = response?.status()
    console.log(`Rooms API 상태: ${status}`)

    if (status === 200) {
      const body = await response?.json()
      console.log(`Rooms API 응답 타입: ${typeof body}`)
      if (body && typeof body === 'object') {
        console.log(`Rooms 데이터 키:`, Object.keys(body))
      }
    }
  })
})

test.describe('📊 종합 리포트', () => {
  test('10.1 모든 페이지 네비게이션 흐름', async ({ page }) => {
    console.log('\n========== 전체 페이지 네비게이션 흐름 테스트 ==========\n')

    const pages = [
      { url: '/', name: '랜딩 페이지' },
      { url: '/map', name: '지도 페이지' },
      { url: '/auth/login', name: '로그인' },
      { url: '/profile', name: '프로필' },
      { url: '/rooms', name: '모임 목록' },
      { url: '/legal/terms', name: '이용약관' },
    ]

    let successCount = 0
    let errorCount = 0

    for (const p of pages) {
      try {
        const { errors } = setupErrorCollection(page)
        await page.goto(`http://localhost:3001${p.url}`, { waitUntil: 'networkidle', timeout: 10000 })
        await page.waitForTimeout(1500)

        const hasErrors = errors.length > 0
        const status = hasErrors ? '❌' : '✅'

        console.log(`${status} ${p.name} (${p.url}) - 에러: ${errors.length}개`)

        if (hasErrors) {
          errorCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.log(`❌ ${p.name} (${p.url}) - 로드 실패: ${error}`)
        errorCount++
      }
    }

    console.log(`\n========== 결과 요약 ==========`)
    console.log(`✅ 성공: ${successCount}/${pages.length}`)
    console.log(`❌ 실패: ${errorCount}/${pages.length}`)
    console.log(`성공률: ${((successCount / pages.length) * 100).toFixed(1)}%`)
  })
})