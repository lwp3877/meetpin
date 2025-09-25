/* src/lib/rateLimit.ts */
// ⚡ Upstash Redis 기반 고성능 레이트 리밋 시스템

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Redis 클라이언트 초기화
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// 개발 환경용 메모리 기반 폴백
const memoryStore = new Map<string, { count: number; resetTime: number }>()

/**
 * 레이트 리밋 결과 타입
 */
interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  limit: number
}

/**
 * 레이트 리밋 프리셋 설정
 */
export const RATE_LIMIT_PRESETS = {
  // 인증 관련
  auth: {
    login: { requests: 5, window: 15 * 60 * 1000 }, // 5회/15분
    signup: { requests: 3, window: 60 * 60 * 1000 }, // 3회/1시간
    passwordReset: { requests: 3, window: 60 * 60 * 1000 }, // 3회/1시간
  },

  // API 요청
  api: {
    general: { requests: 100, window: 60 * 1000 }, // 100회/분
    search: { requests: 30, window: 60 * 1000 }, // 30회/분
    upload: { requests: 10, window: 60 * 1000 }, // 10회/분
  },

  // 콘텐츠 생성
  content: {
    roomCreate: { requests: 5, window: 60 * 1000 }, // 5회/분
    messageCreate: { requests: 50, window: 60 * 1000 }, // 50회/분
    reportCreate: { requests: 3, window: 60 * 1000 }, // 3회/분
  },

  // 보안 관련
  security: {
    cspReport: { requests: 100, window: 60 * 1000 }, // 100회/분
    failedAuth: { requests: 10, window: 15 * 60 * 1000 }, // 10회/15분
  },
} as const

/**
 * Upstash 기반 레이트 리밋 인스턴스들
 */
const rateLimiters = redis
  ? {
      // 인증 레이트 리밋
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15m'),
        analytics: true,
        prefix: 'meetpin:auth',
      }),

      // 일반 API 레이트 리밋
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1m'),
        analytics: true,
        prefix: 'meetpin:api',
      }),

      // 콘텐츠 생성 레이트 리밋
      content: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1m'),
        analytics: true,
        prefix: 'meetpin:content',
      }),

      // 업로드 레이트 리밋
      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1m'),
        analytics: true,
        prefix: 'meetpin:upload',
      }),

      // 보안 이벤트 레이트 리밋
      security: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1m'),
        analytics: true,
        prefix: 'meetpin:security',
      }),
    }
  : null

/**
 * 메인 레이트 리밋 함수
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    // Upstash Redis 사용 가능한 경우
    if (redis && rateLimiters) {
      // 동적 레이트 리밋 생성
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${Math.floor(windowMs / 1000)}s`),
        analytics: true,
        prefix: 'meetpin:custom',
      })

      const result = await limiter.limit(key)

      return {
        success: result.success,
        remaining: result.remaining,
        resetTime: result.reset,
        limit: result.limit,
      }
    }

    // 폴백: 메모리 기반 레이트 리밋
    return memoryRateLimit(key, limit, windowMs)
  } catch (error) {
    console.error('Rate limit error:', error)

    // 에러 시 폴백
    return memoryRateLimit(key, limit, windowMs)
  }
}

/**
 * 프리셋 기반 레이트 리밋
 */
export async function rateLimitWithPreset(
  key: string,
  preset: string,
  identifier: string
): Promise<RateLimitResult> {
  try {
    if (redis && rateLimiters && preset in rateLimiters) {
      const limiter = rateLimiters[preset as keyof typeof rateLimiters]
      if (limiter) {
        const result = await limiter.limit(`${key}:${identifier}`)

        return {
          success: result.success,
          remaining: result.remaining,
          resetTime: result.reset,
          limit: result.limit,
        }
      }
    }

    // 폴백 설정
    const presetConfig = getPresetConfig(preset)
    return memoryRateLimit(
      `${preset}:${key}:${identifier}`,
      presetConfig.requests,
      presetConfig.window
    )
  } catch (error) {
    console.error('Preset rate limit error:', error)

    const presetConfig = getPresetConfig(preset)
    return memoryRateLimit(
      `${preset}:${key}:${identifier}`,
      presetConfig.requests,
      presetConfig.window
    )
  }
}

/**
 * 특정 엔드포인트별 레이트 리밋
 */
export async function rateLimitEndpoint(
  endpoint: string,
  ip: string,
  userId?: string
): Promise<RateLimitResult> {
  const identifier = userId ? `user:${userId}` : `ip:${ip}`
  const key = `endpoint:${endpoint}:${identifier}`

  // 엔드포인트별 제한 설정
  const endpointLimits: Record<string, { requests: number; window: number }> = {
    '/api/auth/login': RATE_LIMIT_PRESETS.auth.login,
    '/api/auth/signup': RATE_LIMIT_PRESETS.auth.signup,
    '/api/rooms': RATE_LIMIT_PRESETS.content.roomCreate,
    '/api/messages': RATE_LIMIT_PRESETS.content.messageCreate,
    '/api/reports': RATE_LIMIT_PRESETS.content.reportCreate,
    '/api/upload': RATE_LIMIT_PRESETS.api.upload,
    '/api/search': RATE_LIMIT_PRESETS.api.search,
  }

  const config = endpointLimits[endpoint] || RATE_LIMIT_PRESETS.api.general

  return rateLimit(key, config.requests, config.window)
}

/**
 * IP 기반 전역 레이트 리밋
 */
export async function rateLimitGlobal(ip: string): Promise<RateLimitResult> {
  return rateLimit(`global:${ip}`, 1000, 60 * 1000) // 1000회/분
}

/**
 * 사용자별 레이트 리밋
 */
