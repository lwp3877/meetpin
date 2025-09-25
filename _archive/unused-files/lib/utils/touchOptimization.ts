/* src/lib/utils/touchOptimization.ts */

/**
 * 모바일 터치 인터페이스 최적화 유틸리티
 * 실제 사용자 테스트에서 중요한 터치 경험 개선
 */

export interface TouchConfig {
  tapDelay?: number
  doubleTapDelay?: number
  longPressDelay?: number
  touchStartThreshold?: number
  preventDefaultEvents?: string[]
}

/**
 * 기본 터치 설정
 */
const defaultTouchConfig: TouchConfig = {
  tapDelay: 100,
  doubleTapDelay: 300,
  longPressDelay: 500,
  touchStartThreshold: 10,
  preventDefaultEvents: ['touchmove', 'touchstart'],
}

/**
 * 터치 이벤트 최적화 클래스
 */
export class TouchOptimizer {
  private config: TouchConfig
  private touchStartTime: number = 0
  private touchStartPosition: { x: number; y: number } = { x: 0, y: 0 }
  private isLongPress: boolean = false
  private longPressTimer: NodeJS.Timeout | null = null
  private lastTapTime: number = 0

  constructor(config: Partial<TouchConfig> = {}) {
    this.config = { ...defaultTouchConfig, ...config }
  }

  /**
   * 터치 최적화 이벤트 리스너 추가
   */
  public attachToElement(
    element: HTMLElement,
    handlers: {
      onTap?: (event: TouchEvent) => void
      onDoubleTap?: (event: TouchEvent) => void
      onLongPress?: (event: TouchEvent) => void
      onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: TouchEvent) => void
    }
  ): () => void {
    const touchStartHandler = (event: TouchEvent) => {
      this.handleTouchStart(event, handlers)
    }

    const touchEndHandler = (event: TouchEvent) => {
      this.handleTouchEnd(event, handlers)
    }

    const touchMoveHandler = (event: TouchEvent) => {
      this.handleTouchMove(event, handlers)
    }

    // 이벤트 리스너 추가
    element.addEventListener('touchstart', touchStartHandler, { passive: false })
    element.addEventListener('touchend', touchEndHandler, { passive: false })
    element.addEventListener('touchmove', touchMoveHandler, { passive: false })

    // cleanup 함수 반환
    return () => {
      element.removeEventListener('touchstart', touchStartHandler)
      element.removeEventListener('touchend', touchEndHandler)
      element.removeEventListener('touchmove', touchMoveHandler)
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
      }
    }
  }

  private handleTouchStart(
    event: TouchEvent,
    handlers: {
      onTap?: (event: TouchEvent) => void
      onDoubleTap?: (event: TouchEvent) => void
      onLongPress?: (event: TouchEvent) => void
      onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: TouchEvent) => void
    }
  ) {
    this.touchStartTime = Date.now()
    this.isLongPress = false

    const touch = event.touches[0]
    this.touchStartPosition = {
      x: touch.clientX,
      y: touch.clientY,
    }

    // 롱프레스 타이머 설정
    if (handlers.onLongPress) {
      this.longPressTimer = setTimeout(() => {
        this.isLongPress = true
        handlers.onLongPress!(event)
      }, this.config.longPressDelay)
    }

    // 기본 이벤트 방지 (필요한 경우)
    if (this.config.preventDefaultEvents?.includes('touchstart')) {
      event.preventDefault()
    }
  }

  private handleTouchEnd(
    event: TouchEvent,
    handlers: {
      onTap?: (event: TouchEvent) => void
      onDoubleTap?: (event: TouchEvent) => void
      onLongPress?: (event: TouchEvent) => void
      onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: TouchEvent) => void
    }
  ) {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - this.touchStartTime

    // 롱프레스 타이머 정리
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    // 롱프레스였다면 다른 이벤트 처리하지 않음
    if (this.isLongPress) {
      return
    }

    // 짧은 터치인 경우 탭으로 처리
    if (touchDuration < this.config.tapDelay!) {
      const currentTime = Date.now()
      const timeSinceLastTap = currentTime - this.lastTapTime

      // 더블탭 체크
      if (timeSinceLastTap < this.config.doubleTapDelay! && handlers.onDoubleTap) {
        handlers.onDoubleTap(event)
        this.lastTapTime = 0 // 더블탭 후 초기화
      } else if (handlers.onTap) {
        // 더블탭 대기 시간 설정
        setTimeout(() => {
          if (Date.now() - this.lastTapTime > this.config.doubleTapDelay!) {
            handlers.onTap!(event)
          }
        }, this.config.doubleTapDelay)
        this.lastTapTime = currentTime
      }
    }
  }

  private handleTouchMove(
    event: TouchEvent,
    handlers: {
      onTap?: (event: TouchEvent) => void
      onDoubleTap?: (event: TouchEvent) => void
      onLongPress?: (event: TouchEvent) => void
      onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: TouchEvent) => void
    }
  ) {
    const touch = event.touches[0]
    const deltaX = touch.clientX - this.touchStartPosition.x
    const deltaY = touch.clientY - this.touchStartPosition.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 움직임이 임계값을 넘으면 탭이 아님
    if (distance > this.config.touchStartThreshold!) {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }

      // 스와이프 감지
      if (handlers.onSwipe && distance > 50) {
        const direction = this.getSwipeDirection(deltaX, deltaY)
        if (direction) {
          handlers.onSwipe(direction, event)
        }
      }
    }

    // 기본 이벤트 방지 (필요한 경우)
    if (this.config.preventDefaultEvents?.includes('touchmove')) {
      event.preventDefault()
    }
  }

  private getSwipeDirection(
    deltaX: number,
    deltaY: number
  ): 'left' | 'right' | 'up' | 'down' | null {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }
}

