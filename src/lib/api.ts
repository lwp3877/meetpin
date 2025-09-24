/* src/lib/api.ts */
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { getAuthenticatedUser, requireAdmin } from '@/lib/services/auth'
import { checkIPRateLimit, checkUserIPRateLimit, RateLimitType } from '@/lib/utils/rateLimit'

/**
 * 간단한 인메모리 레이트 리미팅 스토어
 * 실제 운영에서는 Redis 등의 외부 스토어를 사용하는 것을 권장
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * 간단한 키 기반 레이트 리미팅 함수
 * @param key - 리미트를 적용할 고유 키 (예: IP주소, 사용자ID 등)
 * @param limit - 제한할 요청 수
 * @param windowMs - 제한 시간 윈도우 (밀리초)
 * @returns 요청이 허용되면 true, 제한에 걸리면 false
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Re-export auth functions for compatibility
export { getAuthenticatedUser, requireAdmin } from '@/lib/services/auth'

/**
 * 통일된 API 응답 타입
 * 모든 API 엔드포인트는 이 형식으로 응답을 반환해야 함
 * @template T - 응답 데이터의 타입
 */
export interface ApiResponse<T = any> {
  /** 요청 성공 여부 */
  ok: boolean
  /** 응답 데이터 (성공 시) */
  data?: T
  /** 에러 코드 (실패 시) */
  code?: string
  /** 사용자에게 표시할 메시지 */
  message?: string
}

