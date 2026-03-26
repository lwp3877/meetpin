/* src/lib/observability/logger-server.ts */
// 🔐 서버 전용 로거 - 순환 의존성 해결 및 API 에러 로깅 복구
/* eslint-disable no-console */ // 이 파일이 server-side logger 자체이므로 console 직접 사용이 의도됨

import 'server-only'
import { NextRequest } from 'next/server'
import { scrubPII, generateRequestId, shouldSample, type LogContext, type LogLevel } from './logger'

/**
 * 서버 전용 구조화 로거
 * - API Routes에서 안전하게 사용 가능
 * - 순환 의존성 없음
 * - PII 자동 스크러빙
 * - 환경별 출력 형식 자동 전환
 */
export class ServerLogger {
  private context: LogContext
  private minLevel: LogLevel

  constructor(context: LogContext = {}, minLevel?: LogLevel) {
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'meetpin-api',
    }

    // 환경별 최소 로그 레벨 설정
    this.minLevel =
      minLevel ||
      (process.env.NODE_ENV === 'production'
        ? 'info'
        : process.env.NODE_ENV === 'test'
          ? 'error'
          : 'debug')
  }

  // 로그 레벨 우선순위
  private getLevelPriority(level: LogLevel): number {
    const priorities = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 }
    return priorities[level] || 0
  }

  // 로그 출력 여부 판단
  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.minLevel)
  }

  // 컨텍스트 추가
  with(additionalContext: LogContext): ServerLogger {
    return new ServerLogger(
      {
        ...this.context,
        ...additionalContext,
      },
      this.minLevel
    )
  }

  // 로그 출력 (레벨별)
  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    if (!this.shouldLog(level)) return

    const logEntry = {
      level,
      message: scrubPII(message),
      ...this.context,
      ...meta,
      timestamp: new Date().toISOString(),
    }

    // 개발 환경: 컬러 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      const coloredLevel = this.colorizeLevel(level)
      const contextStr = this.context.requestId ? `[${this.context.requestId.slice(0, 12)}]` : ''
      const pathStr = this.context.path ? `${this.context.method} ${this.context.path}` : ''

      console.log(`${coloredLevel} ${contextStr} ${pathStr} ${message}`)

      // 메타데이터가 있으면 출력
      if (Object.keys(meta).length > 0) {
        console.log('  └─', meta)
      }

      // 에러 객체가 있으면 스택 트레이스 출력
      if (meta.error instanceof Error) {
        console.error('  └─ Stack:', meta.error.stack)
      }
    } else {
      // 프로덕션: JSON 구조화 로그 (Datadog, CloudWatch 등 호환)
      console.log(JSON.stringify(logEntry))
    }
  }

  private colorizeLevel(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m[DEBUG]\x1b[0m', // Cyan
      info: '\x1b[32m[INFO]\x1b[0m', // Green
      warn: '\x1b[33m[WARN]\x1b[0m', // Yellow
      error: '\x1b[31m[ERROR]\x1b[0m', // Red
      fatal: '\x1b[35m[FATAL]\x1b[0m', // Magenta
    }
    return colors[level] || level
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta || {})
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta || {})
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta || {})
  }

  error(message: string, error?: Error | string, meta?: Record<string, any>) {
    const errorMeta = {
      ...(meta || {}),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    }
    this.log('error', message, errorMeta)
  }

  fatal(message: string, error?: Error | string, meta?: Record<string, any>) {
    const errorMeta = {
      ...(meta || {}),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    }
    this.log('fatal', message, errorMeta)
  }
}

/**
 * Request 기반 서버 로거 생성
 */
export async function createServerLogger(request: NextRequest): Promise<ServerLogger> {
  const requestId = generateRequestId()

  const context: LogContext = {
    requestId,
    path: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 200) || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    sampling: shouldSample(),
  }

  return new ServerLogger(context)
}

/**
 * API Route 로깅 헬퍼
 */
export function logApiRequest(
  logger: ServerLogger,
  startTime: number,
  status: number,
  error?: Error | string
) {
  const latency = Date.now() - startTime

  const loggerWithContext = logger.with({ latency, status })

  if (status >= 500) {
    loggerWithContext.error(`API request failed (${status})`, error)
  } else if (status >= 400) {
    loggerWithContext.warn(`API request warning (${status})`, { error: error?.toString() })
  } else {
    loggerWithContext.info(`API request completed (${status})`)
  }
}

/**
 * 성능 측정 헬퍼 (서버 전용)
 */
export class ServerPerformanceTimer {
  private startTime: number
  private logger: ServerLogger
  private operation: string

  constructor(logger: ServerLogger, operation: string) {
    this.startTime = Date.now()
    this.logger = logger
    this.operation = operation
  }

  end(success: boolean = true, meta: Record<string, any> = {}) {
    const duration = Date.now() - this.startTime

    const context = {
      operation: this.operation,
      duration,
      success,
      ...meta,
    }

    if (success) {
      this.logger.info(`Operation ${this.operation} completed`, context)
    } else {
      this.logger.warn(`Operation ${this.operation} failed`, context)
    }

    return duration
  }
}

// 전역 서버 로거 인스턴스
export const serverLogger = new ServerLogger()

/**
 * 사용 예시:
 *
 * // API Route에서
 * import { createServerLogger, logApiRequest } from '@/lib/observability/logger-server'
 *
 * export async function POST(request: NextRequest) {
 *   const logger = await createServerLogger(request)
 *   const startTime = Date.now()
 *
 *   try {
 *     logger.info('Processing request', { body: await request.json() })
 *     // ... 비즈니스 로직
 *     logApiRequest(logger, startTime, 200)
 *     return NextResponse.json({ ok: true })
 *   } catch (error) {
 *     logApiRequest(logger, startTime, 500, error as Error)
 *     return NextResponse.json({ ok: false }, { status: 500 })
 *   }
 * }
 */
