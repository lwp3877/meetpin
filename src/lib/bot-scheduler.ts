/**
 * 시간대별 봇 방 자동 생성 스케줄러
 * 하루 종일 자동으로 다양한 시간대에 봇 방을 생성하여 플랫폼이 활발해 보이도록 함
 */

'use client'

import smartRoomGenerator from '@/lib/bot/smart-room-generator'
import { logger } from '@/lib/observability/logger'

interface ScheduleSlot {
  hour: number
  minute: number
  roomCount: number
  categories: string[]
  locationWeight: { [key: string]: number }
  description: string
}

// 하루 24시간 봇 방 생성 스케줄
const DAILY_SCHEDULE: ScheduleSlot[] = [
  // 새벽 시간대 (00:00-06:00) - 최소 활동
  {
    hour: 1,
    minute: 30,
    roomCount: 1,
    categories: ['other'],
    locationWeight: { 강남구: 0.8, 서초구: 0.2 },
    description: '새벽 올빼미족을 위한 심야 모임',
  },
  {
    hour: 4,
    minute: 0,
    roomCount: 1,
    categories: ['exercise'],
    locationWeight: { 한강공원: 1.0 },
    description: '새벽 운동 모임',
  },

  // 아침 시간대 (06:00-09:00) - 출근 전 활동
  {
    hour: 6,
    minute: 30,
    roomCount: 3,
    categories: ['exercise', 'other'],
    locationWeight: { 강남구: 0.4, 서초구: 0.3, 송파구: 0.3 },
    description: '아침 운동 및 모닝 카페 모임',
  },
  {
    hour: 7,
    minute: 45,
    roomCount: 2,
    categories: ['other'],
    locationWeight: { 강남구: 0.6, 마포구: 0.4 },
    description: '출근 전 모닝 커피 모임',
  },

  // 점심 시간대 (11:00-14:00) - 직장인 활동
  {
    hour: 11,
    minute: 30,
    roomCount: 4,
    categories: ['other', 'drink'],
    locationWeight: { 강남구: 0.5, 서초구: 0.3, 영등포구: 0.2 },
    description: '점심시간 만남 모임',
  },
  {
    hour: 12,
    minute: 15,
    roomCount: 5,
    categories: ['other'],
    locationWeight: { 강남구: 0.4, 서초구: 0.3, 중구: 0.3 },
    description: '점심 식사 및 카페 모임',
  },
  {
    hour: 13,
    minute: 0,
    roomCount: 3,
    categories: ['other', 'exercise'],
    locationWeight: { 강남구: 0.6, 서초구: 0.4 },
    description: '점심 후 디저트 모임',
  },

  // 오후 시간대 (14:00-17:00) - 여유 시간
  {
    hour: 15,
    minute: 30,
    roomCount: 3,
    categories: ['other', 'exercise'],
    locationWeight: { 강남구: 0.3, 홍대: 0.4, 성수구: 0.3 },
    description: '오후 여유 시간 모임',
  },
  {
    hour: 16,
    minute: 45,
    roomCount: 2,
    categories: ['other'],
    locationWeight: { 강남구: 0.5, 홍대: 0.5 },
    description: '오후 카페 모임',
  },

  // 저녁 시간대 (17:00-21:00) - 가장 활발한 시간
  {
    hour: 17,
    minute: 30,
    roomCount: 6,
    categories: ['drink', 'other'],
    locationWeight: { 강남구: 0.3, 홍대: 0.3, 이태원: 0.2, 건대: 0.2 },
    description: '퇴근 후 첫 모임',
  },
  {
    hour: 18,
    minute: 0,
    roomCount: 8,
    categories: ['drink', 'other', 'exercise'],
    locationWeight: { 홍대: 0.4, 강남구: 0.3, 이태원: 0.3 },
    description: '저녁 골든타임 모임',
  },
  {
    hour: 18,
    minute: 45,
    roomCount: 7,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.4, 강남구: 0.2, 이태원: 0.2, 건대: 0.2 },
    description: '저녁 식사 및 술모임',
  },
  {
    hour: 19,
    minute: 30,
    roomCount: 9,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.3, 강남구: 0.3, 이태원: 0.2, 건대: 0.2 },
    description: '저녁 피크타임 모임',
  },
  {
    hour: 20,
    minute: 15,
    roomCount: 6,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.4, 강남구: 0.3, 이태원: 0.3 },
    description: '저녁 후반 모임',
  },

  // 밤 시간대 (21:00-24:00) - 야간 활동
  {
    hour: 21,
    minute: 30,
    roomCount: 4,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.5, 이태원: 0.3, 강남구: 0.2 },
    description: '밤 모임의 시작',
  },
  {
    hour: 22,
    minute: 15,
    roomCount: 5,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.4, 이태원: 0.4, 강남구: 0.2 },
    description: '야간 핫플레이스 모임',
  },
  {
    hour: 23,
    minute: 0,
    roomCount: 3,
    categories: ['drink', 'other'],
    locationWeight: { 홍대: 0.6, 이태원: 0.4 },
    description: '심야 모임',
  },
  {
    hour: 23,
    minute: 45,
    roomCount: 2,
    categories: ['drink'],
    locationWeight: { 홍대: 0.7, 이태원: 0.3 },
    description: '막차 전 마지막 모임',
  },
]

