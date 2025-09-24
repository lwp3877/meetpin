'use client'

import React from 'react'
import GoogleAnalytics from './GoogleAnalytics'
import PlausibleAnalytics from './PlausibleAnalytics'
import { MarketingGuard } from './ConsentGuard'

interface AnalyticsManagerProps {
  // Google Analytics
  googleAnalyticsId?: string
  
  // Plausible Analytics  
  plausibleDomain?: string
  plausibleApiHost?: string
  
  // Facebook Pixel (마케팅 동의 필요)
  facebookPixelId?: string
  
  // 기타 설정
  trackLocalhost?: boolean
  debug?: boolean
}

/**
 * Facebook Pixel 컴포넌트
 */
function FacebookPixel({ pixelId }: { pixelId: string }) {
  const handleConsentGranted = () => {
    // Facebook Pixel 초기화
    if (typeof window !== 'undefined') {
      (window as any).fbq('init', pixelId)
      ;(window as any).fbq('track', 'PageView')
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Facebook Pixel initialized with consent')
      }
    }
  }

  const handleConsentDenied = () => {
    // Facebook Pixel 비활성화
    if (typeof window !== 'undefined') {
      // Facebook 스크립트 제거
      const fbScripts = document.querySelectorAll('script[src*="connect.facebook.net"]')
      fbScripts.forEach(script => script.remove())
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Facebook Pixel disabled due to consent')
      }
    }
  }

  return (
    <MarketingGuard
      onConsentGranted={handleConsentGranted}
      onConsentDenied={handleConsentDenied}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `
        }}
      />
    </MarketingGuard>
  )
}

/**
 * 통합 분석 관리자
 */
export default function AnalyticsManager({
  googleAnalyticsId,
  plausibleDomain,
  plausibleApiHost,
  facebookPixelId,
  trackLocalhost = false,
  debug = false
}: AnalyticsManagerProps) {
  // 환경 변수에서 설정 가져오기
  const gaId = googleAnalyticsId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const plausibleSite = plausibleDomain || process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const fbPixelId = facebookPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

  if (debug && process.env.NODE_ENV === 'development') {
    console.log('Analytics Manager Configuration:', {
      googleAnalytics: Boolean(gaId),
      plausible: Boolean(plausibleSite),
      facebookPixel: Boolean(fbPixelId),
      trackLocalhost
    })
  }

  return (
    <>
      {/* Google Analytics (분석 동의 필요) */}
      {gaId && (
        <GoogleAnalytics measurementId={gaId} />
      )}

      {/* Plausible Analytics (개인정보 보호 중심, 분석 동의 필요) */}
      {plausibleSite && (
        <PlausibleAnalytics
          domain={plausibleSite}
          apiHost={plausibleApiHost}
          trackLocalhost={trackLocalhost}
        />
      )}

      {/* Facebook Pixel (마케팅 동의 필요) */}
      {fbPixelId && (
        <FacebookPixel pixelId={fbPixelId} />
      )}
    </>
  )
}

/**
 * 통합 분석 추적 훅
 */
export function useAnalytics() {
  const trackEvent = (
    eventName: string,
    properties?: Record<string, any>,
    options?: {
      ga?: boolean
      plausible?: boolean
      facebook?: boolean
    }
  ) => {
    const { ga = true, plausible = true, facebook = false } = options || {}

    // Google Analytics
    if (ga && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties)
    }

    // Plausible Analytics
    if (plausible && typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(eventName, { props: properties })
    }

    // Facebook Pixel
    if (facebook && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, properties)
    }
  }

  const trackPageView = (url?: string) => {
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_location: url
      })
    }

    // Plausible Analytics
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('pageview', { u: url })
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }

  return {
    trackEvent,
    trackPageView
  }
}

/**
 * 일반적인 분석 이벤트들
 */
export const AnalyticsEvents = {
  // 사용자
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PROFILE_UPDATE: 'profile_update',
  
  // 방
  ROOM_CREATE: 'room_create',
  ROOM_VIEW: 'room_view',
  ROOM_JOIN_REQUEST: 'room_join_request',
  ROOM_SHARE: 'room_share',
  
  // 매칭
  MATCH_ACCEPT: 'match_accept',
  MATCH_REJECT: 'match_reject',
  CHAT_START: 'chat_start',
  MESSAGE_SEND: 'message_send',
  
  // 검색
  SEARCH_PERFORM: 'search_perform',
  FILTER_APPLY: 'filter_apply',
  MAP_INTERACTION: 'map_interaction',
  
  // 결제
  BOOST_VIEW: 'boost_view',
  BOOST_PURCHASE_START: 'boost_purchase_start',
  BOOST_PURCHASE_COMPLETE: 'boost_purchase_complete',
  PAYMENT_METHOD_SELECT: 'payment_method_select',
  
  // 참여
  FEATURE_USE: 'feature_use',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  // 문제
  ERROR_OCCUR: 'error_occur',
  REPORT_SUBMIT: 'report_submit',
  FEEDBACK_SUBMIT: 'feedback_submit'
} as const