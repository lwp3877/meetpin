/**
 * 성능 모니터링 및 분석 시스템
 * 
 * Web Vitals, 사용자 행동, 에러 추적을 담당합니다.
 */

import { flags } from '@/lib/config/flags'

// Web Vitals 메트릭 타입
export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

// 사용자 행동 이벤트 타입
export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: number
  userAgent: string
  url: string
}

// 에러 추적 인터페이스
export interface ErrorEvent {
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  timestamp: number
  userId?: string
  sessionId: string
  userAgent: string
  url: string
}

class Analytics {
  private sessionId: string
  private userId?: string
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = flags.analyticsEnabled
    
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
      this.initializeErrorTracking()
      this.initializeUserTracking()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Web Vitals 초기화
  private async initializeWebVitals() {
    if (!this.isEnabled) return

    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')
      
      const sendToAnalytics = (metric: any) => {
        this.trackWebVital(metric as WebVitalsMetric)
      }

      onCLS(sendToAnalytics)
      onINP(sendToAnalytics) // FID is deprecated, use INP
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    } catch (error) {
      console.warn('Web Vitals 초기화 실패:', error)
    }
  }

  // 에러 추적 초기화
  private initializeErrorTracking() {
    if (!this.isEnabled) return

    // JavaScript 에러 추적
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    })

    // Promise rejection 추적
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    })
  }

  // 사용자 추적 초기화
  private initializeUserTracking() {
    if (!this.isEnabled) return

    // 페이지 뷰 추적
    this.trackPageView()

    // 사용자 상호작용 추적
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.dataset.analytics) {
        this.trackEvent('click', 'interaction', target.dataset.analytics)
      }
    })

    // 스크롤 깊이 추적
    let maxScrollDepth = 0
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        if (scrollDepth >= 25 && scrollDepth % 25 === 0) {
          this.trackEvent('scroll', 'engagement', `${scrollDepth}%`)
        }
      }
    })
  }

  // 사용자 ID 설정
  setUserId(userId: string) {
    this.userId = userId
  }

  // Web Vitals 추적
  private trackWebVital(metric: WebVitalsMetric) {
    if (!this.isEnabled) return

    const data = {
      event: 'web_vital',
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: Date.now(),
      url: window.location.href
    }

    // Vercel Analytics 전송
    if (window.va) {
      window.va('track', data)
    }

    // 개발 환경에서 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Web Vital [${metric.name}]:`, metric.value, metric.rating)
    }

    // 커스텀 분석 엔드포인트 전송
    this.sendToEndpoint('/api/analytics/web-vitals', data)
  }

  // 사용자 이벤트 추적
  trackEvent(action: string, category: string, label?: string, value?: number) {
    if (!this.isEnabled) return

    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Vercel Analytics 전송
    if (window.va) {
      window.va('track', { action, category, label, value })
    }

    // Google Analytics 전송 (설정된 경우)
    if (window.gtag && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      })
    }

    // 개발 환경에서 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Event [${category}/${action}]:`, label, value)
    }

    // 커스텀 분석 엔드포인트 전송
    this.sendToEndpoint('/api/analytics/events', event)
  }

  // 페이지 뷰 추적
  trackPageView(page?: string) {
    if (!this.isEnabled) return

    const url = page || window.location.pathname
    
    this.trackEvent('page_view', 'navigation', url)
  }

  // 에러 추적
  private trackError(error: ErrorEvent) {
    if (!this.isEnabled) return

    // Vercel Analytics 전송
    if (window.va) {
      window.va('track', {
        event: 'Error',
        message: error.message,
        filename: error.filename,
        url: error.url
      })
    }

    // 개발 환경에서 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('🔥 Error tracked:', error.message)
    }

    // 커스텀 에러 추적 엔드포인트 전송
    this.sendToEndpoint('/api/analytics/errors', error)
  }

  // 성능 메트릭 수동 측정
  measurePerformance(name: string, fn: () => Promise<any> | any) {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime
        this.trackEvent('performance', 'custom_timing', name, Math.round(duration))
      })
    } else {
      const duration = performance.now() - startTime
      this.trackEvent('performance', 'custom_timing', name, Math.round(duration))
      return result
    }
  }

  // 커스텀 엔드포인트로 데이터 전송
  private async sendToEndpoint(endpoint: string, data: any) {
    if (!this.isEnabled) return

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    } catch (error) {
      // 분석 데이터 전송 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics 전송 실패:', error)
      }
    }
  }
}

// 싱글톤 인스턴스
let analytics: Analytics | null = null

export function getAnalytics(): Analytics {
  if (!analytics && typeof window !== 'undefined') {
    analytics = new Analytics()
  }
  return analytics!
}

// 편의 함수들
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  getAnalytics()?.trackEvent(action, category, label, value)
}

export function trackPageView(page?: string) {
  getAnalytics()?.trackPageView(page)
}

export function measurePerformance<T>(name: string, fn: () => T): T {
  return getAnalytics()?.measurePerformance(name, fn) || fn()
}

export function setUserId(userId: string) {
  getAnalytics()?.setUserId(userId)
}

// 글로벌 타입 확장
declare global {
  interface Window {
    va?: (event: string, data?: any) => void
    gtag?: (...args: any[]) => void
  }
}

export default Analytics