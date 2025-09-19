/* src/app/api/notifications/read-all/route.ts - 모든 알림 읽음 처리 API */

import { NextRequest } from 'next/server'
import { ApiResponse, ApiError, getAuthenticatedUser } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'

export async function POST(_request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    // 개발 모드에서는 성공 응답만 반환
    if (isDevelopmentMode) {
      return Response.json({
        ok: true,
        message: '모든 알림이 읽음 처리되었습니다'
      } as ApiResponse<void>)
    }

    // 실제 데이터베이스에서 모든 알림 읽음 처리
    const supabase = await createServerSupabaseClient()
    
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      throw new ApiError('알림 읽음 처리에 실패했습니다', 500)
    }

    return Response.json({
      ok: true,
      message: '모든 알림이 읽음 처리되었습니다'
    } as ApiResponse<void>)

  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, message: error.message, code: error.code },
        { status: error.status }
      )
    }

    console.error('Mark all notifications as read error:', error)
    return Response.json(
      { ok: false, message: '알림 읽음 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}