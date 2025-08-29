/* src/app/api/matches/my/route.ts */
import { NextRequest } from 'next/server'
import { createMethodRouter, parseQueryParams, parsePaginationParams, withRateLimit, apiUtils, getAuthenticatedUser } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

// GET /api/matches/my - 내 매치 목록 조회
async function getMyMatches(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const searchParams = parseQueryParams(request)
  const { page, limit, offset } = parsePaginationParams(searchParams)

  // 내가 호스트이거나 게스트인 매치들 조회
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      rooms:room_id (
        id,
        title,
        category,
        lat,
        lng,
        place_text,
        start_at,
        fee
      ),
      host_profile:host_uid (
        nickname,
        avatar_url,
        age_range
      ),
      guest_profile:guest_uid (
        nickname,
        avatar_url,
        age_range
      )
    `)
    .or(`host_uid.eq.${user.id},guest_uid.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Matches fetch error:', error)
    return apiUtils.error('매치 목록을 가져올 수 없습니다', 500)
  }

  // 총 개수 조회
  const { count, error: countError } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .or(`host_uid.eq.${user.id},guest_uid.eq.${user.id}`)

  if (countError) {
    console.error('Count error:', countError)
  }

  return apiUtils.success({
    matches: matches || [],
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
  GET: withRateLimit('api')(getMyMatches),
})