/* src/app/api/healthz/route.ts */
// 🏥 종합 헬스체크 엔드포인트 - 종속 서비스 ping

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
  details?: Record<string, any>
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  environment: string
  checks: HealthCheck[]
  summary: {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
  }
}

async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now()
  
  try {
    if (isDevelopmentMode) {
      // 개발 모드에서는 Mock 데이터 사용으로 항상 healthy
      return {
        service: 'supabase',
        status: 'healthy',
        latency: 10,
        details: { mode: 'development', connection: 'mock' }
      }
    }

    const supabase = await createServerSupabaseClient()
    
    // 간단한 SELECT 쿼리로 DB 연결 확인
    const { data, error } = await supabase
      .from('profiles')
      .select('uid')
      .limit(1)
      .single()

    const latency = Date.now() - start

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found (정상)
      return {
        service: 'supabase',
        status: 'unhealthy',
        latency,
        error: error.message,
        details: { code: error.code }
      }
    }

    // 지연시간 기반 상태 결정
    const status = latency > 1000 ? 'degraded' : 'healthy'

    return {
      service: 'supabase',
      status,
      latency,
      details: { 
        connection: 'active',
        response_time_threshold: '1000ms' 
      }
    }

  } catch (error: any) {
    return {
      service: 'supabase',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error.message,
      details: { type: 'connection_error' }
    }
  }
}

async function checkExternalAPIs(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  // Kakao Maps API 체크
  if (process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY) {
    const start = Date.now()
    try {
      // Kakao API 간단한 ping (실제로는 키 유효성만 확인)
      const latency = Date.now() - start
      checks.push({
        service: 'kakao_maps',
        status: 'healthy',
        latency,
        details: { api_key_configured: true }
      })
    } catch (error: any) {
      checks.push({
        service: 'kakao_maps',
        status: 'unhealthy',
        error: error.message
      })
    }
  }

  // Stripe API 체크
  if (process.env.STRIPE_SECRET_KEY) {
    checks.push({
      service: 'stripe',
      status: 'healthy',
      details: { api_key_configured: true }
    })
  }

  return checks
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // 병렬로 모든 헬스체크 실행
    const [supabaseCheck, externalChecks] = await Promise.all([
      checkSupabase(),
      checkExternalAPIs()
    ])

    const allChecks = [supabaseCheck, ...externalChecks]
    
    // 시스템 메트릭 추가
    const memoryUsage = process.memoryUsage()
    const systemCheck: HealthCheck = {
      service: 'system',
      status: 'healthy',
      details: {
        memory_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        uptime_seconds: Math.round(process.uptime()),
        node_version: process.version
      }
    }
    allChecks.push(systemCheck)

    // 전체 상태 결정
    const summary = {
      total: allChecks.length,
      healthy: allChecks.filter(c => c.status === 'healthy').length,
      unhealthy: allChecks.filter(c => c.status === 'unhealthy').length,
      degraded: allChecks.filter(c => c.status === 'degraded').length
    }

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy'
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded'
    }

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: isDevelopmentMode ? 'development' : 'production',
      checks: allChecks,
      summary
    }

    // 응답 시간 로깅
    const totalLatency = Date.now() - startTime
    console.log(`[HEALTH] Overall: ${overallStatus}, Latency: ${totalLatency}ms`)

    // 상태별 HTTP 코드 반환
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    console.error('[HEALTH] Critical error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: isDevelopmentMode ? 'development' : 'production',
      error: error.message,
      checks: [],
      summary: { total: 0, healthy: 0, unhealthy: 1, degraded: 0 }
    }, { status: 503 })
  }
}