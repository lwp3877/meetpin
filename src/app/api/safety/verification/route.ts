import { NextRequest } from 'next/server'
import {
  createMethodRouter,
  createSuccessResponse,
  createErrorResponse,
  withAuth,
  withErrorHandling,
  requireAdmin,
  ApiRouteContext,
} from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { logger } from '@/lib/observability/logger'

/**
 * POST /api/safety/verification - 사용자 인증 요청
 */
async function handlePOST(request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const body = await request.json()
    const { verification_type, verification_data } = body

    // 검증 유형 확인
    const validTypes = ['phone', 'id_card', 'email', 'age_adult']
    if (!validTypes.includes(verification_type)) {
      return createErrorResponse('유효하지 않은 인증 유형입니다', 400)
    }

    // 이미 인증 대기중인지 확인
    const { data: existing } = await (supabaseAdmin as any)
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('verification_type', verification_type)
      .in('status', ['pending', 'verified'])
      .single()

    if (existing && (existing as any).status === 'verified') {
      return createErrorResponse('이미 인증이 완료되었습니다', 400)
    }

    if (existing && (existing as any).status === 'pending') {
      return createErrorResponse('이미 인증이 대기 중입니다', 400)
    }

    // 인증 요청 생성
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + 365) // 1년 유효

    const { data, error } = await (supabaseAdmin as any)
      .from('user_verifications')
      .insert({
        user_id: user.id,
        verification_type,
        verification_data: verification_data || {},
        status: 'pending',
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create verification request', { error: error.message })
      return createErrorResponse('인증 요청에 실패했습니다', 500)
    }

    logger.info('Verification request created', {
      verification_id: (data as any).id,
      user_id: user.id,
      type: verification_type
    })

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in POST /api/safety/verification', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * GET /api/safety/verification - 내 인증 상태 조회
 */
async function handleGET(_request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch verifications', { error: error.message })
      return createErrorResponse('인증 상태 조회에 실패했습니다', 500)
    }

    return createSuccessResponse(data || [])
  } catch (error) {
    logger.error('Error in GET /api/safety/verification', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * PATCH /api/safety/verification - 인증 상태 업데이트 (관리자 전용)
 */
async function handlePATCH(request: NextRequest, _context: ApiRouteContext) {
  try {
    // 관리자 권한 확인
    const admin = await requireAdmin()

    const body = await request.json()
    const { verification_id, status } = body

    if (!verification_id || !status) {
      return createErrorResponse('verification_id와 status는 필수입니다', 400)
    }

    const validStatuses = ['pending', 'verified', 'rejected', 'expired']
    if (!validStatuses.includes(status)) {
      return createErrorResponse('유효하지 않은 상태값입니다', 400)
    }

    const updateData: any = {
      status,
      verified_by: admin.id,
    }

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString()
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('user_verifications')
      .update(updateData)
      .eq('id', verification_id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update verification status', { error: error.message })
      return createErrorResponse('인증 상태 업데이트에 실패했습니다', 500)
    }

    logger.info('Verification status updated', {
      verification_id,
      new_status: status,
      admin: admin.id
    })

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in PATCH /api/safety/verification', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

export const { POST, GET, PATCH } = createMethodRouter({
  POST: withErrorHandling(withAuth(handlePOST)),
  GET: withErrorHandling(withAuth(handleGET)),
  PATCH: withErrorHandling(handlePATCH),
})
