import { test, expect } from '@playwright/test'

test.describe('새로운 랜딩 페이지 테스트', () => {
  test('모든 버튼이 작동하는지 확인', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log('\n========== 새로운 랜딩 페이지 테스트 ==========\n')

    // 스크린샷
    await page.screenshot({ path: 'test-results/new-landing-full.png', fullPage: true })

    // 1. 헤더 버튼 테스트
    console.log('1. 헤더 "시작하기" 버튼 테스트')
    const headerStartButton = page.locator('button:has-text("시작하기")').first()
    if (await headerStartButton.count() > 0) {
      console.log('  ✓ 시작하기 버튼 발견')
      await headerStartButton.click({ timeout: 5000 })
      await page.waitForTimeout(1500)
      console.log(`  현재 URL: ${page.url()}`)
      await page.screenshot({ path: 'test-results/new-landing-click-start.png' })

      // 돌아가기
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 2. "무료로 시작하기" CTA 버튼
    console.log('2. "무료로 시작하기" CTA 버튼 테스트')
    const freeStartButton = page.locator('button:has-text("무료로 시작하기")').first()
    if (await freeStartButton.count() > 0) {
      console.log('  ✓ 무료로 시작하기 버튼 발견')
      await freeStartButton.click({ timeout: 5000 })
      await page.waitForTimeout(1500)
      console.log(`  현재 URL: ${page.url()}`)
      await page.screenshot({ path: 'test-results/new-landing-free-start.png' })

      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 3. "지도 둘러보기" 버튼
    console.log('3. "지도 둘러보기" 버튼 테스트')
    const exploreMapButton = page.locator('button:has-text("지도 둘러보기")').first()
    if (await exploreMapButton.count() > 0) {
      console.log('  ✓ 지도 둘러보기 버튼 발견')
      await exploreMapButton.click({ timeout: 5000 })
      await page.waitForTimeout(2000)
      console.log(`  현재 URL: ${page.url()}`)
      await page.screenshot({ path: 'test-results/new-landing-explore-map.png', fullPage: true })

      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 4. 카테고리 버튼 (술모임, 운동, 취미)
    console.log('4. 카테고리 버튼 테스트')
    const categories = ['술모임', '운동', '취미']
    for (const category of categories) {
      const categoryButton = page.locator(`button:has-text("${category}")`).first()
      if (await categoryButton.count() > 0) {
        console.log(`  ✓ "${category}" 버튼 발견`)
        await categoryButton.click({ timeout: 5000 })
        await page.waitForTimeout(1500)
        console.log(`    현재 URL: ${page.url()}`)

        await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
        await page.waitForTimeout(1000)
      }
    }

    // 5. "더 많은 모임 보기" 버튼
    console.log('5. "더 많은 모임 보기" 버튼 테스트')
    const moreButton = page.locator('button:has-text("더 많은 모임 보기")').first()
    if (await moreButton.count() > 0) {
      console.log('  ✓ 더 많은 모임 보기 버튼 발견')
      await moreButton.click({ timeout: 5000 })
      await page.waitForTimeout(1500)
      console.log(`  현재 URL: ${page.url()}`)

      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 6. Footer 버튼들
    console.log('6. Footer 버튼 테스트')
    const footerButtons = ['도움말', '문의하기', '이용약관', '개인정보처리방침']
    for (const buttonText of footerButtons) {
      const button = page.locator(`button:has-text("${buttonText}")`).first()
      if (await button.count() > 0) {
        console.log(`  ✓ "${buttonText}" 버튼 발견`)
      }
    }

    // 에러 확인
    console.log(`\n콘솔 에러: ${errors.length}개`)
    if (errors.length > 0) {
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    }

    expect(errors.length).toBe(0)
  })
})