// 요일별 가중치 (월요일=0, 일요일=6)
const WEEKDAY_MULTIPLIER = {
  0: 0.8, // 월요일 - 적음
  1: 0.9, // 화요일
  2: 1.0, // 수요일 - 보통
  3: 1.1, // 목요일
  4: 1.3, // 금요일 - 많음
  5: 1.4, // 토요일 - 가장 많음
  6: 1.2, // 일요일 - 많음
}

export class BotRoomScheduler {
  private isRunning: boolean = false
  private timers: NodeJS.Timeout[] = []

  constructor() {
    // smartRoomGenerator는 이미 인스턴스화된 객체이므로 직접 사용
  }

  /**
   * 스케줄러 시작
   */
  start(): void {
    if (this.isRunning) {
      logger.info('봇 스케줄러가 이미 실행 중입니다.')
      return
    }

    this.isRunning = true
    logger.info('🤖 봇 방 스케줄러 시작됨')

    // 모든 스케줄 등록
    this.registerDailySchedules()

    // 매일 자정에 다음 날 스케줄 등록
    this.scheduleNextDay()
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers = []
    logger.info('🛑 봇 방 스케줄러 중지됨')
  }

  /**
   * 오늘 하루의 모든 스케줄 등록
   */
  private registerDailySchedules(): void {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    DAILY_SCHEDULE.forEach(slot => {
      const scheduleTime = new Date(today)
      scheduleTime.setHours(slot.hour, slot.minute, 0, 0)

      // 이미 지난 시간이면 내일로 설정
      if (scheduleTime <= now) {
        scheduleTime.setDate(scheduleTime.getDate() + 1)
      }

      this.scheduleRoomGeneration(scheduleTime, slot)
    })
  }

  /**
   * 특정 시간에 방 생성 스케줄 등록
   */
  private scheduleRoomGeneration(scheduleTime: Date, slot: ScheduleSlot): void {
    const delay = scheduleTime.getTime() - Date.now()

    if (delay < 0) return // 이미 지난 시간

    const timer = setTimeout(() => {
      this.generateRoomsForSlot(slot)
    }, delay)

    this.timers.push(timer)

    logger.info(
      `📅 봇 방 생성 예약: ${scheduleTime.toLocaleString('ko-KR')} - ${slot.roomCount}개 방`
    )
  }

