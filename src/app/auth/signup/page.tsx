/* src/app/auth/signup/page.tsx */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/config/brand'
import { useAuth } from '@/lib/useAuth'
import { SocialLogin } from '@/components/auth/social-login'
import { SkipLink } from '@/components/ui/AccessibilityProvider'
import { useKeyboardNavigation, useKeyboardShortcuts } from '@/hooks/useKeyboardNavigation'
import { useSignupForm, AGE_RANGES } from '@/hooks/useSignupForm'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const {
    formData,
    consents,
    setConsents,
    isLoading,
    showPassword,
    setShowPassword,
    passwordStrength,
    errors,
    formStatus,
    handleInputChange,
    handleEmailSignUp,
  } = useSignupForm()

  // Keyboard navigation setup
  const keyboardNav = useKeyboardNavigation({
    enableArrowKeys: false, // 폼에서는 Tab 키만 사용
    enableActivation: true,
    loop: true,
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
    escape: () => {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement) {
        activeElement.blur()
      }
    },
  })

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/map')
    }
  }, [user, loading, router])

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
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-6 sm:px-6 lg:px-8"
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
              className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:h-20 sm:w-20"
              role="img"
              aria-label="밋핀 로고"
            >
              <span className="text-2xl sm:text-3xl">📍</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {brandMessages.appName} 시작하기
            </h1>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
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
          <div
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl backdrop-blur-sm sm:p-8"
            role="form"
            aria-labelledby="signup-heading"
            aria-describedby="signup-instructions"
          >
            <h2 id="signup-heading" className="sr-only">
              회원가입 폼
            </h2>
            <p id="signup-instructions" className="sr-only">
              회원가입을 위한 정보를 입력하세요. 이메일, 비밀번호, 비밀번호 확인, 닉네임, 연령대가
              필요합니다. Tab 키로 필드간 이동하고, Ctrl+Enter로 양식을 제출할 수 있습니다. 각
              필드는 실시간으로 유효성을 검사합니다.
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
            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 bg-white px-2 text-sm text-gray-500">또는 이메일로 가입</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <form
              onSubmit={handleEmailSignUp}
              className="space-y-5 sm:space-y-6"
              noValidate
              role="form"
              aria-label="이메일 회원가입"
            >
              {/* Email */}
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
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : formData.email && !errors.email
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
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
                    회원가입에 사용할 이메일 주소를 입력하세요. 예: user@example.com 형식으로
                    입력해주세요.
                  </div>
                  {formData.email && !errors.email && (
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
                  {errors.email && (
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
                {errors.email && (
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
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  비밀번호 * <span className="text-xs text-gray-500">(6자 이상)</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 pr-16 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 sm:pr-20 ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : formData.password && !errors.password
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-describedby={
                      `${errors.password ? 'password-error' : ''} ${formData.password ? 'password-strength' : ''}`.trim() ||
                      undefined
                    }
                    aria-invalid={!!errors.password}
                  />
                  <div className="absolute top-3 right-3 flex items-center space-x-2 sm:top-4 sm:right-4">
                    {formData.password && !errors.password && (
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
                    {errors.password && (
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div
                    className="mt-3"
                    id="password-strength"
                    role="region"
                    aria-label="비밀번호 강도"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        비밀번호 강도:
                      </span>
                      <span
                        className={`text-xs font-semibold sm:text-sm ${passwordStrength.color}`}
                        aria-live="polite"
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 sm:h-3">
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
                    <div className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                      강한 비밀번호 조건: 8자 이상, 대소문자, 숫자, 특수문자 포함
                    </div>
                  </div>
                )}

                {errors.password && (
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
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  비밀번호 확인 *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : formData.confirmPassword && !errors.confirmPassword
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {formData.confirmPassword && !errors.confirmPassword && (
                    <div
                      className="absolute top-3 right-3 text-green-500 sm:top-4"
                      role="img"
                      aria-label="일치하는 비밀번호"
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
                  {errors.confirmPassword && (
                    <div
                      className="absolute top-3 right-3 text-red-500 sm:top-4"
                      role="img"
                      aria-label="비밀번호 불일치"
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
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
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
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Nickname */}
              <div>
                <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-gray-700">
                  닉네임 * <span className="text-xs text-gray-500">(2~20자)</span>
                </label>
                <div className="relative">
                  <input
                    id="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={e => handleInputChange('nickname', e.target.value)}
                    required
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 ${
                      errors.nickname
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : formData.nickname && !errors.nickname
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    placeholder="멋진 닉네임"
                    disabled={isLoading}
                    maxLength={20}
                    autoComplete="nickname"
                    aria-describedby={`nickname-counter ${errors.nickname ? 'nickname-error' : ''}`.trim()}
                    aria-invalid={!!errors.nickname}
                  />
                  {formData.nickname && !errors.nickname && (
                    <div
                      className="absolute top-3 right-3 text-green-500 sm:top-4"
                      role="img"
                      aria-label="유효한 닉네임"
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
                  {errors.nickname && (
                    <div
                      className="absolute top-3 right-3 text-red-500 sm:top-4"
                      role="img"
                      aria-label="닉네임 오류"
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
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    {errors.nickname && (
                      <p
                        id="nickname-error"
                        className="flex items-start text-sm text-red-600"
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
                        <span>{errors.nickname}</span>
                      </p>
                    )}
                  </div>
                  <span
                    id="nickname-counter"
                    className={`text-xs sm:text-sm ${
                      formData.nickname.length > 18
                        ? 'font-medium text-orange-500'
                        : 'text-gray-500'
                    }`}
                    aria-label={`닉네임 글자 수: ${formData.nickname.length}/20`}
                  >
                    {formData.nickname.length}/20
                  </span>
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label htmlFor="ageRange" className="mb-1 block text-sm font-medium text-gray-700">
                  연령대 *
                </label>
                <div className="relative">
                  <select
                    id="ageRange"
                    value={formData.ageRange}
                    onChange={e => handleInputChange('ageRange', e.target.value)}
                    required
                    className={`w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 py-3 text-base transition-all duration-200 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:py-4 ${
                      errors.ageRange
                        ? 'border-red-300 focus:ring-red-200 focus:ring-offset-1'
                        : formData.ageRange && !errors.ageRange
                          ? 'border-green-300 focus:ring-green-200 focus:ring-offset-1'
                          : 'focus:ring-primary border-gray-300 focus:ring-offset-1'
                    }`}
                    disabled={isLoading}
                    aria-describedby={errors.ageRange ? 'ageRange-error' : undefined}
                    aria-invalid={!!errors.ageRange}
                  >
                    <option value="" disabled>
                      연령대를 선택해주세요
                    </option>
                    {AGE_RANGES.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {formData.ageRange && !errors.ageRange && (
                    <div
                      className="absolute top-3 right-10 text-green-500 sm:top-4"
                      role="img"
                      aria-label="연령대 선택 완료"
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
                  {errors.ageRange && (
                    <div
                      className="absolute top-3 right-10 text-red-500 sm:top-4"
                      role="img"
                      aria-label="연령대 오류"
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
                {errors.ageRange && (
                  <p
                    id="ageRange-error"
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
                    <span>{errors.ageRange}</span>
                  </p>
                )}
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="mb-3 border-b border-gray-300 pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">서비스 이용 동의</h3>
                </div>

                {/* Terms of Service */}
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={consents.terms}
                    onChange={e => setConsents(prev => ({ ...prev, terms: e.target.checked }))}
                    className="text-primary focus:ring-primary mt-0.5 h-5 w-5 touch-manipulation rounded border-2 border-gray-300 transition-colors focus:ring-2 focus:ring-offset-1 sm:h-5 sm:w-5"
                    disabled={isLoading}
                    aria-required="true"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    <Link
                      href="/legal/terms"
                      className="text-primary font-medium underline transition-colors hover:text-primary/80"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      이용약관
                    </Link>
                    에 동의합니다{' '}
                    <span className="text-red-500" aria-label="필수">
                      (필수)
                    </span>
                  </label>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start space-x-3">
                  <input
                    id="privacy"
                    type="checkbox"
                    checked={consents.privacy}
                    onChange={e => setConsents(prev => ({ ...prev, privacy: e.target.checked }))}
                    className="text-primary focus:ring-primary mt-0.5 h-5 w-5 touch-manipulation rounded border-2 border-gray-300 transition-colors focus:ring-2 focus:ring-offset-1 sm:h-5 sm:w-5"
                    disabled={isLoading}
                    aria-required="true"
                  />
                  <label htmlFor="privacy" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    <Link
                      href="/legal/privacy"
                      className="text-primary font-medium underline transition-colors hover:text-primary/80"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      개인정보처리방침
                    </Link>
                    에 동의합니다{' '}
                    <span className="text-red-500" aria-label="필수">
                      (필수)
                    </span>
                  </label>
                </div>

                {/* Service Agreement */}
                <div className="flex items-start space-x-3">
                  <input
                    id="service"
                    type="checkbox"
                    checked={consents.service}
                    onChange={e => setConsents(prev => ({ ...prev, service: e.target.checked }))}
                    className="text-primary focus:ring-primary mt-0.5 h-5 w-5 touch-manipulation rounded border-2 border-gray-300 transition-colors focus:ring-2 focus:ring-offset-1 sm:h-5 sm:w-5"
                    disabled={isLoading}
                    aria-required="true"
                  />
                  <label htmlFor="service" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    서비스 이용 중 발생할 수 있는 일시적 장애 및 데이터 변경에 동의합니다{' '}
                    <span className="text-red-500" aria-label="필수">
                      (필수)
                    </span>
                  </label>
                </div>

                {/* Marketing (Optional) */}
                <div className="flex items-start space-x-3 border-t border-gray-200 pt-3">
                  <input
                    id="marketing"
                    type="checkbox"
                    checked={consents.marketing}
                    onChange={e => setConsents(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="text-primary focus:ring-primary mt-0.5 h-5 w-5 touch-manipulation rounded border-2 border-gray-300 transition-colors focus:ring-2 focus:ring-offset-1 sm:h-5 sm:w-5"
                    disabled={isLoading}
                  />
                  <label htmlFor="marketing" className="cursor-pointer text-sm leading-relaxed text-gray-600">
                    이벤트 및 서비스 정보 수신에 동의합니다{' '}
                    <span className="text-gray-400" aria-label="선택">
                      (선택)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 focus:ring-primary mt-6 w-full touch-manipulation rounded-lg py-3 text-base font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 sm:mt-8 sm:py-4 sm:text-lg"
                disabled={isLoading}
                aria-describedby="submit-help signup-keyboard-shortcuts"
                aria-label={isLoading ? '계정 생성 처리 중' : '새 계정 만들기'}
              >
                {isLoading ? (
                  <div
                    className="flex items-center justify-center"
                    role="status"
                    aria-label="계정을 생성하고 있습니다. 잠시만 기다려주세요."
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
                    <span>계정 생성 중...</span>
                  </div>
                ) : (
                  <span>계정 만들기</span>
                )}
              </Button>

              <div className="sr-only">
                <p id="submit-help">
                  입력한 이메일, 비밀번호, 닉네임, 연령대 정보로 새 계정을 만듭니다. 모든 필드를
                  올바르게 입력하고 이용약관에 동의한 후 제출하세요.
                </p>
                <p id="signup-keyboard-shortcuts">
                  키보드 사용법: Tab으로 필드간 이동, Ctrl+Enter로 양식 제출, Escape로 포커스 해제.
                  비밀번호 강도는 실시간으로 표시되며, 각 필드의 유효성 검사 결과를 음성으로
                  안내받을 수 있습니다.
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 sm:text-base">
                이미 계정이 있으신가요?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary focus:ring-primary touch-manipulation rounded font-medium transition-colors hover:underline focus:ring-2 focus:ring-offset-1 focus:outline-none"
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

          {/* Welcome Message - 허위 혜택 정보 제거 */}
          <div
            className="rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 p-4 text-white shadow-xl sm:p-6"
            role="region"
            aria-labelledby="welcome-message"
          >
            <div className="text-center">
              <div className="mb-3 text-3xl sm:text-4xl" role="img" aria-label="환영">
                👋
              </div>
              <h3 id="welcome-message" className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">
                밋핀에 오신 것을 환영합니다!
              </h3>
              <div className="mb-3 rounded-lg bg-white/20 p-3 backdrop-blur-sm sm:mb-4 sm:p-4">
                <div className="mb-2 text-lg font-bold sm:text-xl">지도 기반 모임 서비스</div>
                <div className="text-xs leading-relaxed opacity-90 sm:text-sm">
                  ✨ 내 주변 사람들과 안전하고 즐거운 만남을 시작해보세요
                </div>
                <div className="mt-2 text-xs opacity-90 sm:text-sm">
                  📍 위치 기반 매칭 • 💬 실시간 채팅 • 🛡️ 안전한 환경
                </div>
              </div>
              <div className="text-xs leading-relaxed sm:text-sm">
                회원가입 후 바로 이용 가능합니다!
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div
            className="from-primary/10 to-accent/10 border-primary/20 rounded-xl border bg-gradient-to-r p-4 sm:p-6"
            role="region"
            aria-labelledby="benefits"
          >
            <h3
              id="benefits"
              className="mb-4 text-center text-base font-semibold text-gray-900 sm:text-lg"
            >
              🎉 밋핀과 함께하면
            </h3>
            <ul className="space-y-3 sm:space-y-4" role="list">
              <li className="flex items-start" role="listitem">
                <div
                  className="bg-primary mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7"
                  role="img"
                  aria-label="체크"
                >
                  <svg
                    className="h-3 w-3 text-white sm:h-4 sm:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  내 주변 새로운 사람들과 만날 수 있어요
                </span>
              </li>
              <li className="flex items-start" role="listitem">
                <div
                  className="bg-primary mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7"
                  role="img"
                  aria-label="체크"
                >
                  <svg
                    className="h-3 w-3 text-white sm:h-4 sm:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  취미와 관심사를 공유하는 모임 참여
                </span>
              </li>
              <li className="flex items-start" role="listitem">
                <div
                  className="bg-primary mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7"
                  role="img"
                  aria-label="체크"
                >
                  <svg
                    className="h-3 w-3 text-white sm:h-4 sm:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  안전하고 검증된 사용자들과의 만남
                </span>
              </li>
              <li className="flex items-start" role="listitem">
                <div
                  className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 sm:h-7 sm:w-7"
                  role="img"
                  aria-label="선물"
                >
                  <span className="text-xs sm:text-sm">🎁</span>
                </div>
                <span className="text-xs leading-relaxed font-medium text-gray-700 sm:text-sm">
                  모든 기능 100% 무료!
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