export async function rateLimitUser(userId: string, action: string): Promise<RateLimitResult> {
  const key = `user:${userId}:${action}`

  const actionLimits: Record<string, { requests: number; window: number }> = {
    room_create: { requests: 5, window: 60 * 1000 },
    message_send: { requests: 50, window: 60 * 1000 },
    report_create: { requests: 3, window: 60 * 1000 },
    profile_update: { requests: 10, window: 60 * 1000 },
  }

  const config = actionLimits[action] || { requests: 30, window: 60 * 1000 }

  return rateLimit(key, config.requests, config.window)
}

/**
 * 메모리 기반 폴백 레이트 리밋
 */
function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const resetTime = now + windowMs

  const existing = memoryStore.get(key)

  if (!existing || now > existing.resetTime) {
    // 새로운 윈도우 시작
    memoryStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      remaining: limit - 1,
      resetTime,
      limit,
    }
  }

  if (existing.count >= limit) {
    // 제한 초과
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
      limit,
    }
  }

  // 요청 카운트 증가
  existing.count++
  memoryStore.set(key, existing)

  return {
    success: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
    limit,
  }
}

/**
 * 프리셋 설정 가져오기
 */
function getPresetConfig(preset: string): { requests: number; window: number } {
  switch (preset) {
    case 'auth':
      return RATE_LIMIT_PRESETS.auth.login
    case 'content':
      return RATE_LIMIT_PRESETS.content.roomCreate
    case 'upload':
      return RATE_LIMIT_PRESETS.api.upload
    case 'security':
      return RATE_LIMIT_PRESETS.security.cspReport
    default:
      return RATE_LIMIT_PRESETS.api.general
  }
}

/**
 * 레이트 리밋 통계 (관리자용)
 */
export async function getRateLimitStats(): Promise<any> {
  if (!redis) {
    return {
      provider: 'memory',
      keys: memoryStore.size,
      activeConnections: 0,
    }
  }

  try {
    // Redis 키 스캔 (prefix 기준)
    const keys = await redis.keys('meetpin:*')

    return {
      provider: 'upstash',
      totalKeys: keys.length,
      activeConnections: 1, // Upstash는 connection pool 사용
      memoryFallback: false,
    }
  } catch (error) {
    return {
      provider: 'upstash',
      error: error instanceof Error ? error.message : 'Unknown error',
      memoryFallback: true,
    }
  }
}

/**
 * 레이트 리밋 초기화 (테스트용)
 */
export async function resetRateLimit(key: string): Promise<boolean> {
  try {
    if (redis) {
      await redis.del(key)
      return true
    } else {
      memoryStore.delete(key)
      return true
    }
  } catch (error) {
    console.error('Rate limit reset error:', error)
    return false
  }
}

/**
 * 긴급 레이트 리밋 (DDoS 방어)
 */
export async function emergencyRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit(`emergency:${ip}`, 10, 60 * 1000) // 10회/분
}

// 메모리 정리 (주기적 실행 권장)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 60 * 1000) // 1분마다 정리

// === 하위 호환성을 위한 alias 함수들 ===

/**
 * 레거시 지원: checkRateLimit 함수 (async)
 */
export async function checkRateLimit(
  identifier: string,
  options?: { requests: number; windowMs: number }
): Promise<boolean> {
  if (options) {
    const result = await rateLimit(identifier, options.requests, options.windowMs)
    return result.success
  }

  const config = RATE_LIMIT_PRESETS.api.general
  const result = await rateLimit(identifier, config.requests, config.window)
  return result.success
}

/**
 * 레거시 지원: 타입별 레이트리밋
 */
export async function checkTypedRateLimit(identifier: string, type: string): Promise<boolean> {
  const config = getPresetConfig(type)
  const result = await rateLimit(identifier, config.requests, config.window)
  return result.success
}

/**
 * 레거시 지원: IP 기반 레이트리밋
 */
export async function checkIPRateLimit(ip: string, type: string = 'api'): Promise<boolean> {
  const result = await rateLimitGlobal(ip)
  return result.success
}

/**
 * 레거시 지원: 사용자 기반 레이트리밋
 */
export async function checkUserRateLimit(uid: string, type: string): Promise<boolean> {
  const result = await rateLimitUser(uid, type)
  return result.success
}

/**
 * 레거시 지원: 사용자+IP 기반 레이트리밋
 */
export async function checkUserIPRateLimit(
  uid: string,
  ip: string,
  type: string
): Promise<boolean> {
  const result = await rateLimitUser(uid, `${type}_${ip}`)
  return result.success
}

/**
 * 레거시 지원: 레이트리밋 정보 조회
 */
export async function getRateLimitInfo(identifier: string): Promise<any> {
  // 기존 호환성을 위해 null 반환
  return null
}

/**
 * 레거시 지원: 모든 레이트리밋 리셋
 */
export async function resetAllRateLimits(): Promise<void> {
  memoryStore.clear()
}

/**
 * 레거시 지원: 동기식 레이트리밋
 */
export function rateLimitSync(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// 타입 호환성
export const defaultLimits = RATE_LIMIT_PRESETS
export type RateLimitType = keyof typeof RATE_LIMIT_PRESETS
export interface RateLimitOptions {
  requests: number
  windowMs: number
}

// 기본 export
export default {
  rateLimit,
  rateLimitGlobal,
  rateLimitUser,
  rateLimitEndpoint,
  emergencyRateLimit,
  getRateLimitStats,
  resetRateLimit,
  resetAllRateLimits,
  checkRateLimit,
  checkTypedRateLimit,
  checkIPRateLimit,
  checkUserRateLimit,
  checkUserIPRateLimit,
  getRateLimitInfo,
  presets: RATE_LIMIT_PRESETS,
}
