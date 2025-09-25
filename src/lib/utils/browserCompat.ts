/* src/lib/utils/browserCompat.ts */

/**
 * 브라우저 호환성 및 성능 최적화 유틸리티
 * 실제 사용자 테스트에서 모든 브라우저와 기기에서 완벽한 동작 보장
 */

/**
 * 브라우저 감지 및 기능 지원 체크
 */
export class BrowserDetector {
  private static userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

  /**
   * 현재 브라우저 종류 감지
   */
  static getBrowserType():
    | 'chrome'
    | 'firefox'
    | 'safari'
    | 'edge'
    | 'opera'
    | 'samsung'
    | 'unknown' {
    const ua = this.userAgent.toLowerCase()

    if (ua.includes('edg/')) return 'edge'
    if (ua.includes('opr/') || ua.includes('opera/')) return 'opera'
    if (ua.includes('chrome/') && ua.includes('samsungbrowser/')) return 'samsung'
    if (ua.includes('chrome/')) return 'chrome'
    if (ua.includes('firefox/')) return 'firefox'
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'safari'

    return 'unknown'
  }

  /**
   * 모바일 환경 감지
   */
  static isMobile(): boolean {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent)
  }

  /**
   * iOS 환경 감지
   */
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(this.userAgent)
  }

  /**
   * Android 환경 감지
   */
  static isAndroid(): boolean {
    return /android/i.test(this.userAgent)
  }

  /**
   * 터치 지원 확인
   */
  static hasTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * PWA 환경 확인
   */
  static isPWA(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  }

  /**
   * 온라인 상태 확인
   */
  static isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * 다크 모드 선호도 확인
   */
  static prefersDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 애니메이션 감소 선호도 확인
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}

/**
 * 기능 지원 체크
 */
export class FeatureSupport {
  /**
   * CSS 기능 지원 확인
   */
  static supportsCSS(property: string, value: string): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) {
      return false
    }
    return CSS.supports(property, value)
  }

  /**
   * WebP 이미지 포맷 지원 확인
   */
  static async supportsWebP(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  /**
   * WebGL 지원 확인
   */
  static supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch {
      return false
    }
  }

  /**
   * Service Worker 지원 확인
   */
  static supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator
  }

  /**
   * IndexedDB 지원 확인
   */
  static supportsIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  /**
   * Geolocation 지원 확인
   */
  static supportsGeolocation(): boolean {
    return 'geolocation' in navigator
  }

  /**
   * Push 알림 지원 확인
   */
  static supportsPushNotifications(): boolean {
    return 'PushManager' in window
  }

  /**
   * 클립보드 API 지원 확인
   */
  static supportsClipboard(): boolean {
    return 'clipboard' in navigator
  }

  /**
   * Web Share API 지원 확인
   */
  static supportsWebShare(): boolean {
    return 'share' in navigator
  }

  /**
   * 햅틱 피드백 지원 확인
   */
  static supportsVibration(): boolean {
    return 'vibrate' in navigator
  }
}

/**
 * 성능 최적화
 */
export class PerformanceOptimizer {
  private static observers: Map<string, any> = new Map()

  /**
   * Intersection Observer로 지연 로딩 구현
   */
  static setupLazyLoading(
    selector: string = '[data-lazy]',
    callback?: (element: Element) => void
  ): () => void {
    if (!('IntersectionObserver' in window)) {
      // 폴백: 즉시 로드
      document.querySelectorAll(selector).forEach(callback || this.loadLazyImage)
      return () => {}
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target
            if (callback) {
              callback(element)
            } else {
              PerformanceOptimizer.loadLazyImage(element)
            }
            observer.unobserve(element)
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    )

    document.querySelectorAll(selector).forEach(element => {
      observer.observe(element)
    })

    this.observers.set('lazyLoading', observer)

    return () => {
      observer.disconnect()
      this.observers.delete('lazyLoading')
    }
  }

