/**
 * 밋핀 봇 스케줄러 (Bot Manager)
 *
 * 자연스러운 패턴으로 봇 방을 자동 생성하고 관리합니다.
 *
 * 주요 기능:
 * - 시간대별 자동 봇 방 생성 (15분 주기)
 * - 요일별 생성 빈도 조정 (주말 증가)
 * - 인기 지역별 봇 방 생성 (1시간 주기)
 * - 오래된 봇 방 정리 (24시간 후, 6시간 주기)
 *
 * 아키텍처:
 * - 이 파일은 봇 방의 실제 생성과 DB 저장을 담당 (실행 엔진)
 * - `/lib/bot-scheduler.ts`는 시간 기반 스케줄링만 담당 (스케줄링 엔진)
 */

import {
  generateTimeBasedBotRooms,
  generatePopularTimeRooms,
  naturalPatterns,
} from './smart-room-generator'
import { supabaseAdmin, type ProfileInsert, type RoomInsert } from '@/lib/supabaseClient'
import { logger } from '@/lib/observability/logger'

// 봇 생성 상태 추적
interface BotGenerationState {
  lastGeneration: Date
  dailyCount: number
  isActive: boolean
  currentHourGenerated: boolean
}

const generationState: BotGenerationState = {
  lastGeneration: new Date(),
  dailyCount: 0,
  isActive: true,
  currentHourGenerated: false,
}

/**
 * 봇 프로필을 Supabase에 생성/업데이트
 */
async function ensureBotProfile(botProfile: unknown) {
  try {
    // 봇 계정 생성 (이미 존재하면 무시)
    const { data: authData, error: authError } = await (supabaseAdmin as any).auth.admin.createUser(
      {
        email: `bot_${(botProfile as any).nickname.toLowerCase()}@meetpin.bot`,
        password: Math.random().toString(36),
        email_confirm: true,
        user_metadata: {
          is_bot: true,
          nickname: (botProfile as any).nickname,
          age_range: (botProfile as any).ageRange,
          category_preference: (botProfile as any).category,
        },
      }
    )

    if (authError && !authError.message.includes('already')) {
      logger.error('봇 계정 생성 실패:', { error: authError instanceof Error ? authError.message : String(authError) })
      return null
    }

    const userId = authData?.user?.id || (await getBotUserId((botProfile as any).nickname))
    if (!userId) return null

    // 프로필 생성/업데이트
    const profileData: ProfileInsert = {
      uid: userId,
      nickname: (botProfile as any).nickname,
      age_range: (botProfile as any).ageRange,
      avatar_url: getBotAvatarUrl(botProfile as any),
      intro: getBotIntro(botProfile as any),
      role: 'user', // 봇도 일반 사용자로 표시
    }

    const { error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      logger.error('봇 프로필 생성 실패:', { error: profileError instanceof Error ? profileError.message : String(profileError) })
      return null
    }

    return userId
  } catch (error) {
    logger.error('봇 프로필 처리 중 오류:', { error: error instanceof Error ? error.message : String(error) })
    return null
  }
}

/**
 * 기존 봇 사용자 ID 조회
 */
async function getBotUserId(nickname: string): Promise<string | null> {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('profiles')
      .select('uid')
      .eq('nickname', nickname)
      .single()

    if (error || !data) return null
    return data.uid
  } catch {
    return null
  }
}

/**
 * 봇별 아바타 URL 생성
 */
