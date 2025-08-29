import { NextRequest } from 'next/server'
import { verifyWebhookSignature, handleWebhookEvent, calculateBoostExpiry } from '@/lib/payments/stripe'
import { createSuccessResponse, createErrorResponse } from '@/lib/api'
import { createClient } from '@supabase/supabase-js'

// POST /api/payments/stripe/webhook - Stripe 웹훅 처리
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return createErrorResponse('Missing Stripe signature', 400)
  }
  
  try {
    const payload = await request.text()
    const event = verifyWebhookSignature(payload, signature)
    
    console.log(`Received Stripe webhook: ${event.type}`)
    
    // 이벤트 처리
    const result = await handleWebhookEvent(event)
    
    // checkout.session.completed 이벤트의 경우 DB 업데이트
    if (result.success && result.type === 'checkout.session.completed' && result.roomId && result.days) {
      try {
        // Supabase Admin 클라이언트 생성 (RLS 우회)
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
          console.error('Failed to update boost_until:', updateError)
        } else {
          console.log(`Room ${result.roomId} boosted for ${result.days} days until ${boostExpiry.toISOString()}`)
        }
      } catch (error) {
        console.error('DB update error after payment:', error)
      }
    }
    
    return createSuccessResponse({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return createErrorResponse(error.message || 'Webhook processing failed', 400)
  }
}