import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, ApiError, createSuccessResponse, parseUrlParams } from '@/lib/api'

import { logger } from '@/lib/observability/logger'
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const user = await getAuthenticatedUser()
  const { id: roomId } = await parseUrlParams(context)

  // 방 존재 및 호스트 확인
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('host_uid')
    .eq('id', roomId)
    .single()

  if (roomError || !room) {
    throw new ApiError('존재하지 않는 방입니다', 404)
  }

  if ((room as any).host_uid !== user.id) {
    throw new ApiError('해당 방의 요청을 볼 권한이 없습니다', 403)
  }

  // 해당 방의 참가 요청 목록 조회 (요청자 프로필 및 매치 상태 포함)
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select(
      `
      id, message, status, created_at, updated_at,
      profiles:requester_uid (
        uid, nickname, age_range, avatar_url
      ),
      match:matches(room_id, host_uid, guest_uid)
    `
    )
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  if (reqError) {
    logger.error('Failed to fetch requests:', { error: reqError instanceof Error ? reqError.message : String(reqError) })
    throw new ApiError('요청 목록을 불러오지 못했습니다')
  }

  // 응답 데이터 가공: 요청자 프로필을 user 필드로, match 존재 여부에 따라 match_id 추가
  const formatted =
    requests?.map(req => {
      const requesterProfile = (req as any).profiles
      const matchRecord = (req as any).match?.[0] // 해당 요청에 매치가 있는 경우
      return {
        id: (req as any).id,
        message: (req as any).message,
        status: (req as any).status,
        created_at: (req as any).created_at,
        updated_at: (req as any).updated_at,
        user: requesterProfile
          ? {
              id: requesterProfile.uid,
              nickname: requesterProfile.nickname,
              age_range: requesterProfile.age_range,
              avatar_url: requesterProfile.avatar_url,
            }
          : null,
        match_id: (req as any).status === 'accepted' && matchRecord ? matchRecord.id : undefined,
      }
    }) || []

  return createSuccessResponse({ requests: formatted })
}
