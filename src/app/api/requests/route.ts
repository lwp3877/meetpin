/**
 * 참가 요청 API
 * 모임 참가 요청을 생성하고 조회하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * - GET: 사용자의 참가 요청 목록 또는 호스트가 받은 요청 목록 조회
 * - POST: 새로운 참가 요청 생성
 * 
 * 보안 기능:
 * - 레이트 리미팅 적용 (사용자별 요청 생성 제한)
 * - 인증된 사용자만 접근 가능
 * - 자신의 방에는 참가 요청 불가
 * - 방 시작 1시간 전까지만 요청 가능
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { requestSchema } from '@/lib/utils/zodSchemas'
import { isDevelopmentMode } from '@/lib/config/mockData'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  parsePaginationParams,
  getClientIP,
  rateLimit,
  ApiError
} from '@/lib/api'

// GET /api/requests - 내 요청 목록 또는 내 방의 요청 목록 조회
async function getRequests(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  
  // Rate limiting
  const clientIP = getClientIP(request)
  if (!rateLimit(`requests:${clientIP}:${user.id}`, 100, 60000)) {
    throw new ApiError('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.', 429)
  }
  
  const { limit, offset } = parsePaginationParams(searchParams)
  const type = searchParams.get('type') || 'my_requests' // 'my_requests' 또는 'my_rooms'
  
  let query = supabase.from('requests').select(`
    *,
    room:rooms!requests_room_id_fkey(
      id,
      title,
      category,
      place_text,
      start_at,
      max_people,
      fee,
      host:profiles!rooms_host_uid_fkey(
        id,
        nickname,
        avatar_url
      )
    ),
    requester:profiles!requests_requester_uid_fkey(
      id,
      nickname,
      age_range,
      avatar_url,
      intro
    )
  `)
  
  if (type === 'my_requests') {
    // 내가 보낸 참가 요청들
    query = query.eq('requester_uid', user.id)
  } else if (type === 'my_rooms') {
    // 내 방에 온 참가 요청들
    const { data: myRooms } = await supabase.from('rooms').select('id').eq('host_uid', user.id)
    const roomIds = (myRooms as any)?.map((room: any) => room.id) || []
    query = query.in('room_id', roomIds)
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  const { data: requests, error, count } = await query
  
  if (error) {
    console.error('Requests fetch error:', error)
    throw new ApiError('요청 목록을 가져오는데 실패했습니다')
  }
  
  return createSuccessResponse({
    requests: requests || [],
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: count || 0
    }
  })
}

// POST /api/requests - 참가 요청 생성
async function createRequest(request: NextRequest) {
  const user = await getAuthenticatedUser()
  
  // Rate limiting (사용자별)
  if (!rateLimit(`create-request:${user.id}`, 20, 60000)) {
    throw new ApiError('요청 생성 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.', 429)
  }
  
  // 요청 본문 검증
  const requestData = await parseAndValidateBody(request, requestSchema)
  
  if (isDevelopmentMode) {
    // 개발 모드에서는 성공 응답 반환
    const mockRequest = {
      id: `req-${Date.now()}`,
      room_id: requestData.room_id,
      requester_uid: user.id,
      message: requestData.message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return NextResponse.json({
      ok: true,
      data: mockRequest,
      message: '참가 요청이 전송되었습니다'
    })
  }
  
  const supabase = await createServerSupabaseClient()
  
  // 방 존재 여부 및 상태 확인
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, host_uid, max_people, start_at')
    .eq('id', requestData.room_id)
    .single()
  
  if (roomError || !room) {
    throw new ApiError('방을 찾을 수 없습니다', 404)
  }
  
  if ((room as any).host_uid === user.id) {
    throw new ApiError('본인이 만든 방에는 참가 요청할 수 없습니다')
  }
  
  // 방 시작 시간 확인 (시작 1시간 전까지만 요청 가능)
  const startTime = new Date((room as any).start_at)
  const cutoffTime = new Date(startTime.getTime() - 60 * 60 * 1000) // 1시간 전
  
  if (new Date() > cutoffTime) {
    throw new ApiError('참가 요청 마감 시간이 지났습니다')
  }
  
  // 현재 참가자 수 확인
  const { count: currentCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', requestData.room_id)
    .eq('status', 'accepted')
  
  if ((currentCount || 0) >= (room as any).max_people - 1) { // 호스트 제외
    throw new ApiError('방이 가득 찼습니다')
  }
  
  // 차단 관계 확인
  const { count: blockedCount } = await supabase
    .from('blocked_users')
    .select('*', { count: 'exact', head: true })
    .or(`and(blocker_uid.eq.${user.id},blocked_uid.eq.${(room as any).host_uid}),and(blocker_uid.eq.${(room as any).host_uid},blocked_uid.eq.${user.id})`)
  
  if (blockedCount && blockedCount > 0) {
    throw new ApiError('참가할 수 없는 방입니다')
  }
  
  // 참가 요청 생성
  const { data: newRequest, error } = await (supabase as any)
    .from('requests')
    .insert({
      ...requestData,
      requester_uid: user.id,
    })
    .select(`
      *,
      room:rooms!requests_room_id_fkey(
        id,
        title,
        category,
        place_text,
        start_at,
        host:profiles!rooms_host_uid_fkey(
          id,
          nickname,
          avatar_url
        )
      ),
      requester:profiles!requests_requester_uid_fkey(
        id,
        nickname,
        age_range,
        avatar_url
      )
    `)
    .single()
  
  if (error) {
    if (error.code === '23505') {
      throw new ApiError('이미 참가 요청을 보냈습니다', 409)
    }
    console.error('Request creation error:', error)
    throw new ApiError('참가 요청에 실패했습니다')
  }
  
  return createSuccessResponse(newRequest, '참가 요청이 성공적으로 전송되었습니다', 201)
}

export const { GET, POST } = createMethodRouter({
  GET: getRequests,
  POST: createRequest,
})