/**
 * 밋핀 스마트 봇 방 자동생성 시스템
 * 자연스럽고 매력적인 방을 자동으로 생성하여 플랫폼을 활성화
 */

// Supabase admin client for future database integration from '@/lib/supabaseClient'

// 서울 핫플레이스 좌표 데이터
const seoulHotspots = [
  // 강남구
  { name: '강남역', lat: 37.4979, lng: 127.0276, district: '강남구' },
  { name: '신논현역', lat: 37.5044, lng: 127.0252, district: '강남구' },
  { name: '압구정로데오', lat: 37.5272, lng: 127.0286, district: '강남구' },
  { name: '청담동', lat: 37.5173, lng: 127.0602, district: '강남구' },

  // 서초구
  { name: '서초역', lat: 37.4837, lng: 127.0106, district: '서초구' },
  { name: '교대역', lat: 37.4925, lng: 127.0141, district: '서초구' },

  // 마포구
  { name: '홍대입구', lat: 37.5563, lng: 126.9236, district: '마포구' },
  { name: '합정역', lat: 37.5496, lng: 126.9139, district: '마포구' },
  { name: '상수역', lat: 37.5478, lng: 126.9222, district: '마포구' },
  { name: '망원역', lat: 37.5556, lng: 126.9106, district: '마포구' },

  // 용산구
  { name: '이태원', lat: 37.5345, lng: 126.9944, district: '용산구' },
  { name: '한남동', lat: 37.534, lng: 127.0026, district: '용산구' },
  { name: '용산역', lat: 37.5299, lng: 126.9649, district: '용산구' },

  // 성동구
  { name: '성수동', lat: 37.5446, lng: 127.0555, district: '성동구' },
  { name: '건대입구', lat: 37.5401, lng: 127.0704, district: '성동구' },

  // 종로구
  { name: '종로3가', lat: 37.5703, lng: 126.9829, district: '종로구' },
  { name: '인사동', lat: 37.5707, lng: 126.9858, district: '종로구' },
  { name: '삼청동', lat: 37.5855, lng: 126.9838, district: '종로구' },

  // 중구
  { name: '명동', lat: 37.5636, lng: 126.9856, district: '중구' },
  { name: '동대문', lat: 37.5665, lng: 127.0092, district: '중구' },

  // 송파구
  { name: '잠실', lat: 37.5118, lng: 127.0982, district: '송파구' },
  { name: '석촌호수', lat: 37.5061, lng: 127.1013, district: '송파구' },

  // 영등포구
  { name: '여의도', lat: 37.5219, lng: 126.9245, district: '영등포구' },
  { name: '문래동', lat: 37.5184, lng: 126.895, district: '영등포구' },
]

// 자연스러운 봇 프로필 데이터
const botProfiles = [
  // 술 카테고리 호스트들
  { nickname: '소맥러버', ageRange: '20s_late', category: 'drink', personality: 'cheerful' },
  {
    nickname: '칵테일마스터',
    ageRange: '30s_early',
    category: 'drink',
    personality: 'sophisticated',
  },
  { nickname: '와인애호가', ageRange: '30s_late', category: 'drink', personality: 'elegant' },
  { nickname: '맥주탐험가', ageRange: '20s_early', category: 'drink', personality: 'adventurous' },
  { nickname: '바텐더준', ageRange: '30s_early', category: 'drink', personality: 'professional' },
  { nickname: '홍대주인장', ageRange: '20s_late', category: 'drink', personality: 'energetic' },

  // 운동 카테고리 호스트들
  { nickname: '러닝메이트', ageRange: '20s_early', category: 'exercise', personality: 'active' },
  {
    nickname: '헬스트레이너김',
    ageRange: '30s_early',
    category: 'exercise',
    personality: 'motivational',
  },
  {
    nickname: '요가인스트럭터',
    ageRange: '20s_late',
    category: 'exercise',
    personality: 'peaceful',
  },
  {
    nickname: '클라이밍매니아',
    ageRange: '30s_early',
    category: 'exercise',
    personality: 'challenging',
  },
  {
    nickname: '테니스코치',
    ageRange: '30s_late',
    category: 'exercise',
    personality: 'competitive',
  },
  { nickname: '수영동호회장', ageRange: '40s', category: 'exercise', personality: 'experienced' },

  // 기타 카테고리 호스트들
  { nickname: '카페탐방러', ageRange: '20s_early', category: 'other', personality: 'curious' },
  { nickname: '전시회가이드', ageRange: '30s_early', category: 'other', personality: 'cultured' },
  { nickname: '맛집헌터', ageRange: '20s_late', category: 'other', personality: 'foodie' },
  { nickname: '사진작가지망생', ageRange: '20s_early', category: 'other', personality: 'artistic' },
  { nickname: '독서모임장', ageRange: '30s_late', category: 'other', personality: 'intellectual' },
  { nickname: '보드게임매니아', ageRange: '20s_late', category: 'other', personality: 'strategic' },
  { nickname: '영화리뷰어', ageRange: '30s_early', category: 'other', personality: 'analytical' },
  { nickname: '여행플래너', ageRange: '20s_late', category: 'other', personality: 'adventurous' },
]

