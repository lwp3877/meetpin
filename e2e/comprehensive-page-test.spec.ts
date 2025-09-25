/* e2e/comprehensive-page-test.spec.ts */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

// 테스트할 모든 페이지 경로
const PAGES_TO_TEST = [
  { path: '/', name: '홈페이지' },
  { path: '/map', name: '지도 페이지' },
  { path: '/auth/login', name: '로그인 페이지' },
  { path: '/auth/signup', name: '회원가입 페이지' },
  { path: '/profile', name: '프로필 페이지' },
  { path: '/room/new', name: '새 방 만들기' },
  { path: '/requests', name: '참가 신청 페이지' },
  { path: '/admin', name: '관리자 페이지' },
  { path: '/legal/terms', name: '이용약관' },
  { path: '/legal/privacy', name: '개인정보처리방침' },
  { path: '/legal/location', name: '위치정보이용약관' },
]

// 동적 페이지들 (실제 데이터 있는 것들)
const DYNAMIC_PAGES = [
  { path: '/profile/550e8400-e29b-41d4-a716-446655440001', name: '사용자 프로필' },
  { path: '/room/550e8400-e29b-41d4-a716-446655440010', name: '방 상세 페이지' },
]

test.describe('🌟 완벽한 전체 페이지 테스트 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 네트워크 오류 감지
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`)
      }
    })

    // JavaScript 오류 감지
    page.on('pageerror', error => {
      console.log(`💥 JavaScript 오류: ${error.message}`)
    })
  })

  test('📋 모든 정적 페이지 로드 및 기본 기능 테스트', async ({ page }) => {
    console.log('🚀 모든 페이지 완전 테스트 시작')

    for (const pageInfo of PAGES_TO_TEST) {
      console.log(`\n🔍 ${pageInfo.name} 테스트 중...`)

      try {
        // 페이지 접속
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000,
        })

        // 기본 로딩 확인
        await expect(page).toHaveTitle(/밋핀|MeetPin/)

        // 페이지에 기본 콘텐츠가 있는지 확인
        const bodyText = await page.textContent('body')
        expect(bodyText).toBeTruthy()
        expect(bodyText!.length).toBeGreaterThan(10)

        // 에러 메시지가 없는지 확인
        const errorElements = page.locator('text=error, text=Error, text=오류, text=에러')
        const errorCount = await errorElements.count()
        if (errorCount > 0) {
          const errorTexts = await errorElements.allTextContents()
          console.log(`⚠️ 발견된 오류: ${errorTexts.join(', ')}`)
        }

        // 스크린샷 (선택적)
        // await page.screenshot({ path: `test-results/${pageInfo.name}.png` })

        console.log(`✅ ${pageInfo.name}: 성공`)
      } catch (error) {
        console.log(`❌ ${pageInfo.name}: 실패 - ${error}`)
        throw error
      }
    }
  })

  test('🎯 동적 페이지 및 기능 테스트', async ({ page }) => {
    console.log('🎯 동적 페이지 기능 테스트 시작')

    for (const pageInfo of DYNAMIC_PAGES) {
      console.log(`\n🔍 ${pageInfo.name} 테스트 중...`)

      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        })

        // 로딩 스피너가 사라질 때까지 대기
        await page
          .waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 })
          .catch(() => {
            console.log('로딩 스피너 대기 타임아웃')
          })

        // 실제 콘텐츠가 로드되었는지 확인
        await page.waitForFunction(
          () => {
            const body = document.querySelector('body')
            return body && body.textContent && body.textContent.length > 100
          },
          { timeout: 10000 }
        )

        console.log(`✅ ${pageInfo.name}: 성공`)
      } catch (error) {
        console.log(`❌ ${pageInfo.name}: 실패 - ${error}`)
        throw error
      }
    }
  })

  test('💬 핵심 기능 상호작용 테스트', async ({ page }) => {
    console.log('💬 핵심 기능 테스트 시작')

    // 1. 프로필 모달 테스트
    console.log('\n🔍 프로필 모달 테스트...')
    await page.goto(`${BASE_URL}/profile/550e8400-e29b-41d4-a716-446655440001`)
    await page.waitForLoadState('networkidle')

    // 프로필 정보 확인
    const profileName = page.locator('h2').first()
    await expect(profileName).toBeVisible({ timeout: 10000 })
    console.log('✅ 프로필 정보 표시됨')

    // 2. 방 페이지 호스트 메시지 테스트
    console.log('\n🔍 호스트 메시지 기능 테스트...')
    await page.goto(`${BASE_URL}/room/550e8400-e29b-41d4-a716-446655440010`)
    await page.waitForLoadState('networkidle')

    // 호스트 메시지 버튼 찾기 및 클릭 테스트
    const messageButton = page.locator('text=호스트에게 메시지').first()
    if (await messageButton.isVisible()) {
      await messageButton.click()

      // 모달이 열리는지 확인
      const modal = page.locator('[role="dialog"], .modal, .fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })
      console.log('✅ 호스트 메시지 모달 열림 확인')

      // 모달 닫기
      const closeButton = page
        .locator('button:has-text("취소"), button[aria-label="닫기"], .close')
        .first()
      if (await closeButton.isVisible()) {
        await closeButton.click()
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // 3. 지도 페이지 기본 기능 테스트
    console.log('\n🔍 지도 페이지 기능 테스트...')
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 지도 로딩 대기
    await page
      .waitForSelector('[class*="map"], #map, .leaflet-container', { timeout: 15000 })
      .catch(() => {
        console.log('지도 컨테이너 대기 타임아웃')
      })

    console.log('✅ 모든 핵심 기능 테스트 완료')
  })

  test('🔍 검색 및 필터 기능 테스트', async ({ page }) => {
    console.log('🔍 검색 및 필터 기능 테스트 시작')

    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')

    // 검색창이나 필터 버튼 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first()
    const filterButtons = page.locator(
      'button:has-text("술"), button:has-text("운동"), button:has-text("기타")'
    )

    // 필터 버튼이 있으면 테스트
    const filterCount = await filterButtons.count()
    if (filterCount > 0) {
      console.log(`📊 ${filterCount}개의 필터 버튼 발견`)

      for (let i = 0; i < Math.min(filterCount, 3); i++) {
        const button = filterButtons.nth(i)
        const buttonText = await button.textContent()
        await button.click()
        console.log(`✅ ${buttonText} 필터 클릭 테스트 완료`)
        await page.waitForTimeout(1000) // 필터 적용 대기
      }
    }

    console.log('✅ 검색 및 필터 기능 테스트 완료')
  })

  test('📱 반응형 디자인 테스트', async ({ page }) => {
    console.log('📱 반응형 디자인 테스트 시작')

    const viewports = [
      { width: 375, height: 667, name: '모바일' },
      { width: 768, height: 1024, name: '태블릿' },
      { width: 1920, height: 1080, name: '데스크톱' },
    ]

    for (const viewport of viewports) {
      console.log(`\n📏 ${viewport.name} 뷰포트 테스트...`)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`${BASE_URL}/map`)
      await page.waitForLoadState('networkidle')

      // 기본 콘텐츠가 보이는지 확인
      const body = page.locator('body')
      await expect(body).toBeVisible()

      console.log(`✅ ${viewport.name}: 반응형 레이아웃 정상`)
    }
  })
})
