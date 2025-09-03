/**
 * 인증 관련 서비스 로직을 담당하는 모듈
 * useAuth 훅에서 분리하여 테스트 가능성과 재사용성을 높임
 */

import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { mockLogin, mockSignUp } from '@/lib/mockData'

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

// Mock 모드 여부를 결정하는 함수
export const isDevelopmentMode = (): boolean => {
  return process.env.NEXT_PUBLIC_FORCE_MOCK === 'true' || 
         process.env.NODE_ENV !== 'production'
}

// 현재 인증된 사용자 정보 가져오기
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (isDevelopmentMode()) {
    const stored = localStorage.getItem('meetpin_user')
    return stored ? JSON.parse(stored) : null
  }

  try {
    const supabase = createBrowserSupabaseClient()
    
    // 타임아웃을 설정하여 무한 대기 방지
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 10000)
    )
    
    const { data: { user: authUser }, error } = await Promise.race([
      authPromise, 
      timeoutPromise
    ]) as any
    
    if (error || !authUser) return null

    // 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', authUser.id)
      .single()

    return {
      id: authUser.id,
      email: authUser.email || '',
      nickname: (profile as any)?.nickname,
      role: ((profile as any)?.role as 'user' | 'admin') || 'user',
      age_range: (profile as any)?.age_range,
      avatar_url: (profile as any)?.avatar_url,
      intro: (profile as any)?.intro,
      referral_code: (profile as any)?.referral_code,
      created_at: (profile as any)?.created_at || authUser.created_at,
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

// 이메일 로그인
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResult> => {
  if (isDevelopmentMode()) {
    try {
      const result = await mockLogin(email, password)
      localStorage.setItem('meetpin_user', JSON.stringify(result.user))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  try {
    const supabase = createBrowserSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error || !data.user) {
      return { success: false, error: error?.message ?? '로그인 실패' }
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 이메일 회원가입
export const signUpWithEmail = async (
  email: string,
  password: string,
  nickname: string,
  ageRange: string
): Promise<AuthResult> => {
  if (isDevelopmentMode()) {
    try {
      await mockSignUp(email, password, nickname, ageRange)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  try {
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          age_range: ageRange,
        },
      },
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 로그아웃
export const signOut = async (): Promise<void> => {
  if (isDevelopmentMode()) {
    localStorage.removeItem('meetpin_user')
    return
  }

  const supabase = createBrowserSupabaseClient()
  await supabase.auth.signOut()
}

// 프로필 업데이트
export const updateUserProfile = async (
  updates: Partial<AuthUser>
): Promise<AuthResult> => {
  if (isDevelopmentMode()) {
    const stored = localStorage.getItem('meetpin_user')
    if (stored) {
      const user = JSON.parse(stored)
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('meetpin_user', JSON.stringify(updatedUser))
      return { success: true }
    }
    return { success: false, error: '사용자를 찾을 수 없습니다' }
  }

  try {
    const supabase = createBrowserSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return { success: false, error: '인증되지 않은 사용자입니다' }
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('uid', authUser.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 개발 모드 로깅 유틸리티
export const logAuthState = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.debug(`[authService] ${message}`, data)
  }
}