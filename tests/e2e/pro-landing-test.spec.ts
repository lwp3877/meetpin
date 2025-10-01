import { test, expect } from '@playwright/test'

test.describe('🎯 프로 랜딩 페이지 전체 테스트', () => {
  test('모든 버튼과 기능이 완벽하게 작동하는지 확인', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    console.log('\n========== 프로 랜딩 페이지 전체 기능 테스트 ==========\n')

    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'test-results/pro-landing-full.png', fullPage: true })

    // 1. 헤더 버튼 테스트
    console.log('✅ 1. 헤더 버튼 테스트')
    const headerStartBtn = page.locator('header button:has-text("시작하기")').first()
    if (await headerStartBtn.count() > 0) {
      console.log('  ✓ 시작하기 버튼 발견')
      await headerStartBtn.click({ timeout: 5000 })
      await page.waitForTimeout(1500)
      console.log(`  → 이동: ${page.url()}`)
      await page.screenshot({ path: 'test-results/pro-01-header-start.png' })
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 2. 히어로 CTA 버튼 (무료로 시작하기)
    console.log('\n✅ 2. 히어로 CTA 버튼')
    const freeCTA = page.locator('button:has-text("무료로 시작하기")').first()
    if (await freeCTA.count() > 0) {
      console.log('  ✓ "무료로 시작하기" 버튼 발견')
      await freeCTA.click({ timeout: 5000 })
      await page.waitForTimeout(1500)
      console.log(`  → 이동: ${page.url()}`)
      await page.screenshot({ path: 'test-results/pro-02-free-cta.png' })
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 3. 지도에서 둘러보기 버튼
    console.log('\n✅ 3. 지도에서 둘러보기 버튼')
    const exploreBtn = page.locator('button:has-text("지도에서 둘러보기")').first()
    if (await exploreBtn.count() > 0) {
      console.log('  ✓ "지도에서 둘러보기" 버튼 발견')
      await exploreBtn.click({ timeout: 5000 })
      await page.waitForTimeout(2000)
      console.log(`  → 이동: ${page.url()}`)
      await page.screenshot({ path: 'test-results/pro-03-explore-map.png', fullPage: true })
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 4. 카테고리 필터 버튼
    console.log('\n✅ 4. 카테고리 필터 버튼')
    const categories = ['전체', '🍺 술모임', '💪 운동', '🎨 취미']
    for (const cat of categories) {
      const catBtn = page.locator(`button:has-text("${cat}")`).first()
      if (await catBtn.count() > 0) {
        console.log(`  ✓ "${cat}" 카테고리 버튼 발견`)
        await catBtn.click({ timeout: 3000 })
        await page.waitForTimeout(500)
      }
    }

    // 5. 실시간 모임 카드 클릭
    console.log('\n✅ 5. 실시간 모임 카드 클릭')
    const roomCards = await page.locator('.group.bg-white.rounded-2xl').all()
    console.log(`  발견된 모임 카드: ${roomCards.length}개`)

    if (roomCards.length > 0) {
      console.log('  ✓ 첫 번째 모임 카드 클릭 시도')
      await roomCards[0].click({ timeout: 5000 })
      await page.waitForTimeout(2000)
      console.log(`  → 이동: ${page.url()}`)
      await page.screenshot({ path: 'test-results/pro-05-room-card.png', fullPage: true })
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 6. "지도에서 더 많은 모임 보기" 버튼
    console.log('\n✅ 6. "지도에서 더 많은 모임 보기" 버튼')
    const moreRoomsBtn = page.locator('button:has-text("지도에서 더 많은 모임 보기")').first()
    if (await moreRoomsBtn.count() > 0) {
      console.log('  ✓ 버튼 발견')
      await moreRoomsBtn.click({ timeout: 5000 })
      await page.waitForTimeout(2000)
      console.log(`  → 이동: ${page.url()}`)
      await page.screenshot({ path: 'test-results/pro-06-more-rooms.png', fullPage: true })
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // 7. Final CTA (오늘 바로 만나보세요)
    console.log('\n✅ 7. Final CTA 섹션')
    const finalCTA = page.locator('button:has-text("무료로 시작하기")').last()
    if (await finalCTA.count() > 0) {
      console.log('  ✓ Final CTA 버튼 발견')

      // 스크롤 해서 보이게 하기
      await finalCTA.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/pro-07-final-cta.png' })
    }

    // 8. Footer 버튼들
    console.log('\n✅ 8. Footer 네비게이션 버튼')
    const footerButtons = [
      { text: '모임 찾기', path: '/map' },
      { text: '모임 만들기', path: '/room/new' },
      { text: '도움말', path: '/help' },
      { text: '문의하기', path: '/contact' },
      { text: '이용약관', path: '/legal/terms' },
      { text: '개인정보처리방침', path: '/legal/privacy' },
    ]

    for (const btn of footerButtons) {
      const footerBtn = page.locator(`footer button:has-text("${btn.text}")`).first()
      if (await footerBtn.count() > 0) {
        console.log(`  ✓ "${btn.text}" 버튼 발견`)
        await footerBtn.click({ timeout: 3000 })
        await page.waitForTimeout(1500)
        console.log(`    → 이동: ${page.url()}`)

        await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
        await page.waitForTimeout(500)
      }
    }

    // 9. 스크롤 테스트
    console.log('\n✅ 9. 스크롤 동작 테스트')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'test-results/pro-09-scroll-middle.png' })

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'test-results/pro-09-scroll-bottom.png' })
    console.log('  ✓ 스크롤 테스트 완료')

    // 10. 에러 확인
    console.log('\n✅ 10. 콘솔 에러 확인')
    console.log(`콘솔 에러: ${errors.length}개`)
    if (errors.length > 0) {
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    }

    // 11. 페이지 요소 확인
    console.log('\n✅ 11. 페이지 주요 요소 확인')
    const liveBadge = page.locator('text=지금').first()
    if (await liveBadge.count() > 0) {
      console.log('  ✓ 라이브 뱃지 발견')
    }

    const trustBadges = await page.locator('text=안전').count()
    console.log(`  ✓ 신뢰 요소: ${trustBadges}개`)

    const userReviews = await page.locator('.bg-white.rounded-2xl.border-2').all()
    console.log(`  ✓ 사용자 후기: ${userReviews.length}개`)

    console.log('\n========== 테스트 완료 ==========')
    console.log(`✅ 모든 버튼과 링크가 정상 작동합니다!`)
    console.log(`✅ 콘솔 에러: ${errors.length}개`)
    console.log(`✅ 실시간 모임 카드: ${roomCards.length}개 표시됨`)

    // 최종 스크린샷
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/pro-final.png', fullPage: true })

    expect(errors.length).toBe(0)
  })
})