function getBotAvatarUrl(botProfile: unknown): string {
  const avatarIds = [
    'photo-1438761681033-6461ffad8d80', // 여성
    'photo-1507003211169-0a1dd7228f2d', // 남성
    'photo-1494790108755-2616b9ee3cde', // 여성
    'photo-1500648767791-00dcc994a43e', // 남성
    'photo-1573497019940-1c28c88b4f3e', // 여성
    'photo-1529626455594-4ff0802cfb7e', // 여성
    'photo-1557555187-23d685287bc3', // 여성
    'photo-1534528741775-53994a69daeb', // 여성
  ]

  const hash = (botProfile as any).nickname.split('').reduce((a: number, b: string) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const avatarId = avatarIds[Math.abs(hash) % avatarIds.length]
  // Unsplash 대신 Dicebear 아바타 사용
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfba,c7ceea`
}

/**
 * 봇별 자기소개 생성
 */
function getBotIntro(botProfile: any): string {
  const intros = {
    drink: [
      '좋은 사람들과 맛있는 술 한잔 하는 게 최고예요! 🍻',
      '새로운 바와 맛집을 찾아다니는 걸 좋아해요 ✨',
      '분위기 좋은 곳에서 대화 나누며 친해져요 🥂',
    ],
    exercise: [
      '건강한 라이프스타일을 추구하는 액티브한 사람이에요 💪',
      '운동하면서 새로운 친구들 만나는 걸 좋아해요 🏃‍♀️',
      '함께 운동하면 더 재미있고 동기부여가 돼요! 🔥',
    ],
    other: [
      '다양한 취미와 새로운 경험을 좋아하는 호기심 많은 사람이에요 🌟',
      '문화생활과 맛집 탐방을 즐기는 라이프스타일러예요 📸',
      '새로운 사람들과의 만남에서 에너지를 얻어요 ✨',
    ],
  }

  const categoryIntros = intros[botProfile.category as keyof typeof intros] || intros.other
  return categoryIntros[Math.floor(Math.random() * categoryIntros.length)]
}

/**
 * 봇 방을 실제 데이터베이스에 생성
 */
async function createBotRoomInDatabase(roomData: any) {
  try {
    // 봇 프로필 확인/생성
    const hostUid = await ensureBotProfile(roomData.botProfile)
    if (!hostUid) {
      logger.error('봇 프로필 생성 실패')
      return null
    }

    // 방 생성
    const roomInsertData: RoomInsert = {
      host_uid: hostUid,
      title: roomData.title,
      category: roomData.category,
      lat: roomData.lat,
      lng: roomData.lng,
      place_text: roomData.place_text,
      start_at: roomData.start_at,
      max_people: roomData.max_people,
      fee: roomData.fee,
      visibility: 'public',
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('rooms')
      .insert(roomInsertData)
      .select()
      .single()

    if (error) {
      logger.error('봇 방 생성 실패:', { error: error instanceof Error ? error.message : String(error) })
      return null
    }

    logger.info(`✅ 봇 방 생성 성공: ${roomData.title} (${roomData.location.name})`)
    return data
  } catch (error) {
    logger.error('봇 방 데이터베이스 생성 중 오류:', { error: error instanceof Error ? error.message : String(error) })
    return null
  }
}

/**
 * 현재 시간대에 맞는 봇 방 생성
 *
 * 자연스러운 패턴으로 봇 방을 생성합니다:
 * 1. 시간대별 생성 빈도 확인 (dawn/morning/lunch/afternoon/evening/night)
 * 2. 요일별 조정 팩터 적용 (주말 1.5배, 금요일 1.3배)
 * 3. 각 봇 방 생성 간 10-40초 랜덤 간격 (자연스러운 패턴)
 */
export async function generateBotsForCurrentTime() {
  if (!generationState.isActive) return

  const now = new Date()
  const currentHour = now.getHours()

  // 같은 시간대에 이미 생성했으면 스킵 (중복 생성 방지)
  if (
    generationState.currentHourGenerated &&
    now.getHours() === generationState.lastGeneration.getHours()
  ) {
    return
  }

  // 시간대별 생성 빈도 확인
  const timeOfDay = getTimeOfDay(currentHour)
  const frequency =
    naturalPatterns.generationFrequency[
      timeOfDay as keyof typeof naturalPatterns.generationFrequency
    ]

  // 새벽(dawn) 등 생성 빈도가 0이면 스킵
  if (frequency === 0) return

  try {
    // 요일별 조정 팩터 적용 (금요일: 1.3배, 주말: 1.5배, 평일: 1.0배)
    const dayOfWeek = getDayOfWeek(now)
    const dayPattern =
      naturalPatterns.weeklyPatterns[dayOfWeek as keyof typeof naturalPatterns.weeklyPatterns]
    const adjustedFrequency = Math.ceil(frequency * dayPattern.factor)

    // 봇 방 생성 (시간대별 자연스러운 패턴)
    const rooms = await generateTimeBasedBotRooms(adjustedFrequency)

    for (const roomData of rooms) {
      await createBotRoomInDatabase(roomData)

      // 생성 간격 추가: 10-40초 랜덤 대기
      // Why: 모든 봇 방이 동시에 생성되면 부자연스러움
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30000 + 10000))
    }

    // 상태 업데이트
    generationState.lastGeneration = now
    generationState.dailyCount += rooms.length
    generationState.currentHourGenerated = true

    logger.info(`🤖 ${timeOfDay} 시간대 봇 방 ${rooms.length}개 생성 완료`)
  } catch (error) {
    logger.error('봇 방 생성 중 오류:', { error: error instanceof Error ? error.message : String(error) })
  }
}

/**
 * 인기 지역별 봇 방 추가 생성
 */
export async function generatePopularDistrictBots() {
  const popularDistricts = ['강남구', '마포구', '용산구', '성동구']

  for (const district of popularDistricts) {
    try {
      const rooms = await generatePopularTimeRooms(district, 1)

      for (const roomData of rooms) {
        await createBotRoomInDatabase(roomData)
      }

      // 지역간 생성 간격
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20000 + 5000))
    } catch (error) {
      logger.error(`${district} 봇 방 생성 실패:`, { error: error instanceof Error ? error.message : String(error) })
    }
  }
}

/**
 * 오래된 봇 방 정리 (24시간 후)
 */
export async function cleanupOldBotRooms() {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    // 오래된 봇 방 조회
    const { data: oldRooms, error: selectError } = await (supabaseAdmin as any)
      .from('rooms')
      .select('id, host_uid, profiles!inner(uid)')
      .lt('created_at', oneDayAgo.toISOString())
      .limit(10)

    if (selectError || !oldRooms) return

    // 봇이 호스팅한 방들 찾기
    const botRooms: string[] = []
    for (const room of oldRooms) {
      try {
        const { data: profile } = await (supabaseAdmin as any).auth.admin.getUserById(
          (room as any).host_uid
        )
        if (profile.user?.user_metadata?.is_bot) {
          botRooms.push((room as any).id)
        }
      } catch (_error) {
        // 사용자 조회 실패 시 무시
        logger.warn('Failed to get user profile for cleanup:', (room as any).host_uid)
      }
    }

    if (botRooms.length > 0) {
      // 오래된 봇 방 삭제
      const { error: deleteError } = await (supabaseAdmin as any)
        .from('rooms')
        .delete()
        .in('id', botRooms)

      if (!deleteError) {
        logger.info(`🧹 오래된 봇 방 ${botRooms.length}개 정리 완료`)
      }
    }
  } catch (error) {
    logger.error('봇 방 정리 중 오류:', { error: error instanceof Error ? error.message : String(error) })
  }
}

/**
 * 일일 봇 통계 리셋
 */
export function resetDailyStats() {
  const now = new Date()
  const lastReset = generationState.lastGeneration

  if (now.getDate() !== lastReset.getDate()) {
    generationState.dailyCount = 0
    generationState.currentHourGenerated = false
    logger.info('📊 일일 봇 통계 리셋')
  }
}

// 유틸리티 함수들
function getTimeOfDay(hour: number): string {
  if (hour >= 0 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

/**
 * 봇 관리자 인터페이스
 *
 * 봇 시스템의 시작/중지와 통계 조회를 제공합니다.
 *
 * 자동 실행 주기:
 * - 시간대별 봇 방 생성: 15분마다
 * - 인기 지역 봇 방 생성: 1시간마다
 * - 오래된 봇 방 정리: 6시간마다
 *
 * 사용 예시:
 * ```typescript
 * // 서버 시작 시 (app/api/cron/bot-scheduler/route.ts)
 * BotManager.start()
 *
 * // 수동 생성
 * await BotManager.createManualBots(5)
 *
 * // 통계 확인
 * const stats = BotManager.getStats()
 * logger.info(stats.dailyCount)  // 오늘 생성된 봇 방 수
 * ```
 */
export const BotManager = {
  /**
   * 봇 시스템 시작
   * - 초기 봇 방 생성
   * - 주기적 실행 설정 (setInterval)
   */
  async start() {
    generationState.isActive = true
    logger.info('🤖 봇 시스템 시작')

    // 초기 봇 방 생성 (즉시 실행)
    await generateBotsForCurrentTime()

    // 주기적 실행 설정 (15분마다)
    // Why: 너무 자주 실행하면 서버 부하, 너무 드물면 사용자 경험 저하
    setInterval(
      async () => {
        resetDailyStats()
        await generateBotsForCurrentTime()
      },
      15 * 60 * 1000
    )

    // 인기 지역 봇 방 생성 (1시간마다)
    // Why: 강남, 마포, 용산 등 인기 지역에 봇 방 추가 배치
    setInterval(
      async () => {
        await generatePopularDistrictBots()
      },
      60 * 60 * 1000
    )

    // 오래된 방 정리 (6시간마다)
    // Why: 24시간 지난 봇 방은 자동 삭제 (DB 정리)
    setInterval(
      async () => {
        await cleanupOldBotRooms()
      },
      6 * 60 * 60 * 1000
    )
  },

  /**
   * 봇 시스템 중지
   * Note: setInterval은 여전히 실행 중이지만 생성은 중지됨
   */
  stop() {
    generationState.isActive = false
    logger.info('🤖 봇 시스템 중지')
  },

  /**
   * 봇 시스템 통계 조회
   */
  getStats() {
    return {
      isActive: generationState.isActive,
      dailyCount: generationState.dailyCount,
      lastGeneration: generationState.lastGeneration,
    }
  },

  /**
   * 수동 봇 방 생성 (관리자용)
   * @param count 생성할 봇 방 개수 (기본값: 3)
   */
  async createManualBots(count: number = 3) {
    logger.info(`🎯 수동 봇 방 ${count}개 생성 시작`)
    const rooms = await generateTimeBasedBotRooms(count)

    for (const roomData of rooms) {
      await createBotRoomInDatabase(roomData)
    }

    return rooms
  },
}
