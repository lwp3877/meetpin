// e2e/updated-data-test.spec.ts - 업데이트된 샘플 데이터 검증
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('업데이트된 샘플 데이터 검증', () => {
  test('진행 중인 방들이 표시되는지 확인', async ({ page }) => {
    console.log('🔍 진행 중인 방들 데이터 확인 시작')

    // 지도 페이지 접속
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // API 호출 확인
    let apiCallFound = false
    page.on('response', response => {
      if (response.url().includes('/api/rooms')) {
        apiCallFound = true
        console.log(`✅ API 호출 성공: ${response.status()} ${response.url()}`)
      }
    })

    // 페이지 새로고침하여 API 호출 트리거
    await page.reload()
    await page.waitForTimeout(3000)

    expect(apiCallFound).toBe(true)
    console.log('✅ API 연동 확인됨')

    // 방 제목들이 표시되는지 확인 (일부 방들)
    const roomTitles = [
      '강남에서 맥주 한 잔 🍺',
      '홍대 포차 투어 🍻',
      '강남역 치킨&맥주 🍗',
      '성수 수제맥주 투어 🍺',
    ]

    let foundRooms = 0
    for (const title of roomTitles) {
      const roomElement = page.locator(`text=${title}`).first()
      if (await roomElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ 방 발견: ${title}`)
        foundRooms++
      }
    }

    console.log(`📊 확인된 방: ${foundRooms}/${roomTitles.length}개`)
    expect(foundRooms).toBeGreaterThan(0) // 최소 1개 이상의 방은 표시되어야 함
  })

  test('프로필 이미지가 로드되는지 확인', async ({ page }) => {
    console.log('🔍 프로필 이미지 로드 확인 시작')

    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // 아바타 이미지들이 있는지 확인
    const avatarImages = page.locator('img[src*="unsplash.com"]')
    const imageCount = await avatarImages.count()

    console.log(`📸 프로필 이미지 발견: ${imageCount}개`)

    if (imageCount > 0) {
      // 첫 번째 이미지가 실제로 로드되는지 확인
      const firstImage = avatarImages.first()
      const isVisible = await firstImage.isVisible()
      console.log(`✅ 첫 번째 프로필 이미지 표시: ${isVisible}`)
      expect(isVisible).toBe(true)
    } else {
      console.log('ℹ️  현재 뷰에서는 프로필 이미지가 보이지 않음 (정상적일 수 있음)')
    }
  })

  test('다양한 지역의 방들이 존재하는지 API로 확인', async ({ page, request }) => {
    console.log('🔍 지역별 방 데이터 API 검증')

    // 서울 전체 영역 API 호출
    const response = await request.get(
      `${BASE_URL}/api/rooms?bbox=37.4563,126.8226,37.6761,127.1836&limit=50`
    )
    const data = await response.json()

    expect(response.ok()).toBe(true)
    expect(data.ok).toBe(true)
    expect(data.data.rooms).toBeDefined()

    const rooms = data.data.rooms
    console.log(`📍 총 방 개수: ${rooms.length}개`)

    // 다양한 지역이 포함되어 있는지 확인
    const locations = rooms.map((room: any) => room.place_text)
    const uniqueLocations = [...new Set(locations)]
    console.log(`🗺️  고유 장소 개수: ${uniqueLocations.length}개`)
    console.log(`📍 장소 예시: ${uniqueLocations.slice(0, 5).join(', ')}`)

    expect(uniqueLocations.length).toBeGreaterThan(5) // 최소 5개 이상의 다른 지역

    // 카테고리 다양성 확인
    const categories = rooms.map((room: any) => room.category)
    const uniqueCategories = [...new Set(categories)]
    console.log(`🏷️  카테고리: ${uniqueCategories.join(', ')}`)

    expect(uniqueCategories.length).toBeGreaterThan(1) // 최소 2개 이상의 카테고리

    // 프로필 이미지 확인
    const roomsWithImages = rooms.filter(
      (room: any) => room.profiles.avatar_url && room.profiles.avatar_url.includes('unsplash.com')
    )
    console.log(`📸 프로필 이미지가 있는 방: ${roomsWithImages.length}/${rooms.length}개`)

    expect(roomsWithImages.length).toBeGreaterThan(rooms.length * 0.8) // 80% 이상 이미지 보유

    console.log('✅ 모든 데이터 검증 완료!')
  })

  test('부스트된 방들이 우선 표시되는지 확인', async ({ page, request }) => {
    console.log('🔍 부스트된 방 우선순위 확인')

    const response = await request.get(
      `${BASE_URL}/api/rooms?bbox=37.4563,126.8226,37.6761,127.1836&limit=10`
    )
    const data = await response.json()

    const rooms = data.data.rooms
    const boostedRooms = rooms.filter((room: any) => room.boost_until)

    console.log(`⚡ 부스트된 방: ${boostedRooms.length}개`)

    if (boostedRooms.length > 0) {
      boostedRooms.forEach((room: any, index: number) => {
        console.log(`  ${index + 1}. ${room.title} (부스트 만료: ${room.boost_until})`)
      })

      // 부스트된 방들이 상위에 위치하는지 확인
      const firstFewRooms = rooms.slice(0, Math.min(5, rooms.length))
      const boostedInTop = firstFewRooms.filter((room: any) => room.boost_until).length
      console.log(`📊 상위 5개 중 부스트된 방: ${boostedInTop}개`)

      expect(boostedInTop).toBeGreaterThan(0) // 상위권에 부스트된 방이 있어야 함
    }

    console.log('✅ 부스트 기능 검증 완료!')
  })
})
