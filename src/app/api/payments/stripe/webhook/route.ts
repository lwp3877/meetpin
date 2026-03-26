import { NextRequest } from 'next/server'
import {
  verifyWebhookSignature,
  handleWebhookEvent,
  calculateBoostExpiry,
} from '@/lib/payments/stripe'
import { createSuccessResponse, createErrorResponse } from '@/lib/api'
import { createClient } from '@supabase/supabase-js'
import { isDevelopmentMode } from '@/lib/config/flags'
import { logger } from '@/lib/observability/logger'

// POST /api/payments/stripe/webhook - Stripe 웹훅 처리
export async function POST(request: NextRequest) {
  // STRIPE_WEBHOOK_SECRET 없이는 서버 자체를 실행할 수 없도록 차단.
  // 개발 환경이라도 예외 없음 — 서명 위조 방지가 목적.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.error('CRITICAL: STRIPE_WEBHOOK_SECRET 환경변수가 설정되지 않았습니다')
    return createErrorResponse(
      '웹훅 설정 오류: STRIPE_WEBHOOK_SECRET가 없습니다. 관리자에게 문의하세요.',
      500
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return createErrorResponse('Stripe 서명 헤더(stripe-signature)가 누락되었습니다', 400)
  }

  try {
    const payload = await request.text()

    // 개발/프로덕션 구분 없이 항상 서명 검증
    const event: unknown = verifyWebhookSignature(payload, signature)

    logger.info('Received Stripe webhook', { eventType: (event as Record<string, unknown>).type })

    // 이벤트 처리
    const result = await handleWebhookEvent(event as any)

    // checkout.session.completed 이벤트의 경우 DB 업데이트
    if (
      result.success &&
      result.type === 'checkout.session.completed' &&
      result.roomId &&
      result.days
    ) {
      if (isDevelopmentMode) {
        // 개발 모드: 서명 검증은 완료되었고, DB 업데이트만 시뮬레이션
        const boostExpiry = calculateBoostExpiry(result.days)
        logger.info('[Dev] Room boost simulated (DB 업데이트 생략)', {
          roomId: result.roomId,
          days: result.days,
          boostUntil: boostExpiry.toISOString(),
        })
      } else {
        try {
          // 환경 변수 검증
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase environment variables')
          }

          // Supabase Admin 클라이언트 생성 (RLS 우회)
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          )

          const boostExpiry = calculateBoostExpiry(result.days)
          const { error: updateError } = await supabaseAdmin
            .from('rooms')
            .update({ boost_until: boostExpiry.toISOString() })
            .eq('id', result.roomId)

          if (updateError) {
            logger.error('CRITICAL: 결제 후 부스트 DB 업데이트 실패', {
              error: updateError.message || String(updateError),
              roomId: result.roomId,
              days: result.days
            })
            // 결제는 완료되었지만 DB 업데이트 실패 - 관리자 확인 필요
            return createErrorResponse('결제는 완료되었으나 부스트 활성화에 실패했습니다', 500)
          } else {
            logger.info('부스트 DB 업데이트 완료', {
              roomId: result.roomId,
              days: result.days,
              boostUntil: boostExpiry.toISOString()
            })
          }
        } catch (error) {
          logger.error('CRITICAL: 결제 후 DB 업데이트 오류', { error: error instanceof Error ? error.message : String(error) })
          // 결제 완료 후 DB 업데이트 실패는 치명적 오류
          return createErrorResponse('결제는 완료되었으나 부스트 활성화에 실패했습니다', 500)
        }
      }
    }

    return createSuccessResponse({ received: true })
  } catch (error: unknown) {
    logger.error('Webhook 처리 오류', { error: (error as Error)?.message || String(error) })
    return createErrorResponse(
      (error as Error).message || '웹훅 처리 중 오류가 발생했습니다',
      400
    )
  }
}
