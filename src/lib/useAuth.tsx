/* src/lib/useAuth.ts */
// 클라이언트 사이드 인증 훅

'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { mockLogin, mockSignUp } from '@/lib/mockData'
import { BUILD_VERSION } from '@/lib/buildBuster'

// Mock 모드 강제 활성화 (임시)
const isDevelopmentMode = true
console.log('🔥 useAuth 로딩됨 - 빌드:', BUILD_VERSION)

// 확장된 사용자 타입
export interface AppUser {
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

export interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, nickname: string, ageRange: string) => Promise<{ success: boolean; error?: string }>
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

  // 현재 사용자 정보 가져오기 (지연 로딩 최적화)
  const getCurrentUser = useCallback(async (): Promise<AppUser | null> => {
    if (isDevelopmentMode) {
      const stored = localStorage.getItem('meetpin_user')
      return stored ? JSON.parse(stored) : null
    }

    try {
      // Supabase 클라이언트를 지연 생성하여 초기 로딩 성능 향상
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
  }, [])

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } finally {
      setLoading(false)
    }
  }, [getCurrentUser])

  // 이메일 로그인 - Mock 모드만 사용
  const signIn = async (email: string, password: string) => {
    // SUPABASE 완전 제거 - Mock만 사용
    try {
      const result = await mockLogin(email, password)
      localStorage.setItem('meetpin_user', JSON.stringify(result.user))
      setUser(result.user as AppUser)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 이메일 회원가입 - Mock 모드만 사용
  const signUp = async (email: string, password: string, nickname: string, ageRange: string) => {
    // SUPABASE 완전 제거 - Mock만 사용
    try {
      await mockSignUp(email, password, nickname, ageRange)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 로그아웃
  const signOut = async () => {
    if (isDevelopmentMode) {
      localStorage.removeItem('meetpin_user')
      setUser(null)
      return
    }

    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<AppUser>) => {
    if (isDevelopmentMode) {
      const stored = localStorage.getItem('meetpin_user')
      if (stored) {
        const user = JSON.parse(stored)
        const updatedUser = { ...user, ...updates }
        localStorage.setItem('meetpin_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
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

      await refreshUser()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 초기 로드 및 인증 상태 변경 감지
  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      if (mounted) {
        await refreshUser()
      }
    }

    initializeAuth()

    if (isDevelopmentMode) {
      // localStorage 변경 감지 (개발 모드)
      const handleStorageChange = () => {
        if (mounted) {
          refreshUser()
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (session?.user) {
          await refreshUser()
        }
        setLoading(false)
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      window.location.href = '/auth/login'
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      window.location.href = '/auth/login'
      return null
    }

    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
            <p className="text-gray-600 mb-4">관리자 권한이 필요합니다.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-deep transition-colors"
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
      window.location.href = '/auth/login'
    }
  }, [user, loading])

  return { user, loading }
}

export function useRequireAdmin() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login'
    } else if (!loading && user && user.role !== 'admin') {
      window.location.href = '/'
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