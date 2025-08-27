/* src/lib/rateLimit.ts */
// 간단한 메모리 기반 Rate Limiting

interface RateLimitRecord {
  count: number
  resetTime: number
}

// 메모리 기반 저장소
const requestCounts = new Map<string, RateLimitRecord>()

// 정리를 위한 마지막 청소 시간
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5분마다 청소

export interface RateLimitOptions {
  requests: number // 허용된 요청 수
  windowMs: number // 시간 윈도우 (밀리초)
}

// 기본 Rate Limit 설정
export const defaultLimits = {
  api: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes  
  upload: { requests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  createRoom: { requests: 5, windowMs: 60 * 1000 }, // 5 rooms per minute
  message: { requests: 50, windowMs: 60 * 1000 }, // 50 messages per minute
  report: { requests: 3, windowMs: 60 * 1000 }, // 3 reports per minute
} as const

export type RateLimitType = keyof typeof defaultLimits

/**
 * Rate limit 체크
 * @param identifier - 고유 식별자 (IP, uid, uid+IP 등)
 * @param options - Rate limit 옵션
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = defaultLimits.api
): boolean {
  const now = Date.now()
  
  // 주기적 메모리 정리
  cleanup(now)
  
  const record = requestCounts.get(identifier)
  
  // 첫 요청이거나 윈도우가 리셋된 경우
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs
    })
    return true
  }
  
  // Rate limit 초과 확인
  if (record.count >= options.requests) {
    return false
  }
  
  // 요청 카운트 증가
  record.count++
  return true
}

/**
 * 타입별 Rate limit 체크 (편의 함수)
 */
export function checkTypedRateLimit(
  identifier: string,
  type: RateLimitType
): boolean {
  return checkRateLimit(identifier, defaultLimits[type])
}

/**
 * IP 기반 Rate limit
 */
export function checkIPRateLimit(
  ip: string,
  type: RateLimitType = 'api'
): boolean {
  return checkRateLimit(`ip:${ip}`, defaultLimits[type])
}

/**
 * 사용자 기반 Rate limit  
 */
export function checkUserRateLimit(
  uid: string,
  type: RateLimitType
): boolean {
  return checkRateLimit(`user:${uid}`, defaultLimits[type])
}

/**
 * 사용자 + IP 기반 Rate limit (더 엄격한 제한)
 */
export function checkUserIPRateLimit(
  uid: string,
  ip: string,
  type: RateLimitType
): boolean {
  return checkRateLimit(`user:${uid}:ip:${ip}`, defaultLimits[type])
}

/**
 * Rate limit 정보 조회
 */
export function getRateLimitInfo(identifier: string): {
  count: number
  remaining: number
  resetTime: number
} | null {
  const record = requestCounts.get(identifier)
  if (!record) {
    return null
  }
  
  const now = Date.now()
  if (now > record.resetTime) {
    return null
  }
  
  return {
    count: record.count,
    remaining: Math.max(0, defaultLimits.api.requests - record.count),
    resetTime: record.resetTime
  }
}

/**
 * 특정 식별자의 Rate limit 리셋
 */
export function resetRateLimit(identifier: string): void {
  requestCounts.delete(identifier)
}

/**
 * 모든 Rate limit 리셋 (테스트용)
 */
export function resetAllRateLimits(): void {
  requestCounts.clear()
  lastCleanup = Date.now()
}

/**
 * 만료된 레코드 정리
 */
function cleanup(now: number): void {
  // 5분마다 정리
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return
  }
  
  let cleaned = 0
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
      cleaned++
    }
  }
  
  lastCleanup = now
  
  // 개발 모드에서만 로깅
  if (process.env.NODE_ENV === 'development' && cleaned > 0) {
    console.log(`[RateLimit] Cleaned up ${cleaned} expired records`)
  }
}

/**
 * 메모리 사용량 정보 (디버깅용)
 */
export function getRateLimitStats(): {
  totalRecords: number
  memoryUsage: string
} {
  const totalRecords = requestCounts.size
  const memoryUsage = `${Math.round(totalRecords * 64 / 1024)} KB` // 대략적 계산
  
  return {
    totalRecords,
    memoryUsage
  }
}

/**
 * Express/Next.js 미들웨어 스타일 Rate Limiter
 */
export function createRateLimiter(
  type: RateLimitType,
  getIdentifier: (req: any) => string = (req) => req.ip || 'unknown'
) {
  return (req: any, res: any, next?: Function) => {
    const identifier = getIdentifier(req)
    const allowed = checkTypedRateLimit(identifier, type)
    
    if (!allowed) {
      const error = new Error(`Rate limit exceeded for ${type}`)
      ;(error as any).status = 429
      ;(error as any).code = 'RATE_LIMIT_EXCEEDED'
      
      if (next) {
        return next(error)
      } else {
        throw error
      }
    }
    
    if (next) {
      next()
    }
    return true
  }
}

export default {
  check: checkRateLimit,
  checkTyped: checkTypedRateLimit,
  checkIP: checkIPRateLimit,
  checkUser: checkUserRateLimit,
  checkUserIP: checkUserIPRateLimit,
  getInfo: getRateLimitInfo,
  reset: resetRateLimit,
  resetAll: resetAllRateLimits,
  getStats: getRateLimitStats,
  createLimiter: createRateLimiter,
  limits: defaultLimits,
}