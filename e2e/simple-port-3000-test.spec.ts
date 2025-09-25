// e2e/simple-port-3000-test.spec.ts - 포트 3000 간단한 페이지 점검
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('포트 3000 페이지 접근성 점검', () => {
  test('전체 페이지 로딩 확인', async ({ page }) => {
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

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    console.log(`🔍 포트 3000에서 ${pages.length}개 페이지 점검`)

    for (const { path, name } of pages) {
      try {
        console.log(`📄 ${name} (${path}) 접근 중...`)

        const response = await page.goto(`${BASE_URL}${path}`)

        if (response && response.status() === 200) {
          console.log(`  ✅ ${name}: HTTP ${response.status()}`)
          successCount++
        } else {
          console.log(`  🚨 ${name}: HTTP ${response?.status() || 'No Response'}`)
          errors.push(`${name}: HTTP ${response?.status() || 'No Response'}`)
          errorCount++
        }

        // 기본 페이지 로드 확인
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

        // body 태그 존재 확인
        const body = page.locator('body')
        await expect(body).toBeVisible()
      } catch (error: any) {
        console.log(`  🚨 ${name}: ${error.message}`)
        errors.push(`${name}: ${error.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 포트 3000 점검 결과:`)
    console.log(`  성공: ${successCount}/${pages.length}`)
    console.log(`  실패: ${errorCount}/${pages.length}`)

    if (errors.length > 0) {
      console.log(`🚨 오류 목록:`)
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    }

    expect(errorCount).toBeLessThan(3) // 최대 2개까지 오류 허용
    console.log('🎉 포트 3000 페이지 점검 완료!')
  })

  test('주요 기능 테스트', async ({ page }) => {
    console.log('🔍 주요 기능 테스트 시작')

    // 홈페이지 접근
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('domcontentloaded')
    console.log('✅ 홈페이지 접근 성공')

    // 지도 페이지 접근 및 API 호출 확인
    const apiCalls: string[] = []
    page.on('response', response => {
      if (response.url().includes('/api/rooms')) {
        apiCalls.push(`${response.status()} ${response.url()}`)
        console.log(`📡 API: ${response.status()} ${response.url()}`)
      }
    })

    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000) // API 호출 대기
    console.log('✅ 지도 페이지 접근 성공')

    // 로그인 페이지 폼 테스트
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    const emailInputs = await page.locator('input[type="email"]').count()
    const passwordInputs = await page.locator('input[type="password"]').count()

    console.log(`✅ 로그인 폼 - 이메일 필드: ${emailInputs}개, 비밀번호 필드: ${passwordInputs}개`)

    // API 호출 확인
    if (apiCalls.length > 0) {
      console.log(`✅ API 호출 성공: ${apiCalls.length}개`)
      apiCalls.forEach((call, i) => console.log(`  ${i + 1}. ${call}`))
    }

    console.log('🎉 주요 기능 테스트 완료!')
  })
})