// 카테고리별 활동 템플릿
const activityTemplates = {
  drink: [
    '🍻 {location} 맛집 호핑',
    '🍷 와인 테이스팅 모임',
    '🍺 수제맥주 탐방',
    '🥃 칵테일 바 투어',
    '🍾 샴페인과 함께하는 모임',
    '🍻 퇴근 후 가볍게',
    '🍺 맥주 페스티벌',
    '🍷 와인 공부 모임',
  ],

  exercise: [
    '🏃‍♀️ {location} 조깅 모임',
    '💪 헬스장 운동 메이트',
    '🧘‍♀️ 요가 클래스',
    '🏊‍♂️ 수영 동호회',
    '🚴‍♀️ 자전거 라이딩',
    '🏸 배드민턴 게임',
    '⛰️ 등산 모임',
    '🏀 농구 게임',
    '🎾 테니스 레슨',
    '🧗‍♀️ 클라이밍 체험',
  ],

  other: [
    '☕ {location} 카페 투어',
    '🎨 전시회 관람',
    '📚 독서 모임',
    '🎬 영화 관람',
    '🎲 보드게임 카페',
    '📸 사진 촬영 모임',
    '🎵 콘서트 관람',
    '🍰 베이킹 클래스',
    '🌸 벚꽃 구경',
    '🛍️ 쇼핑 투어',
    '🎪 팝업스토어 탐방',
    '🏛️ 문화유적 탐방',
  ],
}

// 시간대별 활동 선호도
const timePreferences = {
  morning: { hours: [9, 10, 11], categories: ['exercise', 'other'] },
  lunch: { hours: [12, 13, 14], categories: ['other'] },
  afternoon: { hours: [15, 16, 17], categories: ['other', 'exercise'] },
  evening: { hours: [18, 19, 20], categories: ['drink', 'other'] },
  night: { hours: [21, 22], categories: ['drink'] },
}

// 날씨별 활동 추천
const _weatherActivities = {
  sunny: ['조깅', '자전거', '피크닉', '야외 카페'],
  rainy: ['실내 카페', '전시회', '영화관람', '보드게임'],
  cloudy: ['산책', '쇼핑', '맛집탐방', '문화체험'],
}

/**
 * 자연스러운 방 제목 생성
 */
function generateRoomTitle(template: string, location: string, time: Date): string {
  const hour = time.getHours()
  const _timeOfDay = hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁'

  const title = template.replace('{location}', location)

  // 시간대별 수식어 추가
  const timeModifiers = {
    morning: ['상쾌한', '활기찬', '건강한'],
    afternoon: ['여유로운', '즐거운', '편안한'],
    evening: ['따뜻한', '낭만적인', '특별한'],
    night: ['신나는', '열정적인', '즐거운'],
  }

  const _period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night'
  const modifiers = timeModifiers[_period]
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]

  return `${modifier} ${title}`
}

/**
 * 스마트 시간 생성 (현실적인 미래 시간)
 */
function generateSmartTime(): Date {
  const now = new Date()
  const futureTime = new Date(now)

  // 1시간 ~ 48시간 후 랜덤 시간
  const hoursToAdd = Math.floor(Math.random() * 47) + 1
  futureTime.setHours(now.getHours() + hoursToAdd)

  // 현실적인 시간대로 조정 (9시-23시)
  const hour = futureTime.getHours()
  if (hour < 9) {
    futureTime.setHours(9 + Math.floor(Math.random() * 3)) // 9-11시
  } else if (hour > 23) {
    futureTime.setHours(19 + Math.floor(Math.random() * 4)) // 19-22시
  }

  // 분은 0, 15, 30, 45로 설정
  const minutes = [0, 15, 30, 45]
  futureTime.setMinutes(minutes[Math.floor(Math.random() * minutes.length)])
  futureTime.setSeconds(0)

  return futureTime
}

/**
 * 현실적인 참가비 생성
 */
function generateRealisticFee(category: string, location: string): number {
  const baseRanges = {
    drink: [15000, 25000, 35000, 45000],
    exercise: [10000, 15000, 20000, 25000],
    other: [5000, 10000, 15000, 20000, 25000],
  }

  // 지역별 프리미엄 추가
  const premiumAreas = ['강남역', '청담동', '압구정로데오', '한남동']
  const isPremium = premiumAreas.some(area => location.includes(area))

  const baseFees = baseRanges[category as keyof typeof baseRanges]
  let fee = baseFees[Math.floor(Math.random() * baseFees.length)]

  if (isPremium) {
    fee = Math.floor(fee * 1.2) // 20% 프리미엄
  }

  return fee
}

/**
 * 봇 방 단일 생성
 */
