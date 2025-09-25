/* src/app/api/notifications/route.ts - 알림 목록 조회 API */

import { NextRequest } from 'next/server'
import { ApiResponse, ApiError, getAuthenticatedUser } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'
import { withCache, CacheKeys, CacheTTL, invalidateUserCache } from '@/lib/cache/redis'

// API 캐싱 설정 - 알림은 실시간성이 중요하므로 15초간만 캐싱
export const revalidate = 15 // 15초마다 재검증
export const dynamic = 'force-dynamic' // 사용자별 알림 데이터

export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    // 개발 모드에서는 Mock 데이터 반환
    if (isDevelopmentMode) {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'room_request',
          title: '새로운 참가 요청',
          message: '김민수님이 "홍대 치킨 모임"에 참가를 요청했습니다.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
          read: false,
          actionUrl: '/room/room-1',
        },
        {
          id: 'notif-2',
          type: 'message',
          title: '새로운 메시지',
          message: '이영희님이 메시지를 보냈습니다: "안녕하세요! 몇 시에 만날까요?"',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
          read: false,
          actionUrl: '/chat/match-1',
        },
        {
          id: 'notif-3',
          type: 'match_success',
          title: '매칭 성공!',
          message: '박철수님과 매칭되었습니다. 이제 대화를 시작해보세요!',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6시간 전
          read: true,
          actionUrl: '/chat/match-2',
        },
        {
          id: 'notif-4',
          type: 'boost_reminder',
          title: '부스트 만료 알림',
          message: '회원님의 방 부스트가 내일 만료됩니다. 연장하시겠어요?',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12시간 전
          read: true,
          actionUrl: '/room/room-2',
        },
        {
          id: 'notif-5',
          type: 'room_full',
          title: '방이 가득 참',
          message: '만든 방 "강남 볼링 모임"의 정원이 가득 찼습니다.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
          read: true,
          actionUrl: '/room/room-3',
        },
      ]

      return Response.json({
        ok: true,
        data: mockNotifications,
      } as ApiResponse<any[]>)
    }

    // 실제 데이터베이스에서 알림 조회 (Redis 캐시 적용)
    const cacheKey = CacheKeys.notifications(user.id)

    const formattedNotifications = await withCache(cacheKey, CacheTTL.notifications, async () => {
      const supabase = await createServerSupabaseClient()

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw new ApiError('알림을 가져오는데 실패했습니다', 500)
      }

      // 데이터 형식 변환
      return (
        notifications?.map((notification: any) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at,
          read: notification.is_read,
          actionUrl: notification.metadata?.actionUrl,
          data: notification.metadata,
        })) || []
      )
    })

    return Response.json({
      ok: true,
      data: formattedNotifications,
    } as ApiResponse<any[]>)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, message: error.message, code: error.code },
        { status: error.status }
      )
    }

    console.error('Notifications fetch error:', error)
    return Response.json({ ok: false, message: '알림을 가져오는데 실패했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    const { type, title, message, actionUrl, data } = await request.json()

    // 개발 모드에서는 성공 응답만 반환
    if (isDevelopmentMode) {
      return Response.json({
        ok: true,
        message: '알림이 생성되었습니다',
      } as ApiResponse<void>)
    }

    // 실제 알림 생성
    const supabase = await createServerSupabaseClient()

    const { error } = await (supabase as any).from('notifications').insert({
      user_id: user.id,
      type,
      title,
      message,
      metadata: { actionUrl, ...data },
    })

    if (error) {
      throw new ApiError('알림 생성에 실패했습니다', 500)
    }

    // 알림 생성 성공 시 해당 사용자의 알림 캐시 무효화
    await invalidateUserCache(user.id)

    return Response.json({
      ok: true,
      message: '알림이 생성되었습니다',
    } as ApiResponse<void>)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, message: error.message, code: error.code },
        { status: error.status }
      )
    }

    console.error('Notification creation error:', error)
    return Response.json({ ok: false, message: '알림 생성에 실패했습니다' }, { status: 500 })
  }
}
