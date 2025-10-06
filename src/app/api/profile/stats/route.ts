/* src/app/api/profile/stats/route.ts */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { isDevelopmentMode } from '@/lib/config/flags'

import { logger } from '@/lib/observability/logger'
interface UserStats {
  hostedRooms: number
  joinedRooms: number
  completedMatches: number
  totalMessages: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

// 성취 시스템 생성 함수
function generateAchievements(stats: UserStats): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_room',
      title: '첫 모임 개최자',
      description: '첫 번째 모임을 성공적으로 개최했습니다',
      icon: '🎉',
      unlocked: stats.hostedRooms >= 1,
      unlockedAt: stats.hostedRooms >= 1 ? new Date().toISOString() : undefined,
    },
    {
      id: 'room_host_master',
      title: '모임 마스터',
      description: '5개 이상의 모임을 개최했습니다',
      icon: '👑',
      unlocked: stats.hostedRooms >= 5,
      unlockedAt: stats.hostedRooms >= 5 ? new Date().toISOString() : undefined,
    },
    {
      id: 'social_butterfly',
      title: '소셜 나비',
      description: '10개 이상의 모임에 참여했습니다',
      icon: '🦋',
      unlocked: stats.joinedRooms >= 10,
      unlockedAt: stats.joinedRooms >= 10 ? new Date().toISOString() : undefined,
    },
    {
      id: 'conversation_starter',
      title: '대화의 달인',
      description: '50개 이상의 메시지를 주고받았습니다',
      icon: '💬',
      unlocked: stats.totalMessages >= 50,
      unlockedAt: stats.totalMessages >= 50 ? new Date().toISOString() : undefined,
    },
    {
      id: 'match_maker',
      title: '매치 메이커',
      description: '10번 이상의 매칭을 성공시켰습니다',
      icon: '💝',
      unlocked: stats.completedMatches >= 10,
      unlockedAt: stats.completedMatches >= 10 ? new Date().toISOString() : undefined,
    },
  ]

  return achievements.filter(achievement => achievement.unlocked)
}

// 프로필 통계 조회
export async function GET(req: NextRequest) {
  try {
    // Rate limiting: API 호출 100/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:' + clientIP, 100, 60 * 1000)

    const user = await getAuthenticatedUser()

    if (isDevelopmentMode) {
      // 개발 모드에서는 모크 데이터 반환
      const mockStats = {
        hostedRooms: 3,
        joinedRooms: 7,
        completedMatches: 5,
        totalMessages: 142,
        memberSince: user.created_at,
        achievements: [
          {
            id: 'first_room',
            name: '첫 모임 개최',
            description: '첫 번째 모임을 성공적으로 개최했습니다',
            earned: true,
            earnedAt: '2024-01-15',
          },
          {
            id: 'social_butterfly',
            name: '사교왕',
            description: '10개 이상의 모임에 참여했습니다',
            earned: false,
          },
          {
            id: 'chat_master',
            name: '대화의 달인',
            description: '100개 이상의 메시지를 보냈습니다',
            earned: true,
            earnedAt: '2024-02-10',
          },
          {
            id: 'early_adopter',
            name: '얼리어답터',
            description: '서비스 초기 가입자입니다',
            earned: true,
            earnedAt: '2024-01-01',
          },
        ],
        recentActivity: [
          { type: 'hosted', title: '강남 술모임', date: '2024-03-15', participants: 4 },
          { type: 'joined', title: '헬스장 운동 모임', date: '2024-03-12', host: '김철수' },
          { type: 'message', title: '새로운 매칭 상대와 대화', date: '2024-03-10' },
        ],
        favoriteCategories: [
          { category: 'drink', count: 5, percentage: 50 },
          { category: 'exercise', count: 3, percentage: 30 },
          { category: 'other', count: 2, percentage: 20 },
        ],
      }

      return Response.json({
        ok: true,
        data: mockStats,
      })
    }

    const supabase = await createServerSupabaseClient()

    // 호스팅한 모임 수
    const { count: hostedCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('host_uid', user.id)

    // 참여한 모임 수 (수락된 요청)
    const { count: joinedCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('requester_uid', user.id)
      .eq('status', 'accepted')

    // 완료된 매칭 수
    const { count: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .or(`host_uid.eq.${user.id},guest_uid.eq.${user.id}`)

    // 보낸 메시지 수
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_uid', user.id)

    // 최근 활동 (호스팅한 모임, 참여한 모임)
    const { data: recentRooms } = await supabase
      .from('rooms')
      .select('id, title, start_at, max_people')
      .eq('host_uid', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentRequests } = await supabase
      .from('requests')
      .select(
        `
        id, created_at,
        rooms!inner(id, title, host_uid),
        profiles!rooms_host_uid_fkey(nickname)
      `
      )
      .eq('requester_uid', user.id)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(5)

    // 카테고리별 참여 통계
    const { data: categoryStats } = await supabase
      .from('rooms')
      .select('category')
      .or(
        `host_uid.eq.${user.id},id.in.(${
          // 사용자가 참여한 모임의 ID들을 서브쿼리로 가져오기
          "SELECT room_id FROM requests WHERE requester_uid = '" +
          user.id +
          "' AND status = 'accepted'"
        })`
      )

    // 통계 데이터 구성
    const stats = {
      hostedRooms: hostedCount || 0,
      joinedRooms: joinedCount || 0,
      completedMatches: matchCount || 0,
      totalMessages: messageCount || 0,
      memberSince: user.created_at,
      achievements: generateAchievements({
        hostedRooms: hostedCount || 0,
        joinedRooms: joinedCount || 0,
        completedMatches: matchCount || 0,
        totalMessages: messageCount || 0,
      }),
      recentActivity: [
        ...(recentRooms || []).map((room: Record<string, unknown>) => ({
          type: 'hosted',
          title: room.title,
          date: room.start_at,
          participants: room.max_people,
        })),
        ...(recentRequests || []).map((request: Record<string, unknown>) => ({
          type: 'joined',
          title: (request.rooms as Record<string, unknown>)?.title,
          date: request.created_at,
          host: (request.profiles as Record<string, unknown> | undefined)?.nickname || '알 수 없음',
        })),
      ]
        .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
        .slice(0, 10),
      favoriteCategories: Object.entries(
        (categoryStats || []).reduce((acc: Record<string, number>, item: Record<string, unknown>) => {
          const category = item.category as string
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})
      ).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round(((count as number) / (categoryStats?.length || 1)) * 100),
      })),
    }

    const response: ApiResponse<any> = {
      ok: true,
      data: stats,
    }

    return Response.json(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, code: error.code, message: (error as Error).message },
        { status: (error as any).status }
      )
    }

    logger.error('Profile stats API error:', { error: error instanceof Error ? error.message : String(error) })
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
