/* src/app/api/host-messages/route.ts */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { getAuthenticatedUser } from '@/lib/services/auth'
import { createHostMessageSchema } from '@/lib/utils/zodSchemas'
import { isDevelopmentMode } from '@/lib/config/flags'

// 호스트 메시지 전송
export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 메시지 전송 50/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('host-messages:' + clientIP, 50, 60 * 1000)
    
    const user = await getAuthenticatedUser()
    const body = await req.json()
    
    // 입력 검증
    const { roomId, message } = createHostMessageSchema.parse(body)
    
    if (isDevelopmentMode) {
      // 개발 모드에서는 메시지를 로컬 스토리지에 시뮬레이션
      console.log(`[DEV] Host message sent:`, {
        roomId,
        senderId: user.id,
        message,
        timestamp: new Date().toISOString()
      })
      
      // 간단한 성공 응답
      return Response.json({
        ok: true,
        data: {
          id: crypto.randomUUID(),
          roomId,
          senderId: user.id,
          message,
          createdAt: new Date().toISOString()
        }
      })
    }

    const supabase = await createServerSupabaseClient()
    
    // 방 정보 조회 (호스트 UID 가져오기)
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, host_uid, title')
      .eq('id', roomId)
      .single()
    
    if (roomError || !room) {
      throw new ApiError('방을 찾을 수 없습니다', 404)
    }
    
    // 자기 자신에게 메시지 보내기 방지
    if ((room as any).host_uid === user.id) {
      throw new ApiError('자신의 방에는 메시지를 보낼 수 없습니다', 400)
    }
    
    // 호스트 메시지 저장 (임시로 타입 단언 사용)
    const { data: hostMessage, error: messageError } = await (supabase as any)
      .from('host_messages')
      .insert({
        room_id: roomId,
        sender_uid: user.id,
        receiver_uid: (room as any).host_uid,
        text: message
      })
      .select('*')
      .single()
    
    if (messageError) {
      console.error('Host message creation error:', messageError)
      throw new ApiError('메시지 전송에 실패했습니다', 500)
    }
    
    const response: ApiResponse<any> = {
      ok: true,
      data: {
        id: (hostMessage as any).id,
        roomId: (hostMessage as any).room_id,
        senderId: (hostMessage as any).sender_uid,
        receiverId: (hostMessage as any).receiver_uid,
        message: (hostMessage as any).text,
        createdAt: (hostMessage as any).created_at
      }
    }
    
    return Response.json(response)
    
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ ok: false, code: error.code, message: error.message }, { status: error.status })
    }
    
    console.error('Host message API error:', error)
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// 호스트가 받은 메시지 조회
export async function GET(req: NextRequest) {
  try {
    // Rate limiting: API 호출 100/분  
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:' + clientIP, 100, 60 * 1000)
    
    const user = await getAuthenticatedUser()
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')
    
    if (isDevelopmentMode) {
      // 개발 모드에서는 빈 배열 반환
      return Response.json({
        ok: true,
        data: []
      })
    }
    
    const supabase = await createServerSupabaseClient()
    
    let query = (supabase as any)
      .from('host_messages')
      .select(`
        *,
        sender:profiles!host_messages_sender_uid_fkey(nickname, avatar_url),
        room:rooms!host_messages_room_id_fkey(title)
      `)
      .eq('receiver_uid', user.id)
      .order('created_at', { ascending: false })
    
    // 특정 방의 메시지만 조회하는 경우
    if (roomId) {
      query = query.eq('room_id', roomId)
    }
    
    const { data: messages, error } = await query
    
    if (error) {
      console.error('Host messages fetch error:', error)
      throw new ApiError('메시지 조회에 실패했습니다', 500)
    }
    
    const response: ApiResponse<any[]> = {
      ok: true,
      data: messages || []
    }
    
    return Response.json(response)
    
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ ok: false, code: error.code, message: error.message }, { status: error.status })
    }
    
    console.error('Host messages GET API error:', error)
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}