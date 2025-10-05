import { NextRequest } from 'next/server'
import { createBoostCheckoutSession } from '@/lib/payments/stripe'
import { boostSchema } from '@/lib/utils/zodSchemas'
import { config, isDevelopmentMode } from '@/lib/config/flags'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  ApiError,
} from '@/lib/api'

import { logger } from '@/lib/observability/logger'
// POST /api/payments/stripe/checkout - Stripe Checkout 세션 생성
async function createCheckoutSession(request: NextRequest) {
  const user = await getAuthenticatedUser()

  // 요청 본문 검증
  const { room_id, days } = await parseAndValidateBody(request, boostSchema)

  // 개발 모드에서는 Mock 결제 처리
  if (isDevelopmentMode) {
    // Mock 결제 세션 정보 반환
    const mockSessionId = `cs_test_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockCheckoutUrl = `${config.baseUrl}/room/${room_id}?payment=success&mock=true`

    logger.info(`[Mock Payment] Room ${room_id} boost for ${days} days by user ${user.id}`)

    return createSuccessResponse({
      checkout_url: mockCheckoutUrl,
      session_id: mockSessionId,
      mock: true,
      message: '개발 모드: Mock 결제 세션이 생성되었습니다',
    })
  }

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
  } catch (error: unknown) {
    throw new ApiError((error as Error).message || '결제 세션 생성에 실패했습니다')
  }
}

export const { POST } = createMethodRouter({
  POST: createCheckoutSession,
})
