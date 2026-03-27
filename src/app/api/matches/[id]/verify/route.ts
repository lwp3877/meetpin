/* src/app/api/matches/[id]/verify/route.ts */
// GET /api/matches/[id]/verify - 현재 사용자가 해당 매치의 참여자인지 확인
import { NextRequest } from 'next/server'
import { createMethodRouter, createSuccessResponse, ApiError, type ApiRouteContext } from '@/lib/api'
import { getAuthenticatedUser } from '@/lib/services/auth'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

async function verifyMatch(_request: NextRequest, context: ApiRouteContext) {
  const params = await context.params
  const matchId = params['id'] as string
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()

  const { data: match, error } = await supabase
    .from('matches')
    .select('id, host_uid, guest_uid, room_id')
    .eq('id', matchId)
    .single()

  if (error || !match) {
    throw new ApiError('채팅을 찾을 수 없습니다', 404, 'NOT_FOUND')
  }

  const m = match as { id: string; host_uid: string; guest_uid: string; room_id: string }

  if (m.host_uid !== user.id && m.guest_uid !== user.id) {
    throw new ApiError('이 채팅에 접근할 권한이 없습니다', 403, 'FORBIDDEN')
  }

  return createSuccessResponse({
    matchId: m.id,
    roomId: m.room_id,
    isHost: m.host_uid === user.id,
  })
}

export const { GET } = createMethodRouter({ GET: verifyMatch })
