import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  parseUrlParams,
  createSuccessResponse,
  ApiError
} from '@/lib/api'

// 요청 상태 업데이트 스키마
const updateRequestSchema = z.object({
  status: z.enum(['approved', 'accepted', 'rejected']).transform(val => 
    val === 'approved' ? 'accepted' : val
  ),
})

// PATCH /api/requests/[id] - 참가 요청 상태 변경 (수락/거절)
async function updateRequest(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  const supabase = await createServerSupabaseClient()
  const { id } = await parseUrlParams(context)
  
  // 요청 본문 검증
  const { status } = await parseAndValidateBody(request, updateRequestSchema)
  
  // 요청 정보 조회
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select(`
      *,
      room:rooms!requests_room_id_fkey(
        id,
        host_uid,
        max_people,
        start_at
      )
    `)
    .eq('id', id)
    .single()
  
  if (requestError || !requestData) {
    throw new ApiError('요청을 찾을 수 없습니다', 404)
  }
  
  // 방 호스트인지 확인
  const requestWithRoom = requestData as any
  if (!requestWithRoom.room || requestWithRoom.room.host_uid !== user.id) {
    throw new ApiError('요청을 처리할 권한이 없습니다', 403)
  }
  
  // 이미 처리된 요청인지 확인
  if (requestWithRoom.status !== 'pending') {
    throw new ApiError('이미 처리된 요청입니다')
  }
  
  // 방 시작 시간이 지나지 않았는지 확인
  const startTime = new Date(requestWithRoom.room.start_at)
  if (new Date() > startTime) {
    throw new ApiError('이미 시작된 방의 요청은 처리할 수 없습니다')
  }
  
  // 수락하는 경우 추가 검증
  if (status === 'accepted') {
    // 방 시작 시간 확인
    const startTime = new Date(requestWithRoom.room.start_at)
    const cutoffTime = new Date(startTime.getTime() - 30 * 60 * 1000) // 30분 전까지
    
    if (new Date() > cutoffTime) {
      throw new ApiError('요청 수락 마감 시간이 지났습니다')
    }
    
    // 현재 수락된 참가자 수 확인
    const { count: currentCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', requestWithRoom.room_id)
      .eq('status', 'accepted')
    
    if ((currentCount || 0) >= requestWithRoom.room.max_people - 1) {
      throw new ApiError('방이 가득 찼습니다')
    }
  }
  
  // 트랜잭션으로 요청 상태 업데이트 및 매칭 생성
  const { data: updatedRequest, error: updateError } = await (supabase as any)
    .from('requests')
    .update({ status })
    .eq('id', id)
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
  
  if (updateError) {
    console.error('Request update error:', updateError)
    throw new ApiError('요청 처리에 실패했습니다')
  }
  
  // 수락된 경우 매칭 생성
  if (status === 'accepted') {
    const { error: matchError } = await (supabase as any)
      .from('matches')
      .insert({
        room_id: requestWithRoom.room_id,
        host_uid: requestWithRoom.room.host_uid,
        guest_uid: requestWithRoom.requester_uid,
      })
    
    if (matchError && matchError.code !== '23505') { // 중복 제외
      console.error('Match creation error:', matchError)
      // 매칭 생성 실패시 요청 상태를 다시 pending으로 되돌림
      await (supabase as any)
        .from('requests')
        .update({ status: 'pending' })
        .eq('id', id)
      
      throw new ApiError('매칭 생성에 실패했습니다')
    }
  }
  
  const message = status === 'accepted' 
    ? '참가 요청이 수락되었습니다. 이제 1:1 채팅이 가능합니다!'
    : '참가 요청이 거절되었습니다.'
  
  return createSuccessResponse(updatedRequest, message)
}

// DELETE /api/requests/[id] - 참가 요청 취소 (요청자만)
async function deleteRequest(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  const supabase = await createServerSupabaseClient()
  const { id } = await parseUrlParams(context)
  
  // 요청 정보 조회
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select('requester_uid, status')
    .eq('id', id)
    .single()
  
  if (requestError || !requestData) {
    throw new ApiError('요청을 찾을 수 없습니다', 404)
  }
  
  // 요청자인지 확인
  if ((requestData as any).requester_uid !== user.id) {
    throw new ApiError('요청을 취소할 권한이 없습니다', 403)
  }
  
  // 이미 처리된 요청은 취소 불가
  if ((requestData as any).status !== 'pending') {
    throw new ApiError('이미 처리된 요청은 취소할 수 없습니다')
  }
  
  // 요청 삭제
  const { error: deleteError } = await supabase
    .from('requests')
    .delete()
    .eq('id', id)
  
  if (deleteError) {
    console.error('Request deletion error:', deleteError)
    throw new ApiError('요청 취소에 실패했습니다')
  }
  
  return createSuccessResponse(null, '참가 요청이 취소되었습니다')
}

export const { PATCH, DELETE } = createMethodRouter({
  PATCH: updateRequest,
  DELETE: deleteRequest,
})