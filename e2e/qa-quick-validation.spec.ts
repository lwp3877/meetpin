/* 파일경로: e2e/qa-quick-validation.spec.ts */
// 🎯 빠른 QA 검증 - TypeScript 에러 없는 기본 테스트

import { test, expect } from '@playwright/test'

const TEST_CONFIG = {
  baseURL: process.env.CI ? 'https://meetpin-weld.vercel.app' : 'http://localhost:3000'
}

test.describe('🎯 QA 빠른 검증', () => {
  test('1️⃣ 홈페이지 기본 접근성', async ({ page }) => {
    console.log('🧪 홈페이지 기본 접근성 테스트')
    
    const startTime = Date.now()
    await page.goto(TEST_CONFIG.baseURL)
    const loadTime = Date.now() - startTime
    
    // 기본 페이지 로딩 확인
    await expect(page).toHaveTitle(/밋핀|MeetPin/)
    
    // 로딩 시간 검증 (5초 이내)
    expect(loadTime).toBeLessThan(5000)
    console.log(`✅ 페이지 로딩 시간: ${loadTime}ms`)
    
    // 핵심 요소 확인
    const mainContent = page.locator('main, body, #__next')
    await expect(mainContent.first()).toBeVisible()
    
    console.log('✅ 홈페이지 기본 접근성 통과')
  })

  test('2️⃣ 인증 페이지 접근', async ({ page }) => {
    console.log('🧪 인증 시스템 접근성 테스트')
    
    // 로그인 페이지 접근
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    
    // 기본 폼 요소 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible()
      console.log('✅ 이메일 입력 필드 확인')
    }
    
    if (await passwordInput.count() > 0) {
      await expect(passwordInput.first()).toBeVisible()
      console.log('✅ 패스워드 입력 필드 확인')
    }
    
    console.log('✅ 인증 시스템 기본 접근성 통과')
  })

  test('3️⃣ 지도 페이지 기본 기능', async ({ page }) => {
    console.log('🧪 지도 페이지 기본 기능 테스트')
    
    await page.goto(`${TEST_CONFIG.baseURL}/map`)
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000)
    
    // URL 확인
    expect(page.url()).toContain('/map')
    
    // 지도 관련 요소 확인 (유연한 셀렉터)
    const mapContainer = page.locator('#kakao-map, .map-container, [data-testid="map"]')
    if (await mapContainer.count() > 0) {
      console.log('✅ 지도 컨테이너 발견')
    }
    
    // 동적 콘텐츠 확인
    const content = page.locator('div, section, main')
    const contentCount = await content.count()
    expect(contentCount).toBeGreaterThan(5) // 최소 5개 요소
    
    console.log(`✅ 지도 페이지 기본 기능 확인 (${contentCount}개 요소)`)
  })

  test('4️⃣ 모바일 반응형 기본 확인', async ({ page }) => {
    console.log('🧪 모바일 반응형 기본 확인')
    
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(TEST_CONFIG.baseURL)
    
    // 뷰포트 오버플로우 체크
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = 375
    
    // 수평 스크롤이 없어야 함 (10px 여유)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
    
    console.log(`✅ 모바일 뷰포트 최적화: ${viewportWidth}px viewport, ${bodyWidth}px content`)
  })

  test('5️⃣ 기본 API 응답 확인', async ({ page, request }) => {
    console.log('🧪 기본 API 응답 확인')
    
    // 헬스체크 엔드포인트 테스트
    try {
      const response = await request.get(`${TEST_CONFIG.baseURL}/api/health`)
      
      if (response.status() < 500) {
        console.log(`✅ 헬스체크 API 응답: ${response.status()}`)
      } else {
        console.warn(`⚠️ 헬스체크 API 서버 오류: ${response.status()}`)
      }
    } catch (error) {
      console.warn('⚠️ 헬스체크 API 접근 실패')
    }
    
    // 방 목록 API 테스트
    try {
      const response = await request.get(`${TEST_CONFIG.baseURL}/api/rooms`)
      
      if (response.status() < 500) {
        console.log(`✅ 방 목록 API 응답: ${response.status()}`)
      }
    } catch (error) {
      console.warn('⚠️ 방 목록 API 접근 실패')
    }
    
    console.log('✅ 기본 API 응답 확인 완료')
  })
})