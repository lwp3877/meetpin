import type { ConsentConfig, ComplianceSettings, DNTSettings } from './types'

// 현재 동의 버전 (변경 시 기존 동의 무효화)
export const CONSENT_VERSION = '1.0.0'

// 기본 동의 설정
export const DEFAULT_CONSENT_CONFIG: ConsentConfig = {
  version: CONSENT_VERSION,
  
  defaultPreferences: {
    necessary: 'granted', // 필수 쿠키는 항상 허용
    analytics: 'pending', // 분석 쿠키는 사용자 선택
    marketing: 'pending', // 마케팅 쿠키는 사용자 선택
    ip: undefined,
    userAgent: undefined
  },
  
  banner: {
    show: true,
    position: 'bottom',
    theme: 'auto',
    language: 'ko'
  },
  
  expiryDays: {
    preferences: 365, // 1년
    banner: 30 // 30일 후 재표시
  },
  
  metadata: {
    // 필수 쿠키 (서비스 운영에 필수)
    necessary_cookies: [
      'sessionId', // 로그인 상태 유지
      'csrf_token', // CSRF 공격 방지
      'auth_token', // 사용자 인증
      'consent_preferences', // 쿠키 동의 설정 저장
      'language', // 언어 설정
      'theme', // 테마 설정
    ],
    
    // 분석 쿠키 (서비스 개선용)
    analytics_cookies: [
      '_ga', // Google Analytics
      '_ga_*', // Google Analytics 4
      'plausible_user', // Plausible Analytics (privacy-focused)
      '_pk_id', // Matomo Analytics
      'analytics_session', // 내부 분석
    ],
    
    // 마케팅 쿠키 (광고 및 마케팅)
    marketing_cookies: [
      '_fbp', // Facebook Pixel
      '_fbq', // Facebook Conversion
      'gads', // Google Ads
      '__stripe_*', // Stripe 결제 추적
      'marketing_campaign', // 내부 캠페인 추적
    ],
    
    // 분석 서비스 상세 정보
    analytics_services: [
      {
        name: 'Google Analytics',
        purpose: '웹사이트 트래픽 분석 및 사용자 행동 이해',
        provider: 'Google LLC',
        privacy_url: 'https://policies.google.com/privacy',
        cookies: ['_ga', '_ga_*', '_gid']
      },
      {
        name: 'Plausible Analytics',
        purpose: '개인정보 보호 중심의 웹 분석',
        provider: 'Plausible Insights OÜ',
        privacy_url: 'https://plausible.io/privacy',
        cookies: ['plausible_user']
      }
    ],
    
    // 마케팅 서비스 상세 정보
    marketing_services: [
      {
        name: 'Facebook Pixel',
        purpose: '맞춤형 광고 제공 및 마케팅 캠페인 효과 측정',
        provider: 'Meta Platforms Inc.',
        privacy_url: 'https://www.facebook.com/privacy/policy',
        cookies: ['_fbp', '_fbq']
      },
      {
        name: 'Stripe',
        purpose: '결제 처리 및 부정거래 방지',
        provider: 'Stripe Inc.',
        privacy_url: 'https://stripe.com/privacy',
        cookies: ['__stripe_mid', '__stripe_sid']
      }
    ]
  }
}

// 규정 준수 설정
export const COMPLIANCE_SETTINGS: ComplianceSettings = {
  gdpr: {
    enabled: true,
    regions: ['EU', 'EEA', 'GB'], // 유럽연합, 유럽경제지역, 영국
    requireExplicitConsent: true
  },
  ccpa: {
    enabled: true,
    regions: ['CA'], // 캘리포니아
    showOptOut: true
  },
  korean: {
    enabled: true,
    respectLocationInfo: true, // 위치정보법 준수
    requireAgeVerification: false // 만 14세 미만 확인 (필요시 활성화)
  }
}

// Do Not Track 설정
export const DNT_SETTINGS: DNTSettings = {
  enabled: true, // DNT 헤더 존중
  respectDNT: true, // DNT 활성화 시 자동으로 분석/마케팅 거부
  overrideAnalytics: true, // DNT 시 분석 쿠키 비활성화
  overrideMarketing: true // DNT 시 마케팅 쿠키 비활성화
}

// 로컬 스토리지 키
export const CONSENT_STORAGE_KEYS = {
  preferences: 'meetpin_consent_preferences',
  banner_dismissed: 'meetpin_consent_banner_dismissed',
  version: 'meetpin_consent_version',
  events: 'meetpin_consent_events'
} as const

// 쿠키 이름
export const CONSENT_COOKIE_NAMES = {
  preferences: 'consent_preferences',
  banner: 'consent_banner_shown',
  version: 'consent_version'
} as const

// 동의 카테고리 설명
export const CONSENT_CATEGORIES = {
  necessary: {
    title: '필수 쿠키',
    description: '웹사이트 기본 기능과 보안에 필요한 쿠키입니다. 이 쿠키들은 거부할 수 없습니다.',
    required: true,
    examples: [
      '로그인 상태 유지',
      '보안 토큰',
      '언어 및 테마 설정',
      'CSRF 보호'
    ]
  },
  analytics: {
    title: '분석 쿠키',
    description: '웹사이트 사용 패턴을 분석하여 서비스를 개선하는데 사용됩니다.',
    required: false,
    examples: [
      '페이지 방문 횟수',
      '사용자 경로 분석',
      '인기 기능 파악',
      '성능 모니터링'
    ]
  },
  marketing: {
    title: '마케팅 쿠키',
    description: '개인화된 광고를 제공하고 마케팅 캠페인의 효과를 측정합니다.',
    required: false,
    examples: [
      '맞춤형 광고',
      '리타겟팅',
      '소셜 미디어 연동',
      '캠페인 추적'
    ]
  }
} as const

// 유틸리티 함수들
export function isConsentRequired(): boolean {
  // EU/EEA, 캘리포니아, 한국에서는 명시적 동의 필요
  // 실제로는 IP 기반 지역 확인이나 사용자 설정을 확인해야 함
  return true
}

export function isDNTEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.doNotTrack === '1' || 
         (navigator as any).msDoNotTrack === '1' || 
         (window as any).doNotTrack === '1'
}

export function shouldRespectDNT(): boolean {
  return DNT_SETTINGS.enabled && isDNTEnabled()
}