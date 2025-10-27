/* src/lib/brand.ts */
/**
 * 밋핀 브랜드 시스템
 * 앱 전체에서 일관된 색상, 메시지, UI 요소를 제공합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { brandColors, brandMessages, getCategoryDisplay } from '@/lib/config/brand'
 *
 * const primaryColor = brandColors.primary
 * const appName = brandMessages.appName
 * const drinkCategory = getCategoryDisplay('drink')
 * ```
 */

/**
 * 브랜드 색상 팔레트
 * 모든 UI 컴포넌트에서 일관된 색상 사용을 위한 색상 정의
 * WCAG 2.1 AA 준수 (최소 4.5:1 명암비)
 */
export const brandColors = {
  // Primary colors
  primary: '#10B981',
  primaryDeep: '#059669',
  primaryLight: '#34D399',
  primaryHover: '#0D9F71', // hover 전용 색상

  // Secondary colors
  boost: '#F59E0B',
  boostDeep: '#D97706',
  boostHover: '#E59307', // hover 전용 색상
  accent: '#F97316',
  accentDeep: '#EA580C',
  accentHover: '#E8670D', // hover 전용 색상

  // Text colors (WCAG AA 준수)
  text: '#111827',       // 검은색 계열 (white 배경에서 15.8:1)
  textMuted: '#4B5563',  // 중간 회색 (white 배경에서 7.5:1)
  textLight: '#6B7280',  // 밝은 회색 (white 배경에서 4.9:1)
  textInverse: '#FFFFFF', // 역전 텍스트 (dark 배경용)

  // Background colors
  bg: '#FFFFFF',
  bgSoft: '#F9FAFB',     // 부드러운 회색
  bgMuted: '#F3F4F6',    // 중간 회색
  bgDark: '#1F2937',     // 어두운 배경

  // Border colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  borderFocus: '#10B981', // 포커스 시 border

  // Status colors (WCAG AA 준수)
  success: '#10B981',
  successDark: '#059669',
  warning: '#F59E0B',
  warningDark: '#D97706',
  error: '#EF4444',
  errorDark: '#DC2626',
  info: '#3B82F6',
  infoDark: '#2563EB',

  // Category colors
  categoryDrink: '#E11D48',
  categoryExercise: '#3B82F6',
  categoryOther: '#8B5CF6',

  // Interactive states
  hoverOverlay: 'rgba(0, 0, 0, 0.05)',      // hover 오버레이
  activeOverlay: 'rgba(0, 0, 0, 0.1)',      // active 오버레이
  focusRing: 'rgba(16, 185, 129, 0.5)',     // focus ring
  disabled: '#9CA3AF',                       // disabled 상태
  disabledBg: '#F3F4F6',                    // disabled 배경
} as const

export const brandMessages = {
  appName: '밋핀',
  tagline: '핀 찍고, 지금 모여요',
  shortDescription: '지도에서 방을 만들어 근처 사람들과 만나보세요',
  longDescription: '술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.',

  // Navigation
  navHome: '홈',
  navRooms: '방 목록',
  navRequests: '요청함',
  navProfile: '프로필',
  navAdmin: '관리',

  // Common actions
  actionCreate: '만들기',
  actionJoin: '참가 신청',
  actionAccept: '수락',
  actionReject: '거절',
  actionReport: '신고',
  actionBlock: '차단',
  actionBoost: '부스트',

  // Status messages
  loading: '로딩 중...',
  noData: '데이터가 없습니다',
  error: '오류가 발생했습니다',
  success: '성공적으로 완료되었습니다',
} as const

export const categoryLabels = {
  drink: '술',
  exercise: '운동',
  other: '기타',
} as const

export const categoryEmojis = {
  drink: '🍻',
  exercise: '💪',
  other: '✨',
} as const

export const categoryColors = {
  drink: brandColors.categoryDrink,
  exercise: brandColors.categoryExercise,
  other: brandColors.categoryOther,
} as const

export const ageRangeLabels = {
  '20s_early': '20대 초반',
  '20s_late': '20대 후반',
  '30s_early': '30대 초반',
  '30s_late': '30대 후반',
  '40s': '40대',
  '50s+': '50대 이상',
} as const

// Category badges object for easy access
export const categoryBadges = {
  drink: {
    label: categoryLabels.drink,
    emoji: categoryEmojis.drink,
    color: categoryColors.drink,
  },
  exercise: {
    label: categoryLabels.exercise,
    emoji: categoryEmojis.exercise,
    color: categoryColors.exercise,
  },
  other: {
    label: categoryLabels.other,
    emoji: categoryEmojis.other,
    color: categoryColors.other,
  },
} as const

// Brand utilities
export function getCategoryDisplay(category: 'drink' | 'exercise' | 'other') {
  return {
    label: categoryLabels[category],
    emoji: categoryEmojis[category],
    color: categoryColors[category],
  }
}

export function getAgeRangeDisplay(ageRange: keyof typeof ageRangeLabels) {
  return ageRangeLabels[ageRange]
}

// Tailwind CSS custom colors extension
export const tailwindColors = {
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: brandColors.primary,
    600: brandColors.primaryDeep,
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  boost: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: brandColors.boost,
    600: brandColors.boostDeep,
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: brandColors.accent,
    600: brandColors.accentDeep,
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
}

/**
 * Design Tokens - 디자인 시스템 토큰
 * 간격, 크기, 그림자, 애니메이션 등 일관된 디자인 규칙
 */
export const designTokens = {
  // Spacing (4px 기반 시스템)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border radius
  radius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',  // 완전한 원형
  },

  // Shadows (접근성 고려 - 과도하지 않은 그림자)
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Typography
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Transitions
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints (반응형)
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

const brandConfig = {
  colors: brandColors,
  messages: brandMessages,
  categories: {
    labels: categoryLabels,
    emojis: categoryEmojis,
    colors: categoryColors,
  },
  ageRanges: ageRangeLabels,
  tailwind: tailwindColors,
  tokens: designTokens,
  utils: {
    getCategoryDisplay,
    getAgeRangeDisplay,
  },
}

export default brandConfig
