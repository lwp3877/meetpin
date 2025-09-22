/**
 * 전역 에러 핸들러 및 Validation 유틸리티
 * 모든 API 오류와 클라이언트 오류를 일관성 있게 처리
 */

import { toast } from 'react-hot-toast'

export interface AppError {
  message: string
  code?: string
  status?: number
  context?: Record<string, any>
}

export class ApiValidationError extends Error {
  public status: number = 400
  public code: string
  public context?: Record<string, any>

  constructor(message: string, code: string = 'VALIDATION_ERROR', context?: Record<string, any>) {
    super(message)
    this.name = 'ApiValidationError'
    this.code = code
    this.context = context
  }
}

export class NetworkError extends Error {
  public status: number = 0
  public code: string = 'NETWORK_ERROR'

  constructor(message: string = '네트워크 연결을 확인해주세요') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class AuthError extends Error {
  public status: number = 401
  public code: string = 'AUTH_ERROR'

  constructor(message: string = '인증이 필요합니다') {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * 안전한 파라미터 검증
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): asserts value is T {
  if (value === null || value === undefined || value === '') {
    throw new ApiValidationError(`${fieldName}은(는) 필수입니다`, 'REQUIRED_FIELD', {
      field: fieldName,
      value
    })
  }
}

/**
 * UUID 형식 검증
 */
export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    throw new ApiValidationError(`${fieldName}은(는) 올바른 UUID 형식이 아닙니다`, 'INVALID_UUID', {
      field: fieldName,
      value
    })
  }
}

/**
 * URL 파라미터 안전 추출
 */
export function safeExtractParams<T extends Record<string, string>>(
  context: { params: Promise<T> } | { params: T },
  requiredFields: (keyof T)[]
): Promise<T> | T {
  if ('then' in context.params) {
    // Promise<T> 케이스
    return context.params.then((params) => {
      for (const field of requiredFields) {
        validateRequired(params[field], String(field))
        
        // ID 파라미터는 추가로 UUID 검증
        if (String(field).endsWith('id') || String(field) === 'id') {
          validateUUID(params[field], String(field))
        }
      }
      return params
    })
  } else {
    // T 케이스
    for (const field of requiredFields) {
      validateRequired(context.params[field], String(field))
      
      // ID 파라미터는 추가로 UUID 검증
      if (String(field).endsWith('id') || String(field) === 'id') {
        validateUUID(context.params[field], String(field))
      }
    }
    return context.params
  }
}

/**
 * 에러를 사용자 친화적 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return error.message
  }
  
  if (error instanceof NetworkError) {
    return error.message
  }
  
  if (error instanceof AuthError) {
    return error.message
  }
  
  if (error instanceof Error) {
    // Supabase 에러 처리
    if (error.message.includes('JWT')) {
      return '로그인이 만료되었습니다. 다시 로그인해주세요'
    }
    
    if (error.message.includes('permission')) {
      return '권한이 없습니다'
    }
    
    if (error.message.includes('duplicate')) {
      return '이미 존재하는 데이터입니다'
    }
    
    if (error.message.includes('foreign key')) {
      return '참조하는 데이터를 찾을 수 없습니다'
    }
    
    return error.message
  }
  
  return '알 수 없는 오류가 발생했습니다'
}

/**
 * 클라이언트용 에러 토스트 표시
 */
export function showErrorToast(error: unknown, fallbackMessage?: string): void {
  const message = getErrorMessage(error)
  toast.error(fallbackMessage || message)
  
  // 개발 모드에서만 콘솔에 상세 정보 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error)
  }
}

/**
 * API 응답 안전 검증
 */
export function validateApiResponse<T>(
  response: Response,
  data: unknown
): asserts data is { ok: boolean; data?: T; message?: string; code?: string } {
  if (!response.ok) {
    throw new NetworkError(
      `API 요청 실패: ${response.status} ${response.statusText}`
    )
  }
  
  if (typeof data !== 'object' || data === null) {
    throw new ApiValidationError('잘못된 API 응답 형식', 'INVALID_RESPONSE')
  }
  
  const result = data as any
  if (typeof result.ok !== 'boolean') {
    throw new ApiValidationError('API 응답에 ok 필드가 없습니다', 'MISSING_OK_FIELD')
  }
}

