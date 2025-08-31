import { NextRequest } from 'next/server'
import { createBoostCheckoutSession } from '@/lib/payments/stripe'
import { boostSchema } from '@/lib/zodSchemas'
import { config } from '@/lib/flags'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  ApiError
} from '@/lib/api'

// POST /api/payments/stripe/checkout - Stripe Checkout 세션 생성
async function createCheckoutSession(request: NextRequest) {
  const user = await getAuthenticatedUser()
  
  // 요청 본문 검증
  const { room_id, days } = await parseAndValidateBody(request, boostSchema)
  
  try {
    const session = await createBoostCheckoutSession({
      roomId: room_id,
      days,
      userId: user.id,
      successUrl: `${config.baseUrl}/room/${room_id}?payment=success`,
      cancelUrl: `${config.baseUrl}/room/${room_id}?payment=canceled`,
    })
    
    return createSuccessResponse({
      checkout_url: session.url,
      session_id: session.id,
    })
    
  } catch (error: any) {
    throw new ApiError(error.message || '결제 세션 생성에 실패했습니다')
  }
}

export const { POST } = createMethodRouter({
  POST: createCheckoutSession,
})