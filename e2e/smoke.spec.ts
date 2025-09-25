import { test, expect } from '@playwright/test'

const SMOKE_TEST_URL = process.env.TEST_URL || 'http://localhost:3000'

test.describe('🔥 Production Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ignore console errors for smoke tests
    page.on('pageerror', () => {})
    page.on('console', () => {})
  })

  test('1️⃣ Home page loads successfully', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto(SMOKE_TEST_URL, { waitUntil: 'networkidle' })
    })

    await test.step('Verify page title and core elements', async () => {
      await expect(page).toHaveTitle(/MeetPin|밋핀/)

      // Check for main CTA or navigation
      const hasMainCTA = await page.locator('[data-testid="main-cta"], button:has-text("지도"), a[href="/map"]').first().isVisible().catch(() => false)
      const hasNavigation = await page.locator('nav, header').first().isVisible().catch(() => false)

      expect(hasMainCTA || hasNavigation).toBeTruthy()
    })
  })

  test('2️⃣ Login/Auth page accessible', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto(`${SMOKE_TEST_URL}/auth/login`, { waitUntil: 'networkidle' })
    })

    await test.step('Verify auth form exists', async () => {
      // Check for login form or mock auth button
      const hasLoginForm = await page.locator('form, [data-testid="mock-login"], button:has-text("로그인")').first().isVisible()
      expect(hasLoginForm).toBeTruthy()
    })
  })

  test('3️⃣ Room creation form accessible', async ({ page }) => {
    await test.step('Navigate to room creation', async () => {
      await page.goto(`${SMOKE_TEST_URL}/room/new`, { waitUntil: 'networkidle' })
    })

    await test.step('Verify room form or redirect', async () => {
      // Should show form OR redirect to login
      const hasRoomForm = await page.locator('form, input[name="title"], input[name="description"]').first().isVisible().catch(() => false)
      const isLoginRedirect = page.url().includes('/auth/login') || page.url().includes('/login')

      expect(hasRoomForm || isLoginRedirect).toBeTruthy()
    })
  })

  test('4️⃣ Map page renders without crashes', async ({ page }) => {
    await test.step('Navigate to map page', async () => {
      await page.goto(`${SMOKE_TEST_URL}/map`, { waitUntil: 'networkidle' })
    })

    await test.step('Verify map container or fallback', async () => {
      // Check for map container or location-based fallback
      const hasMapContainer = await page.locator('#kakao-map, .map-container, [data-testid="map"]').first().isVisible().catch(() => false)
      const hasLocationFallback = await page.locator('text=위치 권한, text=지도 로딩').first().isVisible().catch(() => false)
      const hasRoomsList = await page.locator('[data-testid="rooms-list"], .room-card').first().isVisible().catch(() => false)

      expect(hasMapContainer || hasLocationFallback || hasRoomsList).toBeTruthy()
    })
  })
})