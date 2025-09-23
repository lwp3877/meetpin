import { NextRequest } from 'next/server'
import { verifyWebhookSignature, handleWebhookEvent, calculateBoostExpiry } from '@/lib/payments/stripe'
import { createSuccessResponse, createErrorResponse } from '@/lib/api'
import { createClient } from '@supabase/supabase-js'
import { isDevelopmentMode } from '@/lib/config/flags'

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
      console.log(`[Mock Webhook] Processing development mode webhook`)
      event = JSON.parse(payload)
    } else {
      // 프로덕션 모드에서는 서명 검증
      event = verifyWebhookSignature(payload, signature!)
    }
    
    console.log(`Received Stripe webhook: ${event.type}`)
    
    // 이벤트 처리
    const result = await handleWebhookEvent(event)
    
    // checkout.session.completed 이벤트의 경우 DB 업데이트
    if (result.success && result.type === 'checkout.session.completed' && result.roomId && result.days) {
      if (isDevelopmentMode) {
        // 개발 모드에서는 DB 업데이트 시뮬레이션만 수행
        const boostExpiry = calculateBoostExpiry(result.days)
        console.log(`[Mock DB Update] Room ${result.roomId} boosted for ${result.days} days until ${boostExpiry.toISOString()}`)
        console.log(`[Mock DB Update] Development mode - No actual database update performed`)
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
                persistSession: false
              }
            }
          )
          
          const boostExpiry = calculateBoostExpiry(result.days)
          const { error: updateError } = await supabaseAdmin
            .from('rooms')
            .update({ boost_until: boostExpiry.toISOString() })
            .eq('id', result.roomId)
          
          if (updateError) {
            console.error('CRITICAL: Failed to update boost after payment:', updateError)
            // 결제는 완료되었지만 DB 업데이트 실패 - 관리자 알림 필요
            return createErrorResponse('Payment completed but boost activation failed', 500)
          } else {
            console.log(`Room ${result.roomId} boosted for ${result.days} days until ${boostExpiry.toISOString()}`)
          }
        } catch (error) {
          console.error('CRITICAL: DB update error after payment:', error)
          // 결제 완료 후 DB 업데이트 실패는 치명적 오류
          return createErrorResponse('Payment completed but boost activation failed', 500)
        }
      }
    }
    
    return createSuccessResponse({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return createErrorResponse(error.message || 'Webhook processing failed', 400)
  }
}