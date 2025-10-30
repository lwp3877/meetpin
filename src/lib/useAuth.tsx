/* src/lib/useAuth.tsx */
// 클라이언트에서 Supabase 인증 상태를 관리하는 최소한의 Provider + Hook 조합.

'use client'

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import * as authService from '@/lib/services/authService'

if (authService.isDevelopmentMode()) {
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
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authService.signInWithEmail(email, password)
    if (result.success) {
      await refreshUser()
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

    initializeAuth()

    if (authService.isDevelopmentMode()) {
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
