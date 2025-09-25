/* src/lib/telemetry/webVitals.ts */
// 📊 Web Vitals 수집 - LCP/CLS/INP/TBT/TTFB 샘플링 전송

'use client'

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
  navigationType?: string
}

export interface VitalsPayload {
  url: string
  user_agent: string
  connection_type?: string
  device_type: 'mobile' | 'tablet' | 'desktop'
  metrics: WebVitalMetric[]
  session_id: string
  timestamp: string
  sampling_rate: number
}

// Web Vitals 임계값 (Google 권장 기준)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

// 성능 등급 계산
function getRating(
  name: WebVitalMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// 디바이스 타입 감지
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const userAgent = navigator.userAgent.toLowerCase()

  // 모바일 감지
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    // 태블릿 vs 모바일 구분
    if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent)) {
      return 'tablet'
    }
    return 'mobile'
  }

  return 'desktop'
}

// 연결 타입 감지 (Navigator Connection API)
function getConnectionType(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  return connection?.effectiveType || connection?.type
}

// 세션 ID 생성 (페이지 로드마다 새로 생성)
function generateSessionId(): string {
  if (typeof window === 'undefined') return 'server-' + Date.now()

  let sessionId = sessionStorage.getItem('vitals-session-id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('vitals-session-id', sessionId)
  }
  return sessionId
}

// 샘플링 결정
function shouldSample(): boolean {
  const samplingRate = parseFloat(process.env.NEXT_PUBLIC_TELEMETRY_SAMPLING_RATE || '0.1')
  return Math.random() < samplingRate
}

// Web Vitals 데이터 전송
async function sendVitals(metrics: WebVitalMetric[]) {
  if (!shouldSample()) return

  try {
    const payload: VitalsPayload = {
      url: window.location.href,
      user_agent: navigator.userAgent,
      connection_type: getConnectionType(),
      device_type: getDeviceType(),
      metrics,
      session_id: generateSessionId(),
      timestamp: new Date().toISOString(),
      sampling_rate: parseFloat(process.env.NEXT_PUBLIC_TELEMETRY_SAMPLING_RATE || '0.1'),
    }

    // beacon API 사용 (페이지 이탈 시에도 전송)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry/web-vitals', JSON.stringify(payload))
    } else {
      // fallback to fetch
      fetch('/api/telemetry/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(console.error)
    }

    // 개발 모드에서는 콘솔에도 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Web Vitals:', metrics)
    }
  } catch (error) {
    console.error('Failed to send web vitals:', error)
  }
}

// 메트릭 누적 저장소
let pendingMetrics: WebVitalMetric[] = []
let sendTimer: NodeJS.Timeout | null = null

// 메트릭 배치 전송 (3초마다 또는 5개 누적시)
function scheduleMetricsSend() {
  if (sendTimer) clearTimeout(sendTimer)

  sendTimer = setTimeout(() => {
    if (pendingMetrics.length > 0) {
      sendVitals([...pendingMetrics])
      pendingMetrics = []
    }
  }, 3000) // 3초 후 전송
}

// 메트릭 수집 핸들러
function handleMetric(metric: any) {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  }

  pendingMetrics.push(webVitalMetric)

  // 즉시 전송 조건: 5개 누적 또는 poor 성능
  if (pendingMetrics.length >= 5 || webVitalMetric.rating === 'poor') {
    sendVitals([...pendingMetrics])
    pendingMetrics = []
    if (sendTimer) clearTimeout(sendTimer)
  } else {
    scheduleMetricsSend()
  }
}

// Web Vitals 수집 시작
export function startWebVitalsCollection() {
  if (typeof window === 'undefined') return

  try {
    // Core Web Vitals
    onCLS(handleMetric)
    onLCP(handleMetric)

    // Additional metrics
    onFCP(handleMetric)
    onTTFB(handleMetric)
    onINP(handleMetric)

    // 페이지 이탈 시 남은 메트릭 전송
    window.addEventListener('beforeunload', () => {
      if (pendingMetrics.length > 0) {
        sendVitals([...pendingMetrics])
      }
    })

    // Visibility change 시에도 전송 (백그라운드 진입)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && pendingMetrics.length > 0) {
        sendVitals([...pendingMetrics])
        pendingMetrics = []
      }
    })
  } catch (error) {
    console.error('Failed to initialize web vitals collection:', error)
  }
}

// Next.js App Router에서 사용하기 위한 컴포넌트
export function WebVitalsReporter() {
  if (typeof window !== 'undefined') {
    startWebVitalsCollection()
  }

  return null
}

// 수동 메트릭 전송 (커스텀 메트릭용)
export function reportCustomMetric(name: string, value: number, unit: string = 'ms') {
  if (!shouldSample()) return

  const customMetric = {
    name: `custom_${name}`,
    value,
    unit,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  }

  fetch('/api/telemetry/custom-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customMetric),
  }).catch(console.error)
}