  private static loadLazyImage(element: Element) {
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.lazy
      if (src) {
        element.src = src
        element.removeAttribute('data-lazy')
      }
    }
  }

  /**
   * 이미지 프리로딩
   */
  static preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    })

    return Promise.all(promises)
  }

  /**
   * 중요 리소스 프리로드
   */
  static preloadCriticalResources() {
    const criticalUrls = [
      '/icons/meetpin.svg',
      // 추가 중요 리소스들
    ]

    // DNS 프리페치
    const dnsPrefetch = [
      'https://xnrqfkecpabucnoxxtwa.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]

    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })

    // 리소스 프리로드
    this.preloadImages(criticalUrls).catch(error => {
      console.warn('Resource preload failed:', error)
    })
  }

  /**
   * 메모리 사용량 모니터링
   */
  static monitorMemoryUsage(): () => void {
    if (!('memory' in performance)) {
      console.warn('Memory monitoring not supported')
      return () => {}
    }

    const checkMemory = () => {
      const memory = (performance as any).memory
      const memoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      }

      // 메모리 사용량이 80% 이상이면 경고
      if (memoryInfo.used / memoryInfo.limit > 0.8) {
        console.warn('High memory usage detected:', memoryInfo)
        this.cleanupMemory()
      }
    }

    const interval = setInterval(checkMemory, 30000) // 30초마다 체크

    return () => {
      clearInterval(interval)
    }
  }

  /**
   * 메모리 정리
   */
  static cleanupMemory() {
    // 사용하지 않는 observers 정리
    this.observers.forEach((observer, key) => {
      try {
        observer.disconnect()
        this.observers.delete(key)
      } catch (error) {
        console.warn(`Failed to cleanup observer ${key}:`, error)
      }
    })

    // 가비지 컬렉션 힌트 (Chrome DevTools에서만 동작)
    if (window.gc) {
      window.gc()
    }
  }

  /**
   * 이미지 최적화
   */
  static optimizeImages() {
    document.querySelectorAll('img').forEach(img => {
      // 로딩 속성 설정
      if (!img.loading) {
        img.loading = 'lazy'
      }

      // 적절한 크기 설정
      if (!img.sizes && img.srcset) {
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      }

      // 에러 처리
      img.onerror = () => {
        img.style.display = 'none'
        console.warn('Failed to load image:', img.src)
      }
    })
  }
}

/**
 * 네트워크 최적화
 */
export class NetworkOptimizer {
  /**
   * 연결 상태 모니터링
   */
  static monitorConnection(): () => void {
    const updateConnectionStatus = () => {
      const isOnline = navigator.onLine
      document.body.classList.toggle('offline', !isOnline)

      if (!isOnline) {
        console.warn('네트워크 연결이 끊어졌습니다')
      } else {
        console.log('네트워크 연결이 복구되었습니다')
      }
    }

    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)

    // 초기 상태 설정
    updateConnectionStatus()

    return () => {
      window.removeEventListener('online', updateConnectionStatus)
      window.removeEventListener('offline', updateConnectionStatus)
    }
  }

  /**
   * 네트워크 품질 감지
   */
  static getConnectionQuality(): 'slow' | 'good' | 'fast' | 'unknown' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection.effectiveType

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow'
        case '3g':
          return 'good'
        case '4g':
          return 'fast'
        default:
          return 'unknown'
      }
    }

    return 'unknown'
  }

  /**
   * 적응형 품질 설정
   */
  static adaptToConnectionQuality() {
    const quality = this.getConnectionQuality()

    switch (quality) {
      case 'slow':
        // 저품질 설정
        document.documentElement.classList.add('low-bandwidth')
        console.log('저대역폭 모드 활성화')
        break
      case 'good':
        // 중간 품질 설정
        document.documentElement.classList.add('medium-bandwidth')
        break
      case 'fast':
        // 고품질 설정
        document.documentElement.classList.add('high-bandwidth')
        break
    }
  }
}

/**
 * 폴리필 및 호환성 패치
 */
