/* src/app/api/rooms/route.ts */
import { NextRequest } from 'next/server'
import {
  createMethodRouter,
  parseQueryParams,
  parsePaginationParams,
  withRateLimit,
  withUserRateLimit,
  parseAndValidateBody,
  apiUtils,
  getAuthenticatedUser,
} from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { createRoomSchema } from '@/lib/utils/zodSchemas'
import { parseBBoxParam } from '@/lib/utils/bbox'
import { mockRooms } from '@/lib/config/mockData'
import { isDevelopmentMode } from '@/lib/config/flags'
import { withCache, CacheKeys, CacheTTL, invalidateRoomCache } from '@/lib/cache/redis'
import { logger } from '@/lib/observability/logger'

// API 캐싱 설정 - 방 목록 데이터는 1분간 캐싱
export const revalidate = 60 // 1분마다 재검증
export const dynamic = 'force-dynamic' // 위치 기반 동적 데이터
// GET /api/rooms - 방 목록 조회 (BBox 기반)
async function getRooms(request: NextRequest) {
  // Supabase 환경변수 검증 (프로덕션에서 실제 DB 사용 시)
  if (!isDevelopmentMode) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Missing Supabase environment variables')
      return apiUtils.error('서버 설정 오류입니다', 500)
    }
  }

  const searchParams = parseQueryParams(request)
  const { page, limit, offset } = parsePaginationParams(searchParams)

  // BBox 파라미터 파싱 (?bbox=south,west,north,east)
  const bboxString = searchParams.get('bbox')
  const bbox = parseBBoxParam(bboxString)

  if (!bbox) {
    return apiUtils.validation('bbox 파라미터가 필요합니다 (형식: south,west,north,east)')
  }

  // Mock 데이터 사용 조건: 명시적으로 개발 모드인 경우만
  if (isDevelopmentMode) {
    // 카테고리 필터
    const category = searchParams.get('category')
    const validCategories = ['drink', 'exercise', 'other']

    // Mock 데이터 필터링
    let filteredRooms = mockRooms.filter(room => {
      // BBox 범위 내 체크
      return (
        room.lat >= bbox.south &&
        room.lat <= bbox.north &&
        room.lng >= bbox.west &&
        room.lng <= bbox.east
      )
    })

    // 카테고리 필터 적용
    if (category && validCategories.includes(category)) {
      filteredRooms = filteredRooms.filter(room => room.category === category)
    }

    // 정렬: boost_until이 있는 것 먼저, 그 다음 생성일
    filteredRooms.sort((a, b) => {
      if (a.boost_until && !b.boost_until) return -1
      if (!a.boost_until && b.boost_until) return 1
      if (a.boost_until && b.boost_until) {
        return new Date(b.boost_until).getTime() - new Date(a.boost_until).getTime()
      }
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    })

    // 페이지네이션 적용
    const total = filteredRooms.length
    const paginatedRooms = filteredRooms.slice(offset, offset + limit)

    // 데이터 정규화: mockRooms 구조를 API 응답 형태로 변환
    const normalizedRooms = paginatedRooms.map(room => ({
      id: String(room.id || crypto.randomUUID()),
      title: String(room.title || "제목 미정"),
      category: String(room.category || "other"),
      lat: Number(room.lat || 0),
      lng: Number(room.lng || 0),
      place_text: String(room.place_text || ""),
      start_at: String(room.start_at || new Date().toISOString()),
      max_people: Number(room.max_people || 1),
      fee: Number(room.fee || 0),
      visibility: "public" as const, // Mock 데이터는 항상 public
      created_at: new Date().toISOString(), // Mock 데이터 생성 시간
      host: room.profiles ? {
        id: "host_unknown", // Mock 데이터는 uid 필드 없음
        nickname: String(room.profiles.nickname || "Unknown"),
        avatar_url: room.profiles.avatar_url,
        age_range: room.profiles.age_range
      } : { id: "host_unknown", nickname: "Unknown", avatar_url: "", age_range: "20s_late" },
      boost_until: room.boost_until,
      // 추가 필드들 보완
      description: "", // Mock 데이터는 description 필드 없음
      host_uid: "host_unknown", // Mock 데이터는 host_uid 필드 없음
      updated_at: new Date().toISOString() // Mock 데이터 갱신 시간
    }))

    return apiUtils.success({
      rooms: normalizedRooms, // API 응답은 'rooms' 키 사용
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
      bbox,
    })
  }

  // 프로덕션에서는 실제 DB 쿼리 수행 (Redis 캐시 적용)
  const category = searchParams.get('category')
  const validCategories = ['drink', 'exercise', 'other']

  // 캐시 키 생성 (bbox + 필터 조건 포함)
  const filterString = category && validCategories.includes(category) ? category : ''
  const cacheKey = CacheKeys.rooms(bboxString || '', `${filterString}:${page}:${limit}`)

  // Redis 캐시를 통한 데이터 조회
  const result = await withCache(cacheKey, CacheTTL.rooms, async () => {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('rooms')
      .select(
        `
        *,
        profiles!host_uid (
          nickname,
          avatar_url,
          age_range
        )
      `
      )
      .eq('visibility', 'public')
      .gte('start_at', new Date().toISOString()) // 미래 시간만
      .gte('lat', bbox.south)
      .lte('lat', bbox.north)
      .gte('lng', bbox.west)
      .lte('lng', bbox.east)

    // 카테고리 필터 적용
    if (category && validCategories.includes(category)) {
      query = query.eq('category', category)
    }

    // 정렬: boost_until DESC NULLS LAST, created_at DESC
    query = query.order('boost_until', { ascending: false, nullsFirst: false })
    query = query.order('created_at', { ascending: false })

    // 페이지네이션
    query = query.range(offset, offset + limit - 1)

    const { data: rooms, error } = await query

    if (error) {
      logger.error('Rooms fetch error', { error: (error as Error).message || String(error) })
      throw new Error('방 목록을 가져올 수 없습니다')
    }

    // 총 개수 조회 (동일한 조건)
    let countQuery = supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('visibility', 'public')
      .gte('start_at', new Date().toISOString())
      .gte('lat', bbox.south)
      .lte('lat', bbox.north)
      .gte('lng', bbox.west)
      .lte('lng', bbox.east)

    if (category && validCategories.includes(category)) {
      countQuery = countQuery.eq('category', category)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      logger.error('Count error', { error: countError.message || String(countError) })
    }

    return {
      rooms: rooms || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1,
      },
      bbox,
    }
  })

  return apiUtils.success(result)
}

