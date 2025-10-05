/* src/app/api/cache/stats/route.ts - Redis 캐시 통계 API */

import { NextRequest } from 'next/server'
import { apiUtils, requireAdmin } from '@/lib/api'
import { getCacheStats } from '@/lib/cache/redis'

import { logger } from '@/lib/observability/logger'
// GET /api/cache/stats - Redis 캐시 통계 조회 (관리자 전용)
export async function GET(_request: NextRequest) {
  try {
    await requireAdmin()

    const stats = await getCacheStats()

    return apiUtils.success({
      redis: stats,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      redisUrl: process.env.REDIS_URL ? '설정됨' : '미설정',
    })
  } catch (error: any) {
    logger.error('Cache stats error:', { error: error instanceof Error ? error.message : String(error) })
    return apiUtils.error(error.message || '캐시 통계를 가져올 수 없습니다', error.status || 500)
  }
}
