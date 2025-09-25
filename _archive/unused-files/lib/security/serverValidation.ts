/* src/lib/security/serverValidation.ts */
// 🛡️ 서버측 입력 검증 및 보안 미들웨어

import { z } from 'zod'
import { NextRequest } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'

// MIME 타입 화이트리스트
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'] as const

// 파일 크기 제한 (바이트)
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  roomImage: 10 * 1024 * 1024, // 10MB
  reportFile: 20 * 1024 * 1024, // 20MB
} as const

// 위험한 파일 확장자 블랙리스트
const DANGEROUS_EXTENSIONS = [
  'exe',
  'bat',
  'cmd',
  'com',
  'pif',
  'scr',
  'vbs',
  'js',
  'jar',
  'sh',
  'py',
  'php',
  'asp',
  'aspx',
  'jsp',
  'pl',
  'cgi',
  'app',
]

// SQL Injection 패턴
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(OR\s+1\s*=\s*1)/gi,
  /(AND\s+1\s*=\s*1)/gi,
  /('|\"|;|\-\-|\/\*|\*\/)/g,
  /(0x[0-9a-f]+)/gi,
]

// XSS 패턴
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
]

// 경로 순회 공격 패턴
const PATH_TRAVERSAL_PATTERNS = [/\.\./g, /\.\\/g, /\.\.%2f/gi, /\.\.%5c/gi, /%2e%2e/gi]

/**
 * 문자열 입력 보안 검증
 */
export function sanitizeString(
  input: string,
  options: {
    maxLength?: number
    allowHtml?: boolean
    stripSql?: boolean
    stripXss?: boolean
  } = {}
): string {
  const { maxLength = 1000, allowHtml = false, stripSql = true, stripXss = true } = options

  let sanitized = input.trim()

  // 길이 제한
  if (sanitized.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`)
  }

  // SQL Injection 방지
  if (stripSql) {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        throw new Error('Potentially malicious SQL pattern detected')
      }
    }
  }

  // XSS 방지
  if (stripXss) {
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(sanitized)) {
        throw new Error('Potentially malicious script pattern detected')
      }
    }
  }

  // HTML 정화
  if (!allowHtml) {
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
  } else {
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u'],
      ALLOWED_ATTR: [],
    })
  }

  // 경로 순회 공격 방지
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new Error('Path traversal pattern detected')
    }
  }

  return sanitized
}

/**
 * 파일 업로드 보안 검증
 */
export async function validateFileUpload(
  file: File | Buffer,
  type: 'avatar' | 'roomImage' | 'reportFile'
): Promise<{
  isValid: boolean
  error?: string
  sanitizedName?: string
}> {
  try {
    let fileName: string
    let fileSize: number
    let fileType: string

    if (file instanceof File) {
      fileName = file.name
      fileSize = file.size
      fileType = file.type
    } else {
      // Buffer의 경우 추가 메타데이터 필요
      throw new Error('Buffer upload requires additional metadata')
    }

    // 파일명 검증
    if (!fileName || fileName.length > 255) {
      return { isValid: false, error: 'Invalid file name' }
    }

    // 파일 확장자 검증
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (!extension) {
      return { isValid: false, error: 'File must have extension' }
    }

    if (DANGEROUS_EXTENSIONS.includes(extension)) {
      return { isValid: false, error: 'File type not allowed' }
    }

    // 파일 크기 검증
    const sizeLimit = FILE_SIZE_LIMITS[type]
    if (fileSize > sizeLimit) {
      return {
        isValid: false,
        error: `File too large. Maximum ${Math.round(sizeLimit / 1024 / 1024)}MB allowed`,
      }
    }

    // MIME 타입 검증
    const allowedTypes =
      type === 'reportFile'
        ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
        : ALLOWED_IMAGE_TYPES

    if (!allowedTypes.includes(fileType as any)) {
      return { isValid: false, error: 'File type not supported' }
    }

    // 파일명 정화
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // 특수문자 제거
      .replace(/_{2,}/g, '_') // 연속 언더스코어 정리
      .substring(0, 100) // 길이 제한

    // 실제 파일 내용 검증 (Magic Number)
    if (file instanceof File) {
      const magicNumberValid = await validateMagicNumber(file, fileType)
      if (!magicNumberValid) {
        return { isValid: false, error: 'File content does not match declared type' }
      }
    }

    return {
      isValid: true,
      sanitizedName,
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'File validation failed',
    }
  }
}

/**
 * Magic Number로 실제 파일 타입 검증
 */
async function validateMagicNumber(file: File, declaredType: string): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Magic Number 패턴
  const magicNumbers: Record<string, number[][]> = {
    'image/jpeg': [
      [0xff, 0xd8, 0xff], // JPEG
    ],
    'image/png': [
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
    ],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
    ],
    'application/pdf': [
      [0x25, 0x50, 0x44, 0x46], // %PDF
    ],
  }

  const patterns = magicNumbers[declaredType]
  if (!patterns) return true // 검증 패턴 없으면 통과

  return patterns.some(pattern => pattern.every((byte, index) => bytes[index] === byte))
}

/**
 * API 요청 본문 검증 미들웨어
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (
    request: NextRequest
  ): Promise<{
    isValid: boolean
    data?: T
    error?: string
  }> => {
    try {
      const contentType = request.headers.get('content-type') || ''
      let body: any

      if (contentType.includes('application/json')) {
        body = await request.json()
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        body = Object.fromEntries(formData)
      } else {
        return { isValid: false, error: 'Unsupported content type' }
      }

      // Zod 스키마 검증
      const result = schema.safeParse(body)

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ')

        return { isValid: false, error: `Validation failed: ${errorMessages}` }
      }

      // 추가 보안 검증 (문자열 필드)
      const sanitizedData = sanitizeObjectStrings(result.data)

      return { isValid: true, data: sanitizedData }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Request validation failed',
      }
    }
  }
}

/**
 * 객체 내 모든 문자열 필드 정화
 */
function sanitizeObjectStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj, { allowHtml: false }) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectStrings(item)) as T
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value)
    }
    return sanitized
  }

  return obj
}

/**
 * 서버측 CSRF 토큰 검증
 */
export function validateCSRFToken(token: string | null, sessionToken: string | null): boolean {
  if (!token || !sessionToken) return false

  // 간단한 CSRF 토큰 검증 (실제로는 더 복잡한 구현 필요)
  return token === `csrf_${sessionToken}_token`
}

/**
 * Rate Limiting 헬퍼
 */
export function getRateLimitKey(request: NextRequest, endpoint: string): string {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // IP + User-Agent 해시로 키 생성
  return `${endpoint}:${ip}:${userAgent.substring(0, 50)}`
}

/**
 * 로그인 시도 검증 (브루트포스 방지)
 */
export function validateLoginAttempt(
  email: string,
  password: string
): { isValid: boolean; error?: string } {
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  // 패스워드 복잡성 검증
  if (password.length < 6) {
    return { isValid: false, error: 'Password too short' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long' }
  }

  // 일반적인 약한 비밀번호 검증
  const weakPasswords = ['123456', 'password', 'admin', 'guest']
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password too weak' }
  }

  return { isValid: true }
}

/**
 * IP 주소 검증 및 정규화
 */
export function normalizeIP(ip: string | null): string {
  if (!ip) return 'unknown'

  // IPv6 매핑된 IPv4 주소 정규화
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7)
  }

  // 프록시 헤더에서 첫 번째 IP 추출
  if (ip.includes(',')) {
    return ip.split(',')[0].trim()
  }

  return ip
}