/**
 * 터치 피드백 효과 (햅틱, 시각적 피드백)
 */
export class TouchFeedback {
  /**
   * 햅틱 피드백 (진동)
   */
  static haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      }
      navigator.vibrate(patterns[type])
    }
  }

  /**
   * 시각적 터치 피드백 (리플 효과)
   */
  static ripple(element: HTMLElement, event: TouchEvent | MouseEvent) {
    const rect = element.getBoundingClientRect()
    const x = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0].clientX - rect.left
      : (event as MouseEvent).clientX - rect.left
    const y = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0].clientY - rect.top
      : (event as MouseEvent).clientY - rect.top

    const ripple = document.createElement('span')
    ripple.style.position = 'absolute'
    ripple.style.borderRadius = '50%'
    ripple.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'
    ripple.style.transform = 'scale(0)'
    ripple.style.animation = 'ripple 0.6s linear'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    ripple.style.width = '20px'
    ripple.style.height = '20px'
    ripple.style.marginLeft = '-10px'
    ripple.style.marginTop = '-10px'
    ripple.style.pointerEvents = 'none'

    element.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  /**
   * 터치 하이라이트 효과
   */
  static highlight(element: HTMLElement, duration: number = 150) {
    const originalBg = element.style.backgroundColor
    const originalTransition = element.style.transition

    element.style.transition = 'background-color 0.1s ease'
    element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'

    setTimeout(() => {
      element.style.backgroundColor = originalBg
      element.style.transition = originalTransition
    }, duration)
  }
}

/**
 * 모바일 뷰포트 최적화
 */
export class ViewportOptimizer {
  /**
   * 모바일 뷰포트 메타 태그 설정
   */
  static setupViewport() {
    let viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement

    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.name = 'viewport'
      document.head.appendChild(viewport)
    }

    viewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  }

  /**
   * iOS Safari 100vh 문제 해결
   */
  static fixVhUnit() {
    const setVhUnit = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setVhUnit()
    window.addEventListener('resize', setVhUnit)
    window.addEventListener('orientationchange', setVhUnit)

    return () => {
      window.removeEventListener('resize', setVhUnit)
      window.removeEventListener('orientationchange', setVhUnit)
    }
  }

  /**
   * 안전 영역 (Safe Area) 설정
   */
  static setupSafeArea() {
    // CSS 커스텀 속성으로 안전 영역 값 설정
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * 스크롤 최적화
 */
export class ScrollOptimizer {
  /**
   * 스무스 스크롤 설정
   */
  static enableSmoothScroll() {
    if (CSS.supports('scroll-behavior', 'smooth')) {
      document.documentElement.style.scrollBehavior = 'smooth'
    } else {
      // 폴리필 또는 대안 구현
      console.warn('Smooth scroll not supported')
    }
  }

  /**
   * 탄성 스크롤 비활성화 (iOS)
   */
  static disableElasticScroll() {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const container = document.getElementById('root')
    if (container) {
      container.style.overflow = 'auto'
      container.style.height = '100vh'
      ;(container.style as any).webkitOverflowScrolling = 'touch'
    }
  }

  /**
   * 스크롤 위치 복원
   */
  static restoreScrollPosition(key: string = 'scrollPosition') {
    const savedPosition = sessionStorage.getItem(key)
    if (savedPosition) {
      const { x, y } = JSON.parse(savedPosition)
      window.scrollTo(x, y)
    }

    // 페이지 언로드 시 스크롤 위치 저장
    const savePosition = () => {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          x: window.scrollX,
          y: window.scrollY,
        })
      )
    }

    window.addEventListener('beforeunload', savePosition)

    return () => {
      window.removeEventListener('beforeunload', savePosition)
    }
  }
}

/**
 * 전역 터치 최적화 초기화
 */
export function initializeTouchOptimization() {
  // 뷰포트 최적화
  ViewportOptimizer.setupViewport()
  ViewportOptimizer.fixVhUnit()
  ViewportOptimizer.setupSafeArea()

  // 스크롤 최적화
  ScrollOptimizer.enableSmoothScroll()

  // CSS 애니메이션 추가
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    /* 터치 대상 최소 크기 보장 */
    .touch-target {
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* 터치 피드백 */
    .touch-feedback {
      position: relative;
      overflow: hidden;
      transition: background-color 0.15s ease;
    }

    .touch-feedback:active {
      background-color: rgba(16, 185, 129, 0.1);
    }

    /* 스크롤 개선 */
    .smooth-scroll {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    /* iOS 안전 영역 */
    .safe-area-top {
      padding-top: var(--safe-area-inset-top);
    }

    .safe-area-bottom {
      padding-bottom: var(--safe-area-inset-bottom);
    }

    .safe-area-left {
      padding-left: var(--safe-area-inset-left);
    }

    .safe-area-right {
      padding-right: var(--safe-area-inset-right);
    }

    /* 전체 높이 수정 */
    .mobile-full-height {
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
    }
  `
  document.head.appendChild(style)

  console.log('✅ Touch optimization initialized')
}

export default {
  TouchOptimizer,
  TouchFeedback,
  ViewportOptimizer,
  ScrollOptimizer,
  initializeTouchOptimization,
}
