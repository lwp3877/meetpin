import { NextRequest } from 'next/server'
import {
  createMethodRouter,
  createSuccessResponse,
  createErrorResponse,
  withAuth,
  withErrorHandling,
  ApiRouteContext,
} from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { logger } from '@/lib/observability/logger'

/**
 * POST /api/safety/feedback - 모임 후 안전 피드백 제출
 */
async function handlePOST(request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const body = await request.json()
    const {
      room_id,
      host_id,
      safety_rating,
      experience_rating,
      feedback_text,
      safety_checklist,
      has_safety_concern,
      safety_concern_details,
      is_anonymous,
    } = body

    // 필수 필드 검증
    if (!room_id || !host_id) {
      return createErrorResponse('room_id와 host_id는 필수입니다', 400)
    }

    // 평점 검증
    if (safety_rating && (safety_rating < 1 || safety_rating > 5)) {
      return createErrorResponse('안전 평점은 1-5 사이여야 합니다', 400)
    }

    if (experience_rating && (experience_rating < 1 || experience_rating > 5)) {
      return createErrorResponse('경험 평점은 1-5 사이여야 합니다', 400)
    }

    // 피드백 저장
    const { data, error } = await (supabaseAdmin as any)
      .from('meetup_feedback')
      .insert({
        room_id,
        attendee_id: user.id,
        host_id,
        safety_rating,
        experience_rating,
        feedback_text,
        safety_checklist: safety_checklist || {},
        has_safety_concern: has_safety_concern || false,
        safety_concern_details,
        is_anonymous: is_anonymous || false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create safety feedback', { error: error.message })
      return createErrorResponse('피드백 저장에 실패했습니다', 500)
    }

    // 안전 문제가 있는 경우 자동으로 긴급 신고 생성
    if (has_safety_concern && safety_concern_details) {
      await (supabaseAdmin as any).from('emergency_reports').insert({
        reporter_id: user.id,
        reported_user_id: host_id,
        room_id,
        emergency_type: 'safety_threat',
        description: safety_concern_details,
        priority_level: 1, // 높은 우선순위
        status: 'reported',
      })

      logger.warn('Safety concern reported', {
        feedback_id: (data as any).id,
        reporter: user.id,
        host: host_id
      })
    }

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in POST /api/safety/feedback', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * GET /api/safety/feedback - 내 피드백 조회
 */
async function handleGET(_request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('meetup_feedback')
      .select(
        `
        *,
        rooms:room_id(title, place_text),
        host:host_id(nickname)
      `
      )
      .eq('attendee_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch feedback', { error: error.message })
      return createErrorResponse('피드백 조회에 실패했습니다', 500)
    }

    return createSuccessResponse(data || [])
  } catch (error) {
    logger.error('Error in GET /api/safety/feedback', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

export const { POST, GET } = createMethodRouter({
  POST: withErrorHandling(withAuth(handlePOST)),
  GET: withErrorHandling(withAuth(handleGET)),
})
