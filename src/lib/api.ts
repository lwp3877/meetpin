/* src/lib/api.ts */
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { getAuthenticatedUser, requireAdmin } from '@/lib/auth'
import { checkIPRateLimit, checkUserRateLimit, checkUserIPRateLimit, RateLimitType } from '@/lib/rateLimit'

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Simple rate limiting function with key-based limits
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
export { getAuthenticatedUser, requireAdmin } from '@/lib/auth'

// 통일된 API 응답 타입 ({ok, data, code, message})
export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}

// API 에러 클래스
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

// 성공 응답 생성
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

// 에러 응답 생성
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
    if (error.name === 'ZodError') {
      const message = error.errors.map((e: any) => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ')
      throw new ApiError(`입력 데이터가 올바르지 않습니다: ${message}`, 400, 'VALIDATION_ERROR')
    }
    throw new ApiError('잘못된 JSON 형식입니다', 400, 'INVALID_JSON')
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

// 에러 처리 미들웨어
export function withErrorHandling(handler: ApiHandler) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error: any) {
      console.error('API Error:', error)
      
      if (error instanceof ApiError) {
        return createErrorResponse(error.message, error.status, error.code)
      }
      
      // Supabase 에러 처리
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
          default:
            console.error('Supabase Error:', error)
        }
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

export default {
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
  utils: apiUtils,
}