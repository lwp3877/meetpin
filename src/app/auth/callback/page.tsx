/* src/app/auth/callback/page.tsx */
// Supabase 인증 콜백 처리 페이지
// 소셜 로그인, 비밀번호 재설정 이메일 클릭 후 이 페이지로 도착합니다.
//
// URL 형태:
//   - 소셜 로그인:        /auth/callback
//   - 비밀번호 재설정:   /auth/callback?type=recovery
//
// useSearchParams()는 Next.js 15에서 Suspense 필요 → 내부 컴포넌트로 분리.

'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

// 실제 콜백 처리 (useSearchParams 사용)
function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const type = searchParams.get('type') // 'recovery' | null

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          logger.error('Auth callback error:', { error: error.message })
          toast.error('인증 처리 중 오류가 발생했습니다')
          router.push('/auth/login?error=callback_failed')
          return
        }

        if (!data.session) {
          // 세션 없음 → 로그인으로
          router.push('/auth/login')
          return
        }

        // 비밀번호 재설정 흐름: 새 비밀번호 입력 페이지로 이동
        if (type === 'recovery') {
          router.push('/auth/reset-password')
          return
        }

        // 일반 소셜 로그인 성공
        toast.success('로그인이 완료되었습니다!')
        router.push('/map')
      } catch (error) {
        logger.error('Auth callback unexpected error:', {
          error: error instanceof Error ? error.message : String(error),
        })
        router.push('/auth/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-gray-600">인증 처리 중...</p>
        <p className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요</p>
      </div>
    </div>
  )
}

// Suspense 래퍼 (useSearchParams 필수 요건)
export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-gray-600">인증 처리 중...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  )
}
