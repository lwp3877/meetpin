/* src/lib/auth.ts */
import { User } from '@supabase/supabase-js'
import { logger } from '@/lib/observability/logger'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabaseClient'
import { ApiError } from '@/lib/api'
import { isDevelopmentMode } from '@/lib/config/flags'
import { cookies } from 'next/headers'

/**
 * Mock 사용자 타입 변환
 */
function createMockSupabaseUser(mockUser: any): User {
  return {
    id: mockUser.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: mockUser.email,
    email_confirmed_at: new Date().toISOString(),
    phone: undefined,
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'mock', providers: ['mock'] },
    user_metadata: {
      nickname: mockUser.nickname,
      age_range: mockUser.age_range,
      role: mockUser.role,
    },
    identities: [],
    created_at: mockUser.created_at,
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  } as User
}

/**
 * 인증된 사용자 정보 가져오기 - Mock 모드와 실제 인증 모두 지원
 */
export async function getAuthenticatedUser(): Promise<User> {
  // Mock 모드인 경우 localStorage에서 사용자 정보 가져오기
  if (isDevelopmentMode) {
    try {
      // 서버에서는 쿠키를 통해 Mock 사용자 정보 확인
      const cookieStore = await cookies()
      const mockUserCookie = cookieStore.get('meetpin_mock_user')

      if (mockUserCookie?.value) {
        const mockUser = JSON.parse(decodeURIComponent(mockUserCookie.value))
        return createMockSupabaseUser(mockUser)
      }
    } catch (_error) {
      logger.info('Mock user cookie not found, trying headers')
    }

    // 헤더에서도 확인 (클라이언트에서 전송된 경우)
    try {
      // Request context가 있는 경우에만 시도
      if (typeof window === 'undefined') {
        // 서버 사이드에서는 Mock 사용자 반환
        const mockUser = {
          id: 'mock_user_' + Date.now(),
          email: 'admin@meetpin.com',
          nickname: 'Mock사용자',
          role: 'admin',
          age_range: '20-29',
          created_at: new Date().toISOString(),
        }
        return createMockSupabaseUser(mockUser)
      }
    } catch (_error) {
      logger.info('Using fallback mock user')
    }
  }

  // 실제 Supabase 인증 사용
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    logger.error('Auth error:', { error: error instanceof Error ? error.message : String(error) })
    throw new ApiError('인증 오류가 발생했습니다', 401, 'AUTH_ERROR')
  }

  if (!user) {
    throw new ApiError('로그인이 필요합니다', 401, 'UNAUTHORIZED')
  }

  return user
}

/**
 * 인증 필수 (미들웨어용)
 */
export async function requireAuth(): Promise<User> {
  return await getAuthenticatedUser()
}

/**
 * 관리자 권한 확인
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAuthenticatedUser()

  // Mock 모드인 경우 사용자 메타데이터에서 역할 확인
  if (isDevelopmentMode && user.app_metadata?.provider === 'mock') {
    if (user.user_metadata?.role !== 'admin') {
      throw new ApiError('관리자 권한이 필요합니다', 403, 'ADMIN_REQUIRED')
    }
    return user
  }

  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('uid', user.id)
    .single()

  if (error) {
    logger.error('Profile fetch error:', { error: error instanceof Error ? error.message : String(error) })
    throw new ApiError('프로필 조회 중 오류가 발생했습니다', 500, 'PROFILE_ERROR')
  }

  if (!profile || (profile as any).role !== 'admin') {
    throw new ApiError('관리자 권한이 필요합니다', 403, 'ADMIN_REQUIRED')
  }

  return user
}

/**
 * 사용자 프로필 조회 (인증된 사용자)
 */
export async function getUserProfile(uid?: string) {
  const user = await getAuthenticatedUser()
  const targetUid = uid || user.id

  // Mock 모드인 경우 Mock 프로필 반환
  if (isDevelopmentMode && user.app_metadata?.provider === 'mock') {
    return {
      uid: user.id,
      email: user.email,
      nickname: user.user_metadata?.nickname || 'Mock사용자',
      role: user.user_metadata?.role || 'user',
      age_range: user.user_metadata?.age_range || '20-29',
      created_at: user.created_at,
      updated_at: user.updated_at,
      avatar_url: null,
      intro: null,
      referral_code: null,
    }
  }

  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', targetUid)
    .single()

  if (error) {
    throw new ApiError('프로필을 찾을 수 없습니다', 404, 'PROFILE_NOT_FOUND')
  }

  return profile
}

/**
 * 사용자 온보딩 상태 확인
 */
export async function checkOnboardingStatus(uid: string) {
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nickname, age_range')
    .eq('uid', uid)
    .single()

  if (error) {
    return { isComplete: false, profile: null }
  }

  const isComplete = !!((profile as any).nickname && (profile as any).age_range)

  return { isComplete, profile }
}

