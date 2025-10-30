/* src/lib/config/brand.ts */

export const brandColors = {
  primary: '#10B981',
  primaryDeep: '#059669',
  primaryLight: '#34D399',
  primaryHover: '#0D9F71',
  boost: '#F59E0B',
  boostDeep: '#D97706',
  boostHover: '#E59307',
  accent: '#F97316',
  accentDeep: '#EA580C',
  accentHover: '#E8670D',
  text: '#111827',
  textMuted: '#4B5563',
  textLight: '#6B7280',
  textInverse: '#FFFFFF',
  bg: '#FFFFFF',
  bgSoft: '#F9FAFB',
  bgMuted: '#F3F4F6',
  bgDark: '#1F2937',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  borderFocus: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  categoryDrink: '#E11D48',
  categoryExercise: '#3B82F6',
  categoryOther: '#8B5CF6',
  hoverOverlay: 'rgba(0, 0, 0, 0.05)',
  activeOverlay: 'rgba(0, 0, 0, 0.1)',
  focusRing: 'rgba(16, 185, 129, 0.5)',
  disabled: '#9CA3AF',
  disabledBg: '#F3F4F6',
} as const

export const brandMessages = {
  appName: '밋핀',
  tagline: '찍고, 모여요',
  shortDescription: '근처 사람들과 모임을 만들고 만나는 위치 기반 서비스',
  longDescription: '취미 모임부터 번개까지 원하는 모임을 발견하고 함께하세요.',
  navHome: '홈',
  navRooms: '모임 찾기',
  navRequests: '신청 관리',
  navProfile: '프로필',
  navAdmin: '관리자',
  actionCreate: '만들기',
  actionJoin: '참여 신청',
  actionAccept: '수락',
  actionReject: '거절',
  actionReport: '신고',
  actionBlock: '차단',
  actionBoost: '부스트',
  loading: '로딩 중...',
  noData: '표시할 내용이 없습니다.',
  error: '요청을 처리하는 중 문제가 발생했습니다.',
  success: '요청이 정상적으로 처리되었습니다.',
} as const

export const categoryLabels = {
  drink: '식음료',
  exercise: '운동',
  other: '기타',
} as const

export const categoryEmojis = {
  drink: '🍻',
  exercise: '🏃',
  other: '🌟',
} as const

const categoryColors = {
  drink: brandColors.categoryDrink,
  exercise: brandColors.categoryExercise,
  other: brandColors.categoryOther,
} as const

export function getCategoryDisplay(category: 'drink' | 'exercise' | 'other') {
  return {
    label: categoryLabels[category],
    emoji: categoryEmojis[category],
    color: categoryColors[category],
  }
}
