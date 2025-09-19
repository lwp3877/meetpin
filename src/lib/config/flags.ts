/**
 * 밋핀 애플리케이션 기능 플래그 및 환경 설정
 * 
 * 이 파일은 애플리케이션의 모든 기능을 켜고 끄는 중앙 제어 시스템입니다.
 * 환경 변수를 통해 개발/프로덕션 환경에서 다른 기능을 활성화할 수 있습니다.
 * 
 * 사용법:
 * - .env.local 파일에서 NEXT_PUBLIC_ENABLE_* 변수를 설정
 * - true로 설정하면 기능 활성화, false나 미설정시 기능 비활성화
 * - 기본값은 각 기능별로 다르게 설정되어 있음 (주석 참조)
 * 
 * @author MeetPin Team
 */

export const flags = {
  // 카카오 OAuth 로그인 (기본: OFF)
  kakaoOAuthEnabled: process.env.NEXT_PUBLIC_ENABLE_KAKAO_OAUTH === 'true',
  
  // Stripe 자동 결제 vs Payment Link (기본: ON - Checkout 자동)
  stripeCheckoutEnabled: process.env.NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT !== 'false',
  
  // 관리자 패널 접근 (기본: ON)
  adminPanelEnabled: process.env.NEXT_PUBLIC_ENABLE_ADMIN_PANEL !== 'false',
  
  // 실시간 알림 (기본: ON)
  realtimeNotificationsEnabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS !== 'false',
  
  // 사용자 신고/차단 기능 (기본: ON)
  userReportingEnabled: process.env.NEXT_PUBLIC_ENABLE_USER_REPORTING !== 'false',
  
  // 위치 기반 검색 (기본: ON)
  locationSearchEnabled: process.env.NEXT_PUBLIC_ENABLE_LOCATION_SEARCH !== 'false',
  
  // 파일 업로드 (아바타) (기본: ON)
  fileUploadEnabled: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD !== 'false',
  
  // 푸시 알림 (향후 확장용) (기본: OFF)
  pushNotificationsEnabled: process.env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  
  // 고급 필터링 (향후 확장용) (기본: OFF)
  advancedFiltersEnabled: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_FILTERS === 'true',
  
  // 분석 도구 (Umami) (기본: OFF)
  analyticsEnabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const

export type FeatureFlag = keyof typeof flags

// Feature flag 체크 함수
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag]
}

// 환경별 설정
export const config = {
  // API URLs
  baseUrl: process.env.SITE_URL || 'http://localhost:3000',
  
  // 지도 기본 설정
  defaultLocation: {
    lat: 37.4979, // 강남역
    lng: 127.0276,
  },
  
  // 페이지네이션 기본값
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // 파일 업로드 제한
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // 채팅 메시지 제한
  maxMessageLength: 1000,
  messagePageSize: 100,
  
  // Rate limiting 기본값
  rateLimits: {
    api: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    upload: { requests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
    createRoom: { requests: 5, windowMs: 60 * 1000 }, // 5 rooms per minute
  },
  
  // 시간 제한
  roomAdvanceBooking: 7 * 24 * 60 * 60 * 1000, // 7일 전까지 예약 가능
  requestCutoffTime: 30 * 60 * 1000, // 시작 30분 전까지 요청 가능
  
  // 부스트 상품 가격 (원)
  boostPrices: {
    '1': 1000, // 1일
    '3': 2500, // 3일 
    '7': 5000, // 7일
  } as const,
  
  // Stripe Price IDs (ENV에서 설정된 경우)
  stripePriceIds: {
    '1': process.env.STRIPE_PRICE_1D_ID || '',
    '3': process.env.STRIPE_PRICE_3D_ID || '',
    '7': process.env.STRIPE_PRICE_7D_ID || '',
  } as const,
} as const

// 개발/프로덕션 환경 확인
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// 개발자 모드 (Mock 데이터 사용) - NEXT_PUBLIC_USE_MOCK_DATA 기준으로 결정
// 프로덕션 준비: 환경변수가 명시적으로 'true'인 경우만 Mock 데이터 사용
export const isDevelopmentMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// 디버그 모드
export const isDebugMode = isDevelopment && process.env.DEBUG?.includes('meetpin')

const flagsConfig = {
  flags,
  config,
  utils: {
    isFeatureEnabled,
  },
  env: {
    isDevelopment,
    isDevelopmentMode,
    isProduction,
    isTest,
    isDebugMode,
  },
}

export default flagsConfig