  /**
   * 슬롯에 따라 실제 방 생성
   */
  private async generateRoomsForSlot(slot: ScheduleSlot): Promise<void> {
    try {
      const weekday = new Date().getDay()
      const multiplier = WEEKDAY_MULTIPLIER[weekday as keyof typeof WEEKDAY_MULTIPLIER] || 1.0
      const adjustedRoomCount = Math.ceil(slot.roomCount * multiplier)

      logger.info(`🤖 봇 방 생성 시작: ${adjustedRoomCount}개 방 (${slot.description})`)

      for (let i = 0; i < adjustedRoomCount; i++) {
        // 카테고리 랜덤 선택
        const _category = slot.categories[Math.floor(Math.random() * slot.categories.length)]

        // 위치 가중치에 따른 랜덤 선택
        const _location = this.selectWeightedLocation(slot.locationWeight)

        // 약간의 시간 간격을 두고 생성 (너무 동시에 생성되지 않도록)
        setTimeout(() => {
          smartRoomGenerator.generateSingleBotRoom()
        }, i * 2000) // 2초 간격
      }

      logger.info(`✅ 봇 방 생성 완료: ${adjustedRoomCount}개 방`)
    } catch (error) {
      logger.error('봇 방 생성 오류:', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 가중치에 따른 위치 선택
   */
  private selectWeightedLocation(locationWeight: { [key: string]: number }): string {
    const locations = Object.keys(locationWeight)
    const weights = Object.values(locationWeight)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    let random = Math.random() * totalWeight

    for (let i = 0; i < locations.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return locations[i]
      }
    }

    return locations[0] // fallback
  }

  /**
   * 다음 날 스케줄 등록
   */
  private scheduleNextDay(): void {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    const timer = setTimeout(() => {
      if (this.isRunning) {
        logger.info('🌅 새로운 하루 스케줄 등록')
        this.registerDailySchedules()
        this.scheduleNextDay() // 다음 날도 예약
      }
    }, timeUntilMidnight)

    this.timers.push(timer)
  }

  /**
   * 현재 활성화된 스케줄 상태 확인
   */
  getStatus(): { isRunning: boolean; activeTimers: number; nextSchedule?: Date } {
    let nextSchedule: Date | undefined

    if (this.timers.length > 0) {
      const now = Date.now()
      const nextDelay = Math.min(
        ...this.timers.map(_timer => {
          // TypeScript에서 timeout의 시간 정보에 직접 접근할 수 없으므로
          // 대략적인 다음 스케줄 시간을 계산
          return 60000 // 1분 후 (예시)
        })
      )
      nextSchedule = new Date(now + nextDelay)
    }

    return {
      isRunning: this.isRunning,
      activeTimers: this.timers.length,
      nextSchedule,
    }
  }

  /**
   * 특정 시간에 즉시 방 생성 (테스트용)
   */
  async generateTestRooms(count: number = 3, category?: string): Promise<void> {
    logger.info(`🧪 테스트 봇 방 ${count}개 생성 시작`)

    for (let i = 0; i < count; i++) {
      const _testCategory =
        category || ['drink', 'exercise', 'other'][Math.floor(Math.random() * 3)]
      setTimeout(() => {
        smartRoomGenerator.generateSingleBotRoom()
      }, i * 1500) // 1.5초 간격
    }
  }
}

// 글로벌 스케줄러 인스턴스
let globalScheduler: BotRoomScheduler | null = null

/**
 * 글로벌 스케줄러 인스턴스 가져오기
 */
export function getBotScheduler(): BotRoomScheduler {
  if (!globalScheduler) {
    globalScheduler = new BotRoomScheduler()
  }
  return globalScheduler
}

/**
 * 자동 스케줄러 시작 (앱 시작 시 호출)
 */
export function initializeBotScheduler(): void {
  if (typeof window !== 'undefined') {
    const scheduler = getBotScheduler()
    scheduler.start()

    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
      scheduler.stop()
    })
  }
}

export default BotRoomScheduler
