/* src/lib/useAuth.ts */
// 클라이언트 사이드 인증 훅

'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import * as authService from '@/lib/services/authService'
import { redirectToLogin, redirectToHome } from '@/lib/utils/navigation'

// 개발 모드에서 로그 출력
if (authService.isDevelopmentMode()) {
  authService.logAuthState('useAuth hook initialized')
}

// 타입을 authService에서 re-export
export type AppUser = authService.AuthUser

export interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    nickname: string,
    ageRange: string
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

// Auth Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies needed - authService.getCurrentUser is stable

  // 이메일 로그인 (authService로 위임)
  const signIn = async (email: string, password: string) => {
    const result = await authService.signInWithEmail(email, password)
    if (result.success) {
      await refreshUser()
    }
    return result
  }

  // 이메일 회원가입 (authService로 위임)
  const signUp = async (email: string, password: string, nickname: string, ageRange: string) => {
    return await authService.signUpWithEmail(email, password, nickname, ageRange)
  }

  // 로그아웃 (authService로 위임)
  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  // 프로필 업데이트 (authService로 위임)
  const updateProfile = async (updates: Partial<AppUser>) => {
    const result = await authService.updateUserProfile(updates)
    if (result.success) {
      await refreshUser()
    }
    return result
  }

  // 초기 로드 및 인증 상태 변경 감지
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (mounted) {
        setLoading(true)
        try {
          const currentUser = await authService.getCurrentUser()
          if (mounted) {
            setUser(currentUser)
          }
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    }

    initializeAuth()

    if (authService.isDevelopmentMode()) {
      // localStorage 변경 감지 (개발 모드)
      const handleStorageChange = async () => {
        if (mounted) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      }

      window.addEventListener('storage', handleStorageChange)
      return () => {
        mounted = false
        window.removeEventListener('storage', handleStorageChange)
      }
    } else {
      // Supabase 인증 상태 변경 감지
      const supabase = createBrowserSupabaseClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (session?.user) {
          const currentUser = await authService.getCurrentUser()
          if (mounted) {
            setUser(currentUser)
          }
        }
        if (mounted) {
          setLoading(false)
        }
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }
  }, []) // No dependencies needed - we're using authService.getCurrentUser directly

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 인증이 필요한 페이지용 HOC
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      redirectToLogin()
      return null
    }

    return <Component {...props} />
  }
}

// 관리자 전용 페이지용 HOC
export function withAdmin<P extends object>(Component: React.ComponentType<P>) {
  return function AdminComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      redirectToLogin()
      return null
    }

    if (user.role !== 'admin') {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">접근 권한 없음</h1>
            <p className="mb-4 text-gray-600">관리자 권한이 필요합니다.</p>
            <button
              onClick={redirectToHome}
              className="bg-primary hover:bg-primary-deep rounded-lg px-4 py-2 text-white transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// 유틸리티 훅들
export function useRequireAuth() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      redirectToLogin()
    }
  }, [user, loading])

  return { user, loading }
}

export function useRequireAdmin() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      redirectToLogin()
    } else if (!loading && user && user.role !== 'admin') {
      redirectToHome()
    }
  }, [user, loading])

  return { user, loading }
}

const authHooks = {
  AuthProvider,
  useAuth,
  withAuth,
  withAdmin,
  useRequireAuth,
  useRequireAdmin,
}

export default authHooks