// POST /api/rooms - 방 생성
async function createRoom(request: NextRequest) {
  const user = await getAuthenticatedUser()

  // 개발 모드에서는 간단한 파싱만 하고 Mock 응답 반환
  if (isDevelopmentMode) {
    const rawBody = await request.text()
    const roomData = JSON.parse(rawBody)
    const newRoom = {
      id: `mock-room-${Date.now()}`,
      host_uid: user.id,
      title: roomData.title,
      description: roomData.description,
      category: roomData.category,
      lat: roomData.lat,
      lng: roomData.lng,
      place_text: roomData.place_text,
      start_at: roomData.start_at,
      max_people: roomData.max_people,
      fee: roomData.fee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      boost_until: null,
    }

    return apiUtils.success({ room: newRoom })
  }

  // 프로덕션에서는 정상적인 스키마 검증 수행
  const roomData = await parseAndValidateBody(request, createRoomSchema)
  const supabase = await createServerSupabaseClient()

  // 시작 시간 검증 (30분 전까지만 생성 가능)
  const startAt = new Date(roomData.start_at)
  const now = new Date()
  const minStartTime = new Date(now.getTime() + 30 * 60 * 1000) // 30분 후

  if (startAt < minStartTime) {
    return apiUtils.validation('방 시작 시간은 최소 30분 후여야 합니다')
  }

  // 트랜잭션을 통한 방 생성 + 호스트 자동 참가
  const { data: room, error } = (await (supabase as any).rpc(
    'create_room_with_host_participation',
    {
      host_user_id: user.id,
      room_data: roomData,
    }
  )) as { data: any | null; error: any }

  if (error) {
    logger.error('Room creation transaction error', { error: (error as Error).message || String(error) })

    // 특정 에러 메시지에 따른 사용자 친화적 응답
    if ((error as Error).message?.includes('시작 시간은 최소 30분 후여야 합니다')) {
      return apiUtils.validation('방 시작 시간은 최소 30분 후여야 합니다')
    }
    if ((error as Error).message?.includes('존재하지 않는 사용자입니다')) {
      return apiUtils.error('사용자 인증에 실패했습니다', 401)
    }

    return apiUtils.error('방 생성에 실패했습니다', 500)
  }

  // 방 생성 성공 시 관련 캐시 무효화
  await invalidateRoomCache()

  return apiUtils.created(room, '방이 성공적으로 생성되었습니다')
}

// 라우터 설정
export const { GET, POST } = createMethodRouter({
  GET: withRateLimit('api')(getRooms),
  POST: withUserRateLimit('content')(createRoom),
})
