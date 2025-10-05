import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { createMessageSchema } from '@/lib/utils/zodSchemas'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  parseUrlParams,
  createSuccessResponse,
  parsePaginationParams,
  ApiError,
} from '@/lib/api'
import { withCache, CacheKeys, CacheTTL, invalidateMessageCache } from '@/lib/cache/redis'

import { logger } from '@/lib/observability/logger'
// 금칙어 목록 (1차 필터링)
const FORBIDDEN_WORDS = [
  '시발',
  '씨발',
  '개새끼',
  '좆',
  '병신',
  '미친새끼',
  '개놈',
  '년놈',
  '섹스',
  '성관계',
  '원나잇',
  '섹파',
  '폰섹',
  '조교',
  '강간',
  '성매매',
  '돈거래',
  '계좌이체',
  '송금',
  '대출',
  '투자',
  '도박',
  '베팅',
  '사기',
  '마약',
  '대마초',
  '필로폰',
  '히로뽕',
  '약물',
  '환각제',
]

// 금칙어 필터링 함수
function containsForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return FORBIDDEN_WORDS.some(word => lowerText.includes(word.toLowerCase()))
}

// GET /api/matches/[id]/messages - 매칭의 메시지 목록 조회
async function getMessages(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const { id: matchId } = await parseUrlParams(context)
  const { searchParams } = new URL(request.url)

  // 페이지네이션 파라미터 (기본 limit 100)
  const { limit = 100, offset } = parsePaginationParams(searchParams)

  // 매칭 정보 조회 및 권한 확인
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('host_uid, guest_uid, room_id')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    throw new ApiError('매칭을 찾을 수 없습니다', 404)
  }

  // 매칭 당사자인지 확인 (host 또는 guest)
  const matchData = match as any
  if (matchData.host_uid !== user.id && matchData.guest_uid !== user.id) {
    throw new ApiError('메시지에 접근할 권한이 없습니다', 403)
  }

  // 차단 관계 확인
  const otherUserId = matchData.host_uid === user.id ? matchData.guest_uid : matchData.host_uid
  const { count: blockedCount } = await supabase
    .from('blocked_users')
    .select('*', { count: 'exact', head: true })
    .or(
      `and(blocker_uid.eq.${user.id},blocked_uid.eq.${otherUserId}),and(blocker_uid.eq.${otherUserId},blocked_uid.eq.${user.id})`
    )

  if (blockedCount && blockedCount > 0) {
    throw new ApiError('차단된 사용자와의 대화입니다', 403)
  }

  // 메시지 목록 조회 (Redis 캐시 적용)
  const cacheKey = CacheKeys.messages(matchId, limit)

  const result = await withCache(cacheKey, CacheTTL.messages, async () => {
    const {
      data: messages,
      error,
      count,
    } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:profiles!messages_sender_uid_fkey(
          id,
          nickname,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Messages fetch error:', { error: error instanceof Error ? error.message : String(error) })
      throw new ApiError('메시지를 가져오는데 실패했습니다')
    }

    return {
      messages: (messages || []).reverse(), // 시간순으로 정렬
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
      },
      match: {
        id: matchId,
        host_uid: matchData.host_uid,
        guest_uid: matchData.guest_uid,
        room_id: matchData.room_id,
      },
    }
  })

  return createSuccessResponse(result)
}

// POST /api/matches/[id]/messages - 새 메시지 생성
async function createMessage(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()
  const { id: matchId } = await parseUrlParams(context)

  // 요청 본문 검증
  const messageData = await parseAndValidateBody(request, createMessageSchema)

  // 금칙어 1차 필터링
  if (containsForbiddenWords(messageData.text)) {
    throw new ApiError('부적절한 내용이 포함되어 있습니다', 422)
  }

  // 매칭 정보 조회 및 권한 확인
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('host_uid, guest_uid, room_id')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    throw new ApiError('매칭을 찾을 수 없습니다', 404)
  }

  // 매칭 당사자인지 확인
  const matchData = match as any
  if (matchData.host_uid !== user.id && matchData.guest_uid !== user.id) {
    throw new ApiError('메시지를 보낼 권한이 없습니다', 403)
  }

  // 차단 관계 확인
  const otherUserId = matchData.host_uid === user.id ? matchData.guest_uid : matchData.host_uid
  const { count: blockedCount } = await supabase
    .from('blocked_users')
    .select('*', { count: 'exact', head: true })
    .or(
      `and(blocker_uid.eq.${user.id},blocked_uid.eq.${otherUserId}),and(blocker_uid.eq.${otherUserId},blocked_uid.eq.${user.id})`
    )

  if (blockedCount && blockedCount > 0) {
    throw new ApiError('차단된 사용자에게 메시지를 보낼 수 없습니다', 403)
  }

  // 메시지 생성
  const { data: newMessage, error } = await (supabase as any)
    .from('messages')
    .insert({
      match_id: matchId,
      sender_uid: user.id,
      text: messageData.text,
    })
    .select(
      `
      *,
      sender:profiles!messages_sender_uid_fkey(
        id,
        nickname,
        avatar_url
      )
    `
    )
    .single()

  if (error) {
    logger.error('Message creation error:', { error: error instanceof Error ? error.message : String(error) })
    throw new ApiError('메시지 전송에 실패했습니다')
  }

  // 메시지 생성 성공 시 해당 매칭의 메시지 캐시 무효화
  await invalidateMessageCache(matchId)

  return createSuccessResponse(newMessage, '메시지가 성공적으로 전송되었습니다', 201)
}

export const { GET, POST } = createMethodRouter({
  GET: getMessages,
  POST: createMessage,
})
