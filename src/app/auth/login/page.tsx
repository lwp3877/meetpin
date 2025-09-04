/* src/app/auth/login/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/brand'
import { useAuth } from '@/lib/useAuth'
import { isDevelopmentMode } from '@/lib/mockData'
import { SocialLogin } from '@/components/social-login'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { user, loading, signIn } = useAuth()

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/map')
    }
  }, [user, loading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요')
      return
    }

    if (!email.includes('@')) {
      toast.error('올바른 이메일 주소를 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        toast.success('로그인 성공!')
        router.push('/map')
      } else {
        toast.error(result.error || '로그인에 실패했습니다')
      }
    } catch (error: any) {
      toast.error(error.message || '로그인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl">📍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {brandMessages.appName}에 로그인
          </h1>
          <p className="text-gray-600">
            {brandMessages.tagline}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
          
          {/* Social Login */}
          <SocialLogin 
            type="login" 
            disabled={isLoading}
            onSuccess={() => {
              toast.success('소셜 로그인이 완료되었습니다!')
              router.push('/map')
            }}
          />

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500 bg-white px-2">
              또는 이메일로 로그인
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          {/* 개발자용 임시 로그인 정보 */}
          {isDevelopmentMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔧 개발자용 임시 로그인</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>관리자:</strong> admin@meetpin.com / 123456</p>
                <p><strong>일반유저:</strong> test@test.com / 123456</p>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '이메일로 로그인'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="mt-2 text-center">
            <button className="text-sm text-gray-500 hover:text-primary">
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-xl mb-1">🗺️</div>
            <div className="text-xs text-gray-600">지도 기반<br />모임</div>
          </div>
          <div className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-xl mb-1">💬</div>
            <div className="text-xs text-gray-600">실시간<br />채팅</div>
          </div>
          <div className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-xl mb-1">👥</div>
            <div className="text-xs text-gray-600">쉬운<br />매칭</div>
          </div>
        </div>
      </div>
    </div>
  )
}