/* src/lib/stripe.ts */
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { logger } from '@/lib/observability/logger'

// Stripe 인스턴스를 전역적으로 관리
let stripePromise: Promise<Stripe | null>

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      logger.warn('Stripe publishable key not found')
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

// 부스트 플랜 정보 (서버 API와 일치)
export const BOOST_PLANS = {
  '1': {
    id: '1',
    name: '1일 부스트',
    description: '24시간 동안 상단 노출',
    price: 1000,
    duration: 1,
    unit: 'day',
    features: ['24시간 상단 노출', '더 많은 참가자 확보', '즉시 활성화'],
    popular: false,
  },
  '3': {
    id: '3',
    name: '3일 부스트',
    description: '3일 동안 상단 노출',
    price: 2500,
    duration: 3,
    unit: 'day',
    features: ['3일 연속 상단 노출', '최대 효과를 위한 권장 옵션', '더 오랜 기간 노출'],
    popular: true,
  },
  '7': {
    id: '7',
    name: '7일 부스트',
    description: '일주일 동안 상단 노출',
    price: 5000,
    duration: 7,
    unit: 'day',
    features: ['일주일 연속 상단 노출', '장기간 모집을 위한 최적 선택', '가장 경제적인 옵션'],
    popular: false,
  },
} as const

export type BoostPlanId = keyof typeof BOOST_PLANS

// 결제 세션 생성 데이터
export interface CreateCheckoutSessionData {
  roomId: string
  planId: BoostPlanId
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
}

// 결제 상태
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'canceled' | 'failed'

// 부스트 상태 확인
export interface BoostStatus {
  isActive: boolean
  expiresAt?: string
  planId?: BoostPlanId
  remainingHours?: number
}

// 가격 포맷팅 (원화)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount)
}

// 부스트 만료까지 남은 시간 계산
export function getRemainingTime(expiresAt: string): {
  hours: number
  minutes: number
  isExpired: boolean
} {
  const now = new Date().getTime()
  const expires = new Date(expiresAt).getTime()
  const diff = expires - now

  if (diff <= 0) {
    return { hours: 0, minutes: 0, isExpired: true }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { hours, minutes, isExpired: false }
}

// 부스트 상태 텍스트 생성
export function getBoostStatusText(status: BoostStatus): string {
  if (!status.isActive) {
    return '부스트 비활성화'
  }

  if (!status.expiresAt) {
    return '부스트 활성화'
  }

  const { hours, minutes, isExpired } = getRemainingTime(status.expiresAt)

  if (isExpired) {
    return '부스트 만료됨'
  }

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}일 ${hours % 24}시간 남음`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`
  } else {
    return `${minutes}분 남음`
  }
}

// Stripe Checkout 세션 생성
export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<{
  success: boolean
  sessionId?: string
  url?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.message || '결제 세션 생성에 실패했습니다',
      }
    }

    return {
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    }
  } catch (error: unknown) {
    logger.error('Create checkout session error:', { error: error instanceof Error ? error.message : String(error) })
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다',
    }
  }
}

// Stripe Checkout으로 리다이렉트
export async function redirectToCheckout(sessionId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const stripe = await getStripe()

    if (!stripe) {
      return {
        success: false,
        error: 'Stripe을 로드할 수 없습니다',
      }
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      return {
        success: false,
        error: (error as any).message,
      }
    }

    return { success: true }
  } catch (error: unknown) {
    logger.error('Redirect to checkout error:', { error: error instanceof Error ? error.message : String(error) })
    return {
      success: false,
      error: '결제 페이지로 이동하는데 실패했습니다',
    }
  }
}

// 부스트 결제 완료 처리
export async function processBoostPayment(
  roomId: string,
  planId: BoostPlanId
): Promise<{
  success: boolean
  error?: string
  sessionId?: string
  url?: string
}> {
  try {
    // API 엔드포인트 호출
    const response = await fetch('/api/payments/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_id: roomId,
        days: planId,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.message || '결제 세션 생성에 실패했습니다',
      }
    }

    // Stripe Checkout으로 리다이렉트
    if (result.data?.checkout_url) {
      window.location.href = result.data.checkout_url
    }

    return {
      success: true,
      sessionId: result.data?.session_id,
      url: result.data?.checkout_url,
    }
  } catch (error: unknown) {
    logger.error('Process boost payment error:', { error: error instanceof Error ? error.message : String(error) })
    return {
      success: false,
      error: '결제 처리 중 오류가 발생했습니다',
    }
  }
}

// 개발 모드에서 사용할 모의 결제 처리
export async function mockPaymentProcess(
  _roomId: string,
  _planId: BoostPlanId
): Promise<{
  success: boolean
  error?: string
}> {
  return new Promise(resolve => {
    setTimeout(() => {
      // 90% 확률로 성공
      if (Math.random() > 0.1) {
        resolve({
          success: true,
        })
      } else {
        resolve({
          success: false,
          error: '결제가 취소되었습니다',
        })
      }
    }, 2000) // 2초 지연으로 실제 결제 과정 모방
  })
}
