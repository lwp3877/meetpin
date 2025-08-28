/* src/app/auth/signup/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/brand'
import { useAuth } from '@/lib/useAuth'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    ageRange: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { user, loading, signUp } = useAuth()

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/map')
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { email, password, confirmPassword, nickname, ageRange } = formData

    if (!email || !password || !confirmPassword || !nickname || !ageRange) {
      toast.error('모든 필드를 입력해주세요')
      return false
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('올바른 이메일 주소를 입력해주세요')
      return false
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다')
      return false
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다')
      return false
    }

    if (nickname.length < 2 || nickname.length > 20) {
      toast.error('닉네임은 2~20자 사이여야 합니다')
      return false
    }

    return true
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { email, password, nickname, ageRange } = formData
      const result = await signUp(email, password, nickname, ageRange)
      
      if (result.success) {
        toast.success('회원가입이 완료되었습니다!')
        toast.success('이제 로그인해주세요')
        router.push('/auth/login')
      } else {
        toast.error(result.error || '회원가입에 실패했습니다')
      }
    } catch (error: any) {
      toast.error(error.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const ageRanges = [
    { value: '20s_early', label: '20대 초반 (20~24세)' },
    { value: '20s_late', label: '20대 후반 (25~29세)' },
    { value: '30s_early', label: '30대 초반 (30~34세)' },
    { value: '30s_late', label: '30대 후반 (35~39세)' },
    { value: '40s', label: '40대 (40~49세)' },
    { value: '50s+', label: '50세 이상' },
  ]

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
            {brandMessages.appName} 시작하기
          </h1>
          <p className="text-gray-600">
            새로운 사람들과의 즐거운 만남을 시작해보세요
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 * <span className="text-xs text-gray-500">(6자 이상)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임 * <span className="text-xs text-gray-500">(2~20자)</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="멋진 닉네임"
                disabled={isLoading}
                maxLength={20}
              />
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500">{formData.nickname.length}/20</span>
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                연령대 *
              </label>
              <select
                id="ageRange"
                value={formData.ageRange}
                onChange={(e) => handleInputChange('ageRange', e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                disabled={isLoading}
              >
                <option value="">연령대를 선택해주세요</option>
                {ageRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Terms */}
            <div className="pt-2">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  <Link href="/legal/terms" className="text-primary hover:underline">
                    이용약관
                  </Link>
                  {' '}및{' '}
                  <Link href="/legal/privacy" className="text-primary hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다 *
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  계정 생성 중...
                </div>
              ) : (
                '계정 만들기'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎉 밋핀과 함께하면
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">내 주변 새로운 사람들과 만날 수 있어요</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">취미와 관심사를 공유하는 모임 참여</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">안전하고 검증된 사용자들과의 만남</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}