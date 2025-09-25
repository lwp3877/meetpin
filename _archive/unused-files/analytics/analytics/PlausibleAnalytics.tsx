'use client'

import React from 'react'
import Script from 'next/script'
import { AnalyticsGuard } from './ConsentGuard'

interface PlausibleAnalyticsProps {
  domain: string
  apiHost?: string
  trackLocalhost?: boolean
}

/**
 * Plausible Analytics 이벤트 추적
 */
export function trackPlausibleEvent(eventName: string, props?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    ;(window as any).plausible(eventName, { props })
  }
}

/**
 * Plausible Analytics 페이지뷰 추적
 */
export function trackPlausiblePageView(url?: string) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    ;(window as any).plausible('pageview', { u: url })
  }
}

/**
 * Plausible Analytics 스크립트 컴포넌트
 */
function PlausibleScript({
  domain,
  apiHost = 'https://plausible.io',
  trackLocalhost = false,
}: PlausibleAnalyticsProps) {
  const scriptSrc = `${apiHost}/js/script.js`

  const handleConsentGranted = () => {
    // Plausible은 쿠키를 사용하지 않지만 명시적으로 활성화
    if (typeof window !== 'undefined') {
      console.log('Plausible Analytics enabled with user consent')
    }
  }

  const handleConsentDenied = () => {
    // Plausible 비활성화 (쿠키 없는 분석도 존중)
    if (typeof window !== 'undefined') {
      // Plausible 스크립트 제거
      const scripts = document.querySelectorAll(`script[src^="${apiHost}"]`)
      scripts.forEach(script => script.remove())

      console.log('Plausible Analytics disabled due to user consent')
    }
  }

  return (
    <AnalyticsGuard onConsentGranted={handleConsentGranted} onConsentDenied={handleConsentDenied}>
      <Script
        src={scriptSrc}
        data-domain={domain}
        data-api={`${apiHost}/api/event`}
        data-exclude={trackLocalhost ? '' : 'localhost'}
        strategy="afterInteractive"
        defer
      />
    </AnalyticsGuard>
  )
}

/**
 * 메인 Plausible Analytics 컴포넌트
 */
export default function PlausibleAnalytics({
  domain,
  apiHost,
  trackLocalhost,
}: PlausibleAnalyticsProps) {
  // 환경 변수에서 도메인 가져오기 (fallback)
  const siteDomain = domain || process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  if (!siteDomain) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Plausible Analytics domain not provided')
    }
    return null
  }

  return <PlausibleScript domain={siteDomain} apiHost={apiHost} trackLocalhost={trackLocalhost} />
}

/**
 * 커스텀 훅: Plausible Analytics 이벤트 추적
 */
export function usePlausibleAnalytics(domain?: string) {
  const siteDomain = domain || process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  const track = (eventName: string, props?: Record<string, string | number>) => {
    if (!siteDomain) return
    trackPlausibleEvent(eventName, props)
  }

  const pageView = (url?: string) => {
    if (!siteDomain) return
    trackPlausiblePageView(url)
  }

  return {
    track,
    pageView,
    isEnabled: Boolean(siteDomain),
  }
}

/**
 * Plausible Analytics용 이벤트 타입 정의
 */
export interface PlausibleEvent {
  name: string
  props?: {
    [key: string]: string | number
  }
}

/**
 * 일반적인 이벤트들
 */
export const PlausibleEvents = {
  // 사용자 행동
  SIGNUP: 'signup',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // 방 관련
  ROOM_CREATE: 'room_create',
  ROOM_JOIN: 'room_join',
  ROOM_LEAVE: 'room_leave',

  // 매칭 관련
  MATCH_REQUEST: 'match_request',
  MATCH_ACCEPT: 'match_accept',
  MATCH_REJECT: 'match_reject',

  // 메시지 관련
  MESSAGE_SEND: 'message_send',
  MESSAGE_READ: 'message_read',

  // 결제 관련
  BOOST_PURCHASE: 'boost_purchase',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAIL: 'payment_fail',

  // 기타
  PROFILE_UPDATE: 'profile_update',
  SEARCH: 'search',
  FILTER_USE: 'filter_use',
} as const
