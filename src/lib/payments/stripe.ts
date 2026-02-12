/* src/lib/payments/stripe.ts */
import Stripe from 'stripe'
import { logger } from '@/lib/observability/logger'
import { flags, config } from '@/lib/config/flags'

// Stripe 초기화 (서버 전용)
// STRIPE_SECRET_KEY 미설정 시 더미 키로 초기화 — 모듈 import 크래시 방지
// 실제 API 호출 시 Stripe가 인증 에러를 반환하지만, 부스트 UI가 숨겨져 있으므로 도달 불가
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_not_configured', {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// 부스트 상품 정의
export type BoostDays = '1' | '3' | '7'

export interface BoostProduct {
  days: BoostDays
  price: number // 원 단위
  priceId?: string // Stripe Price ID (설정된 경우)
  name: string
  description: string
}

export const boostProducts: Record<BoostDays, BoostProduct> = {
  '1': {
    days: '1',
    price: config.boostPrices['1'],
    priceId: config.stripePriceIds['1'] || undefined,
    name: '1일 부스트',
    description: '방을 1일간 상단에 고정 노출합니다',
  },
  '3': {
    days: '3',
    price: config.boostPrices['3'],
    priceId: config.stripePriceIds['3'] || undefined,
    name: '3일 부스트',
    description: '방을 3일간 상단에 고정 노출합니다',
  },
  '7': {
    days: '7',
    price: config.boostPrices['7'],
    priceId: config.stripePriceIds['7'] || undefined,
    name: '7일 부스트',
    description: '방을 7일간 상단에 고정 노출합니다',
  },
}

/**
 * Stripe Checkout 세션 생성
 */
export async function createCheckoutSession(
  roomId: string,
  days: BoostDays,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const product = boostProducts[days]

  if (!flags.stripeCheckoutEnabled) {
    throw new Error('Stripe Checkout이 비활성화되어 있습니다')
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    customer_email: undefined, // 필요시 사용자 이메일 추가
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'boost',
      room_id: roomId,
      user_id: userId,
      days: days,
    },
  }

  // Price ID가 설정된 경우 사용, 아니면 동적으로 생성
  if (product.priceId) {
    sessionParams.line_items = [
      {
        price: product.priceId,
        quantity: 1,
      },
    ]
  } else {
    sessionParams.line_items = [
      {
        price_data: {
          currency: 'krw',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ]
  }

  return await stripe.checkout.sessions.create(sessionParams)
}

/**
 * Payment Link 생성 (수동 처리용)
 */
export async function createPaymentLink(
  days: BoostDays,
  roomId: string
): Promise<Stripe.PaymentLink> {
  const product = boostProducts[days]

  // 먼저 상품 생성
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: `${product.description} (방 ID: ${roomId})`,
    metadata: {
      type: 'boost',
      days: days,
      room_id: roomId,
    },
  })

  // 가격 생성
  const price = await stripe.prices.create({
    currency: 'krw',
    unit_amount: product.price,
    product: stripeProduct.id,
  })

  // Payment Link 생성
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      type: 'boost',
      room_id: roomId,
      days: days,
    },
  })

  return paymentLink
}

/**
 * 웹훅 서명 검증
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET이 설정되지 않았습니다')
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error: unknown) {
    throw new Error(`웹훅 서명 검증 실패: ${(error as Error).message}`)
  }
}

/**
 * 부스트 만료 시간 계산
 */
export function calculateBoostExpiry(days: BoostDays): Date {
  const now = new Date()
  const daysNumber = parseInt(days)
  return new Date(now.getTime() + daysNumber * 24 * 60 * 60 * 1000)
}

/**
 * Checkout Session에서 메타데이터 추출
 */
export function extractSessionMetadata(session: Stripe.Checkout.Session): {
  type: string
  roomId: string
  userId: string
  days: BoostDays
} | null {
  if (!session.metadata) {
    return null
  }

  const { type, room_id, user_id, days } = session.metadata

  if (type !== 'boost' || !room_id || !user_id || !days) {
    return null
  }

  if (!['1', '3', '7'].includes(days)) {
    return null
  }

  return {
    type,
    roomId: room_id,
    userId: user_id,
    days: days as BoostDays,
  }
}

/**
 * 웹훅 이벤트 처리
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<{
  type: string
  roomId?: string
  userId?: string
  days?: BoostDays
  success: boolean
  error?: string
}> {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = extractSessionMetadata(session)

        if (!metadata) {
          return {
            type: event.type,
            success: false,
            error: '메타데이터를 찾을 수 없습니다',
          }
        }

        // DB 업데이트는 웹훅 라우트에서 처리하도록 데이터만 반환
        return {
          type: event.type,
          roomId: metadata.roomId,
          userId: metadata.userId,
          days: metadata.days,
          success: true,
        }
      }

      case 'payment_intent.succeeded': {
        // Payment Intent에서 추가 처리가 필요한 경우
        return {
          type: event.type,
          success: true,
        }
      }

      case 'payment_intent.payment_failed': {
        return {
          type: event.type,
          success: false,
          error: '결제 실패',
        }
      }

      default:
        return {
          type: event.type,
          success: true, // 처리하지 않는 이벤트는 성공으로 표시
        }
    }
  } catch (error: unknown) {
    return {
      type: event.type,
      success: false,
      error: (error as Error).message,
    }
  }
}

/**
 * 고객 생성/조회
 */
export async function findOrCreateCustomer(
  email: string,
  name?: string,
  userId?: string
): Promise<Stripe.Customer> {
  // 기존 고객 검색
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // 새 고객 생성
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId || '',
    },
  })

  return customer
}

/**
 * 결제 의도 생성 (고급 사용)
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'krw',
  metadata?: Stripe.MetadataParam
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

/**
 * 환불 처리
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  })
}

/**
 * 결제 정보 조회
 */
export async function getPaymentDetails(sessionId: string): Promise<{
  session: Stripe.Checkout.Session
  paymentIntent?: Stripe.PaymentIntent
}> {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  let paymentIntent: Stripe.PaymentIntent | undefined
  if (session.payment_intent && typeof session.payment_intent === 'string') {
    paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
  }

  return { session, paymentIntent }
}

// 부스트 결제 세션 생성 (API 호환성)
export async function createBoostCheckoutSession({
  roomId,
  days,
  userId,
  successUrl,
  cancelUrl,
}: {
  roomId: string
  days: '1' | '3' | '7'
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const product = boostProducts[days]

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                type: 'boost',
                room_id: roomId,
                days: days,
              },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'boost',
        room_id: roomId,
        user_id: userId,
        days: days,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30분 후 만료
    })

    return session
  } catch (error) {
    logger.error('Stripe checkout session creation failed:', { error: error instanceof Error ? error.message : String(error) })
    throw new Error('결제 세션 생성에 실패했습니다')
  }
}