/**
 * 배열이 비어있지 않은지 검증
 */
export function validateNonEmptyArray<T>(
  value: T[],
  fieldName: string
): asserts value is [T, ...T[]] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiValidationError(`${fieldName}은(는) 최소 1개 이상이어야 합니다`, 'EMPTY_ARRAY', {
      field: fieldName,
      value
    })
  }
}

/**
 * 숫자 범위 검증
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ApiValidationError(`${fieldName}은(는) 유효한 숫자여야 합니다`, 'INVALID_NUMBER', {
      field: fieldName,
      value
    })
  }
  
  if (value < min || value > max) {
    throw new ApiValidationError(
      `${fieldName}은(는) ${min}~${max} 범위여야 합니다`,
      'OUT_OF_RANGE',
      {
        field: fieldName,
        value,
        min,
        max
      }
    )
  }
}

/**
 * 문자열 길이 검증
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): void {
  if (typeof value !== 'string') {
    throw new ApiValidationError(`${fieldName}은(는) 문자열이어야 합니다`, 'INVALID_STRING', {
      field: fieldName,
      value
    })
  }
  
  if (value.length < min || value.length > max) {
    throw new ApiValidationError(
      `${fieldName}은(는) ${min}~${max}자 사이여야 합니다`,
      'INVALID_LENGTH',
      {
        field: fieldName,
        value,
        min,
        max,
        actualLength: value.length
      }
    )
  }
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(value: string, fieldName: string = '이메일'): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    throw new ApiValidationError(`${fieldName} 형식이 올바르지 않습니다`, 'INVALID_EMAIL', {
      field: fieldName,
      value
    })
  }
}

/**
 * 한국어 닉네임 검증 (특수문자 제한)
 */
export function validateKoreanNickname(value: string, fieldName: string = '닉네임'): void {
  const koreanNicknameRegex = /^[가-힣a-zA-Z0-9\s]{2,20}$/
  if (!koreanNicknameRegex.test(value)) {
    throw new ApiValidationError(
      `${fieldName}은(는) 2-20자의 한글, 영문, 숫자만 사용 가능합니다`,
      'INVALID_NICKNAME',
      {
        field: fieldName,
        value
      }
    )
  }
}

/**
 * 위도/경도 좌표 검증
 */
export function validateCoordinates(lat: number, lng: number): void {
  validateNumberRange(lat, -90, 90, '위도')
  validateNumberRange(lng, -180, 180, '경도')
}

/**
 * 날짜 유효성 검증
 */
export function validateFutureDate(dateString: string, fieldName: string): void {
  const date = new Date(dateString)
  const now = new Date()
  
  if (isNaN(date.getTime())) {
    throw new ApiValidationError(`${fieldName}은(는) 유효한 날짜 형식이어야 합니다`, 'INVALID_DATE', {
      field: fieldName,
      value: dateString
    })
  }
  
  if (date <= now) {
    throw new ApiValidationError(`${fieldName}은(는) 현재 시간보다 미래여야 합니다`, 'PAST_DATE', {
      field: fieldName,
      value: dateString,
      now: now.toISOString()
    })
  }
}

/**
 * API 요청 래퍼 (자동 에러 처리)
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<Response>,
  errorContext?: string
): Promise<T> {
  try {
    const response = await apiCall()
    const data = await response.json()
    
    validateApiResponse<T>(response, data)
    
    if (!data.ok) {
      throw new ApiValidationError(
        data.message || `${errorContext || 'API'} 요청에 실패했습니다`,
        data.code || 'API_ERROR'
      )
    }
    
    return data.data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError()
    }
    throw error
  }
}

export const errorHandler = {
  validateRequired,
  validateUUID,
  safeExtractParams,
  getErrorMessage,
  showErrorToast,
  validateApiResponse,
  validateNonEmptyArray,
  validateNumberRange,
  validateStringLength,
  validateEmail,
  validateKoreanNickname,
  validateCoordinates,
  validateFutureDate,
  safeApiCall,
  ApiValidationError,
  NetworkError,
  AuthError,
}

export default errorHandler