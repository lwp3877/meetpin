import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { roomUpdateSchema } from '@/lib/utils/zodSchemas'
import { isDevelopmentMode, mockRooms } from '@/lib/config/mockData'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  parseUrlParams,
  createSuccessResponse,
  ApiError,
  apiUtils,
} from '@/lib/api'

// GET /api/rooms/[id] - 특정 방 상세 조회
async function getRoom(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  const { id } = await parseUrlParams(context)

  // 개발 모드에서는 Mock 데이터 사용
  if (isDevelopmentMode) {
    const room = mockRooms.find(r => r.id === id)
    if (!room) {
      return apiUtils.error('방을 찾을 수 없습니다', 404)
    }

    return apiUtils.success({
      room: {
        ...room,
        host: room.profiles, // profiles를 host로 매핑
        participants_count: Math.floor(Math.random() * room.max_people) + 1, // 랜덤 참가자 수
        is_host: room.profiles.nickname === '관리자',
      },
    })
  }

  const supabase = await createServerSupabaseClient()

  // 방 정보와 호스트 정보 함께 조회
  const { data: room, error } = await supabase
    .from('rooms')
    .select(
      `
      *,
      host:profiles!rooms_host_uid_fkey(
        id,
        nickname,
        age_range,
        avatar_url,
        intro
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !room) {
    throw new ApiError('방을 찾을 수 없습니다', 404)
  }

  // 현재 참가자 수 조회 (호스트 포함)
  const { count: requestCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', id)
    .eq('status', 'accepted')

  // room이 존재하는지 타입 가드로 확인
  if (!room || typeof room !== 'object') {
    throw new ApiError('방을 찾을 수 없습니다', 404)
  }

  return createSuccessResponse({
    room: {
      ...(room as any),
      participants_count: (requestCount || 0) + 1, // 호스트 포함
      is_host: (room as any).host_uid === user.id,
    },
  })
}

// PATCH /api/rooms/[id] - 방 정보 수정
async function updateRoom(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const { id } = await parseUrlParams(context)

  // 방 소유자 확인
  const { data: room } = await supabase.from('rooms').select('host_uid').eq('id', id).single()

  if (!room || (room as any).host_uid !== user.id) {
    throw new ApiError('방을 수정할 권한이 없습니다', 403)
  }

  // 요청 본문 검증
  const updateData = await parseAndValidateBody(request, roomUpdateSchema)

  // 시작 시간 검증 (수정하는 경우)
  if (updateData.start_at) {
    const startTime = new Date(updateData.start_at)
    const minStartTime = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후

    if (startTime < minStartTime) {
      throw new ApiError('시작 시간은 최소 1시간 후여야 합니다')
    }
  }

  // 방 정보 업데이트
  const { data: updatedRoom, error } = (await (supabase as any)
    .from('rooms')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      host:profiles!rooms_host_uid_fkey(
        id,
        nickname,
        age_range,
        avatar_url
      )
    `
    )
    .single()) as { data: any | null; error: any }

  if (error) {
    console.error('Room update error:', error)
    throw new ApiError('방 정보 수정에 실패했습니다')
  }

  return createSuccessResponse(updatedRoom, '방 정보가 성공적으로 수정되었습니다')
}

// DELETE /api/rooms/[id] - 방 삭제
async function deleteRoom(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const { id } = await parseUrlParams(context)

  // 방 소유자 확인
  const { data: room } = await supabase.from('rooms').select('host_uid').eq('id', id).single()

  if (!room || (room as any).host_uid !== user.id) {
    throw new ApiError('방을 삭제할 권한이 없습니다', 403)
  }

  // 참가자 매칭이 존재하면 삭제 불가
  const { count: acceptedCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', id)
    .eq('status', 'accepted')

  if (acceptedCount && acceptedCount > 0) {
    throw new ApiError('참가자가 있는 모임은 삭제할 수 없습니다', 400)
  }

  // 실제 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
  const { error } = await supabase.from('rooms').delete().eq('id', id)

  if (error) {
    console.error('Room deletion error:', error)
    throw new ApiError('방 삭제에 실패했습니다')
  }

  return createSuccessResponse(null, '방이 성공적으로 삭제되었습니다')
}

export const { GET, PATCH, DELETE } = createMethodRouter({
  GET: getRoom,
  PATCH: updateRoom,
  DELETE: deleteRoom,
})
