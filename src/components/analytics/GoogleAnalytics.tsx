'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'
import { AnalyticsGuard } from './ConsentGuard'

interface GoogleAnalyticsProps {
  measurementId: string
}

// Google Analytics 이벤트 타입
export interface GAEvent {
  action: string
  category: string
  label?: string
  value?: number
}

// Google Analytics 함수들 - 타입은 src/types/global.d.ts에 정의됨

/**
 * Google Analytics 이벤트 전송
 */
export function trackEvent({ action, category, label, value }: GAEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

/**
 * 페이지뷰 추적
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_location: url,
      page_title: title
    })
  }
}

/**
 * 동의 상태 업데이트
 */
export function updateGAConsent(hasConsent: boolean) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_storage: 'denied', // 마케팅 동의는 별도 관리
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    })
  }
}

/**
 * Google Analytics 컴포넌트
 */
function GoogleAnalyticsScript({ measurementId }: GoogleAnalyticsProps) {
  const handleConsentGranted = () => {
    // 동의가 허용되었을 때 Analytics 활성화
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
      
      // 초기 설정
      window.gtag('config', measurementId, {
        send_page_view: true,
        anonymize_ip: true, // IP 익명화
        allow_google_signals: false, // Google 신호 비활성화
        cookie_flags: 'samesite=strict;secure' // 쿠키 보안 설정
      })
    }
  }

  const handleConsentDenied = () => {
    // 동의가 거부되었을 때 Analytics 비활성화
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  useEffect(() => {
    // 초기 동의 상태 설정 (기본값: 거부)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500 // 500ms 대기
      })
    }
  }, [])

  return (
    <>
      {/* Google Analytics 스크립트 로드 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            
            // 기본 동의 상태 설정
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            
            gtag('js', new Date());
          `
        }}
      />
      
      {/* 동의 기반 초기화 */}
      <AnalyticsGuard
        onConsentGranted={handleConsentGranted}
        onConsentDenied={handleConsentDenied}
      >
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', '${measurementId}', {
                send_page_view: true,
                anonymize_ip: true,
                allow_google_signals: false,
                cookie_flags: 'samesite=strict;secure'
              });
            `
          }}
        />
      </AnalyticsGuard>
    </>
  )
}

/**
 * 메인 Google Analytics 컴포넌트
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  // 환경 변수에서 측정 ID 가져오기 (fallback)
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!gaId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics measurement ID not provided')
    }
    return null
  }

  return <GoogleAnalyticsScript measurementId={gaId} />
}

/**
 * 커스텀 훅: Google Analytics 이벤트 추적
 */
export function useGoogleAnalytics(measurementId?: string) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  const track = (event: GAEvent) => {
    if (!gaId) return
    trackEvent(event)
  }

  const pageView = (url: string, title?: string) => {
    if (!gaId) return
    trackPageView(url, title)
  }

  return {
    track,
    pageView,
    isEnabled: Boolean(gaId)
  }
}