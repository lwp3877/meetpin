import { NextRequest } from 'next/server'
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/payments/stripe'
import { createSuccessResponse, createErrorResponse } from '@/lib/api'

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
    await handleWebhookEvent(event)
    
    return createSuccessResponse({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return createErrorResponse(error.message || 'Webhook processing failed', 400)
  }
}