/**
 * 연령 인증 API 엔드포인트
 * 개인정보보호법 및 청소년보호법 준수
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiResponse, ApiError } from '@/lib/api'
import { verifyAge, AgeVerificationData } from '@/lib/age-verification'
import { checkRateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

import { logger } from '@/lib/observability/logger'
const ageVerificationSchema = z.object({
  ageRange: z.enum(['20s_early', '20s_late', '30s_early', '30s_late', '40s', '50s+']),
  birthYear: z.number().min(1940).max(2010).optional(),
  verificationMethod: z.enum(['self_declaration', 'id_verification', 'phone_verification']),
  phoneNumber: z.string().optional(),
  consent: z.object({
    dataCollection: z.boolean(),
    ageVerification: z.boolean(),
    serviceTerms: z.boolean(),
  }),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting - 연령 인증 시도 제한
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const rateLimitKey = `age-verification:${clientIP}`

    if (!(await checkRateLimit(rateLimitKey, { requests: 3, windowMs: 15 * 60 * 1000 }))) {
      // 15분에 3번
      throw new ApiError('너무 많은 인증 시도가 있었습니다. 잠시 후 다시 시도해주세요.', 429)
    }

    // 인증된 사용자 확인
    const user = await getAuthenticatedUser()

    // 요청 데이터 검증
    const body = await request.json()
    const validationResult = ageVerificationSchema.safeParse(body)

    if (!validationResult.success) {
      throw new ApiError('입력 데이터가 올바르지 않습니다.', 400)
    }

    const { ageRange, birthYear, verificationMethod, phoneNumber, consent } = validationResult.data

    // 필수 동의 확인
    if (!consent.dataCollection || !consent.ageVerification || !consent.serviceTerms) {
      throw new ApiError('서비스 이용을 위한 필수 동의가 필요합니다.', 400)
    }

    // 연령 인증 데이터 준비
    const verificationData: AgeVerificationData = {
      ageRange,
      birthYear,
      verificationMethod,
      phoneNumber,
    }

    // 요청 메타데이터 수집
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = clientIP !== 'unknown' ? clientIP : undefined

    // 연령 인증 실행
    const result = await verifyAge(user.id, verificationData, userAgent, ipAddress)

    // 미성년자인 경우 접근 거부
    if (!result.isAdult) {
      return NextResponse.json(
        {
          ok: false,
          message: result.message,
          code: 'MINOR_ACCESS_DENIED',
        } satisfies ApiResponse<null>,
        { status: 403 }
      )
    }

    // 인증 실패인 경우
    if (!result.verified) {
      return NextResponse.json(
        {
          ok: false,
          message: result.message,
          code: 'VERIFICATION_FAILED',
        } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    // 성공
    return NextResponse.json({
      ok: true,
      data: {
        isAdult: result.isAdult,
        verified: result.verified,
        method: result.method,
        verifiedAt: new Date().toISOString(),
      },
      message: result.message,
    } satisfies ApiResponse<{
      isAdult: boolean
      verified: boolean
      method: string
      verifiedAt: string
    }>)
  } catch (error: unknown) {
    logger.error('Age verification API error:', { error: error instanceof Error ? error.message : String(error) })

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: (error as Error).message,
          code: 'AGE_VERIFICATION_ERROR',
        } satisfies ApiResponse<null>,
        { status: (error as any).status }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: '연령 인증 처리 중 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 인증된 사용자 확인
    const user = await getAuthenticatedUser()

    // 현재 연령 인증 상태 조회
    const { getUserAgeVerificationStatus } = await import('@/lib/age-verification')
    const status = await getUserAgeVerificationStatus(user.id)

    return NextResponse.json({
      ok: true,
      data: {
        isVerified: status.isVerified,
        isAdult: status.isAdult,
        verificationMethod: status.verificationMethod,
        verifiedAt: status.verifiedAt,
        requiresVerification: !status.isVerified,
      },
    } satisfies ApiResponse<{
      isVerified: boolean
      isAdult: boolean
      verificationMethod?: string
      verifiedAt?: string
      requiresVerification: boolean
    }>)
  } catch (error: unknown) {
    logger.error('Get age verification status error:', { error: error instanceof Error ? error.message : String(error) })

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
        message: '인증 상태 조회 중 오류가 발생했습니다.',
      } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
