/* src/app/auth/reset-password/page.tsx */
// 비밀번호 재설정 페이지
//
// 흐름:
//   1. 사용자가 login 페이지에서 "비밀번호 찾기" 요청
//   2. Supabase가 재설정 이메일 발송 (redirectTo: /auth/callback?type=recovery)
//   3. 이메일 링크 클릭 → /auth/callback?type=recovery 도착
//   4. callback 페이지에서 세션 확인 후 이 페이지로 redirect
//   5. 이 페이지에서 새 비밀번호 입력 → supabase.auth.updateUser({ password })
//   6. 성공 → 로그인 페이지로 이동
//
// 처리하는 케이스:
//   - 정상: 새 비밀번호 입력 폼 표시
//   - 링크 만료: 안내 메시지 + 재요청 유도
//   - 직접 접근(세션 없음): 만료 화면과 동일하게 처리
//   - 변경 완료: 성공 화면 표시

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/config/brand'
import toast from 'react-hot-toast'

type PageStatus = 'loading' | 'ready' | 'expired' | 'success'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<PageStatus>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 세션 유효성 확인 (링크 만료 여부)
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // 세션 없음 = 링크 만료됐거나 직접 접근
        setStatus('expired')
      } else {
        setStatus('ready')
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다')
      return
    }
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        // updateUser 실패 = 세션 만료 가능성
        toast.error('비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.')
        setStatus('expired')
        return
      }

      setStatus('success')
      toast.success('비밀번호가 성공적으로 변경되었습니다!')
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── 로딩 ───────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-600">확인 중...</p>
        </div>
      </div>
    )
  }

  // ── 링크 만료 / 세션 없음 ──────────────────────
  if (status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">⏰</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">링크가 만료되었습니다</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600">
            비밀번호 재설정 링크는 <strong>1시간</strong> 동안만 유효합니다.
            <br />
            아래 버튼을 눌러 다시 요청해주세요.
          </p>
          <Link
            href="/auth/login"
            className="block w-full rounded-lg bg-emerald-500 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-600"
          >
            다시 요청하러 가기
          </Link>
        </div>
      </div>
    )
  }

  // ── 변경 완료 ───────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">비밀번호가 변경되었습니다</h1>
          <p className="mb-6 text-gray-600">새 비밀번호로 로그인해주세요.</p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
          >
            로그인하러 가기
          </Button>
        </div>
      </div>
    )
  }

  // ── 새 비밀번호 입력 폼 ─────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* 로고 + 제목 */}
        <div className="text-center">
          <div
            className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
            role="img"
            aria-label="밋핀 로고"
          >
            <span className="text-2xl">📍</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">새 비밀번호 설정</h1>
          <p className="text-gray-600">{brandMessages.appName} 계정의 비밀번호를 변경합니다</p>
        </div>

        {/* 입력 폼 */}
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* 새 비밀번호 */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                새 비밀번호{' '}
                <span className="text-xs text-gray-500">(6자 이상)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="새 비밀번호를 입력하세요"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                  aria-pressed={showPassword}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className={`w-full rounded-lg border px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:outline-none disabled:bg-gray-100 ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300 focus:ring-red-500'
                    : confirmPassword && password === confirmPassword
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-sm text-green-600">비밀번호가 일치합니다</p>
              )}
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword}
              className="mt-2 w-full bg-emerald-500 py-3 text-base font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  변경 중...
                </span>
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 transition-colors hover:text-emerald-600"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
