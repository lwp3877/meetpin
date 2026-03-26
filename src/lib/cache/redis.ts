/* src/lib/cache/redis.ts - Redis 캐시 시스템 */
//
// ⚠️ 이 파일의 역할과 rateLimit.ts의 차이:
//
//   cache/redis.ts  — ioredis (TCP 프로토콜)
//     → 방 목록, 메시지, 알림, 프로필 등 데이터 캐싱
//     → 환경변수: REDIS_URL (redis:// 또는 rediss:// 형식)
//     → 필요한 서비스: Redis 서버 (Upstash의 경우 별도 TCP URL 사용)
//
//   rateLimit.ts  — @upstash/redis (HTTP REST 프로토콜)
//     → IP/사용자 기반 요청 횟수 제한
//     → 환경변수: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//     → 두 라이브러리는 프로토콜이 달라 하나로 통합 불가
//
// 무료 배포(Vercel + Upstash 무료)에서는:
//   - REDIS_URL 없음 → 캐싱 비활성화 (데이터는 DB에서 직접 읽음, 정상 동작)
//   - UPSTASH_REDIS_REST_URL 있음 → rate limiting 정상 동작
//
// 캐싱 활성화가 필요하면 Upstash에서 TCP 연결 URL(rediss://...)을 REDIS_URL에 설정하세요.

import Redis from 'ioredis'
import { logger } from '@/lib/observability/logger'

// Redis 클라이언트 싱글톤
let redis: Redis | null = null

// Redis 연결 설정
export function getRedisClient(): Redis | null {
  if (!redis) {
    try {
      // REDIS_URL: TCP Redis 연결 URL (redis:// 또는 rediss://)
      // 주의: UPSTASH_REDIS_REST_URL은 HTTP URL이므로 ioredis에 사용 불가
      const redisUrl = process.env.REDIS_URL

      if (!redisUrl) {
        // REDIS_URL 미설정 시 캐싱 비활성화 — DB에서 직접 조회로 fallback (정상 동작)
        return null
      }

      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 10000,
      })

      redis.on('connect', () => {
        logger.info('[Redis] Connected successfully')
      })

      redis.on('error', err => {
        logger.error('[Redis] Connection error', { error: (err as Error).message })
        redis = null // 연결 오류 시 재연결 시도를 위해 초기화
      })
    } catch (error) {
      logger.error('[Redis] Failed to initialize Redis client', { error: error instanceof Error ? error.message : String(error) })
      return null
    }
  }

  return redis
}

// 캐시 키 생성 헬퍼
export const CacheKeys = {
  rooms: (bbox?: string, filters?: string) => {
    const key = `rooms:${bbox || 'all'}`
    return filters ? `${key}:${filters}` : key
  },
  roomDetail: (roomId: string) => `room:${roomId}`,
  messages: (matchId: string, limit?: number) => `messages:${matchId}:${limit || 50}`,
  notifications: (userId: string) => `notifications:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
  hostMessages: (userId: string) => `host_messages:${userId}`,
} as const

// 캐시 TTL 설정 (초 단위)
export const CacheTTL = {
  rooms: 60, // 1분 - 방 목록은 자주 변경됨
  roomDetail: 300, // 5분 - 방 상세 정보는 상대적으로 안정적
  messages: 30, // 30초 - 메시지는 실시간성이 중요
  notifications: 60, // 1분 - 알림도 실시간성이 중요
  userProfile: 600, // 10분 - 프로필은 상대적으로 변경이 적음
  hostMessages: 60, // 1분 - 호스트 메시지는 실시간성이 중요
} as const

// 캐시 래퍼 함수
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const client = getRedisClient()

  // Redis가 없으면 직접 DB에서 가져오기
  if (!client) {
    return await fetcher()
  }

  try {
    // 캐시에서 확인
    const cached = await client.get(key)

    if (cached) {
      try {
        return JSON.parse(cached) as T
      } catch (parseError) {
        logger.warn('[Redis] Failed to parse cached data', { error: parseError instanceof Error ? parseError.message : String(parseError) })
        // 파싱 실패시 캐시 삭제하고 새로 가져오기
        await client.del(key)
      }
    }

    // 캐시 미스 - DB에서 가져와서 캐시에 저장
    const data = await fetcher()

    // Redis에 저장 (에러가 나도 데이터는 반환)
    try {
      await client.setex(key, ttl, JSON.stringify(data))
    } catch (setError) {
      logger.warn('[Redis] Failed to cache data', { error: setError instanceof Error ? setError.message : String(setError) })
    }

    return data
  } catch (error) {
    logger.error('[Redis] Cache operation failed', { error: error instanceof Error ? error.message : String(error) })
    // Redis 에러시 DB에서 직접 가져오기
    return await fetcher()
  }
}

// 캐시 무효화 함수들
export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
      logger.info(`[Redis] Invalidated ${keys.length} cache keys matching: ${pattern}`)
    }
  } catch (error) {
    logger.error('[Redis] Failed to invalidate cache', { error: error instanceof Error ? error.message : String(error) })
  }
}

// 특정 사용자 관련 캐시 무효화
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    invalidateCache(`notifications:${userId}`),
    invalidateCache(`host_messages:${userId}`),
    invalidateCache(`profile:${userId}`),
    invalidateCache(`messages:*${userId}*`),
  ])
}

// 방 관련 캐시 무효화
export async function invalidateRoomCache(roomId?: string): Promise<void> {
  if (roomId) {
    await invalidateCache(`room:${roomId}`)
  }
  // 모든 방 목록 캐시 무효화
  await invalidateCache('rooms:*')
}

// 메시지 캐시 무효화
export async function invalidateMessageCache(matchId: string): Promise<void> {
  await invalidateCache(`messages:${matchId}:*`)
}

// Redis 연결 종료
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}

// 캐시 통계 조회
export async function getCacheStats(): Promise<{
  connected: boolean
  keyCount: number
  memoryUsage?: string
}> {
  const client = getRedisClient()

  if (!client) {
    return { connected: false, keyCount: 0 }
  }

  try {
    const keyCount = await client.dbsize()
    const info = await client.info('memory')
    const memMatch = info.match(/used_memory_human:(.+)\r?\n/)
    const memoryUsage = memMatch ? memMatch[1] : undefined

    return {
      connected: true,
      keyCount,
      memoryUsage,
    }
  } catch (error) {
    logger.error('[Redis] Failed to get cache stats', { error: error instanceof Error ? error.message : String(error) })
    return { connected: false, keyCount: 0 }
  }
}

