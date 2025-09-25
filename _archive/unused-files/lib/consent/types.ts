// 동의 관리 시스템 타입 정의

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing'

export type ConsentStatus = 'granted' | 'denied' | 'pending'

export interface ConsentRecord {
  category: ConsentCategory
  status: ConsentStatus
  timestamp: number
  version: string
  source: 'banner' | 'settings' | 'onboarding' | 'api'
}

export interface ConsentPreferences {
  necessary: ConsentStatus // 항상 granted이어야 함
  analytics: ConsentStatus
  marketing: ConsentStatus
  timestamp: number
  version: string
  ip?: string
  userAgent?: string
}

export interface ConsentBannerSettings {
  show: boolean
  position: 'bottom' | 'top'
  theme: 'light' | 'dark' | 'auto'
  language: 'ko' | 'en'
}

export interface ConsentMetadata {
  // 쿠키 정보
  necessary_cookies: string[]
  analytics_cookies: string[]
  marketing_cookies: string[]

  // 서비스 정보
  analytics_services: {
    name: string
    purpose: string
    provider: string
    privacy_url: string
    cookies: string[]
  }[]

  marketing_services: {
    name: string
    purpose: string
    provider: string
    privacy_url: string
    cookies: string[]
  }[]
}

export interface ConsentConfig {
  // 버전 관리
  version: string

  // 기본 설정
  defaultPreferences: Omit<ConsentPreferences, 'timestamp' | 'version'>

  // 배너 설정
  banner: ConsentBannerSettings

  // 만료 설정
  expiryDays: {
    preferences: number // 사용자 선택 만료 (기본: 365일)
    banner: number // 배너 재표시 (기본: 30일)
  }

  // 메타데이터
  metadata: ConsentMetadata
}

// 동의 이벤트 타입
export interface ConsentEvent {
  type:
    | 'banner_shown'
    | 'banner_accepted'
    | 'banner_rejected'
    | 'preferences_changed'
    | 'preferences_reset'
  category?: ConsentCategory
  preferences: ConsentPreferences
  metadata?: {
    source: string
    trigger: string
    [key: string]: any
  }
}

// Do Not Track 지원
export interface DNTSettings {
  enabled: boolean
  respectDNT: boolean
  overrideAnalytics: boolean
  overrideMarketing: boolean
}

// GDPR/CCPA 지원
export interface ComplianceSettings {
  gdpr: {
    enabled: boolean
    regions: string[] // ['EU', 'EEA', ...]
    requireExplicitConsent: boolean
  }
  ccpa: {
    enabled: boolean
    regions: string[] // ['CA', ...]
    showOptOut: boolean
  }
  korean: {
    enabled: boolean
    respectLocationInfo: boolean // 위치정보법 준수
    requireAgeVerification: boolean // 만 14세 미만 확인
  }
}

export interface ConsentManagerState {
  preferences: ConsentPreferences | null
  config: ConsentConfig
  compliance: ComplianceSettings
  dnt: DNTSettings
  isLoaded: boolean
  isVisible: boolean
  events: ConsentEvent[]
}
