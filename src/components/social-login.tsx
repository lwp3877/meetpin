/* src/components/social-login.tsx */
'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/flags'

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
      if (isDevelopmentMode) {
        // Development mode - show mock message
        toast.success('개발 모드: 카카오 로그인 시뮬레이션')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (onSuccess) onSuccess()
        return
      }

      // Production Supabase OAuth
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        toast.error('카카오 로그인에 실패했습니다: ' + error.message)
      }
    } catch (error: any) {
      console.error('Kakao login error:', error)
      toast.error('카카오 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleGoogleLogin = async () => {
    setLoadingProvider('google')
    
    try {
      if (isDevelopmentMode) {
        // Development mode - show mock message
        toast.success('개발 모드: 구글 로그인 시뮬레이션')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (onSuccess) onSuccess()
        return
      }

      // Production Supabase OAuth
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        toast.error('구글 로그인에 실패했습니다: ' + error.message)
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error('구글 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleNaverLogin = async () => {
    setLoadingProvider('naver')
    
    try {
      if (isDevelopmentMode) {
        // Development mode - show mock message
        toast.success('개발 모드: 네이버 로그인 시뮬레이션')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (onSuccess) onSuccess()
        return
      }

      // For production, Naver is not supported by Supabase yet
      toast.error('네이버 로그인은 준비 중입니다. 카카오/구글 로그인을 이용해주세요.')
    } catch (error: any) {
      console.error('Naver login error:', error)
      toast.error('네이버 로그인 중 오류가 발생했습니다')
    } finally {
      setLoadingProvider(null)
    }
  }

  const isLoading = loadingProvider !== null

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500 bg-white px-2">
          또는 간편하게
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Kakao Login */}
      <Button
        type="button"
        onClick={handleKakaoLogin}
        disabled={disabled || isLoading}
        className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] font-medium py-3 border-0 shadow-sm hover:shadow-md transition-all"
      >
        {loadingProvider === 'kakao' ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#3C1E1E] border-t-transparent rounded-full animate-spin mr-2"></div>
            카카오로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 mr-2 bg-[#3C1E1E] rounded-sm flex items-center justify-center">
              <span className="text-[#FEE500] text-xs font-bold">K</span>
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
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 border border-gray-300 shadow-sm hover:shadow-md transition-all"
      >
        {loadingProvider === 'google' ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin mr-2"></div>
            구글로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
        className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white font-medium py-3 border-0 shadow-sm hover:shadow-md transition-all"
      >
        {loadingProvider === 'naver' ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            네이버로 {type === 'login' ? '로그인' : '가입'} 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 mr-2 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[#03C75A] text-xs font-bold">N</span>
            </div>
            네이버로 {type === 'login' ? '로그인' : '가입'}하기
          </div>
        )}
      </Button>

      {/* Benefits for social login */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-500 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium">소셜 로그인 혜택</div>
            <div className="text-xs text-blue-600 mt-1">
              ✓ 간편한 원클릭 {type === 'login' ? '로그인' : '가입'} <br/>
              ✓ 별도 비밀번호 관리 불필요 <br/>
              ✓ 안전한 계정 연동
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="text-center mt-4">
        <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-2">
          💡 소셜 로그인 기능을 준비 중입니다. 곧 만나보실 수 있어요!
        </div>
      </div>
    </div>
  )
}