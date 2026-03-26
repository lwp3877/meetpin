/* src/lib/observability/logger.ts */
// 🔍 구조화 로깅 유틸리티 - requestId, userId, 지연시간, PII 스크러빙
/* eslint-disable no-console */ // 이 파일이 logger 자체이므로 console 직접 사용이 의도됨

import { NextRequest } from 'next/server'

// 로그 레벨 정의
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// 구조화 로그 필드
export interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  path?: string
  method?: string
  userAgent?: string
  ip?: string
  latency?: number
  status?: number
  error?: string | Error
  sampling?: boolean
  [key: string]: unknown
}

// PII 감지 패턴 (한국어 포함)
const PII_PATTERNS = [
  /\b\d{2,3}-\d{3,4}-\d{4}\b/g, // 전화번호
  /\b\d{6}-[1-4]\d{6}\b/g, // 주민등록번호
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // 이메일
  /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, // 카드번호
  /(?:password|pwd|pass|token|secret|key)["']?\s*[:=]\s*["']?[^\s"',}]+/gi, // 비밀번호/토큰
]

// PII 스크러빙 함수
export function scrubPII(text: string): string {
  let scrubbed = text

  PII_PATTERNS.forEach(pattern => {
    scrubbed = scrubbed.replace(pattern, '[REDACTED]')
  })

  return scrubbed
}

// Request ID 생성
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 샘플링 결정 (환경변수 기반)
export function shouldSample(): boolean {
  const samplingRate = parseFloat(process.env.TELEMETRY_SAMPLING_RATE || '0.1')
  return Math.random() < samplingRate
}

// 구조화 로거 클래스
export class StructuredLogger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'meetpin-web',
    }
  }

  // 컨텍스트 추가
  with(additionalContext: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.context,
      ...additionalContext,
    })
  }

  // 로그 출력 (레벨별)
  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const logEntry = {
      level,
      message: scrubPII(message),
      ...this.context,
      ...meta,
      timestamp: new Date().toISOString(),
    }

    // 개발 환경에서는 콘솔에 보기 좋게 출력
    if (process.env.NODE_ENV === 'development') {
      const coloredLevel = this.colorizeLevel(level)
      const contextStr = this.context.requestId ? `[${this.context.requestId}]` : ''
      console.log(`${coloredLevel} ${contextStr} ${message}`, meta)
    } else {
      // 프로덕션에서는 JSON 구조화 로그
      console.log(JSON.stringify(logEntry))
    }
  }

  private colorizeLevel(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m[DEBUG]\x1b[0m',
      info: '\x1b[32m[INFO]\x1b[0m',
      warn: '\x1b[33m[WARN]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m',
      fatal: '\x1b[35m[FATAL]\x1b[0m',
    }
    return colors[level] || level
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta)
  }

  fatal(message: string, meta?: Record<string, any>) {
    this.log('fatal', message, meta)
  }
}

// Request 기반 로거 생성
export async function createRequestLogger(request: NextRequest): Promise<StructuredLogger> {
  const requestId = generateRequestId()

  // 기본 컨텍스트 구성
  const context: LogContext = {
    requestId,
    path: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 200) || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    sampling: shouldSample(),
  }

  // 인증된 사용자 정보는 호출자가 context에 추가
  // (순환 의존성 방지를 위해 getAuthenticatedUser 직접 호출하지 않음)

  return new StructuredLogger(context)
}

// API Route 미들웨어용 로깅 헬퍼
export function logApiRequest(
  logger: StructuredLogger,
  startTime: number,
  status: number,
  error?: Error | string
) {
  const latency = Date.now() - startTime
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  const message = error
    ? `API request failed: ${error instanceof Error ? error.message : error}`
    : `API request completed`

  const loggerWithContext = logger.with({ latency, status, error: error?.toString() })

  if (level === 'error') {
    loggerWithContext.error(message)
  } else if (level === 'warn') {
    loggerWithContext.warn(message)
  } else {
    loggerWithContext.info(message)
  }
}

// 전역 로거 인스턴스
export const logger = new StructuredLogger()

// 성능 측정 헬퍼
export class PerformanceTimer {
  private startTime: number
  private logger: StructuredLogger
  private operation: string

  constructor(logger: StructuredLogger, operation: string) {
    this.startTime = Date.now()
    this.logger = logger
    this.operation = operation
  }

  end(success: boolean = true, meta: Record<string, any> = {}) {
    const duration = Date.now() - this.startTime
    const level = success ? 'info' : 'warn'

    const message = `Operation ${this.operation} ${success ? 'completed' : 'failed'}`
    const context = {
      operation: this.operation,
      duration,
      success,
      ...meta,
    }

    if (level === 'warn') {
      this.logger.warn(message, context)
    } else {
      this.logger.info(message, context)
    }

    return duration
  }
}

// 사용 예시:
// const logger = await createRequestLogger(request)
// logger.info('Processing room creation request', { roomData })
// const timer = new PerformanceTimer(logger, 'database_query')
// // ... 작업 수행
// timer.end(true, { rowsAffected: 1 })
