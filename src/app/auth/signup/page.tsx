/* src/app/auth/signup/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/config/brand'
import { useAuth } from '@/lib/useAuth'
import { SocialLogin } from '@/components/auth/social-login'
import { SkipLink } from '@/components/ui/AccessibilityProvider'
import { useKeyboardNavigation, useKeyboardShortcuts } from '@/hooks/useKeyboardNavigation'
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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '', bgColor: '', barColor: '' })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    ageRange: ''
  })
  const [formStatus, setFormStatus] = useState('')
  const router = useRouter()
  const { user, loading, signUp } = useAuth()

  // Keyboard navigation setup
  const keyboardNav = useKeyboardNavigation({
    enableArrowKeys: false, // 폼에서는 Tab 키만 사용
    enableActivation: true,
    loop: true
  })

  // Keyboard shortcuts for enhanced UX
  useKeyboardShortcuts({
    'ctrl+enter': () => {
      const form = document.querySelector('form')
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(submitEvent)
      }
    },
    'escape': () => {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement) {
        activeElement.blur()
      }
    }
  })

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/map')
    }
  }, [user, loading, router])

  // Real-time validation functions with screen reader announcements
  const validateEmail = useCallback((email: string) => {
    if (!email) {
      setFormStatus('')
      return ''
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const errorMsg = '올바른 이메일 주소를 입력해주세요. 예: user@example.com'
      setFormStatus(`이메일 오류: ${errorMsg}`)
      return errorMsg
    }
    setFormStatus('이메일 주소가 올바릅니다')
    return ''
  }, [])

  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { score: 0, label: '', color: '', bgColor: '', barColor: '' }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    // Calculate score
    if (checks.length) score += 2
    if (checks.lowercase) score += 1
    if (checks.uppercase) score += 1
    if (checks.numbers) score += 1
    if (checks.symbols) score += 2
    
    // Determine strength label and color
    if (score <= 2) return { score, label: '약함', color: 'text-red-500', bgColor: 'bg-red-100', barColor: 'bg-red-500' }
    if (score <= 4) return { score, label: '보통', color: 'text-yellow-500', bgColor: 'bg-yellow-100', barColor: 'bg-yellow-500' }
    if (score <= 6) return { score, label: '양호', color: 'text-blue-500', bgColor: 'bg-blue-100', barColor: 'bg-blue-500' }
    return { score, label: '매우 강함', color: 'text-green-500', bgColor: 'bg-green-100', barColor: 'bg-green-500' }
  }, [])
  
  const validatePassword = useCallback((password: string) => {
    if (!password) return ''
    if (password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다'
    }
    if (password.length > 50) {
      return '비밀번호는 50자 이하여야 합니다'
    }
    return ''
  }, [])

  const validateConfirmPassword = useCallback((confirmPassword: string, password: string) => {
    if (!confirmPassword) return ''
    if (confirmPassword !== password) {
      return '비밀번호가 일치하지 않습니다'
    }
    return ''
  }, [])

  const validateNickname = useCallback((nickname: string) => {
    if (!nickname) return ''
    if (nickname.length < 2) {
      return '닉네임은 2자 이상이어야 합니다'
    }
    if (nickname.length > 20) {
      return '닉네임은 20자 이하여야 합니다'
    }
    if (!/^[a-zA-Z0-9가-힣]*$/.test(nickname)) {
      return '닉네임은 한글, 영문, 숫자만 사용 가능합니다'
    }
    return ''
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    let error = ''
    switch (field) {
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        setPasswordStrength(getPasswordStrength(value))
        // Also revalidate confirm password if it exists
        if (formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(formData.confirmPassword, value) }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password)
        break
      case 'nickname':
        error = validateNickname(value)
        break
      case 'ageRange':
        error = !value ? '연령대를 선택해주세요' : ''
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
  }


  const validateForm = () => {
    const { email, password, confirmPassword, nickname, ageRange } = formData
    
    // Run all validations
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password)
    const nicknameError = validateNickname(nickname)
    const ageRangeError = !ageRange ? '연령대를 선택해주세요' : ''
    
    // Update all errors
    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      nickname: nicknameError,
      ageRange: ageRangeError
    })
    
    // Check if any required field is empty
    if (!email || !password || !confirmPassword || !nickname || !ageRange) {
      toast.error('모든 필드를 입력해주세요')
      return false
    }
    
    // Check if any validation error exists
    if (emailError || passwordError || confirmPasswordError || nicknameError || ageRangeError) {
      toast.error('입력 정보를 다시 확인해주세요')
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
    <>
      <SkipLink href="#main-content">주 콘텐츠로 바로 가기</SkipLink>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8" role="main">
        <div 
          ref={keyboardNav.containerRef as React.RefObject<HTMLDivElement>}
          className="w-full max-w-md sm:max-w-lg space-y-6" 
          id="main-content"
          data-keyboard-container="true"
        >
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg transition-transform hover:scale-105" role="img" aria-label="밋핀 로고">
            <span className="text-2xl sm:text-3xl">📍</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {brandMessages.appName} 시작하기
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            새로운 사람들과의 즐거운 만남을 시작해보세요
          </p>
        </div>

        {/* Screen Reader Status Announcements */}
        <div 
          id="form-status" 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
          role="status"
        >
          {formStatus}
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 backdrop-blur-sm" role="form" aria-labelledby="signup-heading" aria-describedby="signup-instructions">
          <h2 id="signup-heading" className="sr-only">회원가입 폼</h2>
          <p id="signup-instructions" className="sr-only">
            회원가입을 위한 정보를 입력하세요. 이메일, 비밀번호, 비밀번호 확인, 닉네임, 연령대가 필요합니다.
            Tab 키로 필드간 이동하고, Ctrl+Enter로 양식을 제출할 수 있습니다. 각 필드는 실시간으로 유효성을 검사합니다.
          </p>
          
          {/* Social Login */}
          <SocialLogin 
            type="signup" 
            disabled={isLoading}
            onSuccess={() => {
              toast.success('소셜 가입이 완료되었습니다!')
              router.push('/map')
            }}
          />

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500 bg-white px-2">
              또는 이메일로 가입
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <form onSubmit={handleEmailSignUp} className="space-y-5 sm:space-y-6" noValidate role="form" aria-label="이메일 회원가입">
            {/* Email */}
            <div role="group" aria-labelledby="email-label">
              <label id="email-label" htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소 <span className="text-red-500" aria-label="필수 입력">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className={`w-full px-4 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1' 
                      : formData.email && !errors.email 
                      ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                      : 'border-gray-300 focus:ring-primary focus:ring-offset-1'
                  }`}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  inputMode="email"
                  aria-describedby={`email-help ${errors.email ? 'email-error' : ''}`.trim()}
                  aria-invalid={!!errors.email}
                  aria-required="true"
                />
                <div id="email-help" className="sr-only">
                  회원가입에 사용할 이메일 주소를 입력하세요. 예: user@example.com 형식으로 입력해주세요.
                </div>
                {formData.email && !errors.email && (
                  <div className="absolute right-3 top-3 sm:top-4 text-green-500" role="img" aria-label="유효한 이메일">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errors.email && (
                  <div className="absolute right-3 top-3 sm:top-4 text-red-500" role="img" aria-label="이메일 오류">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert" aria-live="polite">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.email}</span>
                </p>
              )}
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
                  className={`w-full px-4 py-3 sm:py-4 pr-16 sm:pr-20 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1' 
                      : formData.password && !errors.password 
                      ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                      : 'border-gray-300 focus:ring-primary focus:ring-offset-1'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-describedby={`${errors.password ? 'password-error' : ''} ${formData.password ? 'password-strength' : ''}`.trim() || undefined}
                  aria-invalid={!!errors.password}
                />
                <div className="absolute right-3 sm:right-4 top-3 sm:top-4 flex items-center space-x-2">
                  {formData.password && !errors.password && (
                    <div className="text-green-500" role="img" aria-label="유효한 비밀번호">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {errors.password && (
                    <div className="text-red-500" role="img" aria-label="비밀번호 오류">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors touch-manipulation"
                    disabled={isLoading}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                    aria-pressed={showPassword}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3" id="password-strength" role="region" aria-label="비밀번호 강도">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">비밀번호 강도:</span>
                    <span className={`text-xs sm:text-sm font-semibold ${passwordStrength.color}`} aria-live="polite">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.barColor}`}
                      style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={passwordStrength.score}
                      aria-valuemin={0}
                      aria-valuemax={7}
                      aria-label="비밀번호 강도 진행도"
                    ></div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                    강한 비밀번호 조건: 8자 이상, 대소문자, 숫자, 특수문자 포함
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert" aria-live="polite">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className={`w-full px-4 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1' 
                      : formData.confirmPassword && !errors.confirmPassword 
                      ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                      : 'border-gray-300 focus:ring-primary focus:ring-offset-1'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                />
                {formData.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute right-3 top-3 sm:top-4 text-green-500" role="img" aria-label="일치하는 비밀번호">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errors.confirmPassword && (
                  <div className="absolute right-3 top-3 sm:top-4 text-red-500" role="img" aria-label="비밀번호 불일치">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert" aria-live="polite">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임 * <span className="text-xs text-gray-500">(2~20자)</span>
              </label>
              <div className="relative">
                <input
                  id="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  required
                  className={`w-full px-4 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.nickname 
                      ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1' 
                      : formData.nickname && !errors.nickname 
                      ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                      : 'border-gray-300 focus:ring-primary focus:ring-offset-1'
                  }`}
                  placeholder="멋진 닉네임"
                  disabled={isLoading}
                  maxLength={20}
                  autoComplete="nickname"
                  aria-describedby={`nickname-counter ${errors.nickname ? 'nickname-error' : ''}`.trim()}
                  aria-invalid={!!errors.nickname}
                />
                {formData.nickname && !errors.nickname && (
                  <div className="absolute right-3 top-3 sm:top-4 text-green-500" role="img" aria-label="유효한 닉네임">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errors.nickname && (
                  <div className="absolute right-3 top-3 sm:top-4 text-red-500" role="img" aria-label="닉네임 오류">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div>
                  {errors.nickname && (
                    <p id="nickname-error" className="text-sm text-red-600 flex items-start" role="alert" aria-live="polite">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.nickname}</span>
                    </p>
                  )}
                </div>
                <span id="nickname-counter" className={`text-xs sm:text-sm ${
                  formData.nickname.length > 18 ? 'text-orange-500 font-medium' : 'text-gray-500'
                }`} aria-label={`닉네임 글자 수: ${formData.nickname.length}/20`}>
                  {formData.nickname.length}/20
                </span>
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                연령대 *
              </label>
              <div className="relative">
                <select
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={(e) => handleInputChange('ageRange', e.target.value)}
                  required
                  className={`w-full px-4 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none cursor-pointer ${
                    errors.ageRange 
                      ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1' 
                      : formData.ageRange && !errors.ageRange 
                      ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                      : 'border-gray-300 focus:ring-primary focus:ring-offset-1'
                  }`}
                  disabled={isLoading}
                  aria-describedby={errors.ageRange ? 'ageRange-error' : undefined}
                  aria-invalid={!!errors.ageRange}
                >
                  <option value="" disabled>연령대를 선택해주세요</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {formData.ageRange && !errors.ageRange && (
                  <div className="absolute right-10 top-3 sm:top-4 text-green-500" role="img" aria-label="연령대 선택 완료">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errors.ageRange && (
                  <div className="absolute right-10 top-3 sm:top-4 text-red-500" role="img" aria-label="연령대 오류">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.ageRange && (
                <p id="ageRange-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert" aria-live="polite">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.ageRange}</span>
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-3 sm:pt-4">
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-5 w-5 sm:h-6 sm:w-6 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 border-2 border-gray-300 rounded transition-colors touch-manipulation"
                  disabled={isLoading}
                  aria-describedby="terms-description"
                />
                <label htmlFor="terms" className="text-sm sm:text-base text-gray-600 leading-relaxed cursor-pointer">
                  <span id="terms-description">
                    <Link 
                      href="/legal/terms" 
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors touch-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="이용약관 (새 창에서 열기)"
                    >
                      이용약관
                    </Link>
                    {' '}및{' '}
                    <Link 
                      href="/legal/privacy" 
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded transition-colors touch-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="개인정보처리방침 (새 창에서 열기)"
                    >
                      개인정보처리방침
                    </Link>
                    에 동의합니다 *
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 py-3 sm:py-4 text-base sm:text-lg font-medium mt-6 sm:mt-8 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation"
              disabled={isLoading}
              aria-describedby="submit-help signup-keyboard-shortcuts"
              aria-label={isLoading ? '계정 생성 처리 중' : '새 계정 만들기'}
            >
              {isLoading ? (
                <div className="flex items-center justify-center" role="status" aria-label="계정을 생성하고 있습니다. 잠시만 기다려주세요.">
                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>계정 생성 중...</span>
                </div>
              ) : (
                <span>계정 만들기</span>
              )}
            </Button>
            
            <div className="sr-only">
              <p id="submit-help">
                입력한 이메일, 비밀번호, 닉네임, 연령대 정보로 새 계정을 만듭니다. 
                모든 필드를 올바르게 입력하고 이용약관에 동의한 후 제출하세요.
              </p>
              <p id="signup-keyboard-shortcuts">
                키보드 사용법: Tab으로 필드간 이동, Ctrl+Enter로 양식 제출, Escape로 포커스 해제.
                비밀번호 강도는 실시간으로 표시되며, 각 필드의 유효성 검사 결과를 음성으로 안내받을 수 있습니다.
              </p>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded font-medium transition-colors touch-manipulation"
                aria-label="로그인 페이지로 이동"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm sm:text-base text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded p-2 transition-colors touch-manipulation"
            aria-label="홈 페이지로 돌아가기"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        {/* Special Offer */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl p-4 sm:p-6 text-white shadow-xl border border-yellow-300" role="region" aria-labelledby="special-offer">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-3" role="img" aria-label="선물">🎁</div>
            <h3 id="special-offer" className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              신규 가입 특별 혜택!
            </h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">프리미엄 부스트 3일 무료</div>
              <div className="text-xs sm:text-sm opacity-90 leading-relaxed">
                ✨ 내 모임이 상단에 노출되어 더 많은 사람들이 볼 수 있어요
              </div>
              <div className="text-xs sm:text-sm opacity-90 mt-2">
                💰 일반 가격: 2,500원 → <span className="font-bold line-through">무료</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              지금 가입하면 자동으로 적용됩니다!
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 sm:p-6 border border-primary/20" role="region" aria-labelledby="benefits">
          <h3 id="benefits" className="text-base sm:text-lg font-semibold text-gray-900 mb-4 text-center">
            🎉 밋핀과 함께하면
          </h3>
          <ul className="space-y-3 sm:space-y-4" role="list">
            <li className="flex items-start" role="listitem">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0" role="img" aria-label="체크">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">내 주변 새로운 사람들과 만날 수 있어요</span>
            </li>
            <li className="flex items-start" role="listitem">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0" role="img" aria-label="체크">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">취미와 관심사를 공유하는 모임 참여</span>
            </li>
            <li className="flex items-start" role="listitem">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0" role="img" aria-label="체크">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">안전하고 검증된 사용자들과의 만남</span>
            </li>
            <li className="flex items-start" role="listitem">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0" role="img" aria-label="선물">
                <span className="text-xs sm:text-sm">🎁</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">신규 가입 시 프리미엄 부스트 3일 무료!</span>
            </li>
          </ul>
        </div>
        </div>
      </div>
    </>
  )
}