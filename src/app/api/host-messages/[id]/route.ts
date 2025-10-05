/**
 * 호스트 메시지 개별 조회/삭제 API
 * 특정 호스트 메시지를 조회하거나 삭제하는 기능을 제공합니다.
 */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { isDevelopmentMode } from '@/lib/config/flags'

import { logger } from '@/lib/observability/logger'
// 특정 호스트 메시지 조회
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting: API 호출 100/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:' + clientIP, 100, 60 * 1000)

    const user = await getAuthenticatedUser()
    const { id: messageId } = await params

    if (!messageId) {
      throw new ApiError('메시지 ID가 필요합니다', 400, 'INVALID_MESSAGE_ID')
    }

    if (isDevelopmentMode) {
      // 개발 모드에서는 모크 데이터 반환
      const mockMessage = {
        id: messageId,
        room_id: 'mock-room-1',
        sender_uid: 'mock-sender-1',
        receiver_uid: user.id,
        text: '안녕하세요! 모임에 관심이 있어서 문의드립니다.',
        is_read: false,
        created_at: new Date().toISOString(),
        sender: {
          nickname: '김철수',
          avatar_url: null,
        },
        room: {
          title: '강남 술모임',
        },
      }

      return Response.json({
        ok: true,
        data: mockMessage,
      })
    }

    const supabase = await createServerSupabaseClient()

    // 메시지 조회 (본인이 송신자이거나 수신자인 경우만)
    const { data: message, error } = await supabase
      .from('host_messages')
      .select(
        `
        *,
        sender:profiles!sender_uid(nickname, avatar_url),
        receiver:profiles!receiver_uid(nickname, avatar_url),
        room:rooms(title)
      `
      )
      .eq('id', messageId)
      .or(`sender_uid.eq.${user.id},receiver_uid.eq.${user.id}`)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('메시지를 찾을 수 없습니다', 404, 'MESSAGE_NOT_FOUND')
      }
      throw new ApiError('메시지 조회에 실패했습니다', 500, 'FETCH_ERROR')
    }

    const response: ApiResponse<any> = {
      ok: true,
      data: message,
    }

    return Response.json(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, code: error.code, message: (error as Error).message },
        { status: (error as any).status }
      )
    }

    logger.error('Host message API error:', { error: error instanceof Error ? error.message : String(error) })
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// 특정 호스트 메시지 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting: API 호출 30/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:delete:' + clientIP, 30, 60 * 1000)

    const user = await getAuthenticatedUser()
    const { id: messageId } = await params

    if (!messageId) {
      throw new ApiError('메시지 ID가 필요합니다', 400, 'INVALID_MESSAGE_ID')
    }

    if (isDevelopmentMode) {
      // 개발 모드에서는 성공 응답만 반환
      return Response.json({
        ok: true,
        message: '메시지가 삭제되었습니다',
      })
    }

    const supabase = await createServerSupabaseClient()

    // 메시지 삭제 (본인이 송신자이거나 수신자인 경우만)
    const { error } = await supabase
      .from('host_messages')
      .delete()
      .eq('id', messageId)
      .or(`sender_uid.eq.${user.id},receiver_uid.eq.${user.id}`)

    if (error) {
      throw new ApiError('메시지 삭제에 실패했습니다', 500, 'DELETE_ERROR')
    }

    const response: ApiResponse<null> = {
      ok: true,
      message: '메시지가 삭제되었습니다',
    }

    return Response.json(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, code: error.code, message: (error as Error).message },
        { status: (error as any).status }
      )
    }

    logger.error('Host message delete API error:', { error: error instanceof Error ? error.message : String(error) })
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
