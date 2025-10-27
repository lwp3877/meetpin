/**
 * 긴급 신고 API 엔드포인트
 * 사용자 안전을 위한 긴급 신고 처리
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiResponse, ApiError } from '@/lib/api'
import { checkRateLimit } from '@/lib/rateLimit'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'

import { logger } from '@/lib/observability/logger'
const emergencyReportSchema = z.object({
  reportType: z.enum([
    'harassment',
    'violence',
    'fraud',
    'inappropriate_behavior',
    'safety_concern',
    'medical_emergency',
    'other',
  ]),
  description: z.string().min(10, '신고 내용은 최소 10자 이상 입력해주세요').max(1000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().max(200).optional(),
  roomId: z.string().uuid().optional(),
  reportedUserId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  anonymousReport: z.boolean().default(false),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting - 긴급 신고 남용 방지
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const rateLimitKey = `emergency-report:${clientIP}`

    if (!(await checkRateLimit(rateLimitKey, { requests: 5, windowMs: 15 * 60 * 1000 }))) {
      // 15분에 5번
      throw new ApiError('너무 많은 신고가 접수되었습니다. 잠시 후 다시 시도해주세요.', 429)
    }

    // 요청 데이터 검증
    const body = await request.json()
    const validationResult = emergencyReportSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      throw new ApiError(firstError.message || '입력 데이터가 올바르지 않습니다.', 400)
    }

    const {
      reportType,
      description,
      latitude,
      longitude,
      locationAddress,
      roomId,
      reportedUserId,
      priority,
      anonymousReport,
    } = validationResult.data

    // 사용자 인증 (익명 신고가 아닌 경우)
    let reporterId: string | null = null
    if (!anonymousReport) {
      try {
        const user = await getAuthenticatedUser()
        reporterId = user.id
      } catch (_error) {
        // 익명 신고로 처리
        logger.info('Anonymous emergency report submitted')
      }
    }

    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient()

    // 신고 데이터 생성
    const reportData = {
      reporter_id: reporterId,
      report_type: reportType,
      description: description.trim(),
      latitude,
      longitude,
      location_address: locationAddress,
      room_id: roomId,
      reported_user_id: reportedUserId,
      priority: priority || 'medium', // 기본값은 medium, 트리거에서 자동 조정됨
    }

    // 데이터베이스에 신고 저장
    const { data: report, error: insertError } = await (supabase as any)
      .from('emergency_reports')
      .insert([reportData])
      .select(
        `
        id,
        report_type,
        status,
        priority,
        created_at
      `
      )
      .single()

    if (insertError) {
      logger.error('Emergency report insert error:', { error: insertError instanceof Error ? insertError.message : String(insertError) })
      throw new ApiError('신고 접수 중 오류가 발생했습니다.', 500)
    }

    // 추가 정보 수집 (분석용) - 향후 확장 가능

    // 긴급도에 따른 즉시 알림 (critical이나 high인 경우)
    if (report.priority === 'critical' || report.priority === 'high') {
      // 실제 구현시 여기서 관리자 알림 발송
      logger.info(`URGENT: Emergency report ${report.id} with priority ${report.priority}`)

      // 관리자 알림 로그 저장
      await (supabase as any).from('admin_notifications').insert([
        {
          type: 'emergency_report_urgent',
          title: `긴급 신고 접수 (${report.priority})`,
          message: `신고 유형: ${reportType}, 설명: ${description.substring(0, 100)}...`,
          priority: report.priority,
          reference_id: report.id,
        },
      ])
    }

    // 성공 응답
    return NextResponse.json({
      ok: true,
      data: {
        reportId: report.id,
        status: report.status,
        priority: report.priority,
        reportedAt: report.created_at,
        message: anonymousReport
          ? '익명 신고가 접수되었습니다. 신속히 검토하겠습니다.'
          : '신고가 접수되었습니다. 빠른 시일 내에 검토하겠습니다.',
      },
      message: '신고가 성공적으로 접수되었습니다.',
    } satisfies ApiResponse<{
      reportId: string
      status: string
      priority: string
      reportedAt: string
      message: string
    }>)
  } catch (error) {
    logger.error('Emergency report API error:', { error: error instanceof Error ? error.message : String(error) })

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: (error as Error).message,
          code: 'EMERGENCY_REPORT_ERROR',
        } satisfies ApiResponse<null>,
        { status: (error as any).status }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: '신고 처리 중 오류가 발생했습니다. 긴급한 경우 112에 신고해주세요.',
        code: 'INTERNAL_ERROR',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 관리자 인증 확인
    const user = await getAuthenticatedUser()
    const supabase = await createServerSupabaseClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as Record<string, unknown> | null)?.role !== 'admin') {
      throw new ApiError('관리자 권한이 필요합니다.', 403)
    }

    // 쿼리 파라미터 처리
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // 신고 목록 조회
    let query = supabase
      .from('emergency_reports_dashboard')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data: reports, error } = await query

    if (error) {
      throw new ApiError('신고 목록 조회 중 오류가 발생했습니다.', 500)
    }

    // 통계 정보 조회
    const { data: stats } = await supabase.from('emergency_reports_stats').select('*').single()

    return NextResponse.json({
      ok: true,
      data: {
        reports: reports || [],
        stats: stats || {},
        pagination: {
          limit,
          offset,
          hasMore: reports?.length === limit,
        },
      },
    } satisfies ApiResponse<{
      reports: Record<string, unknown>[]
      stats: unknown
      pagination: {
        limit: number
        offset: number
        hasMore: boolean
      }
    }>)
  } catch (error) {
    logger.error('Get emergency reports error:', { error: error instanceof Error ? error.message : String(error) })

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: (error as Error).message,
        } satisfies ApiResponse<null>,
        { status: (error as any).status }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: '신고 목록 조회 중 오류가 발생했습니다.',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
