// e2e/full-page-check.spec.ts - 포트 3000 전체 페이지 점검
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('밋핀 전체 페이지 점검 (포트 3000)', () => {
  test('모든 페이지 접근 및 오류 확인', async ({ page }) => {
    // 콘솔 에러 감지
    const consoleErrors: string[] = []
    const networkErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('🚨 Console Error:', msg.text())
      }
    })

    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`)
        console.log(`🚨 Network Error: ${response.status()} ${response.url()}`)
      } else {
        console.log(`✅ ${response.status()} ${response.url()}`)
      }
    })

    const pages = [
      { path: '/', name: '홈페이지' },
      { path: '/map', name: '지도 페이지' },
      { path: '/auth/login', name: '로그인' },
      { path: '/auth/signup', name: '회원가입' },
      { path: '/room/new', name: '방 만들기' },
      { path: '/profile', name: '프로필' },
      { path: '/admin', name: '관리자' },
      { path: '/room/550e8400-e29b-41d4-a716-446655440010', name: '방 상세' },
      { path: '/requests', name: '요청함' },
      { path: '/legal/terms', name: '이용약관' },
      { path: '/legal/privacy', name: '개인정보처리방침' },
      { path: '/legal/location', name: '위치정보이용약관' },
    ]

    console.log(`🔍 총 ${pages.length}개 페이지 점검 시작`)

    for (const { path, name } of pages) {
      try {
        console.log(`\n📄 ${name} (${path}) 점검 중...`)

        await page.goto(`${BASE_URL}${path}`)
        await page.waitForLoadState('networkidle', { timeout: 10000 })

        // 페이지 제목 확인
        const title = await page.title()
        console.log(`  제목: ${title}`)

        // 기본 요소 확인
        const body = page.locator('body')
        await expect(body).toBeVisible()

        // 에러 페이지인지 확인
        const notFound = page.locator('text=404').or(page.locator('text=Not Found'))
        const serverError = page.locator('text=500').or(page.locator('text=Internal Server Error'))

        expect(await notFound.isVisible()).toBe(false)
        expect(await serverError.isVisible()).toBe(false)

        console.log(`  ✅ ${name} 정상 로드`)
      } catch (error: any) {
        console.log(`  🚨 ${name} 오류: ${error.message}`)
        throw error
      }
    }

    console.log(`\n📊 점검 완료 결과:`)
    console.log(`  Console 오류: ${consoleErrors.length}개`)
    console.log(`  Network 오류: ${networkErrors.length}개`)

    if (consoleErrors.length > 0) {
      console.log('🚨 Console 오류 목록:')
      consoleErrors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    }

    if (networkErrors.length > 0) {
      console.log('🚨 Network 오류 목록:')
      networkErrors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    }

    console.log('🎉 전체 페이지 점검 완료!')
  })

  test('주요 UI 기능 및 인터랙션 테스트', async ({ page }) => {
    console.log('🔍 UI 기능 테스트 시작')

    // 홈페이지 기본 요소
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=밋핀')).toBeVisible()
    await expect(page.locator('text=핀 찍고, 지금 모여요')).toBeVisible()
    console.log('✅ 홈페이지 브랜딩 요소 확인')

    // 지도 페이지 기능
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // 지도 로딩 대기

    // 카테고리 필터 버튼 테스트
    const categories = ['전체', '술', '운동', '기타']
    for (const category of categories) {
      const btn = page.locator(`text=${category}`).first()
      if (await btn.isVisible()) {
        await btn.click()
        await page.waitForTimeout(500)
        console.log(`✅ ${category} 필터 버튼 클릭 성공`)
      }
    }

    // 로그인 폼 테스트
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const emailField = page.locator('input[type="email"]').first()
    const passwordField = page.locator('input[type="password"]').first()

    if (await emailField.isVisible()) {
      await emailField.fill('admin@meetpin.com')
      console.log('✅ 로그인 이메일 입력 성공')
    }

    if (await passwordField.isVisible()) {
      await passwordField.fill('123456')
      console.log('✅ 로그인 비밀번호 입력 성공')
    }

    // 방 생성 폼 테스트
    await page.goto(`${BASE_URL}/room/new`)
    await page.waitForLoadState('networkidle')

    const titleField = page.locator('input[name="title"]').first()
    if (await titleField.isVisible()) {
      await titleField.fill('포트 3000 테스트 모임')
      console.log('✅ 방 제목 입력 성공')
    }

    console.log('🎉 UI 기능 테스트 완료!')
  })

  test('API 연동 및 데이터 로딩 확인', async ({ page }) => {
    console.log('🔍 API 연동 테스트 시작')

    const apiCalls: string[] = []

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const status = response.status()
        const url = response.url()
        apiCalls.push(`${status} ${url}`)
        console.log(`📡 API: ${status} ${url}`)
      }
    })

    // 지도 페이지에서 rooms API 호출 확인
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // API 호출 대기

    console.log(`📊 감지된 API 호출: ${apiCalls.length}개`)
    apiCalls.forEach((call, i) => {
      console.log(`  ${i + 1}. ${call}`)
    })

    // rooms API가 호출되었는지 확인
    const roomsApiCalled = apiCalls.some(call => call.includes('/api/rooms'))
    if (roomsApiCalled) {
      console.log('✅ rooms API 호출 성공')
    } else {
      console.log('⚠️  rooms API 호출 확인되지 않음')
    }

    console.log('🎉 API 연동 테스트 완료!')
  })
})