export async function generateSingleBotRoom(): Promise<any> {
  try {
    // 랜덤 핫스팟 선택
    const hotspot = seoulHotspots[Math.floor(Math.random() * seoulHotspots.length)]

    // 랜덤 봇 프로필 선택
    const botProfile = botProfiles[Math.floor(Math.random() * botProfiles.length)]

    // 카테고리에 맞는 활동 템플릿 선택
    const templates = activityTemplates[botProfile.category as keyof typeof activityTemplates]
    const template = templates[Math.floor(Math.random() * templates.length)]

    // 시간 생성
    const startTime = generateSmartTime()

    // 방 제목 생성
    const title = generateRoomTitle(template, hotspot.name, startTime)

    // 참가비 생성
    const fee = generateRealisticFee(botProfile.category, hotspot.name)

    // 최대 인원 (현실적인 범위)
    const maxPeople = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)]

    // 좌표에 약간의 랜덤 변화 추가 (같은 장소에 계속 생성되지 않도록)
    const lat = hotspot.lat + (Math.random() - 0.5) * 0.003 // 약 300m 범위
    const lng = hotspot.lng + (Math.random() - 0.5) * 0.003

    return {
      title,
      category: botProfile.category,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      place_text: `${hotspot.name} 근처`,
      start_at: startTime.toISOString(),
      max_people: maxPeople,
      fee,
      botProfile,
      location: hotspot,
    }
  } catch (error) {
    console.error('봇 방 생성 중 오류:', error)
    throw error
  }
}

/**
 * 시간대에 따른 스마트 방 생성
 */
export async function generateTimeBasedBotRooms(count: number = 3): Promise<any[]> {
  const rooms = []
  const now = new Date()
  const currentHour = now.getHours()

  // 현재 시간대에 적합한 카테고리 필터링
  let preferredCategories: string[] = ['drink', 'exercise', 'other']

  for (const [_period, config] of Object.entries(timePreferences)) {
    if (config.hours.includes(currentHour)) {
      preferredCategories = config.categories
      break
    }
  }

  for (let i = 0; i < count; i++) {
    try {
      const room = await generateSingleBotRoom()

      // 시간대에 맞는 카테고리로 조정
      if (!preferredCategories.includes(room.category)) {
        const newCategory =
          preferredCategories[Math.floor(Math.random() * preferredCategories.length)]
        const newProfile = botProfiles.find(p => p.category === newCategory) || botProfiles[0]

        room.category = newCategory
        room.botProfile = newProfile

        // 카테고리 변경에 따른 제목 재생성
        const templates = activityTemplates[newCategory as keyof typeof activityTemplates]
        const template = templates[Math.floor(Math.random() * templates.length)]
        room.title = generateRoomTitle(template, room.location.name, new Date(room.start_at))
      }

      rooms.push(room)
    } catch (error) {
      console.error(`봇 방 ${i + 1} 생성 실패:`, error)
    }
  }

  return rooms
}

/**
 * 지역별 인기 시간대 분석 후 봇 방 생성
 */
export async function generatePopularTimeRooms(
  district: string,
  count: number = 2
): Promise<any[]> {
  const districtHotspots = seoulHotspots.filter(h => h.district === district)
  if (districtHotspots.length === 0) return []

  const rooms = []

  for (let i = 0; i < count; i++) {
    try {
      const room = await generateSingleBotRoom()

      // 해당 지역 핫스팟으로 변경
      const hotspot = districtHotspots[Math.floor(Math.random() * districtHotspots.length)]
      room.location = hotspot
      room.lat = hotspot.lat + (Math.random() - 0.5) * 0.003
      room.lng = hotspot.lng + (Math.random() - 0.5) * 0.003
      room.place_text = `${hotspot.name} 근처`

      rooms.push(room)
    } catch (error) {
      console.error(`지역별 봇 방 ${i + 1} 생성 실패:`, error)
    }
  }

  return rooms
}

// 봇 탐지 방지를 위한 자연스러운 패턴
export const naturalPatterns = {
  // 시간대별 생성 빈도 (시간당 방 생성 수)
  generationFrequency: {
    dawn: 0, // 새벽 0-6시
    morning: 2, // 아침 7-11시
    lunch: 1, // 점심 12-14시
    afternoon: 3, // 오후 15-17시
    evening: 4, // 저녁 18-21시
    night: 2, // 밤 22-23시
  },

  // 요일별 활동 패턴
  weeklyPatterns: {
    monday: { categories: ['exercise', 'other'], factor: 0.7 },
    tuesday: { categories: ['exercise', 'other'], factor: 0.8 },
    wednesday: { categories: ['drink', 'other'], factor: 0.9 },
    thursday: { categories: ['drink', 'other'], factor: 1.0 },
    friday: { categories: ['drink', 'other'], factor: 1.3 },
    saturday: { categories: ['drink', 'exercise', 'other'], factor: 1.5 },
    sunday: { categories: ['other', 'exercise'], factor: 1.1 },
  },

  // 계절별 활동 조정
  seasonalAdjustments: {
    spring: { outdoor: 1.3, indoor: 0.8 },
    summer: { outdoor: 1.5, indoor: 0.7 },
    autumn: { outdoor: 1.2, indoor: 0.9 },
    winter: { outdoor: 0.6, indoor: 1.4 },
  },
}

const smartRoomGenerator = {
  generateSingleBotRoom,
  generateTimeBasedBotRooms,
  generatePopularTimeRooms,
  naturalPatterns,
}

export default smartRoomGenerator
