/**
 * src/hooks/useSignupForm.ts — 회원가입 폼 로직
 *
 * 이 파일은 회원가입 화면의 모든 상태와 동작을 담당합니다.
 * JSX(화면)와 로직(동작)을 분리하여 signup/page.tsx를 읽기 쉽게 유지합니다.
 *
 * 포함 내용:
 *  - 폼 입력값 상태 (이메일, 비밀번호, 닉네임, 연령대)
 *  - 동의 항목 상태 (이용약관, 개인정보, 서비스, 마케팅)
 *  - 실시간 입력 검증
 *  - 비밀번호 강도 측정
 *  - 회원가입 제출 처리
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import toast from 'react-hot-toast'

// 연령대 선택 옵션
export const AGE_RANGES = [
  { value: '20s_early', label: '20대 초반 (20~24세)' },
  { value: '20s_late', label: '20대 후반 (25~29세)' },
  { value: '30s_early', label: '30대 초반 (30~34세)' },
  { value: '30s_late', label: '30대 후반 (35~39세)' },
  { value: '40s', label: '40대 (40~49세)' },
  { value: '50s+', label: '50세 이상' },
] as const

// 비밀번호 강도 타입
export interface PasswordStrength {
  score: number
  label: string
  color: string
  bgColor: string
  barColor: string
}

// 폼 에러 타입
export interface FormErrors {
  email: string
  password: string
  confirmPassword: string
  nickname: string
  ageRange: string
}

export function useSignupForm() {
  const router = useRouter()
  const { signUp } = useAuth()

  // 입력값 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    ageRange: '',
  })

  // 동의 항목 상태
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    service: false,
    marketing: false,
  })

  // UI 상태
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formStatus, setFormStatus] = useState('') // 스크린 리더용 상태 안내
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    bgColor: '',
    barColor: '',
  })
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    ageRange: '',
  })

  // ───────────────────────────────────────────────
  // 검증 함수들 (각 필드마다 독립적으로 사용 가능)
  // ───────────────────────────────────────────────

  const validateEmail = useCallback((email: string): string => {
    if (!email) {
      setFormStatus('')
      return ''
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const msg = '올바른 이메일 주소를 입력해주세요. 예: user@example.com'
      setFormStatus(`이메일 오류: ${msg}`)
      return msg
    }
    setFormStatus('이메일 주소가 올바릅니다')
    return ''
  }, [])

  const validatePassword = useCallback((password: string): string => {
    if (!password) return ''
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다'
    if (password.length > 50) return '비밀번호는 50자 이하여야 합니다'
    return ''
  }, [])

  const validateConfirmPassword = useCallback(
    (confirmPassword: string, password: string): string => {
      if (!confirmPassword) return ''
      if (confirmPassword !== password) return '비밀번호가 일치하지 않습니다'
      return ''
    },
    []
  )

  const validateNickname = useCallback((nickname: string): string => {
    if (!nickname) return ''
    if (nickname.length < 2) return '닉네임은 2자 이상이어야 합니다'
    if (nickname.length > 20) return '닉네임은 20자 이하여야 합니다'
    if (!/^[a-zA-Z0-9가-힣]*$/.test(nickname))
      return '닉네임은 한글, 영문, 숫자만 사용 가능합니다'
    return ''
  }, [])

  // 비밀번호 강도 측정 (점수: 0~7)
  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '', bgColor: '', barColor: '' }

    let score = 0
    if (password.length >= 8) score += 2
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2

    if (score <= 2)
      return { score, label: '약함', color: 'text-red-500', bgColor: 'bg-red-100', barColor: 'bg-red-500' }
    if (score <= 4)
      return { score, label: '보통', color: 'text-yellow-500', bgColor: 'bg-yellow-100', barColor: 'bg-yellow-500' }
    if (score <= 6)
      return { score, label: '양호', color: 'text-blue-500', bgColor: 'bg-blue-100', barColor: 'bg-blue-500' }
    return { score, label: '매우 강함', color: 'text-green-500', bgColor: 'bg-green-100', barColor: 'bg-green-500' }
  }, [])

  // ───────────────────────────────────────────────
  // 이벤트 핸들러
  // ───────────────────────────────────────────────

  // 입력값 변경 + 실시간 검증
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    let error = ''
    switch (field) {
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        setPasswordStrength(getPasswordStrength(value))
        // 비밀번호 변경 시 비밀번호 확인도 재검증
        if (formData.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
          }))
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

  // 전체 폼 검증 (제출 전)
  const validateAllFields = (): boolean => {
    const { email, password, confirmPassword, nickname, ageRange } = formData
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password)
    const nicknameError = validateNickname(nickname)
    const ageRangeError = !ageRange ? '연령대를 선택해주세요' : ''

    setErrors({ email: emailError, password: passwordError, confirmPassword: confirmPasswordError, nickname: nicknameError, ageRange: ageRangeError })

    if (!email || !password || !confirmPassword || !nickname || !ageRange) {
      toast.error('모든 필드를 입력해주세요')
      return false
    }
    if (emailError || passwordError || confirmPasswordError || nicknameError || ageRangeError) {
      toast.error('입력 정보를 다시 확인해주세요')
      return false
    }
    if (!consents.terms) { toast.error('이용약관에 동의해주세요'); return false }
    if (!consents.privacy) { toast.error('개인정보처리방침에 동의해주세요'); return false }
    if (!consents.service) { toast.error('서비스 이용 약관에 동의해주세요'); return false }

    return true
  }

  // 회원가입 제출
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAllFields()) return

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
    } catch (error: unknown) {
      toast.error((error as Error).message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // 상태
    formData,
    consents,
    setConsents,
    isLoading,
    showPassword,
    setShowPassword,
    passwordStrength,
    errors,
    formStatus,
    // 핸들러
    handleInputChange,
    handleEmailSignUp,
  }
}
