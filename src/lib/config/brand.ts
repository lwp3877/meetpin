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
 */
export const brandColors = {
  // Primary colors
  primary: '#10B981',
  primaryDeep: '#059669',
  primaryLight: '#34D399',

  // Secondary colors
  boost: '#F59E0B',
  boostDeep: '#D97706',
  accent: '#F97316',
  accentDeep: '#EA580C',

  // Text colors
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',

  // Background colors
  bg: '#FFFFFF',
  bgSoft: '#F3F4F6',
  bgMuted: '#E5E7EB',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Category colors
  categoryDrink: '#E11D48',
  categoryExercise: '#3B82F6',
  categoryOther: '#8B5CF6',
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
  utils: {
    getCategoryDisplay,
    getAgeRangeDisplay,
  },
}

export default brandConfig
