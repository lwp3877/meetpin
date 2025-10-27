import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  ApiError,
  type ApiRouteContext,
} from '@/lib/api'

import { logger } from '@/lib/observability/logger'
// 요청 상태 업데이트 스키마
const updateRequestSchema = z.object({
  status: z
    .enum(['approved', 'accepted', 'rejected'])
    .transform(val => (val === 'approved' ? 'accepted' : val)),
})

// PATCH /api/requests/[id] - 참가 요청 상태 변경 (수락/거절)
async function updateRequest(request: NextRequest, context: ApiRouteContext) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const params = await context.params
  const id = params.id as string

  // 요청 본문 검증
  const { status } = await parseAndValidateBody(request, updateRequestSchema)

  // 요청 정보 조회
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select(
      `
      *,
      room:rooms!requests_room_id_fkey(
        id,
        host_uid,
        max_people,
        start_at
      )
    `
    )
    .eq('id', id)
    .single()

  if (requestError || !requestData) {
    throw new ApiError('요청을 찾을 수 없습니다', 404)
  }

  // 방 호스트인지 확인
  const requestWithRoom = requestData as Record<string, unknown>
  if (!requestWithRoom.room || (requestWithRoom.room as Record<string, unknown>).host_uid !== user.id) {
    throw new ApiError('요청을 처리할 권한이 없습니다', 403)
  }

  // 이미 처리된 요청인지 확인
  if (requestWithRoom.status !== 'pending') {
    throw new ApiError('이미 처리된 요청입니다')
  }

  // 방 시작 시간이 지나지 않았는지 확인
  const startTime = new Date((requestWithRoom.room as Record<string, unknown>).start_at as string)
  if (new Date() > startTime) {
    throw new ApiError('이미 시작된 방의 요청은 처리할 수 없습니다')
  }

  // 수락하는 경우 추가 검증
  if (status === 'accepted') {
    // 방 시작 시간 확인
    const startTime = new Date((requestWithRoom.room as Record<string, unknown>).start_at as string)
    const cutoffTime = new Date(startTime.getTime() - 30 * 60 * 1000) // 30분 전까지

    if (new Date() > cutoffTime) {
      throw new ApiError('요청 수락 마감 시간이 지났습니다')
    }
  }

  // 수락하는 경우 원자적 트랜잭션으로 처리 (race condition 방지)
  if (status === 'accepted') {
    // PostgreSQL 함수를 사용한 원자적 처리
    const { data: result, error: transactionError } = await (supabase as any).rpc(
      'accept_request_atomically',
      {
        request_id: id,
        max_capacity: (requestWithRoom.room as Record<string, unknown>).max_people,
      }
    )

    if (transactionError) {
      logger.error('Transaction error:', { error: transactionError instanceof Error ? transactionError.message : String(transactionError) })
      if (transactionError.message?.includes('room_full')) {
        throw new ApiError('방이 가득 찼습니다')
      }
      throw new ApiError('요청 처리에 실패했습니다')
    }

    if (!result) {
      throw new ApiError('방이 가득 찼습니다')
    }
  } else {
    // 거절하는 경우 단순 업데이트
    const { error: updateError } = await (supabase as any)
      .from('requests')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      logger.error('Request update error:', { error: updateError instanceof Error ? updateError.message : String(updateError) })
      throw new ApiError('요청 처리에 실패했습니다')
    }
  }

  // 업데이트된 요청 정보 조회
  const { data: updatedRequest, error: fetchError } = await supabase
    .from('requests')
    .select(
      `
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
    `
    )
    .eq('id', id)
    .single()

  if (fetchError) {
    logger.error('Updated request fetch error:', { error: fetchError instanceof Error ? fetchError.message : String(fetchError) })
    throw new ApiError('처리된 요청 정보를 가져올 수 없습니다')
  }

  const message =
    status === 'accepted'
      ? '참가 요청이 수락되었습니다. 이제 1:1 채팅이 가능합니다!'
      : '참가 요청이 거절되었습니다.'

  return createSuccessResponse(updatedRequest, message)
}

// DELETE /api/requests/[id] - 참가 요청 취소 (요청자만)
async function deleteRequest(_request: NextRequest, context: ApiRouteContext) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const params = await context.params
  const id = params.id as string

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
  const { error: deleteError } = await supabase.from('requests').delete().eq('id', id)

  if (deleteError) {
    logger.error('Request deletion error:', { error: deleteError instanceof Error ? deleteError.message : String(deleteError) })
    throw new ApiError('요청 취소에 실패했습니다')
  }

  return createSuccessResponse(null, '참가 요청이 취소되었습니다')
}

export const { PATCH, DELETE } = createMethodRouter({
  PATCH: updateRequest,
  DELETE: deleteRequest,
})
