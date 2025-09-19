/* src/app/api/notifications/[id]/route.ts - 개별 알림 삭제 API */

import { NextRequest } from 'next/server'
import { ApiResponse, ApiError, getAuthenticatedUser } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    const { id: notificationId } = await params
    
    // 개발 모드에서는 성공 응답만 반환
    if (isDevelopmentMode) {
      return Response.json({
        ok: true,
        message: '알림이 삭제되었습니다'
      } as ApiResponse<void>)
    }

    // 실제 데이터베이스에서 알림 삭제
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id) // 본인 알림만 삭제 가능

    if (error) {
      throw new ApiError('알림 삭제에 실패했습니다', 500)
    }

    return Response.json({
      ok: true,
      message: '알림이 삭제되었습니다'
    } as ApiResponse<void>)

  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, message: error.message, code: error.code },
        { status: error.status }
      )
    }

    console.error('Notification deletion error:', error)
    return Response.json(
      { ok: false, message: '알림 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}