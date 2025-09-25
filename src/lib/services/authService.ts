/**
 * 인증 관련 서비스 로직을 담당하는 모듈
 * useAuth 훅에서 분리하여 테스트 가능성과 재사용성을 높임
 */

import { createBrowserSupabaseClient } from '@/lib/supabaseClient'

// Database types for Supabase operations
interface ProfileUpdate {
  nickname?: string
  age_range?: string
  avatar_url?: string
  intro?: string
}

interface ProfileRecord {
  uid: string
  nickname?: string
  role: 'user' | 'admin'
  age_range?: string
  avatar_url?: string
  intro?: string
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  nickname?: string
  role: 'user' | 'admin'
  age_range?: string
  avatar_url?: string
  intro?: string
  referral_code?: string
  created_at: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

import { isDevelopmentMode as _isDevelopmentMode } from '@/lib/config/flags'

// Mock 모드 여부를 결정하는 함수
export const isDevelopmentMode = (): boolean => {
  return _isDevelopmentMode
}

// 현재 인증된 사용자 정보 가져오기
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    if (isDevelopmentMode()) {
      // Mock 모드: localStorage에서 사용자 정보 가져오기
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('meetpin_user')
        return stored ? JSON.parse(stored) : null
      }
      return null
    } else {
      // 실제 Supabase 모드
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        logAuthState('No authenticated user found', authError)
        return null
      }

      // 프로필 정보 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', authUser.id)
        .single()

      if (profileError) {
        logAuthState('Failed to fetch user profile', profileError)
        return null
      }

      if (!profile) {
        logAuthState('Profile not found')
        return null
      }

      const profileData = profile as ProfileRecord

      return {
        id: authUser.id,
        email: authUser.email || '',
        nickname: profileData.nickname,
        role: profileData.role || 'user',
        age_range: profileData.age_range,
        avatar_url: profileData.avatar_url,
        intro: profileData.intro,
        created_at: profileData.created_at,
      }
    }
  } catch (error) {
    logAuthState('Error in getCurrentUser', error)
    return null
  }
}

// 이메일 로그인
export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    if (isDevelopmentMode()) {
      // Mock 모드: Mock 로그인 사용
      const { mockLogin } = await import('@/lib/config/mockData')
      const result = await mockLogin(email, password)
      localStorage.setItem('meetpin_user', JSON.stringify(result.user))

      // 서버에서도 읽을 수 있도록 쿠키에도 저장
      if (typeof document !== 'undefined') {
        document.cookie = `meetpin_mock_user=${encodeURIComponent(JSON.stringify(result.user))}; path=/; max-age=86400`
      }

      return { success: true }
    } else {
      // 실제 Supabase 모드
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logAuthState('Sign in failed', error)
        return {
          success: false,
          error:
            error.message === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 잘못되었습니다'
              : '로그인에 실패했습니다. 다시 시도해주세요.',
        }
      }

      if (!data.user) {
        return { success: false, error: '로그인에 실패했습니다' }
      }

      return { success: true }
    }
  } catch (error: any) {
    logAuthState('Unexpected error in signInWithEmail', error)
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    }
  }
}

// 이메일 회원가입
export const signUpWithEmail = async (
  email: string,
  password: string,
  nickname: string,
  ageRange: string
): Promise<AuthResult> => {
  try {
    if (isDevelopmentMode()) {
      // Mock 모드: Mock 회원가입 사용
      const { mockSignUp } = await import('@/lib/config/mockData')
      await mockSignUp(email, password, nickname, ageRange)
      return { success: true }
    } else {
      // 실제 Supabase 모드
      const supabase = createBrowserSupabaseClient()

      // 이메일 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        logAuthState('Sign up failed', signUpError)
        return {
          success: false,
          error: signUpError.message.includes('already registered')
            ? '이미 등록된 이메일입니다'
            : '회원가입에 실패했습니다. 다시 시도해주세요.',
        }
      }

      if (!data.user) {
        return { success: false, error: '회원가입에 실패했습니다' }
      }

      // 프로필 생성 (트리거가 자동으로 처리하지만 nickname, age_range 업데이트 필요)
      const profileUpdate: ProfileUpdate = {
        nickname,
        age_range: ageRange,
      }
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update(profileUpdate)
        .eq('uid', data.user.id)

      if (profileError) {
        logAuthState('Profile update failed after signup', profileError)
        // 프로필 업데이트 실패해도 회원가입은 성공으로 처리
      }

      return { success: true }
    }
  } catch (error: any) {
    logAuthState('Unexpected error in signUpWithEmail', error)
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    }
  }
}

// 로그아웃
export const signOut = async (): Promise<void> => {
  try {
    if (isDevelopmentMode()) {
      // Mock 모드: localStorage에서 사용자 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('meetpin_user')
        // 쿠키도 제거
        if (typeof document !== 'undefined') {
          document.cookie = 'meetpin_mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      }
    } else {
      // 실제 Supabase 모드
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        logAuthState('Sign out failed', error)
        // 에러가 있어도 로그아웃 처리 (클라이언트 사이드 정리)
      }
    }
  } catch (error) {
    logAuthState('Unexpected error in signOut', error)
    // 에러가 있어도 로그아웃 처리
  }
}

// 프로필 업데이트
export const updateUserProfile = async (updates: Partial<AuthUser>): Promise<AuthResult> => {
  try {
    if (isDevelopmentMode()) {
      // Mock 모드: localStorage에서 사용자 정보 업데이트
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('meetpin_user')
        if (stored) {
          const user = JSON.parse(stored)
          const updatedUser = { ...user, ...updates }
          localStorage.setItem('meetpin_user', JSON.stringify(updatedUser))

          // 쿠키도 업데이트
          if (typeof document !== 'undefined') {
            document.cookie = `meetpin_mock_user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400`
          }

          return { success: true }
        }
        return { success: false, error: '사용자를 찾을 수 없습니다' }
      }
      return { success: false, error: '브라우저 환경이 아닙니다' }
    } else {
      // 실제 Supabase 모드
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return { success: false, error: '인증되지 않은 사용자입니다' }
      }

      // 프로필 업데이트 (id는 수정 불가)
      const { id: _id, created_at: _created_at, email: _email, ...profileUpdates } = updates
      const updateData: ProfileUpdate = {
        nickname: profileUpdates.nickname,
        age_range: profileUpdates.age_range,
        avatar_url: profileUpdates.avatar_url,
        intro: profileUpdates.intro,
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('uid', authUser.id)

      if (error) {
        logAuthState('Profile update failed', error)
        return {
          success: false,
          error: '프로필 업데이트에 실패했습니다. 다시 시도해주세요.',
        }
      }

      return { success: true }
    }
  } catch (error: any) {
    logAuthState('Unexpected error in updateUserProfile', error)
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    }
  }
}

// 개발 모드 로깅 유틸리티
export const logAuthState = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.debug(`[authService] ${message}`, data)
  }
}