/**
 * 구조화된 API 에러 클래스
 * HTTP 상태 코드와 에러 코드를 포함하여 일관된 에러 처리 제공
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 표준화된 성공 응답을 생성합니다
 * @template T - 응답 데이터의 타입
 * @param data - 반환할 데이터
 * @param message - 성공 메시지 (선택사항)
 * @param status - HTTP 상태 코드 (기본값: 200)
 * @returns NextResponse 객체
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    ok: true,
    data,
    message,
  }, { status })
}

/**
 * 표준화된 에러 응답을 생성합니다
 * @param error - 에러 메시지 또는 Error 객체
 * @param status - HTTP 상태 코드 (기본값: 400)
 * @param code - 에러 코드 (선택사항)
 * @returns NextResponse 객체
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 400,
  code?: string
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error
  
  return NextResponse.json({
    ok: false,
    code,
    message,
  }, { status })
}

// 클라이언트 IP 주소 추출
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

// 요청 본문 파싱 및 검증
export async function parseAndValidateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error: any) {
    if (error.name === 'ZodError' && error.errors && Array.isArray(error.errors)) {
      const message = error.errors.map((e: any) => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ')
      throw new ApiError(`입력 데이터가 올바르지 않습니다: ${message}`, 400, 'VALIDATION_ERROR')
    }
    console.error('Parse error:', error)
    throw new ApiError('요청 데이터 처리 중 오류가 발생했습니다', 400, 'PARSE_ERROR')
  }
}

// URL 파라미터 파싱
export async function parseUrlParams(
  context: { params: Promise<{ [key: string]: string }> }
): Promise<{ [key: string]: string }> {
  return await context.params
}

// 쿼리 파라미터 파싱
export function parseQueryParams(request: NextRequest): URLSearchParams {
  const url = new URL(request.url)
  return url.searchParams
}

// 페이지네이션 파라미터 파싱
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

// Rate Limit 체크 미들웨어
export function withRateLimit(type: RateLimitType = 'api') {
  return (handler: ApiHandler) => {
    return async (request: NextRequest, context: any) => {
      const ip = getClientIP(request)
      
      // IP 기반 Rate Limit
      if (!checkIPRateLimit(ip, type)) {
        throw new ApiError('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', 429, 'RATE_LIMIT_EXCEEDED')
      }
      
      return await handler(request, context)
    }
  }
}

// 인증 미들웨어
export function withAuth(handler: AuthenticatedApiHandler) {
  return async (request: NextRequest, context: any) => {
    const user = await getAuthenticatedUser()
    return await handler(request, context, user)
  }
}

// 관리자 권한 미들웨어
export function withAdminAuth(handler: AuthenticatedApiHandler) {
  return async (request: NextRequest, context: any) => {
    const user = await requireAdmin()
    return await handler(request, context, user)
  }
}

// 사용자별 Rate Limit 체크 (인증 필요)
export function withUserRateLimit(type: RateLimitType) {
  return (handler: AuthenticatedApiHandler) => {
    return withAuth(async (request: NextRequest, context: any, user) => {
      const ip = getClientIP(request)
      
      // 사용자 + IP 기반 Rate Limit (더 엄격)
      if (!checkUserIPRateLimit(user.id, ip, type)) {
        throw new ApiError('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', 429, 'RATE_LIMIT_EXCEEDED')
      }
      
      return await handler(request, context, user)
    })
  }
}

// 에러 처리 미들웨어 (강화된 버전)
export function withErrorHandling(handler: ApiHandler) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error: any) {
      console.error('API Error:', error)
      
      if (error instanceof ApiError) {
        return createErrorResponse(error.message, error.status, error.code)
      }
      
      // 네트워크 및 연결 에러 처리
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return createErrorResponse('네트워크 연결에 실패했습니다', 503, 'NETWORK_ERROR')
      }
      
      if (error.name === 'AbortError') {
        return createErrorResponse('요청 시간이 초과되었습니다', 408, 'TIMEOUT_ERROR')
      }
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return createErrorResponse('서비스에 연결할 수 없습니다', 503, 'CONNECTION_ERROR')
      }
      
      // Supabase 에러 처리 (확장됨)
      if (error.code) {
        switch (error.code) {
          case 'PGRST116':
            return createErrorResponse('리소스를 찾을 수 없습니다', 404, 'NOT_FOUND')
          case '23505':
            return createErrorResponse('중복된 데이터입니다', 409, 'CONFLICT')
          case '23503':
            return createErrorResponse('참조 무결성 위반입니다', 400, 'FOREIGN_KEY_VIOLATION')
          case '42501':
            return createErrorResponse('권한이 없습니다', 403, 'INSUFFICIENT_PRIVILEGE')
          case '08006':
            return createErrorResponse('데이터베이스 연결에 실패했습니다', 503, 'DATABASE_CONNECTION_ERROR')
          case '53300':
            return createErrorResponse('서버가 과부하 상태입니다', 503, 'SERVER_OVERLOAD')
          case '57014':
            return createErrorResponse('쿼리 실행 시간이 초과되었습니다', 408, 'QUERY_TIMEOUT')
          case 'JWT_EXPIRED':
            return createErrorResponse('인증 토큰이 만료되었습니다', 401, 'TOKEN_EXPIRED')
          case 'JWT_INVALID':
            return createErrorResponse('잘못된 인증 토큰입니다', 401, 'TOKEN_INVALID')
          default:
            console.error('Supabase Error:', error)
        }
      }
      
      // JSON 파싱 에러 처리
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return createErrorResponse('잘못된 요청 형식입니다', 400, 'INVALID_JSON')
      }
      
      // 메모리 부족 에러
      if (error.code === 'ERR_MEMORY_ALLOCATION_FAILED' || error.message?.includes('memory')) {
        return createErrorResponse('서버 리소스가 부족합니다', 503, 'MEMORY_ERROR')
      }
      
      return createErrorResponse('서버 내부 오류가 발생했습니다', 500, 'INTERNAL_ERROR')
    }
  }
}

// 메서드별 핸들러 라우터
export function createMethodRouter(handlers: {
  GET?: ApiHandler
  POST?: ApiHandler
  PUT?: ApiHandler
  PATCH?: ApiHandler
  DELETE?: ApiHandler
}) {
  return {
    GET: handlers.GET ? withErrorHandling(handlers.GET) : undefined,
    POST: handlers.POST ? withErrorHandling(handlers.POST) : undefined,
    PUT: handlers.PUT ? withErrorHandling(handlers.PUT) : undefined,
    PATCH: handlers.PATCH ? withErrorHandling(handlers.PATCH) : undefined,
    DELETE: handlers.DELETE ? withErrorHandling(handlers.DELETE) : undefined,
  }
}

// 타입 정의
export type ApiHandler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse>

export type AuthenticatedApiHandler = (
  request: NextRequest,
  context: any,
  user: { id: string; email?: string }
) => Promise<NextResponse>

// 공통 API 유틸리티 함수들
export const apiUtils = {
  // 성공 응답
  success: createSuccessResponse,
  
  // 에러 응답
  error: createErrorResponse,
  
  // 생성 성공 응답
  created: <T>(data?: T, message?: string) => 
    createSuccessResponse(data, message, 201),
  
  // 삭제 성공 응답
  deleted: (message: string = '삭제되었습니다') => 
    createSuccessResponse(undefined, message, 200),
  
  // 업데이트 성공 응답
  updated: <T>(data?: T, message: string = '업데이트되었습니다') => 
    createSuccessResponse(data, message, 200),
  
  // 찾을 수 없음 에러
  notFound: (message: string = '리소스를 찾을 수 없습니다') => 
    createErrorResponse(message, 404, 'NOT_FOUND'),
  
  // 권한 없음 에러
  forbidden: (message: string = '권한이 없습니다') => 
    createErrorResponse(message, 403, 'FORBIDDEN'),
  
  // 인증 필요 에러
  unauthorized: (message: string = '인증이 필요합니다') => 
    createErrorResponse(message, 401, 'UNAUTHORIZED'),
  
  // 검증 실패 에러
  validation: (message: string) => 
    createErrorResponse(message, 400, 'VALIDATION_ERROR'),
  
  // 중복 데이터 에러
  conflict: (message: string = '중복된 데이터입니다') => 
    createErrorResponse(message, 409, 'CONFLICT'),
  
  // Rate limit 초과 에러
  rateLimit: (message: string = '요청 한도를 초과했습니다') => 
    createErrorResponse(message, 429, 'RATE_LIMIT_EXCEEDED'),
}

const apiUtilsCollection = {
  ApiError,
  createSuccessResponse,
  createErrorResponse,
  getClientIP,
  parseAndValidateBody,
  parseUrlParams,
  parseQueryParams,
  parsePaginationParams,
  withRateLimit,
  withAuth,
  withAdminAuth,
  withUserRateLimit,
  withErrorHandling,
  createMethodRouter,
}

export default apiUtilsCollection