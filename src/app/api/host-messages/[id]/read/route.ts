/* src/app/api/host-messages/[id]/read/route.ts */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { isDevelopmentMode } from '@/lib/config/mockData'

// 호스트 메시지 읽음 처리
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting: API 호출 100/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:' + clientIP, 100, 60 * 1000)
    
    const user = await getAuthenticatedUser()
    const { id: messageId } = await params

    if (!messageId) {
      throw new ApiError('메시지 ID가 필요합니다', 400)
    }

    if (isDevelopmentMode) {
      // 개발 모드에서는 단순 성공 응답
      console.log(`[DEV] Marking host message ${messageId} as read by user ${user.id}`)
      
      return Response.json({
        ok: true,
        data: {
          id: messageId,
          is_read: true,
          updated_at: new Date().toISOString()
        }
      })
    }

    const supabase = await createServerSupabaseClient()
    
    // 메시지 읽음 처리 (본인이 받은 메시지만)
    const { data: message, error } = await (supabase as any)
      .from('host_messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .eq('receiver_uid', user.id) // 본인이 받은 메시지만 업데이트 가능
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('메시지를 찾을 수 없습니다', 404)
      }
      console.error('Host message read error:', error)
      throw new ApiError('메시지 읽음 처리에 실패했습니다', 500)
    }

    const response: ApiResponse<any> = {
      ok: true,
      data: {
        id: (message as any).id,
        is_read: (message as any).is_read,
        updated_at: (message as any).updated_at
      }
    }

    return Response.json(response)
    
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ ok: false, code: error.code, message: error.message }, { status: error.status })
    }
    
    console.error('Host message read API error:', error)
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}