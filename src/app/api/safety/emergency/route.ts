import { NextRequest, NextResponse } from 'next/server'
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
 * POST /api/safety/emergency - 긴급 상황 신고
 */
async function handlePOST(request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const body = await request.json()
    const { reported_user_id, room_id, emergency_type, description, location_info } = body

    // 필수 필드 검증
    if (!reported_user_id || !emergency_type || !description) {
      return createErrorResponse('필수 정보가 누락되었습니다', 400)
    }

    // 신고 유형 검증
    const validTypes = ['safety_threat', 'harassment', 'fraud', 'inappropriate_behavior', 'other']
    if (!validTypes.includes(emergency_type)) {
      return createErrorResponse('유효하지 않은 신고 유형입니다', 400)
    }

    // 긴급 신고 생성
    const { data, error } = await (supabaseAdmin as any)
      .from('emergency_reports')
      .insert({
        reporter_id: user.id,
        reported_user_id,
        room_id,
        emergency_type,
        description,
        location_info,
        priority_level: emergency_type === 'safety_threat' ? 1 : 3,
        status: 'reported',
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create emergency report', { error: error.message })
      return createErrorResponse('신고 접수에 실패했습니다', 500)
    }

    logger.warn('Emergency report created', {
      report_id: (data as any).id,
      reporter: user.id,
      reported_user: reported_user_id,
      type: emergency_type
    })

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in POST /api/safety/emergency', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * GET /api/safety/emergency - 긴급 신고 목록 조회 (관리자 전용)
 */
async function handleGET(_request: NextRequest, _context: ApiRouteContext) {
  try {
    // 관리자 권한 확인
    await requireAdmin()

    const { data, error } = await (supabaseAdmin as any)
      .from('emergency_reports')
      .select(
        `
        *,
        reporter:reporter_id(nickname),
        reported_user:reported_user_id(nickname),
        rooms:room_id(title)
      `
      )
      .order('priority_level', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Failed to fetch emergency reports', { error: error.message })
      return createErrorResponse('신고 목록 조회에 실패했습니다', 500)
    }

    return createSuccessResponse(data || [])
  } catch (error) {
    logger.error('Error in GET /api/safety/emergency', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * PATCH /api/safety/emergency - 긴급 신고 상태 업데이트 (관리자 전용)
 */
async function handlePATCH(request: NextRequest, _context: ApiRouteContext) {
  try {
    // 관리자 권한 확인
    const admin = await requireAdmin()

    const body = await request.json()
    const { report_id, status, resolution_notes } = body

    if (!report_id || !status) {
      return createErrorResponse('report_id와 status는 필수입니다', 400)
    }

    const validStatuses = ['reported', 'investigating', 'resolved', 'dismissed']
    if (!validStatuses.includes(status)) {
      return createErrorResponse('유효하지 않은 상태값입니다', 400)
    }

    const updateData: any = {
      status,
      assigned_to: admin.id,
    }

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('emergency_reports')
      .update(updateData)
      .eq('id', report_id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update emergency report', { error: error.message })
      return createErrorResponse('신고 상태 업데이트에 실패했습니다', 500)
    }

    logger.info('Emergency report updated', {
      report_id,
      new_status: status,
      admin: admin.id
    })

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in PATCH /api/safety/emergency', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

export const { POST, GET, PATCH } = createMethodRouter({
  POST: withErrorHandling(withAuth(handlePOST)),
  GET: withErrorHandling(handleGET),
  PATCH: withErrorHandling(handlePATCH),
})
