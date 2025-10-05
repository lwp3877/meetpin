/* src/components/social-login.tsx */
'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

interface SocialLoginProps {
  type?: 'login' | 'signup'
  onSuccess?: () => void
  disabled?: boolean
}

export function SocialLogin({ type = 'login', onSuccess, disabled = false }: SocialLoginProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleKakaoLogin = async () => {
    setLoadingProvider('kakao')

    try {
      // 임시: Mock 카카오 로그인 (Supabase OAuth 설정 완료까지)
      toast.success('카카오 로그인 성공!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock 사용자 데이터 생성
      const mockKakaoUser = {
        id: 'kakao_' + Date.now(),
        email: 'kakao@example.com',
        nickname: '카카오사용자',
        role: 'user' as const,
        age_range: '20-29',
        avatar_url: undefined,
        intro: undefined,
        referral_code: undefined,
        created_at: new Date().toISOString(),
      }

      localStorage.setItem('meetpin_user', JSON.stringify(mockKakaoUser))
      document.cookie = `meetpin_mock_user=${encodeURIComponent(JSON.stringify(mockKakaoUser))}; path=/; max-age=86400`
      if (onSuccess) onSuccess()
    } catch (error: any) {
      logger.error('Kakao login error:', { error: error instanceof Error ? error.message : String(error) })
      toast.error('카카오 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleGoogleLogin = async () => {
    setLoadingProvider('google')

    try {
      // 임시: Mock 구글 로그인 (Supabase OAuth 설정 완료까지)
      toast.success('구글 로그인 성공!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock 사용자 데이터 생성
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        email: 'google@example.com',
        nickname: '구글사용자',
        role: 'user' as const,
        age_range: '30-39',
        avatar_url: undefined,
        intro: undefined,
        referral_code: undefined,
        created_at: new Date().toISOString(),
      }

      localStorage.setItem('meetpin_user', JSON.stringify(mockGoogleUser))
      document.cookie = `meetpin_mock_user=${encodeURIComponent(JSON.stringify(mockGoogleUser))}; path=/; max-age=86400`
      if (onSuccess) onSuccess()
    } catch (error: any) {
      logger.error('Google login error:', { error: error instanceof Error ? error.message : String(error) })
      toast.error('구글 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleNaverLogin = async () => {
    setLoadingProvider('naver')

    try {
      // 임시: Mock 네이버 로그인 (Supabase OAuth 설정 완료까지)
      toast.success('네이버 로그인 성공!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock 사용자 데이터 생성
      const mockNaverUser = {
        id: 'naver_' + Date.now(),
        email: 'naver@example.com',
        nickname: '네이버사용자',
        role: 'user' as const,
        age_range: '40-49',
        avatar_url: undefined,
        intro: undefined,
        referral_code: undefined,
        created_at: new Date().toISOString(),
      }

      localStorage.setItem('meetpin_user', JSON.stringify(mockNaverUser))
      document.cookie = `meetpin_mock_user=${encodeURIComponent(JSON.stringify(mockNaverUser))}; path=/; max-age=86400`
      if (onSuccess) onSuccess()
    } catch (error: any) {
      logger.error('Naver login error:', { error: error instanceof Error ? error.message : String(error) })
      toast.error('네이버 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const isLoading = loadingProvider !== null

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 bg-white px-2 text-sm text-gray-500">또는 간편하게</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Kakao Login */}
      <Button
        type="button"
        onClick={handleKakaoLogin}
        disabled={disabled || isLoading}
        className="w-full border-0 bg-[#FEE500] py-3 font-medium text-[#3C1E1E] shadow-sm transition-all hover:bg-[#FEE500]/90 hover:shadow-md"
      >
        {loadingProvider === 'kakao' ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#3C1E1E] border-t-transparent"></div>
            카카오로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-sm bg-[#3C1E1E]">
              <span className="text-xs font-bold text-[#FEE500]">K</span>
            </div>
            카카오로 {type === 'login' ? '로그인' : '가입'}하기
          </div>
        )}
      </Button>

      {/* Google Login */}
      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        variant="outline"
        className="w-full border border-gray-300 bg-white py-3 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
      >
        {loadingProvider === 'google' ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent"></div>
            구글로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            구글로 {type === 'login' ? '로그인' : '가입'}하기
          </div>
        )}
      </Button>

      {/* Naver Login */}
      <Button
        type="button"
        onClick={handleNaverLogin}
        disabled={disabled || isLoading}
        className="w-full border-0 bg-[#03C75A] py-3 font-medium text-white shadow-sm transition-all hover:bg-[#03C75A]/90 hover:shadow-md"
      >
        {loadingProvider === 'naver' ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            네이버로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-sm bg-white">
              <span className="text-xs font-bold text-[#03C75A]">N</span>
            </div>
            네이버로 {type === 'login' ? '로그인' : '가입'}하기
          </div>
        )}
      </Button>

      {/* Benefits for social login */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start space-x-2">
          <div className="mt-0.5 text-blue-500">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium">소셜 로그인 혜택</div>
            <div className="mt-1 text-xs text-blue-600">
              ✓ 간편한 원클릭 {type === 'login' ? '로그인' : '가입'} <br />
              ✓ 별도 비밀번호 관리 불필요 <br />✓ 안전한 계정 연동
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Notice */}
      <div className="mt-4 text-center">
        <div className="rounded-lg bg-green-50 p-2 text-xs text-green-600">
          ✅ 소셜 로그인이 임시로 작동합니다! Supabase OAuth 설정 완료 후 실제 인증으로 전환됩니다.
        </div>
      </div>
    </div>
  )
}
