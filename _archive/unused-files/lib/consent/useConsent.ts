'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ConsentPreferences, ConsentCategory, ConsentEvent } from './types'
import { consentManager } from './manager'

interface UseConsentReturn {
  // 상태
  preferences: ConsentPreferences | null
  isLoaded: boolean
  needsConsent: boolean
  shouldShowBanner: boolean

  // 메서드
  hasConsent: (category: ConsentCategory) => boolean
  updateConsent: (
    updates: Partial<Pick<ConsentPreferences, 'analytics' | 'marketing'>>
  ) => Promise<void>
  acceptAll: () => Promise<void>
  rejectAll: () => Promise<void>
  resetPreferences: () => Promise<void>
  dismissBanner: () => void
  getEventHistory: () => ConsentEvent[]

  // 유틸리티
  isAnalyticsEnabled: boolean
  isMarketingEnabled: boolean
}

export function useConsent(): UseConsentReturn {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(true)
  const [shouldShowBanner, setShouldShowBanner] = useState(false)

  // 동의 관리자 초기화 및 상태 로드
  useEffect(() => {
    let mounted = true

    const initializeConsent = async () => {
      try {
        await consentManager.initialize()

        if (!mounted) return

        const currentPreferences = consentManager.getPreferences()
        setPreferences(currentPreferences)
        setNeedsConsent(consentManager.needsConsent())
        setShouldShowBanner(consentManager.shouldShowBanner())
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize consent manager:', error)
        if (mounted) {
          setIsLoaded(true) // 실패해도 로드 완료로 처리
        }
      }
    }

    initializeConsent()

    return () => {
      mounted = false
    }
  }, [])

  // 동의 변경 감지
  useEffect(() => {
    if (!isLoaded) return

    const unsubscribe = consentManager.onConsentChange(newPreferences => {
      setPreferences(newPreferences)
      setNeedsConsent(consentManager.needsConsent())
      setShouldShowBanner(consentManager.shouldShowBanner())
    })

    return unsubscribe
  }, [isLoaded])

  // 동의 상태 확인
  const hasConsent = useCallback(
    (category: ConsentCategory): boolean => {
      if (!isLoaded || !preferences) {
        return category === 'necessary' // 로드 전에는 필수 쿠키만 허용
      }
      return consentManager.hasConsent(category)
    },
    [isLoaded, preferences]
  )

  // 동의 설정 업데이트
  const updateConsent = useCallback(
    async (
      updates: Partial<Pick<ConsentPreferences, 'analytics' | 'marketing'>>
    ): Promise<void> => {
      try {
        await consentManager.updateConsent(updates, 'settings')
      } catch (error) {
        console.error('Failed to update consent:', error)
        throw error
      }
    },
    []
  )

  // 모든 동의 허용
  const acceptAll = useCallback(async (): Promise<void> => {
    try {
      await consentManager.acceptAll('banner')
      setShouldShowBanner(false)
      consentManager.dismissBanner()
    } catch (error) {
      console.error('Failed to accept all consent:', error)
      throw error
    }
  }, [])

  // 필수 쿠키만 허용
  const rejectAll = useCallback(async (): Promise<void> => {
    try {
      await consentManager.rejectAll('banner')
      setShouldShowBanner(false)
      consentManager.dismissBanner()
    } catch (error) {
      console.error('Failed to reject all consent:', error)
      throw error
    }
  }, [])

  // 동의 설정 초기화
  const resetPreferences = useCallback(async (): Promise<void> => {
    try {
      await consentManager.resetPreferences('user_reset')
      setShouldShowBanner(true)
    } catch (error) {
      console.error('Failed to reset consent preferences:', error)
      throw error
    }
  }, [])

  // 배너 해제
  const dismissBanner = useCallback((): void => {
    setShouldShowBanner(false)
    consentManager.dismissBanner()
  }, [])

  // 이벤트 히스토리 가져오기
  const getEventHistory = useCallback((): ConsentEvent[] => {
    return consentManager.getEventHistory()
  }, [])

  // 편의 속성들
  const isAnalyticsEnabled = hasConsent('analytics')
  const isMarketingEnabled = hasConsent('marketing')

  return {
    // 상태
    preferences,
    isLoaded,
    needsConsent,
    shouldShowBanner,

    // 메서드
    hasConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    resetPreferences,
    dismissBanner,
    getEventHistory,

    // 유틸리티
    isAnalyticsEnabled,
    isMarketingEnabled,
  }
}

// 간단한 동의 확인용 훅
export function useConsentStatus(category: ConsentCategory): boolean {
  const { hasConsent, isLoaded } = useConsent()

  if (!isLoaded) {
    return category === 'necessary' // 로드 전에는 필수 쿠키만 허용
  }

  return hasConsent(category)
}

// 분석 스크립트 로드 가드용 훅
export function useAnalyticsConsent(): {
  canLoadAnalytics: boolean
  isLoaded: boolean
} {
  const { isAnalyticsEnabled, isLoaded } = useConsent()

  return {
    canLoadAnalytics: isLoaded && isAnalyticsEnabled,
    isLoaded,
  }
}

// 마케팅 스크립트 로드 가드용 훅
export function useMarketingConsent(): {
  canLoadMarketing: boolean
  isLoaded: boolean
} {
  const { isMarketingEnabled, isLoaded } = useConsent()

  return {
    canLoadMarketing: isLoaded && isMarketingEnabled,
    isLoaded,
  }
}
