/* src/app/api/requests/my/route.ts */
import { NextRequest } from 'next/server'
import {
  createMethodRouter,
  parseQueryParams,
  parsePaginationParams,
  withRateLimit,
  apiUtils,
  getAuthenticatedUser,
} from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

import { logger } from '@/lib/observability/logger'
// GET /api/requests/my - 내가 보낸 요청과 받은 요청 조회
async function getMyRequests(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const searchParams = parseQueryParams(request)
  const { page, limit, offset } = parsePaginationParams(searchParams)
  const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'

  let query = supabase.from('requests').select(`
      *,
      rooms:room_id (
        id,
        title,
        category,
        lat,
        lng,
        place_text,
        start_at,
        max_people,
        fee,
        host_uid,
        profiles:host_uid (
          nickname,
          avatar_url,
          age_range
        )
      ),
      profiles:requester_uid (
        nickname,
        avatar_url,
        age_range
      )
    `)

  // 타입에 따라 필터링
  if (type === 'sent') {
    // 내가 보낸 요청
    query = query.eq('requester_uid', user.id)
  } else if (type === 'received') {
    // 내가 받은 요청 (내가 호스트인 방의 요청들)
    const { data: myRooms } = await supabase.from('rooms').select('id').eq('host_uid', user.id)

    const roomIds = (myRooms as any)?.map((room: Record<string, unknown>) => room.id) || []
    if (roomIds.length > 0) {
      query = query.in('room_id', roomIds)
    } else {
      // 내가 호스트인 방이 없으면 빈 결과 반환
      return apiUtils.success({
        requests: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    }
  } else {
    // 전체 (내가 보낸 것 + 내가 받은 것)
    const { data: myRooms } = await supabase.from('rooms').select('id').eq('host_uid', user.id)

    const roomIds = (myRooms as any)?.map((room: Record<string, unknown>) => room.id) || []

    if (roomIds.length > 0) {
      query = query.or(`requester_uid.eq.${user.id},room_id.in.(${roomIds.join(',')})`)
    } else {
      query = query.eq('requester_uid', user.id)
    }
  }

  const { data: requests, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    logger.error('Requests fetch error:', { error: error instanceof Error ? error.message : String(error) })
    return apiUtils.error('요청 목록을 가져올 수 없습니다', 500)
  }

  // 총 개수 조회
  let countQuery = supabase.from('requests').select('id', { count: 'exact', head: true })

  if (type === 'sent') {
    countQuery = countQuery.eq('requester_uid', user.id)
  } else if (type === 'received') {
    const { data: myRooms } = await supabase.from('rooms').select('id').eq('host_uid', user.id)

    const roomIds = (myRooms as any)?.map((room: Record<string, unknown>) => room.id) || []
    if (roomIds.length > 0) {
      countQuery = countQuery.in('room_id', roomIds)
    }
  } else {
    const { data: myRooms } = await supabase.from('rooms').select('id').eq('host_uid', user.id)

    const roomIds = (myRooms as any)?.map((room: Record<string, unknown>) => room.id) || []

    if (roomIds.length > 0) {
      countQuery = countQuery.or(`requester_uid.eq.${user.id},room_id.in.(${roomIds.join(',')})`)
    } else {
      countQuery = countQuery.eq('requester_uid', user.id)
    }
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    logger.error('Count error:', { error: countError instanceof Error ? countError.message : String(countError) })
  }

  return apiUtils.success({
    requests: requests || [],
    type,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNext: offset + limit < (count || 0),
      hasPrev: page > 1,
    },
  })
}

export const { GET } = createMethodRouter({
  GET: withRateLimit('api')(getMyRequests),
})
