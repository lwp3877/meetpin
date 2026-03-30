/* src/app/auth/login/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/config/brand'
import { useAuth } from '@/lib/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { SocialLogin } from '@/components/auth/social-login'
import { SkipLink } from '@/components/ui/AccessibilityProvider'
import { useKeyboardNavigation, useKeyboardShortcuts } from '@/hooks/useKeyboardNavigation'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [formStatus, setFormStatus] = useState('')

  // 비밀번호 재설정 관련 상태
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // 키보드 네비게이션 설정
  const keyboardNav = useKeyboardNavigation({
    enableArrowKeys: false, // 폼에서는 Tab 키만 사용
    enableActivation: true,
    loop: true,
  })

  // 키보드 단축키 설정
  useKeyboardShortcuts({
    'ctrl+enter': () => {
      const form = document.querySelector('form')
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(submitEvent)
      }
    },
    escape: () => {
      // 필드 포커스 해제
      const activeElement = document.activeElement as HTMLElement
      if (activeElement) {
        activeElement.blur()
      }
    },
  })
  const router = useRouter()
  const { user, loading, signIn } = useAuth()

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/map')
    }
  }, [user, loading, router])

  // Real-time email validation with screen reader announcements
  const validateEmail = useCallback((email: string) => {
    if (!email) {
      setEmailError('')
      setFormStatus('')
      return false
    }
    if (!email.includes('@')) {
      const errorMsg = '이메일 주소에 @ 기호가 포함되어야 합니다'
      setEmailError(errorMsg)
      setFormStatus(`이메일 오류: ${errorMsg}`)
      return false
    }
    if (!email.includes('.') || email.indexOf('@') > email.lastIndexOf('.')) {
      const errorMsg = '올바른 이메일 형식이 아닙니다. 예: user@example.com'
      setEmailError(errorMsg)
      setFormStatus(`이메일 오류: ${errorMsg}`)
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const errorMsg = '올바른 이메일 주소를 입력해주세요. 예: user@example.com'
      setEmailError(errorMsg)
      setFormStatus(`이메일 오류: ${errorMsg}`)
      return false
    }
    setEmailError('')
    setFormStatus('이메일 주소가 올바릅니다')
    return true
  }, [])

  // Real-time password validation with screen reader announcements
  const validatePassword = useCallback((password: string) => {
    if (!password) {
      setPasswordError('')
      return false
    }
    if (password.length < 6) {
      const errorMsg = '비밀번호는 6자 이상이어야 합니다'
      setPasswordError(errorMsg)
      setFormStatus(`비밀번호 오류: ${errorMsg}`)
      return false
    }
    setPasswordError('')
    setFormStatus('비밀번호가 올바릅니다')
    return true
  }, [])

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (isEmailFocused || value) {
      validateEmail(value)
    }
  }

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (isPasswordFocused || value) {
      validatePassword(value)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 전체 유효성 검사
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!email || !password) {
      if (!email) {
        setEmailError('이메일을 입력해주세요')
        setFormStatus('이메일 필드가 비어있습니다. 이메일 주소를 입력해주세요.')
      }
      if (!password) {
        setPasswordError('비밀번호를 입력해주세요')
        setFormStatus('비밀번호 필드가 비어있습니다. 비밀번호를 입력해주세요.')
      }
      toast.error('모든 필드를 입력해주세요')
      return
    }

    if (!isEmailValid || !isPasswordValid) {
      setFormStatus('입력 정보에 오류가 있습니다. 각 필드의 오류 메시지를 확인하고 수정해주세요.')
      toast.error('입력 정보를 다시 확인해주세요')
      return
    }

    setIsLoading(true)
    setFormStatus('로그인을 처리하고 있습니다. 잠시만 기다려주세요.')

    try {
      const result = await signIn(email, password)

      if (result.success) {
        setFormStatus('로그인에 성공했습니다! 지도 페이지로 이동합니다.')
        toast.success('로그인 성공! 지도로 이동합니다 🚀')
        router.push('/map')
      } else {
        // 더 구체적인 에러 메시지
        let errorMessage = ''
        if (result.error?.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 잘못되었습니다. 다시 확인해주세요.'
          toast.error('이메일 또는 비밀번호가 잘못되었습니다')
        } else if (result.error?.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인하여 계정을 활성화해주세요.'
          toast.error('이메일 인증이 필요합니다. 메일을 확인해주세요')
        } else {
          errorMessage = result.error || '로그인에 실패했습니다. 다시 시도해주세요.'
          toast.error(result.error || '로그인에 실패했습니다')
        }
        setFormStatus(`로그인 오류: ${errorMessage}`)
      }
    } catch (error: unknown) {
      logger.error('Login error:', { error: error instanceof Error ? error.message : String(error) })
      const errorMessage =
        '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
      setFormStatus(`연결 오류: ${errorMessage}`)
      toast.error('네트워크 연결을 확인하고 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 재설정 이메일 발송
  // Supabase가 사용자 이메일로 재설정 링크를 보내줍니다.
  // 링크를 클릭하면 /auth/callback을 거쳐 비밀번호 변경 페이지로 이동합니다.
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      toast.error('이메일을 입력해주세요')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      toast.error('올바른 이메일 주소를 입력해주세요')
      return
    }

    setIsResetLoading(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        // 재설정 링크 클릭 후 돌아올 URL
        // 실제 도메인은 Supabase 대시보드 > Authentication > URL Configuration 에서도 설정 필요
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        logger.error('Password reset error:', { error: error.message })
        toast.error('재설정 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setResetSent(true)
      toast.success('재설정 이메일을 발송했습니다. 받은 편지함을 확인해주세요.')
    } catch (err) {
      logger.error('Password reset unexpected error:', { error: err instanceof Error ? err.message : String(err) })
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsResetLoading(false)
    }
  }

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SkipLink href="#main-content">주 콘텐츠로 바로 가기</SkipLink>
      <div
        className="flex min-h-screen items-start justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-3 sm:items-center sm:px-6 lg:px-8"
        role="main"
      >
        <div
          ref={keyboardNav.containerRef as React.RefObject<HTMLDivElement>}
          className="w-full max-w-md space-y-6 sm:max-w-lg"
          id="main-content"
          data-keyboard-container="true"
        >
          {/* Logo */}
          <div className="text-center">
            <div
              className="bg-primary mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:h-16 sm:w-16"
              role="img"
              aria-label="밋핀 로고"
            >
              <span className="text-2xl sm:text-3xl">📍</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {brandMessages.appName}에 로그인
            </h1>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              {brandMessages.tagline}
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

          {/* Login Form */}
          <div
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl backdrop-blur-sm sm:p-8"
            role="form"
            aria-labelledby="login-heading"
            aria-describedby="form-instructions"
          >
            <h2 id="login-heading" className="sr-only">
              로그인 폼
            </h2>
            <p id="form-instructions" className="sr-only">
              이메일과 비밀번호를 입력하여 로그인하세요. 필드간 이동은 Tab 키를, 양식 제출은
              Ctrl+Enter를 사용하세요. 각 필드는 실시간으로 유효성을 검사합니다.
            </p>

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
            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 bg-white px-2 text-sm text-gray-500">또는 이메일로 로그인</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form
              onSubmit={handleEmailLogin}
              className="space-y-5 sm:space-y-6"
              noValidate
              role="form"
              aria-label="이메일 로그인"
            >
              <div role="group" aria-labelledby="email-label">
                <label
                  id="email-label"
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  이메일 주소{' '}
                  <span className="text-red-500" aria-label="필수 입력">
                    *
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    data-testid="login-email"
                    type="email"
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 ${
                      emailError
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : email && !emailError
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    placeholder="your@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                    inputMode="email"
                    aria-describedby={`email-help ${emailError ? 'email-error' : ''}`.trim()}
                    aria-invalid={!!emailError}
                    aria-required="true"
                  />
                  <div id="email-help" className="sr-only">
                    이메일 주소를 입력하세요. 예: user@example.com 형식으로 입력해주세요.
                  </div>
                  {email && !emailError && (
                    <div
                      className="absolute top-3 right-3 text-green-500 sm:top-4"
                      role="img"
                      aria-label="유효한 이메일"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  {emailError && (
                    <div
                      className="absolute top-3 right-3 text-red-500 sm:top-4"
                      role="img"
                      aria-label="이메일 오류"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p
                    id="email-error"
                    className="mt-2 flex items-start text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg
                      className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              <div role="group" aria-labelledby="password-label">
                <label
                  id="password-label"
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  비밀번호{' '}
                  <span className="text-red-500" aria-label="필수 입력">
                    *
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    data-testid="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 pr-16 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 sm:pr-20 ${
                      passwordError
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : password && !passwordError
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-describedby={`password-help ${passwordError ? 'password-error' : ''}`.trim()}
                    aria-invalid={!!passwordError}
                    aria-required="true"
                  />
                  <div id="password-help" className="sr-only">
                    비밀번호를 입력하세요. 최소 6자 이상이어야 합니다. 비밀번호 표시 버튼을 사용하여
                    입력한 내용을 확인할 수 있습니다.
                  </div>
                  <div className="absolute top-3 right-3 flex items-center space-x-2 sm:top-4 sm:right-4">
                    {password && !passwordError && (
                      <div className="text-green-500" role="img" aria-label="유효한 비밀번호">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    {passwordError && (
                      <div className="text-red-500" role="img" aria-label="비밀번호 오류">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:ring-primary touch-manipulation rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus:ring-2 focus:ring-offset-1 focus:outline-none"
                      disabled={isLoading}
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                      aria-pressed={showPassword}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {showPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <p
                    id="password-error"
                    className="mt-2 flex items-start text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg
                      className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                data-testid="login-submit"
                className="bg-primary hover:bg-primary/90 focus:ring-primary w-full touch-manipulation rounded-lg py-3 text-base font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 sm:py-4 sm:text-lg"
                disabled={isLoading}
                aria-describedby="submit-help keyboard-shortcuts"
                aria-label={isLoading ? '로그인 처리 중' : '이메일로 로그인하기'}
              >
                {isLoading ? (
                  <div
                    className="flex items-center justify-center"
                    role="status"
                    aria-label="로그인 처리 중입니다. 잠시만 기다려주세요."
                  >
                    <svg className="mr-3 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  <span>이메일로 로그인</span>
                )}
              </Button>
            </form>

            <div className="sr-only">
              <p id="submit-help">
                이메일과 비밀번호로 로그인합니다. 모든 필드를 올바르게 입력한 후 로그인 버튼을
                클릭하거나 Ctrl+Enter를 누르세요.
              </p>
              <p id="keyboard-shortcuts">
                키보드 사용법: Tab으로 필드간 이동, Ctrl+Enter로 양식 제출, Escape로 포커스 해제
              </p>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 sm:text-base">
                계정이 없으신가요?{' '}
                <Link
                  href="/auth/signup"
                  className="text-primary focus:ring-primary touch-manipulation rounded font-medium transition-colors hover:underline focus:ring-2 focus:ring-offset-1 focus:outline-none"
                  aria-label="회원가입 페이지로 이동"
                >
                  회원가입
                </Link>
              </p>
            </div>

            {/* 비밀번호 재설정 */}
            <div className="mt-3">
              {!showForgotPassword ? (
                // 버튼: 클릭하면 재설정 폼이 열립니다
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setResetSent(false)
                      setResetEmail(email) // 이미 입력된 이메일이 있으면 자동 채움
                    }}
                    className="hover:text-primary focus:ring-primary touch-manipulation rounded p-1 text-sm text-gray-500 transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none sm:text-base"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              ) : resetSent ? (
                // 발송 완료 메시지
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-medium">이메일을 발송했습니다!</p>
                  <p className="mt-1 text-green-700">
                    <strong>{resetEmail}</strong>로 비밀번호 재설정 링크를 보냈습니다.
                    받은 편지함(스팸함도 확인)을 확인해주세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetSent(false) }}
                    className="mt-3 text-sm font-medium text-green-700 underline"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              ) : (
                // 이메일 입력 폼
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.
                  </p>
                  <form onSubmit={handleForgotPassword} className="space-y-3">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      disabled={isResetLoading}
                      autoComplete="email"
                      aria-label="비밀번호 재설정용 이메일"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isResetLoading}
                        className="bg-primary hover:bg-primary/90 flex-1 py-2 text-sm"
                      >
                        {isResetLoading ? '전송 중...' : '재설정 링크 발송'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={isResetLoading}
                        className="py-2 text-sm"
                      >
                        취소
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="hover:text-primary focus:ring-primary inline-flex touch-manipulation items-center rounded p-2 text-sm text-gray-500 transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none sm:text-base"
              aria-label="홈 페이지로 돌아가기"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              홈으로 돌아가기
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}
