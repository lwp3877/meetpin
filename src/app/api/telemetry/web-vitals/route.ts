/* src/app/api/telemetry/web-vitals/route.ts */
// 📊 Web Vitals 수집 API - 샘플링율 적용, PII 제거, 일일 요약 로그

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
  navigationType?: string
}

interface VitalsPayload {
  url: string
  user_agent: string
  connection_type?: string
  device_type: 'mobile' | 'tablet' | 'desktop'
  metrics: WebVitalMetric[]
  session_id: string
  timestamp: string
  sampling_rate: number
}

// PII 제거 함수
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // 쿼리 파라미터에서 PII 가능성이 있는 것들 제거
    const sensitiveParams = ['email', 'phone', 'token', 'session', 'user', 'id']

    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })

    return urlObj.pathname + (urlObj.search || '')
  } catch {
    return '/unknown'
  }
}

function sanitizeUserAgent(userAgent: string): string {
  // User Agent에서 버전 정보만 유지하고 개인식별 가능한 부분 제거
  return userAgent
    .replace(/\([^)]*\)/g, '') // 괄호 안 내용 제거
    .replace(/Version\/[\d.]+/g, '') // 버전 정보 제거
    .substring(0, 100) // 길이 제한
}

// 메트릭 검증
function validateMetrics(metrics: any[]): WebVitalMetric[] {
  const validMetrics: WebVitalMetric[] = []

  for (const metric of metrics) {
    if (!metric.name || !metric.value || typeof metric.value !== 'number') {
      continue
    }

    // 메트릭 이름 화이트리스트
    if (!['CLS', 'FCP', 'FID', 'LCP', 'TTFB', 'INP'].includes(metric.name)) {
      continue
    }

    // 비정상적인 값 필터링
    if (metric.value < 0 || metric.value > 60000) {
      // 60초 초과는 무시
      continue
    }

    validMetrics.push({
      name: metric.name,
      value: Math.round(metric.value * 100) / 100, // 소수점 2자리
      rating: metric.rating || 'needs-improvement',
      delta: metric.delta ? Math.round(metric.delta * 100) / 100 : undefined,
      navigationType: metric.navigationType,
    })
  }

  return validMetrics
}

// 일일 요약 통계 저장 (메모리 기반, 실제로는 Redis/DB 사용)
const dailyStats = new Map<
  string,
  {
    date: string
    count: number
    avgLCP: number
    avgCLS: number
    avgTTFB: number
    deviceTypes: Record<string, number>
    ratings: Record<string, number>
  }
>()

function updateDailyStats(payload: VitalsPayload) {
  const today = new Date().toISOString().split('T')[0]
  const key = `stats_${today}`

  const existing = dailyStats.get(key) || {
    date: today,
    count: 0,
    avgLCP: 0,
    avgCLS: 0,
    avgTTFB: 0,
    deviceTypes: {},
    ratings: {},
  }

  existing.count++
  existing.deviceTypes[payload.device_type] = (existing.deviceTypes[payload.device_type] || 0) + 1

  // 메트릭별 평균 계산
  payload.metrics.forEach(metric => {
    existing.ratings[metric.rating] = (existing.ratings[metric.rating] || 0) + 1

    switch (metric.name) {
      case 'LCP':
        existing.avgLCP = (existing.avgLCP * (existing.count - 1) + metric.value) / existing.count
        break
      case 'CLS':
        existing.avgCLS = (existing.avgCLS * (existing.count - 1) + metric.value) / existing.count
        break
      case 'TTFB':
        existing.avgTTFB = (existing.avgTTFB * (existing.count - 1) + metric.value) / existing.count
        break
    }
  })

  dailyStats.set(key, existing)

  // 100개 샘플마다 요약 로그 출력
  if (existing.count % 100 === 0) {
    logger.info('Web Vitals daily summary', {
      date: today,
      sample_count: existing.count,
      avg_lcp: Math.round(existing.avgLCP),
      avg_cls: Math.round(existing.avgCLS * 1000) / 1000,
      avg_ttfb: Math.round(existing.avgTTFB),
      device_distribution: existing.deviceTypes,
      rating_distribution: existing.ratings,
    })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 샘플링 체크
    const samplingRate = parseFloat(process.env.TELEMETRY_SAMPLING_RATE || '0.1')
    if (Math.random() >= samplingRate) {
      return NextResponse.json({ status: 'sampled_out' }, { status: 200 })
    }

    const payload: VitalsPayload = await request.json()

    // 입력 검증
    if (!payload.metrics || !Array.isArray(payload.metrics) || payload.metrics.length === 0) {
      return NextResponse.json({ error: 'Invalid metrics' }, { status: 400 })
    }

    // 메트릭 검증 및 정제
    const validMetrics = validateMetrics(payload.metrics)
    if (validMetrics.length === 0) {
      return NextResponse.json({ error: 'No valid metrics' }, { status: 400 })
    }

    // PII 제거
    const sanitizedPayload = {
      ...payload,
      url: sanitizeUrl(payload.url),
      user_agent: sanitizeUserAgent(payload.user_agent || ''),
      metrics: validMetrics,
    }

    // 구조화 로그 출력
    logger.info('Web Vitals collected', {
      device_type: sanitizedPayload.device_type,
      connection_type: sanitizedPayload.connection_type,
      metrics_count: validMetrics.length,
      url: sanitizedPayload.url,
      sampling_rate: samplingRate,
      session_id: payload.session_id ? 'present' : 'missing',
    })

    // 개별 메트릭 로그 (poor 성능인 경우)
    validMetrics.forEach(metric => {
      if (metric.rating === 'poor') {
        logger.warn(`Poor Web Vital detected: ${metric.name}`, {
          metric_name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: sanitizedPayload.url,
          device_type: sanitizedPayload.device_type,
        })
      }
    })

    // 일일 통계 업데이트
    updateDailyStats(sanitizedPayload)

    return NextResponse.json(
      {
        status: 'recorded',
        metrics_processed: validMetrics.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error('Web Vitals collection failed', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
    })

    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// 통계 조회 엔드포인트 (개발/운영팀용)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const stats = dailyStats.get(`stats_${date}`)

    if (!stats) {
      return NextResponse.json({
        date,
        message: 'No data for this date',
        available_dates: Array.from(dailyStats.keys()).map(k => k.replace('stats_', '')),
      })
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
