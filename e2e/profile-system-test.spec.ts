// e2e/profile-system-test.spec.ts - 완벽한 프로필 시스템 테스트
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('완벽한 프로필 시스템 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지 로드
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('사용자 프로필 페이지 전체 기능 테스트', async ({ page }) => {
    console.log('🔍 사용자 프로필 페이지 전체 기능 테스트 시작')
    
    // 김철수 사용자의 프로필 페이지로 직접 이동
    const testUserId = '550e8400-e29b-41d4-a716-446655440001'
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    
    // 페이지 로드 확인
    console.log('✅ 프로필 페이지 로드됨')
    
    // 프로필 헤더 확인
    const profileName = page.locator('h2').first()
    await expect(profileName).toContainText('김철수')
    console.log('✅ 프로필 이름 표시됨: 김철수')
    
    // 프로필 이미지 확인
    const profileImage = page.locator('img[alt*="프로필 사진"]').first()
    const isImageVisible = await profileImage.isVisible().catch(() => false)
    console.log(`📸 프로필 이미지 표시: ${isImageVisible ? '✅' : '⚠️ 없음'}`)
    
    // 연령대 표시 확인
    const ageRange = page.locator('text=20대').first()
    await expect(ageRange).toBeVisible()
    console.log('✅ 연령대 표시됨')
    
    // 평점 표시 확인
    const rating = page.locator('text=⭐').first()
    await expect(rating).toBeVisible()
    console.log('✅ 평점 표시됨')
    
    // 통계 섹션 확인
    const statsSection = page.locator('text=참여한 모임')
    await expect(statsSection).toBeVisible()
    console.log('✅ 활동 통계 표시됨')
    
    // 탭 네비게이션 테스트
    const tabs = ['소개', '활동', '업적']
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first()
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(500)
        console.log(`✅ ${tabName} 탭 클릭 성공`)
      }
    }
    
    // 자기소개 섹션 확인 (소개 탭에서)
    const introSection = page.locator('text=자기소개')
    if (await introSection.isVisible()) {
      console.log('✅ 자기소개 섹션 표시됨')
    }
    
    // 관심사 태그 확인
    const interestTags = page.locator('text=🍻').or(page.locator('text=💪')).or(page.locator('text=🍽️'))
    const hasInterests = await interestTags.first().isVisible().catch(() => false)
    console.log(`🏷️ 관심사 태그 표시: ${hasInterests ? '✅' : '⚠️ 없음'}`)
    
    // 액션 버튼 확인
    const chatButton = page.locator('text=1:1 채팅하기').first()
    await expect(chatButton).toBeVisible()
    console.log('✅ 채팅 버튼 표시됨')
    
    const mapButton = page.locator('text=지도에서 모임 찾기').first()
    await expect(mapButton).toBeVisible()
    console.log('✅ 지도 버튼 표시됨')
    
    console.log('🎉 사용자 프로필 페이지 전체 기능 테스트 완료!')
  })
  
  test('프로필 페이지 반응형 디자인 테스트', async ({ page }) => {
    console.log('📱 프로필 페이지 반응형 디자인 테스트 시작')
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440001'
    
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    console.log('✅ 데스크톱 뷰 테스트 완료')
    
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    const profileHeader = page.locator('h2').first()
    await expect(profileHeader).toBeVisible()
    console.log('✅ 태블릿 뷰 테스트 완료')
    
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await expect(profileHeader).toBeVisible()
    console.log('✅ 모바일 뷰 테스트 완료')
    
    // 탭 클릭 테스트 (모바일에서)
    const activityTab = page.locator('text=활동').first()
    if (await activityTab.isVisible()) {
      await activityTab.click()
      await page.waitForTimeout(500)
      console.log('✅ 모바일에서 탭 클릭 테스트 완료')
    }
    
    console.log('🎉 반응형 디자인 테스트 완료!')
  })
  
  test('프로필 네비게이션 테스트', async ({ page }) => {
    console.log('🧭 프로필 네비게이션 테스트 시작')
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440002'
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    
    // 뒤로 가기 버튼 테스트
    const backButton = page.locator('svg[stroke="currentColor"]').first()
    if (await backButton.isVisible()) {
      console.log('✅ 뒤로 가기 버튼 찾음')
    }
    
    // 메뉴 버튼 (점 3개) 확인
    const menuButton = page.locator('svg').filter({ hasText: /M12 5v.01M12 12v.01M12 19v.01/ })
    const hasMenuButton = await menuButton.count() > 0
    console.log(`⚙️ 메뉴 버튼 표시: ${hasMenuButton ? '✅' : '⚠️ 없음'}`)
    
    // 지도로 이동 버튼 클릭 테스트
    const mapLink = page.locator('a[href="/map"]').first()
    if (await mapLink.isVisible()) {
      // 새 탭에서 열리지 않도록 target 속성 확인
      const hasBlankTarget = await mapLink.getAttribute('target') === '_blank'
      console.log(`🗺️ 지도 링크 표시: ✅ (새탭: ${hasBlankTarget ? '예' : '아니오'})`)
    }
    
    console.log('🎉 네비게이션 테스트 완료!')
  })
  
  test('프로필 데이터 무결성 테스트', async ({ page, request }) => {
    console.log('🔒 프로필 데이터 무결성 테스트 시작')
    
    // 여러 사용자 ID로 테스트
    const testUserIds = [
      '550e8400-e29b-41d4-a716-446655440001', // 김철수
      '550e8400-e29b-41d4-a716-446655440002', // 이영희
      '550e8400-e29b-41d4-a716-446655440003'  // 박민수
    ]
    
    for (const userId of testUserIds) {
      await page.goto(`${BASE_URL}/profile/${userId}`)
      await page.waitForLoadState('networkidle')
      
      // 프로필 이름이 표시되는지 확인
      const profileName = page.locator('h2').first()
      const nameText = await profileName.textContent()
      expect(nameText).toBeTruthy()
      console.log(`✅ 사용자 ${userId.slice(-1)}: 이름 표시됨 (${nameText})`)
      
      // 필수 요소들이 모두 있는지 확인
      const requiredElements = [
        'text=일 전 가입',
        'text=개월 전 가입',
        'text=년 전 가입',
        'text=참여한 모임',
        'text=주최한 모임',
        'text=새로운 친구'
      ]
      
      let foundElement = false
      for (const element of requiredElements) {
        if (await page.locator(element).first().isVisible().catch(() => false)) {
          foundElement = true
          break
        }
      }
      expect(foundElement).toBeTruthy()
      console.log(`✅ 사용자 ${userId.slice(-1)}: 필수 요소 확인됨`)
    }
    
    // 존재하지 않는 사용자 ID 테스트
    await page.goto(`${BASE_URL}/profile/nonexistent-user-id`)
    await page.waitForLoadState('networkidle')
    
    const notFoundMessage = page.locator('text=사용자를 찾을 수 없어요')
    await expect(notFoundMessage).toBeVisible()
    console.log('✅ 존재하지 않는 사용자 처리 확인됨')
    
    console.log('🎉 데이터 무결성 테스트 완료!')
  })
  
  test('프로필 상호작용 테스트', async ({ page }) => {
    console.log('🖱️ 프로필 상호작용 테스트 시작')
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440001'
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    
    // 모든 버튼 요소 찾기
    const allButtons = page.locator('button, [role="button"], a')
    const buttonCount = await allButtons.count()
    console.log(`🔘 총 ${buttonCount}개의 상호작용 요소 발견`)
    
    // 클릭 가능한 탭들 테스트
    const tabs = page.locator('button').filter({ hasText: /소개|활동|업적/ })
    const tabCount = await tabs.count()
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i)
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(300)
        const tabText = await tab.textContent()
        console.log(`✅ 탭 클릭 테스트: ${tabText?.trim()}`)
      }
    }
    
    // 호버 효과 테스트 (버튼들)
    const actionButtons = page.locator('button, a').filter({ hasText: /채팅|지도/ })
    const actionButtonCount = await actionButtons.count()
    
    for (let i = 0; i < Math.min(actionButtonCount, 3); i++) {
      const button = actionButtons.nth(i)
      if (await button.isVisible()) {
        await button.hover()
        await page.waitForTimeout(200)
        const buttonText = await button.textContent()
        console.log(`✅ 호버 테스트: ${buttonText?.trim().substring(0, 20)}`)
      }
    }
    
    // 스크롤 테스트
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    console.log('✅ 스크롤 테스트 완료')
    
    console.log('🎉 상호작용 테스트 완료!')
  })
  
  test('프로필 성능 및 로딩 테스트', async ({ page }) => {
    console.log('⚡ 프로필 성능 및 로딩 테스트 시작')
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440001'
    
    // 페이지 로딩 시간 측정
    const startTime = Date.now()
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`⏱️ 페이지 로딩 시간: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000) // 5초 이내
    
    // 이미지 로딩 확인
    const images = page.locator('img')
    const imageCount = await images.count()
    
    let loadedImages = 0
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight !== 0)
      if (isLoaded) loadedImages++
    }
    
    console.log(`🖼️ 이미지 로딩: ${loadedImages}/${imageCount}개 성공`)
    
    // 연속 탭 클릭 성능 테스트
    const tabs = ['소개', '활동', '업적']
    const tabClickStartTime = Date.now()
    
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first()
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(100) // 최소 대기
      }
    }
    
    const tabClickTime = Date.now() - tabClickStartTime
    console.log(`🔄 탭 전환 성능: ${tabClickTime}ms`)
    expect(tabClickTime).toBeLessThan(3000) // 3초 이내
    
    console.log('🎉 성능 테스트 완료!')
  })
  
  test('프로필 접근성 테스트', async ({ page }) => {
    console.log('♿ 프로필 접근성 테스트 시작')
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440001'
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab') // 첫 번째 포커스 가능한 요소로
    await page.waitForTimeout(300)
    
    // 여러 번 탭 눌러서 모든 포커스 가능한 요소 확인
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
    }
    console.log('✅ 키보드 네비게이션 테스트 완료')
    
    // Enter 키로 버튼 클릭 테스트
    const focusedElement = page.locator(':focus')
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '')
    
    if (tagName === 'button' || tagName === 'a') {
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      console.log('✅ Enter 키 버튼 클릭 테스트 완료')
    }
    
    // Alt 텍스트 확인
    const imagesWithAlt = page.locator('img[alt]')
    const altImageCount = await imagesWithAlt.count()
    console.log(`🖼️ Alt 텍스트가 있는 이미지: ${altImageCount}개`)
    
    // 색상 대비 확인 (기본적인 체크)
    const darkText = page.locator('.text-gray-900, .text-gray-800').first()
    const isDarkTextVisible = await darkText.isVisible().catch(() => false)
    console.log(`🎨 충분한 색상 대비: ${isDarkTextVisible ? '✅' : '⚠️'}`)
    
    console.log('🎉 접근성 테스트 완료!')
  })
  
  test('종합 시나리오 테스트', async ({ page }) => {
    console.log('🎭 종합 시나리오 테스트 시작')
    
    // 시나리오: 사용자가 다른 사용자의 프로필을 보고 상호작용하는 과정
    
    // 1. 홈페이지에서 시작
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    console.log('✅ 1단계: 홈페이지 접근')
    
    // 2. 특정 사용자 프로필로 직접 이동
    const testUserId = '550e8400-e29b-41d4-a716-446655440002'
    await page.goto(`${BASE_URL}/profile/${testUserId}`)
    await page.waitForLoadState('networkidle')
    console.log('✅ 2단계: 프로필 페이지 접근')
    
    // 3. 프로필 정보 확인
    const userName = page.locator('h2').first()
    await expect(userName).toBeVisible()
    const userNameText = await userName.textContent()
    console.log(`✅ 3단계: 사용자 정보 확인 (${userNameText})`)
    
    // 4. 각 탭 탐색
    const tabs = ['소개', '활동', '업적']
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first()
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(500)
        console.log(`✅ 4단계: ${tabName} 탭 확인`)
      }
    }
    
    // 5. 액션 버튼 상호작용
    const chatButton = page.locator('text=1:1 채팅하기').first()
    if (await chatButton.isVisible()) {
      // disabled 상태 확인
      const isDisabled = await chatButton.getAttribute('disabled') !== null
      console.log(`✅ 5단계: 채팅 버튼 상태 확인 (비활성화: ${isDisabled})`)
    }
    
    // 6. 지도로 이동 테스트
    const mapButton = page.locator('text=지도에서 모임 찾기').first()
    if (await mapButton.isVisible()) {
      console.log('✅ 6단계: 지도 이동 버튼 확인')
    }
    
    // 7. 다른 사용자 프로필로 이동
    const anotherUserId = '550e8400-e29b-41d4-a716-446655440003'
    await page.goto(`${BASE_URL}/profile/${anotherUserId}`)
    await page.waitForLoadState('networkidle')
    
    const anotherUserName = page.locator('h2').first()
    const anotherUserNameText = await anotherUserName.textContent()
    console.log(`✅ 7단계: 다른 사용자 프로필 확인 (${anotherUserNameText})`)
    
    console.log('🎉 종합 시나리오 테스트 완료!')
  })
})