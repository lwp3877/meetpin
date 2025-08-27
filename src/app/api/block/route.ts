import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  rateLimit,
  ApiError
} from '@/lib/api'

// 차단/해제 스키마
const blockActionSchema = z.object({
  target_uid: z.string().uuid(),
  action: z.enum(['block', 'unblock'])
})

// POST /api/block - 사용자 차단/해제
async function handleBlockAction(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  const supabase = await createServerSupabaseClient()
  
  // Rate limiting (사용자별 차단 액션 제한: 1분에 5개)
  if (!rateLimit(`block-action:${user.id}`, 5, 60000)) {
    throw new ApiError('차단 처리 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.', 429)
  }
  
  // 요청 본문 검증
  const { target_uid, action } = await parseAndValidateBody(request, blockActionSchema)
  
  // 자기 자신 차단 방지
  if (target_uid === user.id) {
    throw new ApiError('본인을 차단할 수 없습니다')
  }
  
  // 대상 사용자 존재 확인
  const { data: targetUser, error: userError } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('id', target_uid)
    .single()
  
  if (userError || !targetUser) {
    throw new ApiError('차단할 사용자를 찾을 수 없습니다', 404)
  }
  
  if (action === 'block') {
    // 차단 추가 (중복 방지를 위해 upsert 사용)
    const { error } = await (supabase as any)
      .from('blocked_users')
      .upsert({
        blocker_uid: user.id,
        blocked_uid: target_uid
      }, {
        onConflict: 'blocker_uid,blocked_uid'
      })
    
    if (error) {
      console.error('Block creation error:', error)
      throw new ApiError('사용자 차단에 실패했습니다')
    }
    
    return createSuccessResponse(
      { 
        blocked: true, 
        target_user: targetUser 
      },
      `${(targetUser as any).nickname}님을 차단했습니다`
    )
    
  } else if (action === 'unblock') {
    // 차단 해제
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_uid', user.id)
      .eq('blocked_uid', target_uid)
    
    if (error) {
      console.error('Unblock error:', error)
      throw new ApiError('사용자 차단 해제에 실패했습니다')
    }
    
    return createSuccessResponse(
      { 
        blocked: false, 
        target_user: targetUser 
      },
      `${(targetUser as any).nickname}님의 차단을 해제했습니다`
    )
  }
  
  // Should never reach here
  throw new ApiError('알 수 없는 액션입니다')
}

// GET /api/block - 차단한 사용자 목록 조회
async function getBlockedUsers(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  
  // 차단한 사용자 목록 조회
  const { data: blockedUsers, error, count } = await supabase
    .from('blocked_users')
    .select(`
      *,
      blocked_user:profiles!blocked_users_blocked_uid_fkey(
        id,
        nickname,
        avatar_url,
        age_range
      )
    `, { count: 'exact' })
    .eq('blocker_uid', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Blocked users fetch error:', error)
    throw new ApiError('차단 목록을 가져오는데 실패했습니다')
  }
  
  return createSuccessResponse({
    blocked_users: blockedUsers || [],
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: count || 0
    }
  })
}

export const { GET, POST } = createMethodRouter({
  GET: getBlockedUsers,
  POST: handleBlockAction,
})