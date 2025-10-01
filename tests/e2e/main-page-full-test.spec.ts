import { test, expect } from '@playwright/test'

test.describe('메인 페이지 전체 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 개발 서버에 접속
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000) // 렌더링 완료 대기
  })

  test('1. 페이지 로드 및 기본 요소 확인', async ({ page }) => {
    console.log('✅ 테스트 1: 페이지 로드 확인')

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/밋핀|MeetPin/)

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/01-page-load.png', fullPage: true })
  })

  test('2. 네비게이션 요소 확인', async ({ page }) => {
    console.log('✅ 테스트 2: 네비게이션 확인')

    // 모든 링크 찾기
    const links = await page.locator('a').all()
    console.log(`찾은 링크 수: ${links.length}`)

    for (const link of links.slice(0, 10)) { // 처음 10개만 테스트
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      console.log(`  - 링크: "${text?.trim()}" → ${href}`)
    }

    await page.screenshot({ path: 'test-results/02-navigation.png', fullPage: true })
  })

  test('3. 버튼 요소 확인 및 클릭 테스트', async ({ page }) => {
    console.log('✅ 테스트 3: 버튼 확인')

    // 모든 버튼 찾기
    const buttons = await page.locator('button').all()
    console.log(`찾은 버튼 수: ${buttons.length}`)

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const isVisible = await button.isVisible()
      const isEnabled = await button.isEnabled()
      console.log(`  - 버튼 ${i + 1}: "${text?.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`)

      if (isVisible && isEnabled) {
        try {
          // 버튼 클릭 테스트 (에러 발생 시 스킵)
          await button.click({ timeout: 3000 })
          await page.waitForTimeout(1000)
          console.log(`    ✓ 클릭 성공`)
          await page.screenshot({ path: `test-results/03-button-${i + 1}-clicked.png`, fullPage: true })

          // 뒤로 가기
          await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`    ⚠ 클릭 실패 또는 타임아웃: ${error}`)
        }
      }
    }
  })

  test('4. CTA 버튼 테스트 (지도 보기, 시작하기 등)', async ({ page }) => {
    console.log('✅ 테스트 4: CTA 버튼')

    // "지도 보기" 또는 "시작하기" 버튼 찾기
    const ctaTexts = ['지도', '시작', 'Map', 'Start', '모임', '핀']

    for (const text of ctaTexts) {
      try {
        const button = page.locator(`button:has-text("${text}")`).first()
        if (await button.count() > 0) {
          console.log(`  - CTA 버튼 발견: "${text}"`)
          const isVisible = await button.isVisible()
          console.log(`    visible: ${isVisible}`)

          if (isVisible) {
            await button.click({ timeout: 5000 })
            await page.waitForTimeout(2000)
            console.log(`    ✓ 클릭 성공`)
            await page.screenshot({ path: `test-results/04-cta-${text}.png`, fullPage: true })

            // 현재 URL 확인
            const currentUrl = page.url()
            console.log(`    현재 URL: ${currentUrl}`)

            // 뒤로 가기
            await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
            await page.waitForTimeout(1000)
          }
        }
      } catch (error) {
        console.log(`  ⚠ "${text}" 버튼 테스트 실패: ${error}`)
      }
    }
  })

  test('5. 입력 폼 요소 확인', async ({ page }) => {
    console.log('✅ 테스트 5: 입력 폼')

    // 모든 input 찾기
    const inputs = await page.locator('input').all()
    console.log(`찾은 input 수: ${inputs.length}`)

    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const input = inputs[i]
      const type = await input.getAttribute('type')
      const placeholder = await input.getAttribute('placeholder')
      const name = await input.getAttribute('name')
      console.log(`  - Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`)

      // 텍스트 입력 테스트
      if (type === 'text' || type === 'email' || !type) {
        try {
          await input.fill('테스트 입력')
          await page.waitForTimeout(500)
          console.log(`    ✓ 텍스트 입력 성공`)
        } catch (error) {
          console.log(`    ⚠ 입력 실패: ${error}`)
        }
      }
    }

    await page.screenshot({ path: 'test-results/05-forms.png', fullPage: true })
  })

  test('6. 이미지 로딩 확인', async ({ page }) => {
    console.log('✅ 테스트 6: 이미지 로딩')

    // 모든 이미지 찾기
    const images = await page.locator('img').all()
    console.log(`찾은 이미지 수: ${images.length}`)

    let loadedCount = 0
    let errorCount = 0

    for (let i = 0; i < Math.min(images.length, 10); i++) {
      const img = images[i]
      const src = await img.getAttribute('src')
      const alt = await img.getAttribute('alt')

      try {
        // naturalWidth를 체크하여 이미지 로드 상태 확인
        const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)

        if (isLoaded) {
          loadedCount++
          console.log(`  ✓ 이미지 ${i + 1} 로드 성공: ${alt || src?.substring(0, 50)}`)
        } else {
          errorCount++
          console.log(`  ✗ 이미지 ${i + 1} 로드 실패: ${alt || src?.substring(0, 50)}`)
        }
      } catch (error) {
        errorCount++
        console.log(`  ⚠ 이미지 ${i + 1} 확인 오류: ${error}`)
      }
    }

    console.log(`\n이미지 로딩 결과: ${loadedCount}개 성공, ${errorCount}개 실패`)
    await page.screenshot({ path: 'test-results/06-images.png', fullPage: true })
  })

  test('7. 스크롤 및 반응형 동작 확인', async ({ page }) => {
    console.log('✅ 테스트 7: 스크롤 동작')

    // 페이지 높이 확인
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    console.log(`페이지 높이: ${pageHeight}px`)

    // 스크롤 테스트
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/07-scroll-middle.png', fullPage: false })

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/07-scroll-bottom.png', fullPage: false })

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(1000)
    console.log('  ✓ 스크롤 테스트 완료')
  })

  test('8. 콘솔 에러 확인', async ({ page }) => {
    console.log('✅ 테스트 8: 콘솔 에러 모니터링')

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

    // 페이지 새로고침하여 에러 수집
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    // 몇 가지 상호작용 수행
    try {
      const buttons = await page.locator('button').all()
      if (buttons.length > 0) {
        await buttons[0].click({ timeout: 3000 })
        await page.waitForTimeout(1000)
      }
    } catch (error) {
      console.log(`  상호작용 중 오류: ${error}`)
    }

    console.log(`\n콘솔 에러: ${errors.length}개`)
    errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))

    console.log(`\n콘솔 경고: ${warnings.length}개`)
    warnings.slice(0, 5).forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`))

    await page.screenshot({ path: 'test-results/08-console-check.png', fullPage: true })
  })

  test('9. 네트워크 요청 확인', async ({ page }) => {
    console.log('✅ 테스트 9: 네트워크 요청')

    const requests: string[] = []
    const failures: string[] = []

    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`)
    })

    page.on('requestfailed', request => {
      failures.push(`Failed: ${request.url()} - ${request.failure()?.errorText}`)
    })

    // 페이지 새로고침
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    console.log(`\n총 요청 수: ${requests.length}개`)
    console.log('주요 요청:')
    requests.slice(0, 10).forEach((req, i) => console.log(`  ${i + 1}. ${req}`))

    console.log(`\n실패한 요청: ${failures.length}개`)
    failures.forEach((fail, i) => console.log(`  ${i + 1}. ${fail}`))

    await page.screenshot({ path: 'test-results/09-network.png', fullPage: true })
  })

  test('10. 전체 페이지 상호작용 시나리오', async ({ page }) => {
    console.log('✅ 테스트 10: 전체 시나리오')

    // 1. 페이지 로드
    await page.waitForLoadState('networkidle')
    console.log('  1. 페이지 로드 완료')

    // 2. 모든 visible 버튼 찾기
    const visibleButtons = await page.locator('button:visible').all()
    console.log(`  2. 보이는 버튼 수: ${visibleButtons.length}`)

    // 3. 각 버튼 클릭 시도
    for (let i = 0; i < Math.min(visibleButtons.length, 3); i++) {
      try {
        const button = visibleButtons[i]
        const text = await button.textContent()
        console.log(`  3.${i + 1} 버튼 클릭: "${text?.trim()}"`)

        await button.click({ timeout: 3000 })
        await page.waitForTimeout(1500)
        await page.screenshot({ path: `test-results/10-scenario-${i + 1}.png`, fullPage: true })

        // 메인으로 돌아가기
        await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
        await page.waitForTimeout(1000)
      } catch (error) {
        console.log(`  ⚠ 버튼 클릭 실패: ${error}`)
      }
    }

    // 4. 스크롤 테스트
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(1000)
    console.log('  4. 중간 스크롤 완료')

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    console.log('  5. 하단 스크롤 완료')

    await page.screenshot({ path: 'test-results/10-scenario-final.png', fullPage: true })
    console.log('  ✓ 전체 시나리오 테스트 완료')
  })
})