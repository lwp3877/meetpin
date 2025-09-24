'use client'

import React, { useEffect, useRef } from 'react'
import { useAnalyticsConsent, useMarketingConsent } from '@/lib/consent'

interface ConsentGuardProps {
  children: React.ReactNode
  type: 'analytics' | 'marketing'
  fallback?: React.ReactNode
  onConsentGranted?: () => void
  onConsentDenied?: () => void
}

/**
 * 동의 기반 컴포넌트 가드
 * 사용자가 해당 카테고리에 동의한 경우에만 자식 컴포넌트를 렌더링
 */
export default function ConsentGuard({
  children,
  type,
  fallback = null,
  onConsentGranted,
  onConsentDenied
}: ConsentGuardProps) {
  const analyticsConsent = useAnalyticsConsent()
  const marketingConsent = useMarketingConsent()
  const previousConsentRef = useRef<boolean | null>(null)

  const consent = type === 'analytics' ? analyticsConsent : marketingConsent
  const canLoadAnalytics = 'canLoadAnalytics' in consent ? consent.canLoadAnalytics : false
  const canLoadMarketing = 'canLoadMarketing' in consent ? consent.canLoadMarketing : false
  const isLoaded = consent.isLoaded

  const hasConsent = type === 'analytics' ? canLoadAnalytics : canLoadMarketing

  // 동의 상태 변경 감지 및 콜백 실행
  useEffect(() => {
    if (!isLoaded) return

    const previousConsent = previousConsentRef.current
    
    if (previousConsent !== hasConsent) {
      if (hasConsent) {
        onConsentGranted?.()
      } else {
        onConsentDenied?.()
      }
      
      previousConsentRef.current = hasConsent
    }
  }, [hasConsent, isLoaded, onConsentGranted, onConsentDenied])

  // 로딩 중이거나 동의가 없으면 fallback 또는 null 반환
  if (!isLoaded || !hasConsent) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * 분석 스크립트 전용 가드
 */
export function AnalyticsGuard({
  children,
  fallback,
  onConsentGranted,
  onConsentDenied
}: Omit<ConsentGuardProps, 'type'>) {
  return (
    <ConsentGuard
      type="analytics"
      fallback={fallback}
      onConsentGranted={onConsentGranted}
      onConsentDenied={onConsentDenied}
    >
      {children}
    </ConsentGuard>
  )
}

/**
 * 마케팅 스크립트 전용 가드
 */
export function MarketingGuard({
  children,
  fallback,
  onConsentGranted,
  onConsentDenied
}: Omit<ConsentGuardProps, 'type'>) {
  return (
    <ConsentGuard
      type="marketing"
      fallback={fallback}
      onConsentGranted={onConsentGranted}
      onConsentDenied={onConsentDenied}
    >
      {children}
    </ConsentGuard>
  )
}