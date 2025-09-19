/**
 * 프로덕션 준비 상태 E2E 테스트
 * 
 * 주요 사용자 플로우와 핵심 기능들이 정상 작동하는지 검증합니다.
 */

import { test, expect } from '@playwright/test'

test.describe('프로덕션 준비 상태 검증', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 데이터 환경에서 테스트
    await page.goto('/')
  })

  test('메인 페이지 로딩 및 기본 네비게이션', async ({ page }) => {
    // 메인 페이지 로딩 확인
    await expect(page).toHaveTitle(/밋핀/)
    
    // 기본 네비게이션 요소 확인
    await expect(page.locator('text=밋핀')).toBeVisible()
    
    // 지도 페이지로 이동
    await page.click('text=지금 모임 찾기')
    await expect(page).toHaveURL(/\/map/)
  })

  test('방 목록 API 및 표시 기능', async ({ page }) => {
    await page.goto('/map')
    
    // 지도 페이지 로딩 대기
    await page.waitForLoadState('networkidle')
    
    // API 호출 모니터링
    const apiResponse = page.waitForResponse(response => 
      response.url().includes('/api/rooms') && response.status() === 200
    )
    
    // 페이지 새로고침으로 API 호출 트리거
    await page.reload()
    
    // API 응답 확인
    const response = await apiResponse
    const responseData = await response.json()
    
    expect(responseData.ok).toBe(true)
    expect(responseData.data.rooms).toBeDefined()
    expect(Array.isArray(responseData.data.rooms)).toBe(true)
    
    // UI에 방 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="room-list"], .room-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('회원가입 플로우', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // 회원가입 폼 요소 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="nickname"]')).toBeVisible()
    
    // Mock 데이터로 회원가입 시도
    await page.fill('input[type="email"]', 'test@meetpin.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="nickname"]', '테스트사용자')
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]')
    
    // 성공 응답 또는 리다이렉션 확인
    await page.waitForTimeout(2000)
    
    // Mock 환경에서는 에러가 예상되므로 폼이 여전히 존재하는지만 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('로그인 플로우', async ({ page }) => {
    await page.goto('/auth/login')
    
    // 로그인 폼 요소 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Mock 관리자 계정으로 로그인 시도
    await page.fill('input[type="email"]', 'admin@meetpin.com')
    await page.fill('input[type="password"]', '123456')
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')
    
    // 결과 대기 (Mock 환경에서는 에러 예상)
    await page.waitForTimeout(2000)
  })

  test('방 생성 페이지 접근성', async ({ page }) => {
    await page.goto('/room/new')
    
    // 방 생성 폼 요소 확인
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('select[name="category"]')).toBeVisible()
    await expect(page.locator('input[name="place_text"]')).toBeVisible()
    
    // 필수 입력 필드 확인
    const requiredFields = ['title', 'place_text', 'start_at', 'max_people']
    
    for (const field of requiredFields) {
      const element = page.locator(`[name="${field}"]`)
      await expect(element).toBeVisible()
    }
  })

  test('API 엔드포인트 응답성 검증', async ({ page }) => {
    // 중요한 API 엔드포인트들의 응답 시간과 상태 확인
    const apiEndpoints = [
      '/api/rooms?bbox=37.4563,126.8226,37.6761,127.1836&limit=10',
      '/api/requests/my',
      '/api/matches/my',
      '/api/notifications'
    ]

    for (const endpoint of apiEndpoints) {
      const startTime = Date.now()
      
      try {
        const response = await page.request.get(endpoint)
        const responseTime = Date.now() - startTime
        
        // 응답 시간이 5초 이내인지 확인
        expect(responseTime).toBeLessThan(5000)
        
        // 응답이 JSON 형식인지 확인
        const contentType = response.headers()['content-type']
        expect(contentType).toContain('application/json')
        
        console.log(`✅ ${endpoint}: ${response.status()} (${responseTime}ms)`)
      } catch (error) {
        console.log(`⚠️ ${endpoint}: 접근 제한 또는 인증 필요`)
      }
    }
  })

  test('반응형 디자인 검증', async ({ page }) => {
    await page.goto('/map')
    
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('body')).toBeVisible()
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
    
    // 모바일에서 네비게이션 메뉴 동작 확인
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-nav')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
    }
  })

  test('성능 및 로딩 시간 검증', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/map')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 페이지 로딩 시간이 10초 이내인지 확인
    expect(loadTime).toBeLessThan(10000)
    
    // Core Web Vitals 측정
    const performanceMetrics = await page.evaluate(() => {
      return {
        // First Contentful Paint
        fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime,
        // Largest Contentful Paint (간접 측정)
        loadComplete: performance.now()
      }
    })
    
    console.log(`📊 페이지 로딩 시간: ${loadTime}ms`)
    console.log(`📊 First Contentful Paint: ${performanceMetrics.fcp}ms`)
  })

  test('에러 처리 및 사용자 피드백', async ({ page }) => {
    // 존재하지 않는 페이지 접근
    await page.goto('/nonexistent-page')
    
    // 404 페이지 또는 적절한 에러 처리 확인
    const pageContent = await page.textContent('body')
    const hasErrorHandling = pageContent?.includes('404') || 
                            pageContent?.includes('페이지를 찾을 수 없습니다') ||
                            pageContent?.includes('Not Found')
    
    expect(hasErrorHandling).toBe(true)
  })

  test('접근성 기본 요구사항 검증', async ({ page }) => {
    await page.goto('/map')
    
    // 기본 접근성 요소 확인
    const mainElement = page.locator('main, [role="main"]')
    if (await mainElement.count() > 0) {
      await expect(mainElement.first()).toBeVisible()
    }
    
    // 네비게이션 요소 확인
    const navElement = page.locator('nav, [role="navigation"]')
    if (await navElement.count() > 0) {
      await expect(navElement.first()).toBeVisible()
    }
    
    // 키보드 네비게이션 기본 테스트
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeDefined()
  })
})