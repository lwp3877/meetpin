/**
 * 개인정보 권리 요청 API 엔드포인트
 * GDPR 및 개인정보보호법 준수를 위한 사용자 권리 행사
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiResponse, ApiError } from '@/lib/api'
import { checkRateLimit } from '@/lib/rateLimit'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'

const privacyRightsRequestSchema = z.object({
  requestType: z.enum([
    'data_access', // 개인정보 열람권
    'data_correction', // 개인정보 정정·삭제권
    'data_deletion', // 개인정보 삭제권 (잊혀질 권리)
    'data_portability', // 개인정보 이동권
    'processing_restriction', // 개인정보 처리정지권
    'withdraw_consent', // 동의철회권
    'objection_processing', // 개인정보 처리거부권
  ]),
  reason: z.string().min(10, '요청 사유를 최소 10자 이상 입력해주세요').max(1000),
  specificData: z.string().max(500).optional(), // 특정 데이터에 대한 요청인 경우
  contactEmail: z.string().email('올바른 이메일 주소를 입력해주세요').optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  legalBasis: z.string().max(300).optional(), // 법적 근거 (필요시)
  preferredResponseMethod: z.enum(['email', 'app_notification', 'postal_mail']).default('email'),
  additionalInfo: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting - 개인정보 권리 요청 남용 방지
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const rateLimitKey = `privacy-rights:${clientIP}`

    if (!(await checkRateLimit(rateLimitKey, { requests: 3, windowMs: 60 * 60 * 1000 }))) {
      // 1시간에 3번
      throw new ApiError('개인정보 권리 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.', 429)
    }

    // 사용자 인증
    const user = await getAuthenticatedUser()

    // 요청 데이터 검증
    const body = await request.json()
    const validationResult = privacyRightsRequestSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      throw new ApiError(firstError.message || '입력 데이터가 올바르지 않습니다.', 400)
    }

    const {
      requestType,
      reason,
      specificData,
      contactEmail,
      urgency,
      legalBasis,
      preferredResponseMethod,
      additionalInfo,
    } = validationResult.data

    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient()

    // 사용자별 rate limiting 추가
    const userRateLimitKey = `privacy-rights-user:${user.id}`
    if (!(await checkRateLimit(userRateLimitKey, { requests: 5, windowMs: 24 * 60 * 60 * 1000 }))) {
      // 24시간에 5번
      throw new ApiError('일일 개인정보 권리 요청 한도를 초과했습니다.', 429)
    }

    // 사용자 정보 조회 (연락처 정보 확인)
    const { data: profile } = (await supabase
      .from('profiles')
      .select('email, nickname')
      .eq('id', user.id)
      .single()) as { data: any | null; error: any }

    // 기본 연락처 설정
    const finalContactEmail = contactEmail || profile?.email || ''

    // 개인정보 권리 요청 데이터 생성
    const requestData = {
      user_id: user.id,
      request_type: requestType,
      reason: reason.trim(),
      specific_data: specificData?.trim(),
      contact_email: finalContactEmail,
      urgency,
      legal_basis: legalBasis?.trim(),
      preferred_response_method: preferredResponseMethod,
      additional_info: additionalInfo?.trim(),
      status: 'pending',
      request_metadata: {
        user_agent: request.headers.get('user-agent'),
        ip_address: clientIP !== 'unknown' ? clientIP : null,
        timestamp: new Date().toISOString(),
        user_nickname: profile?.nickname,
      },
    }

    // 데이터베이스에 요청 저장
    const { data: privacyRequest, error: insertError } = (await (supabase as any)
      .from('privacy_rights_requests')
      .insert([requestData])
      .select(
        `
        id,
        request_type,
        status,
        urgency,
        created_at
      `
      )
      .single()) as { data: any | null; error: any }

    if (insertError) {
      console.error('Privacy rights request insert error:', insertError)
      throw new ApiError('개인정보 권리 요청 접수 중 오류가 발생했습니다.', 500)
    }

    // 관리자 알림 생성
    const notificationData = {
      type: 'privacy_rights_request',
      title: `개인정보 권리 요청: ${getRequestTypeKorean(requestType)}`,
      message: `사용자 ${profile?.nickname || 'Unknown'}님이 ${getRequestTypeKorean(requestType)} 요청을 제출했습니다.`,
      priority: urgency === 'high' ? 'high' : 'medium',
      reference_id: privacyRequest.id,
      metadata: {
        user_id: user.id,
        request_type: requestType,
        urgency,
      },
    }

    await (supabase as any).from('admin_notifications').insert([notificationData])

    // 요청 유형별 예상 처리 시간 안내
    const expectedResponseTime = getExpectedResponseTime(requestType)

    // 성공 응답
    return NextResponse.json({
      ok: true,
      data: {
        requestId: privacyRequest.id,
        requestType: requestType,
        status: privacyRequest.status,
        urgency: privacyRequest.urgency,
        submittedAt: privacyRequest.created_at,
        expectedResponseTime,
        contactEmail: finalContactEmail,
        message: `${getRequestTypeKorean(requestType)} 요청이 접수되었습니다. ${expectedResponseTime} 내에 처리됩니다.`,
      },
      message: '개인정보 권리 요청이 성공적으로 접수되었습니다.',
    } satisfies ApiResponse<{
      requestId: string
      requestType: string
      status: string
      urgency: string
      submittedAt: string
      expectedResponseTime: string
      contactEmail: string
      message: string
    }>)
  } catch (error) {
    console.error('Privacy rights request API error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
          code: 'PRIVACY_RIGHTS_REQUEST_ERROR',
        } satisfies ApiResponse<null>,
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: '개인정보 권리 요청 처리 중 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 사용자 인증
    const user = await getAuthenticatedUser()
    const supabase = await createServerSupabaseClient()

    // 쿼리 파라미터 처리
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // 사용자의 개인정보 권리 요청 내역 조회
    let query = supabase
      .from('privacy_rights_requests')
      .select(
        `
        id,
        request_type,
        reason,
        status,
        urgency,
        created_at,
        updated_at,
        admin_response,
        processed_at
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query

    if (error) {
      throw new ApiError('권리 요청 내역 조회 중 오류가 발생했습니다.', 500)
    }

    // 요청 유형을 한국어로 변환
    const formattedRequests =
      requests?.map((req: any) => ({
        ...req,
        request_type_korean: getRequestTypeKorean(req.request_type),
        status_korean: getStatusKorean(req.status),
      })) || []

    return NextResponse.json({
      ok: true,
      data: {
        requests: formattedRequests,
        pagination: {
          limit,
          offset,
          hasMore: requests?.length === limit,
        },
      },
    } satisfies ApiResponse<{
      requests: any[]
      pagination: {
        limit: number
        offset: number
        hasMore: boolean
      }
    }>)
  } catch (error) {
    console.error('Get privacy rights requests error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: '권리 요청 내역 조회 중 오류가 발생했습니다.',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

// 유틸리티 함수들
function getRequestTypeKorean(requestType: string): string {
  const typeMap: Record<string, string> = {
    data_access: '개인정보 열람',
    data_correction: '개인정보 정정·삭제',
    data_deletion: '개인정보 삭제 (잊혀질 권리)',
    data_portability: '개인정보 이동',
    processing_restriction: '개인정보 처리정지',
    withdraw_consent: '동의철회',
    objection_processing: '개인정보 처리거부',
  }
  return typeMap[requestType] || requestType
}

function getStatusKorean(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '접수',
    processing: '처리중',
    completed: '완료',
    rejected: '거부',
    cancelled: '취소',
  }
  return statusMap[status] || status
}

function getExpectedResponseTime(requestType: string): string {
  const timeMap: Record<string, string> = {
    data_access: '10일',
    data_correction: '10일',
    data_deletion: '10일',
    data_portability: '20일',
    processing_restriction: '10일',
    withdraw_consent: '즉시',
    objection_processing: '10일',
  }
  return timeMap[requestType] || '10일'
}
