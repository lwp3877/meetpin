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
 * GET /api/safety/settings - 사용자 안전 설정 조회
 */
async function handleGET(_request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('user_safety_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      logger.error('Failed to fetch safety settings', { error: error.message })
      return createErrorResponse('안전 설정 조회에 실패했습니다', 500)
    }

    // 설정이 없으면 기본값 반환
    if (!data) {
      const defaultSettings = {
        allow_adult_only_meetings: true,
        require_verified_users_only: false,
        share_emergency_contact: false,
        safety_reminder_enabled: true,
        post_meetup_checkin_enabled: true,
      }

      // 기본 설정 생성
      const { data: newSettings, error: insertError } = await (supabaseAdmin as any)
        .from('user_safety_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings,
        })
        .select()
        .single()

      if (insertError) {
        logger.error('Failed to create default safety settings', { error: insertError.message })
        return createSuccessResponse(defaultSettings)
      }

      return createSuccessResponse(newSettings)
    }

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in GET /api/safety/settings', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

/**
 * PATCH /api/safety/settings - 사용자 안전 설정 업데이트
 */
async function handlePATCH(request: NextRequest, _context: ApiRouteContext, user: { id: string }) {
  try {
    const body = await request.json()
    const {
      allow_adult_only_meetings,
      require_verified_users_only,
      share_emergency_contact,
      safety_reminder_enabled,
      post_meetup_checkin_enabled,
    } = body

    // 업데이트할 필드만 포함
    const updates: any = {}
    if (typeof allow_adult_only_meetings === 'boolean') {
      updates.allow_adult_only_meetings = allow_adult_only_meetings
    }
    if (typeof require_verified_users_only === 'boolean') {
      updates.require_verified_users_only = require_verified_users_only
    }
    if (typeof share_emergency_contact === 'boolean') {
      updates.share_emergency_contact = share_emergency_contact
    }
    if (typeof safety_reminder_enabled === 'boolean') {
      updates.safety_reminder_enabled = safety_reminder_enabled
    }
    if (typeof post_meetup_checkin_enabled === 'boolean') {
      updates.post_meetup_checkin_enabled = post_meetup_checkin_enabled
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('업데이트할 설정이 없습니다', 400)
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('user_safety_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update safety settings', { error: error.message })
      return createErrorResponse('안전 설정 업데이트에 실패했습니다', 500)
    }

    logger.info('Safety settings updated', { user_id: user.id })

    return createSuccessResponse(data)
  } catch (error) {
    logger.error('Error in PATCH /api/safety/settings', {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

export const { GET, PATCH } = createMethodRouter({
  GET: withErrorHandling(withAuth(handleGET)),
  PATCH: withErrorHandling(withAuth(handlePATCH)),
})
