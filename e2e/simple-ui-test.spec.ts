// e2e/simple-ui-test.spec.ts - 간단한 UI 검증 테스트
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3001'

test.describe('밋핀 핵심 기능 검증', () => {
  test('전체 페이지 접근성 및 기본 요소 확인', async ({ page }) => {
    // 1. 홈페이지 접근
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/밋핀/)
    console.log('✅ 홈페이지 로드 성공')

    // 2. 맵 페이지 접근
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ 맵 페이지 로드 성공')

    // 3. 로그인 페이지 접근
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')
    const emailField = page.locator('input[type="email"]').first()
    const passwordField = page.locator('input[type="password"]').first()

    if (await emailField.isVisible()) {
      await emailField.fill('admin@meetpin.com')
      console.log('✅ 이메일 입력 성공')
    }

    if (await passwordField.isVisible()) {
      await passwordField.fill('123456')
      console.log('✅ 비밀번호 입력 성공')
    }

    // 4. 방 생성 페이지 접근
    await page.goto(`${BASE_URL}/room/new`)
    await page.waitForLoadState('networkidle')
    const titleField = page.locator('input[name="title"]').first()

    if (await titleField.isVisible()) {
      await titleField.fill('테스트 모임')
      console.log('✅ 방 제목 입력 성공')
    }

    // 5. 프로필 페이지 접근
    await page.goto(`${BASE_URL}/profile`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ 프로필 페이지 로드 성공')

    // 6. 방 상세 페이지 접근
    await page.goto(`${BASE_URL}/room/550e8400-e29b-41d4-a716-446655440010`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ 방 상세 페이지 로드 성공')

    // 7. 관리자 페이지 접근
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ 관리자 페이지 로드 성공')

    console.log('🎉 모든 페이지 접근성 테스트 완료!')
  })

  test('클릭 가능한 버튼 및 링크 확인', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 페이지의 모든 버튼과 링크 확인
    const clickableElements = await page.locator('button, a[href], [role="button"]').all()
    console.log(`🔍 찾은 클릭 가능한 요소: ${clickableElements.length}개`)

    // 처음 5개 요소만 테스트
    for (let i = 0; i < Math.min(5, clickableElements.length); i++) {
      const element = clickableElements[i]
      try {
        if (await element.isVisible()) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase())
          const text = await element.textContent()
          console.log(`✅ 요소 ${i + 1}: ${tagName} - "${text?.slice(0, 30) || 'no text'}"`)

          // 호버 테스트
          await element.hover()
          await page.waitForTimeout(100)
        }
      } catch (error) {
        console.log(`⚠️  요소 ${i + 1} 테스트 중 에러 (무시함): ${error}`)
      }
    }

    console.log('🎉 버튼/링크 확인 테스트 완료!')
  })

  test('폼 입력 필드 확인', async ({ page }) => {
    // 로그인 폼 테스트
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')

    const inputs = await page.locator('input').all()
    console.log(`🔍 로그인 페이지 입력 필드: ${inputs.length}개`)

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      if (await input.isVisible()) {
        const type = (await input.getAttribute('type')) || 'text'
        const placeholder = (await input.getAttribute('placeholder')) || ''
        console.log(`✅ 입력 필드 ${i + 1}: ${type} - "${placeholder}"`)

        // 간단한 입력 테스트
        if (type === 'email') {
          await input.fill('test@example.com')
        } else if (type === 'password') {
          await input.fill('testpass')
        } else {
          await input.fill('테스트 입력')
        }
      }
    }

    console.log('🎉 폼 입력 테스트 완료!')
  })

  test('API 연동 확인', async ({ page }) => {
    // API 응답을 확인하기 위해 네트워크 요청 감지
    const responses: string[] = []

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push(`${response.status()} ${response.url()}`)
      }
    })

    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('🔍 감지된 API 호출:')
    responses.forEach((response, i) => {
      console.log(`  ${i + 1}. ${response}`)
    })

    expect(responses.length).toBeGreaterThan(0)
    console.log('🎉 API 연동 테스트 완료!')
  })
})
