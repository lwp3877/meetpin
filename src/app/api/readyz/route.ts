/* src/app/api/readyz/route.ts */
// 🎯 Readiness Probe - 트래픽을 받을 준비가 되었는지 확인

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'

import { logger } from '@/lib/observability/logger'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ReadinessCheck {
  component: string
  ready: boolean
  latency?: number
  error?: string
}

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now()
  const checks: ReadinessCheck[] = []

  try {
    // 1. Database readiness 체크
    if (isDevelopmentMode) {
      // 개발 모드: Mock 데이터 사용으로 즉시 ready
      checks.push({
        component: 'database',
        ready: true,
        latency: 5,
      })
    } else {
      // 프로덕션: 실제 DB 연결 체크
      const dbStart = Date.now()
      try {
        const supabase = await createServerSupabaseClient()
        await supabase.from('profiles').select('uid').limit(1)

        checks.push({
          component: 'database',
          ready: true,
          latency: Date.now() - dbStart,
        })
      } catch (error: unknown) {
        checks.push({
          component: 'database',
          ready: false,
          error: (error as Error).message,
        })
      }
    }

    // 2. 필수 환경변수 체크
    const requiredEnvVars = isDevelopmentMode
      ? []
      : ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']

    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])
    checks.push({
      component: 'environment',
      ready: missingEnvVars.length === 0,
      error: missingEnvVars.length > 0 ? `Missing: ${missingEnvVars.join(', ')}` : undefined,
    })

    // 3. 메모리 사용량 체크 (512MB 임계값)
    const memoryUsage = process.memoryUsage()
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
    const memoryReady = heapUsedMB < 512

    checks.push({
      component: 'memory',
      ready: memoryReady,
      error: !memoryReady ? `High memory usage: ${Math.round(heapUsedMB)}MB` : undefined,
    })

    // 전체 readiness 결정
    const allReady = checks.every(check => check.ready)
    const totalLatency = Date.now() - startTime

    const response = {
      ready: allReady,
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      checks,
      summary: {
        total: checks.length,
        ready: checks.filter(c => c.ready).length,
        not_ready: checks.filter(c => !c.ready).length,
      },
    }

    // 로깅
    logger.info(`[READY] Status: ${allReady ? 'READY' : 'NOT_READY'}, Latency: ${totalLatency}ms`)

    return NextResponse.json(response, {
      status: allReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
  } catch (error: unknown) {
    logger.error('[READY] Critical error:', { error: error instanceof Error ? error.message : String(error) })

    return NextResponse.json(
      {
        ready: false,
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        checks: [],
        summary: { total: 0, ready: 0, not_ready: 1 },
      },
      { status: 503 }
    )
  }
}
