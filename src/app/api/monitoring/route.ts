/* src/app/api/monitoring/route.ts - 시스템 모니터링 API */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { requireAdmin } from '@/lib/api'

import { logger } from '@/lib/observability/logger'
interface SystemMetrics {
  timestamp: string
  database: {
    status: 'healthy' | 'degraded' | 'down'
    connection_count?: number
    query_performance?: number
  }
  api: {
    total_requests_24h: number
    error_rate_24h: number
    avg_response_time: number
  }
  users: {
    total_users: number
    active_users_24h: number
    new_users_24h: number
  }
  rooms: {
    total_rooms: number
    active_rooms: number
    new_rooms_24h: number
  }
  system: {
    memory_usage: number
    uptime: number
    error_count_24h: number
  }
}

export async function GET(_request: NextRequest) {
  try {
    // 관리자 권한 필요
    await requireAdmin()

    const supabase = await createServerSupabaseClient()
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 데이터베이스 연결 상태 확인
    let dbStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    let dbQueryTime = 0

    try {
      const startTime = Date.now()
      await supabase.from('profiles').select('count', { count: 'exact', head: true })
      dbQueryTime = Date.now() - startTime

      if (dbQueryTime > 1000) dbStatus = 'degraded'
      if (dbQueryTime > 5000) dbStatus = 'down'
    } catch {
      dbStatus = 'down'
    }

    // 사용자 통계
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: newUsers24h } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())

    // 방 통계
    const { count: totalRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })

    const { count: activeRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .gte('start_at', now.toISOString())

    const { count: newRooms24h } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())

    const metrics: SystemMetrics = {
      timestamp: now.toISOString(),
      database: {
        status: dbStatus,
        query_performance: dbQueryTime,
      },
      api: {
        total_requests_24h: 0, // 실제 구현 시 로그 분석 필요
        error_rate_24h: 0,
        avg_response_time: 0,
      },
      users: {
        total_users: totalUsers || 0,
        active_users_24h: 0, // 활성 사용자 추적 로직 필요
        new_users_24h: newUsers24h || 0,
      },
      rooms: {
        total_rooms: totalRooms || 0,
        active_rooms: activeRooms || 0,
        new_rooms_24h: newRooms24h || 0,
      },
      system: {
        memory_usage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        uptime: process.uptime(),
        error_count_24h: 0, // 에러 로깅 시스템 필요
      },
    }

    return NextResponse.json({
      ok: true,
      data: metrics,
    })
  } catch (error) {
    logger.error('Monitoring API error:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      {
        ok: false,
        message: '모니터링 데이터 수집 실패',
      },
      { status: 500 }
    )
  }
}