/**
 * 관리자용 사용자 조회 (RLS 우회)
 */
export async function getAdminUserProfile(uid: string) {
  // 관리자 권한 확인
  await requireAdmin()

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(
      `
      *,
      auth.users!inner(
        email,
        created_at as auth_created_at,
        email_confirmed_at,
        last_sign_in_at
      )
    `
    )
    .eq('uid', uid)
    .single()

  if (error) {
    throw new ApiError('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND')
  }

  return profile
}

/**
 * 현재 사용자가 특정 사용자를 차단했는지 확인
 */
export async function isUserBlocked(targetUid: string): Promise<boolean> {
  try {
    const currentUser = await getAuthenticatedUser()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocker_uid')
      .eq('blocker_uid', currentUser.id)
      .eq('blocked_uid', targetUid)
      .single()

    return !!data && !error
  } catch {
    return false
  }
}

/**
 * 특정 사용자가 현재 사용자를 차단했는지 확인
 */
export async function isBlockedByUser(blockerUid: string): Promise<boolean> {
  try {
    const currentUser = await getAuthenticatedUser()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_uid')
      .eq('blocker_uid', blockerUid)
      .eq('blocked_uid', currentUser.id)
      .single()

    return !!data && !error
  } catch {
    return false
  }
}

/**
 * 상호 차단 관계 확인
 */
export async function checkMutualBlocking(otherUid: string): Promise<{
  blockedByMe: boolean
  blockedByThem: boolean
  hasBlocking: boolean
}> {
  const [blockedByMe, blockedByThem] = await Promise.all([
    isUserBlocked(otherUid),
    isBlockedByUser(otherUid),
  ])

  return {
    blockedByMe,
    blockedByThem,
    hasBlocking: blockedByMe || blockedByThem,
  }
}

/**
 * 방 소유자 확인
 */
export async function requireRoomOwner(roomId: string): Promise<User> {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()

  const { data: room, error } = await supabase
    .from('rooms')
    .select('host_uid')
    .eq('id', roomId)
    .single()

  if (error || !room) {
    throw new ApiError('방을 찾을 수 없습니다', 404, 'ROOM_NOT_FOUND')
  }

  if ((room as any).host_uid !== user.id) {
    throw new ApiError('방 소유자만 수정할 수 있습니다', 403, 'NOT_ROOM_OWNER')
  }

  return user
}

/**
 * 매치 당사자 확인
 */
export async function requireMatchParticipant(matchId: string): Promise<User> {
  const user = await getAuthenticatedUser()
  const supabase = await createServerSupabaseClient()

  const { data: match, error } = await supabase
    .from('matches')
    .select('host_uid, guest_uid')
    .eq('id', matchId)
    .single()

  if (error || !match) {
    throw new ApiError('매치를 찾을 수 없습니다', 404, 'MATCH_NOT_FOUND')
  }

  if ((match as any).host_uid !== user.id && (match as any).guest_uid !== user.id) {
    throw new ApiError('매치 당사자만 접근할 수 있습니다', 403, 'NOT_MATCH_PARTICIPANT')
  }

  return user
}

/**
 * 세션 정리 (로그아웃)
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new ApiError('로그아웃 중 오류가 발생했습니다', 500, 'SIGNOUT_ERROR')
  }
}

/**
 * 사용자 삭제 (관리자용)
 */
export async function deleteUserAdmin(uid: string) {
  // 관리자 권한 확인
  await requireAdmin()

  const { error } = await supabaseAdmin.auth.admin.deleteUser(uid)

  if (error) {
    throw new ApiError('사용자 삭제 중 오류가 발생했습니다', 500, 'USER_DELETE_ERROR')
  }
}

/**
 * 사용자 역할 변경 (관리자용)
 */
export async function updateUserRole(uid: string, role: 'user' | 'admin') {
  // 관리자 권한 확인
  await requireAdmin()

  const { error } = await (supabaseAdmin as any).from('profiles').update({ role }).eq('uid', uid)

  if (error) {
    throw new ApiError('사용자 역할 변경 중 오류가 발생했습니다', 500, 'ROLE_UPDATE_ERROR')
  }
}

/**
 * 이메일 인증 상태 확인
 */
export async function checkEmailVerification(uid: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(uid)

  if (error || !data.user) {
    return false
  }

  return !!data.user.email_confirmed_at
}

/**
 * 사용자 통계 (관리자용)
 */
export async function getUserStats() {
  // 관리자 권한 확인
  await requireAdmin()

  const { data, error } = await supabaseAdmin.from('admin_stats').select('*')

  if (error) {
    throw new ApiError('사용자 통계 조회 중 오류가 발생했습니다', 500, 'STATS_ERROR')
  }

  return data
}

