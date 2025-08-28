/* 파일경로: e2e/room-creation.spec.ts */
import { test, expect, type Page } from '@playwright/test'

test.describe('Room Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Mock authentication - simulate logged in user
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        }
      }))
    })
  })

  test('should navigate to room creation page', async ({ page }) => {
    await page.click('text=모임 만들기')
    await expect(page).toHaveURL('/room/new')
    
    // Check if form elements are visible
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('select[name="category"]')).toBeVisible()
    await expect(page.locator('input[name="place_text"]')).toBeVisible()
    await expect(page.locator('input[name="start_at"]')).toBeVisible()
    await expect(page.locator('input[name="max_people"]')).toBeVisible()
    await expect(page.locator('input[name="fee"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/room/new')
    
    // Try to submit empty form
    await page.click('button:has-text("모임 만들기")')
    
    // Check for validation errors
    await expect(page.locator('text=제목은 5자 이상 입력해주세요')).toBeVisible()
    await expect(page.locator('text=장소를 5자 이상 입력해주세요')).toBeVisible()
  })

  test('should create room successfully with valid data', async ({ page }) => {
    await page.goto('/room/new')
    
    // Fill out the form
    await page.fill('input[name="title"]', '홍대에서 맥주 한잔 어떠세요')
    await page.selectOption('select[name="category"]', 'drink')
    await page.fill('input[name="place_text"]', '홍대 걷고싶은거리 맥주집')
    
    // Set date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateTimeString = tomorrow.toISOString().slice(0, 16)
    await page.fill('input[name="start_at"]', dateTimeString)
    
    await page.fill('input[name="max_people"]', '6')
    await page.fill('input[name="fee"]', '20000')
    
    // Mock successful API response
    await page.route('/api/rooms', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            id: 'mock-room-id',
            title: '홍대에서 맥주 한잔 어떠세요'
          }
        })
      })
    })
    
    // Submit the form
    await page.click('button:has-text("모임 만들기")')
    
    // Wait for navigation to rooms list
    await expect(page).toHaveURL('/rooms')
    
    // Check for success message or redirect
    await page.waitForTimeout(1000)
  })

  test('should show error when API fails', async ({ page }) => {
    await page.goto('/room/new')
    
    // Fill out form with valid data
    await page.fill('input[name="title"]', '테스트 모임')
    await page.selectOption('select[name="category"]', 'drink')
    await page.fill('input[name="place_text"]', '테스트 장소입니다')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateTimeString = tomorrow.toISOString().slice(0, 16)
    await page.fill('input[name="start_at"]', dateTimeString)
    
    // Mock API error response
    await page.route('/api/rooms', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: '모임 생성에 실패했습니다'
        })
      })
    })
    
    // Submit form
    await page.click('button:has-text("모임 만들기")')
    
    // Check for error message
    await expect(page.locator('text=모임 생성에 실패했습니다')).toBeVisible()
  })

  test('should validate title length', async ({ page }) => {
    await page.goto('/room/new')
    
    // Test too short title
    await page.fill('input[name="title"]', '짧음')
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=제목은 5자 이상 입력해주세요')).toBeVisible()
    
    // Test too long title
    await page.fill('input[name="title"]', 'a'.repeat(51))
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=제목은 50자를 초과할 수 없습니다')).toBeVisible()
  })

  test('should validate max people range', async ({ page }) => {
    await page.goto('/room/new')
    
    // Fill required fields first
    await page.fill('input[name="title"]', '테스트 모임입니다')
    await page.fill('input[name="place_text"]', '테스트 장소입니다')
    
    // Test too many people
    await page.fill('input[name="max_people"]', '25')
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=최대 20명까지 가능합니다')).toBeVisible()
    
    // Test too few people
    await page.fill('input[name="max_people"]', '1')
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=최소 2명 이상이어야 합니다')).toBeVisible()
  })

  test('should validate fee range', async ({ page }) => {
    await page.goto('/room/new')
    
    // Fill required fields first
    await page.fill('input[name="title"]', '테스트 모임입니다')
    await page.fill('input[name="place_text"]', '테스트 장소입니다')
    
    // Test negative fee
    await page.fill('input[name="fee"]', '-1000')
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=참가비는 0원 이상이어야 합니다')).toBeVisible()
    
    // Test too high fee
    await page.fill('input[name="fee"]', '150000')
    await page.click('button:has-text("모임 만들기")')
    await expect(page.locator('text=참가비는 최대 100,000원까지 설정할 수 있습니다')).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/room/new')
    
    // Fill form with valid data
    await page.fill('input[name="title"]', '로딩 테스트 모임')
    await page.selectOption('select[name="category"]', 'drink')
    await page.fill('input[name="place_text"]', '로딩 테스트 장소')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateTimeString = tomorrow.toISOString().slice(0, 16)
    await page.fill('input[name="start_at"]', dateTimeString)
    
    // Mock slow API response
    await page.route('/api/rooms', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: { id: 'mock-room-id' }
        })
      })
    })
    
    // Submit form
    await page.click('button:has-text("모임 만들기")')
    
    // Check loading state
    await expect(page.locator('text=생성 중...')).toBeVisible()
    await expect(page.locator('button:has-text("생성 중...")')).toBeDisabled()
    
    // Wait for completion
    await expect(page).toHaveURL('/rooms', { timeout: 5000 })
  })

  test('should handle category selection', async ({ page }) => {
    await page.goto('/room/new')
    
    // Test category selection
    await page.selectOption('select[name="category"]', 'drink')
    expect(await page.inputValue('select[name="category"]')).toBe('drink')
    
    await page.selectOption('select[name="category"]', 'exercise')
    expect(await page.inputValue('select[name="category"]')).toBe('exercise')
    
    await page.selectOption('select[name="category"]', 'other')
    expect(await page.inputValue('select[name="category"]')).toBe('other')
  })
})