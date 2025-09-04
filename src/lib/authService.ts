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

import { isDevelopmentMode as _isDevelopmentMode } from '@/lib/flags'

// Mock 모드 여부를 결정하는 함수
export const isDevelopmentMode = (): boolean => {
  return _isDevelopmentMode
}

// 현재 인증된 사용자 정보 가져오기 - 임시로 Mock 모드 사용
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // 임시: localStorage에서 Mock 사용자 정보 가져오기
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('meetpin_user')
    return stored ? JSON.parse(stored) : null
  }
  return null
}

// 이메일 로그인 - 임시로 Mock 모드 사용 (Supabase 설정 완료까지)
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResult> => {
  // 임시: Supabase 설정 완료까지 Mock 로그인 사용
  try {
    const { mockLogin } = await import('@/lib/mockData')
    const result = await mockLogin(email, password)
    localStorage.setItem('meetpin_user', JSON.stringify(result.user))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 이메일 회원가입 - 임시로 Mock 모드 사용 (Supabase 설정 완료까지)
export const signUpWithEmail = async (
  email: string,
  password: string,
  nickname: string,
  ageRange: string
): Promise<AuthResult> => {
  // 임시: Supabase 설정 완료까지 Mock 회원가입 사용
  try {
    const { mockSignUp } = await import('@/lib/mockData')
    await mockSignUp(email, password, nickname, ageRange)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 로그아웃 - 임시로 Mock 모드 사용
export const signOut = async (): Promise<void> => {
  // 임시: localStorage에서 사용자 정보 제거
  if (typeof window !== 'undefined') {
    localStorage.removeItem('meetpin_user')
  }
}

// 프로필 업데이트 - 임시로 Mock 모드 사용
export const updateUserProfile = async (
  updates: Partial<AuthUser>
): Promise<AuthResult> => {
  // 임시: localStorage에서 사용자 정보 업데이트
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('meetpin_user')
    if (stored) {
      const user = JSON.parse(stored)
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('meetpin_user', JSON.stringify(updatedUser))
      return { success: true }
    }
    return { success: false, error: '사용자를 찾을 수 없습니다' }
  }
  return { success: false, error: '브라우저 환경이 아닙니다' }
}

// 개발 모드 로깅 유틸리티
export const logAuthState = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.debug(`[authService] ${message}`, data)
  }
}