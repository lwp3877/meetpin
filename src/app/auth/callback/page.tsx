/* src/app/auth/callback/page.tsx */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        
        // Get the auth code from URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('로그인 처리 중 오류가 발생했습니다')
          router.push('/auth/login?error=callback_failed')
          return
        }

        if (data.session) {
          toast.success('로그인이 완료되었습니다!')
          router.push('/map')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth callback unexpected error:', error)
        router.push('/auth/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려 주세요</p>
      </div>
    </div>
  )
}