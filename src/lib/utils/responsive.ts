/* src/lib/utils/responsive.ts */
/**
 * 반응형 디자인 유틸리티
 * 일관된 반응형 패턴을 제공합니다.
 */

/**
 * 반응형 컨테이너 클래스
 * 모든 페이지에서 일관된 컨테이너 너비 사용
 */
export const containerClasses = {
  // 기본 컨테이너 (max-width + padding)
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',

  // 좁은 컨테이너 (폼, 프로필 등)
  narrow: 'w-full max-w-2xl mx-auto px-4 sm:px-6',

  // 중간 컨테이너 (대부분의 콘텐츠)
  medium: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',

  // 넓은 컨테이너 (대시보드, 목록)
  wide: 'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',

  // 전체 너비 (지도, 히어로 섹션)
  full: 'w-full',

  // 컨테이너 없이 패딩만
  padding: 'px-4 sm:px-6 lg:px-8',
} as const

/**
 * 반응형 그리드 클래스
 */
export const gridClasses = {
  // 카드 그리드 (1열 → 2열 → 3열)
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',

  // 2열 그리드 (1열 → 2열)
  two: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',

  // 3열 그리드 (1열 → 2열 → 3열)
  three: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',

  // 4열 그리드 (2열 → 3열 → 4열)
  four: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4',

  // 자동 fit 그리드
  auto: 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 sm:gap-6',
} as const

/**
 * 반응형 Flex 클래스
 */
export const flexClasses = {
  // 세로 → 가로
  row: 'flex flex-col md:flex-row gap-4',

  // 가로 유지 + 줄바꿈
  rowWrap: 'flex flex-row flex-wrap gap-4',

  // 중앙 정렬
  center: 'flex items-center justify-center',

  // 양쪽 정렬
  between: 'flex items-center justify-between',

  // 시작 정렬
  start: 'flex items-start justify-start',
} as const

/**
 * 반응형 텍스트 크기 클래스
 */
export const textSizeClasses = {
  // 제목 크기
  h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
  h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  h4: 'text-lg sm:text-xl lg:text-2xl font-semibold',

  // 본문 크기
  body: 'text-sm sm:text-base',
  bodyLarge: 'text-base sm:text-lg',

  // 작은 텍스트
  small: 'text-xs sm:text-sm',
} as const

/**
 * 반응형 간격 클래스
 */
export const spacingClasses = {
  // 섹션 간격
  section: 'py-8 sm:py-12 lg:py-16',
  sectionSmall: 'py-4 sm:py-6 lg:py-8',

  // 컴포넌트 간격
  component: 'space-y-4 sm:space-y-6',
  componentSmall: 'space-y-2 sm:space-y-3',
} as const

/**
 * 터치 최적화 클래스
 */
export const touchClasses = {
  // 터치 영역 (최소 44x44px - Apple HIG 권장)
  target: 'min-h-[44px] min-w-[44px]',

  // 터치 패딩
  padding: 'p-3 sm:p-2',

  // 터치 간격
  gap: 'gap-3 sm:gap-2',
} as const

/**
 * 반응형 visibility 클래스
 */
export const visibilityClasses = {
  // 모바일에서만 표시
  mobileOnly: 'block md:hidden',

  // 태블릿 이상에서만 표시
  tabletUp: 'hidden md:block',

  // 데스크톱에서만 표시
  desktopOnly: 'hidden lg:block',

  // 모바일에서 숨김
  hideOnMobile: 'hidden sm:block',
} as const

/**
 * 반응형 breakpoint 체크 (클라이언트 사이드)
 */
export function useBreakpoint() {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth

  if (width < 640) return 'mobile'
  if (width < 768) return 'tablet'
  if (width < 1024) return 'desktop'
  return 'wide'
}

/**
 * 반응형 유틸리티 모음
 */
export const responsive = {
  container: containerClasses,
  grid: gridClasses,
  flex: flexClasses,
  text: textSizeClasses,
  spacing: spacingClasses,
  touch: touchClasses,
  visibility: visibilityClasses,
  breakpoint: useBreakpoint,
} as const

export default responsive