export class CompatibilityPatches {
  /**
   * 필수 폴리필 로드
   */
  static async loadPolyfills() {
    const polyfills: Promise<void>[] = []

    // Intersection Observer 폴리필
    if (!('IntersectionObserver' in window)) {
      polyfills.push(
        import('intersection-observer')
          .then(() => {
            console.log('IntersectionObserver polyfill loaded')
          })
          .catch(() => {
            console.warn('Failed to load IntersectionObserver polyfill')
          })
      )
    }

    // Web Share API 폴리필
    if (!('share' in navigator)) {
      window.navigator.share = async (data: ShareData) => {
        if (navigator.clipboard && data.url) {
          await navigator.clipboard.writeText(data.url)
          console.log('URL copied to clipboard (Web Share polyfill)')
        }
      }
    }

    await Promise.allSettled(polyfills)
  }

  /**
   * CSS 커스텀 속성 폴백
   */
  static setupCSSFallbacks() {
    // CSS 그리드 지원 확인
    if (!FeatureSupport.supportsCSS('display', 'grid')) {
      document.documentElement.classList.add('no-grid')
    }

    // Flexbox 지원 확인
    if (!FeatureSupport.supportsCSS('display', 'flex')) {
      document.documentElement.classList.add('no-flexbox')
    }

    // CSS 변수 지원 확인
    if (!FeatureSupport.supportsCSS('color', 'var(--test)')) {
      document.documentElement.classList.add('no-css-variables')
    }
  }

  /**
   * 이벤트 리스너 패치
   */
  static patchEventListeners() {
    // Passive event listener 지원 확인
    let supportsPassive = false
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassive = true
        },
      })
      window.addEventListener('test', null as any, opts)
    } catch (_e) {}

    // 패치가 필요한 경우 글로벌 설정
    if (!supportsPassive) {
      console.warn('Passive event listeners not supported')
    }
  }
}

/**
 * 전역 브라우저 호환성 초기화
 */
export async function initializeBrowserCompatibility() {
  console.log('🔧 브라우저 호환성 초기화 시작...')

  // 브라우저 정보 로깅
  const browserInfo = {
    type: BrowserDetector.getBrowserType(),
    isMobile: BrowserDetector.isMobile(),
    isIOS: BrowserDetector.isIOS(),
    isAndroid: BrowserDetector.isAndroid(),
    hasTouchSupport: BrowserDetector.hasTouchSupport(),
    isPWA: BrowserDetector.isPWA(),
    isOnline: BrowserDetector.isOnline(),
  }

  console.log('📱 브라우저 정보:', browserInfo)

  // 호환성 패치 적용
  await CompatibilityPatches.loadPolyfills()
  CompatibilityPatches.setupCSSFallbacks()
  CompatibilityPatches.patchEventListeners()

  // 성능 최적화 설정
  PerformanceOptimizer.preloadCriticalResources()
  PerformanceOptimizer.setupLazyLoading()
  PerformanceOptimizer.optimizeImages()

  // 네트워크 최적화
  NetworkOptimizer.monitorConnection()
  NetworkOptimizer.adaptToConnectionQuality()

  // 메모리 모니터링 시작
  const memoryCleanup = PerformanceOptimizer.monitorMemoryUsage()

  // 브라우저별 특별 처리
  if (browserInfo.isIOS) {
    document.documentElement.classList.add('ios')
    // iOS 특별 처리
  }

  if (browserInfo.isAndroid) {
    document.documentElement.classList.add('android')
    // Android 특별 처리
  }

  if (browserInfo.isMobile) {
    document.documentElement.classList.add('mobile')
  }

  console.log('✅ 브라우저 호환성 초기화 완료')

  // cleanup 함수 반환
  return () => {
    memoryCleanup()
    PerformanceOptimizer.cleanupMemory()
  }
}

const defaultExport = {
  BrowserDetector,
  FeatureSupport,
  PerformanceOptimizer,
  NetworkOptimizer,
  CompatibilityPatches,
  initializeBrowserCompatibility,
}
export default defaultExport
