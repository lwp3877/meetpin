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
  const signature = request.headers.get('stripe-signature')

  // 개발 모드에서는 웹훅 서명 검증 생략
  if (!isDevelopmentMode && !signature) {
    return createErrorResponse('Missing Stripe signature', 400)
  }

  try {
    const payload = await request.text()

    let event: any

    if (isDevelopmentMode) {
      // 개발 모드에서는 직접 JSON 파싱
      logger.info('[Mock Webhook] Processing development mode webhook')
      event = JSON.parse(payload)
    } else {
      // 프로덕션 모드에서는 서명 검증
      event = verifyWebhookSignature(payload, signature!)
    }

    logger.info('Received Stripe webhook', { eventType: event.type })

    // 이벤트 처리
    const result = await handleWebhookEvent(event)

    // checkout.session.completed 이벤트의 경우 DB 업데이트
    if (
      result.success &&
      result.type === 'checkout.session.completed' &&
      result.roomId &&
      result.days
    ) {
      if (isDevelopmentMode) {
        // 개발 모드에서는 DB 업데이트 시뮬레이션만 수행
        const boostExpiry = calculateBoostExpiry(result.days)
        logger.info('[Mock DB Update] Room boosted', {
          roomId: result.roomId,
          days: result.days,
          boostUntil: boostExpiry.toISOString(),
          mode: 'development'
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
            logger.error('CRITICAL: Failed to update boost after payment', {
              error: updateError.message || String(updateError),
              roomId: result.roomId,
              days: result.days
            })
            // 결제는 완료되었지만 DB 업데이트 실패 - 관리자 알림 필요
            return createErrorResponse('Payment completed but boost activation failed', 500)
          } else {
            logger.info('Room boosted successfully', {
              roomId: result.roomId,
              days: result.days,
              boostUntil: boostExpiry.toISOString()
            })
          }
        } catch (error) {
          logger.error('CRITICAL: DB update error after payment', { error: error instanceof Error ? error.message : String(error) })
          // 결제 완료 후 DB 업데이트 실패는 치명적 오류
          return createErrorResponse('Payment completed but boost activation failed', 500)
        }
      }
    }

    return createSuccessResponse({ received: true })
  } catch (error: any) {
    logger.error('Webhook error', { error: error?.message || String(error) })
    return createErrorResponse(error.message || 'Webhook processing failed', 400)
  }
}
