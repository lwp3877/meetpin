/* src/lib/useAuth.tsx */
// 클라이언트에서 Supabase 인증 상태를 관리하는 최소한의 Provider + Hook 조합.

'use client'

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import * as authService from '@/lib/services/authService'
import { isDevelopmentMode } from '@/lib/config/flags'

if (isDevelopmentMode) {
  authService.logAuthState('useAuth hook initialized')
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
      const currentUser = await Promise.race([authService.getCurrentUser(), timeoutPromise])
      setUser(currentUser)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authService.signInWithEmail(email, password)
    if (result.success) {
      // refreshUser()를 호출하면 loading=true → 로그인 폼 전체가 스피너로 대체되어
      // "로그인 중..." 버튼이 사라지고 "로딩 중..." 화면으로 전환됨.
      // 대신 loading 상태를 건드리지 않고 user만 직접 업데이트.
      const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
      const currentUser = await Promise.race([authService.getCurrentUser(), timeoutPromise])
      setUser(currentUser)
    }
    return result
  }

  const signUp = async (email: string, password: string, nickname: string, ageRange: string) => {
    return await authService.signUpWithEmail(email, password, nickname, ageRange)
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    const result = await authService.updateUserProfile(updates)
    if (result.success) {
      await refreshUser()
    }
    return result
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      setLoading(true)
      try {
        // 5초 타임아웃: getUser()가 hanging 되면 로딩 스피너가 영원히 표시되는 문제 방지
        const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
        const currentUser = await Promise.race([authService.getCurrentUser(), timeoutPromise])
        if (mounted) {
          setUser(currentUser)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    if (isDevelopmentMode) {
      const handleStorageChange = async () => {
        if (!mounted) return
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }

      window.addEventListener('storage', handleStorageChange)
      return () => {
        mounted = false
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    const supabase = createBrowserSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [refreshUser])

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
