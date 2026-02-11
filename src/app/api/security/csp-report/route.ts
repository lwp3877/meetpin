/* src/app/api/security/csp-report/route.ts */
// 🛡️ CSP 위반 리포트 수집 엔드포인트

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { requireAdmin } from '@/lib/api'

import { logger } from '@/lib/observability/logger'
interface CSPReport {
  'csp-report': {
    'document-uri': string
    referrer: string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    disposition: string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
    'status-code': number
    'script-sample': string
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSP 리포트는 빈번할 수 있으므로 관대한 레이트 리밋
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await rateLimit(
      `csp-report:${ip}`,
      100, // 100 리포트/분
      60 * 1000 // 1분
    )

    if (!rateLimitResult.success) {
      return new NextResponse('Too Many CSP Reports', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      })
    }

    const body: CSPReport = await request.json()
    const report = body['csp-report']

    if (!report) {
      return new NextResponse('Invalid CSP Report Format', { status: 400 })
    }

    // CSP 위반 로그 기록
    const violation = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: ip,
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      blockedUri: report['blocked-uri'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      scriptSample: report['script-sample']?.substring(0, 100), // 처음 100자만
      disposition: report.disposition,
    }

    // 프로덕션에서는 로깅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // 중요한 CSP 위반만 로깅 (스팸 방지)
      const importantViolations = ['script-src', 'object-src', 'base-uri', 'form-action']

      const isImportant = importantViolations.some(directive =>
        report['violated-directive'].includes(directive)
      )

      if (isImportant) {
        logger.error('🚨 Critical CSP Violation:', { error: violation instanceof Error ? violation.message : String(violation) })

        // Sentry나 다른 모니터링 서비스로 전송
        // await sendToMonitoring(violation)
      }
    } else {
      // 개발 환경에서는 모든 위반 로깅
      logger.warn('⚠️ CSP Violation:', violation)
    }

    // 위반 패턴 분석을 위한 간단한 통계
    const violationType = report['violated-directive']
    const blockedDomain = extractDomain(report['blocked-uri'])

    // 메모리 기반 카운터 (프로덕션에서는 Redis 사용 권장)
    if (!global.cspStats) {
      global.cspStats = new Map()
    }

    const statsKey = `${violationType}:${blockedDomain}`
    const currentCount = global.cspStats.get(statsKey) || 0
    global.cspStats.set(statsKey, currentCount + 1)

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    logger.error('CSP Report Processing Error:', { error: error instanceof Error ? error.message : String(error) })
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// CSP 통계 조회 (관리자용)
export async function GET(_request: NextRequest) {
  try {
    await requireAdmin()

    const stats = global.cspStats || new Map()
    const sortedStats = Array.from(stats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50) // 상위 50개만

    return NextResponse.json({
      totalViolations: Array.from(stats.values()).reduce((a, b) => a + b, 0),
      topViolations: sortedStats.map(([key, count]) => {
        const [directive, domain] = key.split(':')
        return { directive, domain, count }
      }),
      lastUpdated: new Date().toISOString(),
    })
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// 도메인 추출 헬퍼 함수
function extractDomain(url: string): string {
  try {
    if (url === 'eval' || url === 'inline') return url
    if (url.startsWith('data:')) return 'data'
    if (url.startsWith('blob:')) return 'blob'

    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return 'unknown'
  }
}

// TypeScript 글로벌 타입 확장
declare global {
  var cspStats: Map<string, number> | undefined
}
