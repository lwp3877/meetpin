/* src/lib/accessibility/a11yEnhancement.ts */

/**
 * 접근성 및 사용성 개선 시스템
 * 실제 사용자 테스트에서 모든 사용자가 앱을 쉽게 사용할 수 있도록 보장
 */

/**
 * 키보드 내비게이션 개선
 */
export class KeyboardNavigation {
  private static focusableElements: string = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  /**
   * 포커스 트랩 설정 (모달 등에서 사용)
   */
  static setupFocusTrap(container: HTMLElement): () => void {
    const focusableEls = container.querySelectorAll(
      this.focusableElements
    ) as NodeListOf<HTMLElement>
    const firstFocusableEl = focusableEls[0]
    const lastFocusableEl = focusableEls[focusableEls.length - 1]

    // 초기 포커스 설정
    firstFocusableEl?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab (역방향)
        if (document.activeElement === firstFocusableEl) {
          e.preventDefault()
          lastFocusableEl?.focus()
        }
      } else {
        // Tab (정방향)
        if (document.activeElement === lastFocusableEl) {
          e.preventDefault()
          firstFocusableEl?.focus()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 모달 닫기 등의 액션 실행
        const closeButton = container.querySelector('[data-close]') as HTMLElement
        closeButton?.click()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    container.addEventListener('keydown', handleEscapeKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
      container.removeEventListener('keydown', handleEscapeKey)
    }
  }

  /**
   * 키보드 단축키 설정
   */
  static setupShortcuts(): () => void {
    const shortcuts = {
      // 전역 단축키
      'Alt+h': () => (window.location.href = '/'), // 홈
      'Alt+m': () => (window.location.href = '/map'), // 지도
      'Alt+p': () => (window.location.href = '/profile'), // 프로필
      'Alt+s': () => {
        // 검색 포커스
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="검색"]'
        ) as HTMLInputElement
        searchInput?.focus()
      },
      'Ctrl+/': () => this.showShortcutHelp(), // 단축키 도움말
      '/': (e: KeyboardEvent) => {
        // 빠른 검색
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        e.preventDefault()
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="검색"]'
        ) as HTMLInputElement
        searchInput?.focus()
      },
    }

    const handleKeyboard = (e: KeyboardEvent) => {
      const key = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.key]
        .filter(Boolean)
        .join('+')

      const action = shortcuts[key as keyof typeof shortcuts]
      if (action) {
        e.preventDefault()
        action(e)
      }
    }

    document.addEventListener('keydown', handleKeyboard)

    return () => {
      document.removeEventListener('keydown', handleKeyboard)
    }
  }

  /**
   * 단축키 도움말 표시
   */
  private static showShortcutHelp() {
    const helpContent = `
      <div role="dialog" aria-labelledby="shortcut-title" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <h2 id="shortcut-title" class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ⌨️ 키보드 단축키
          </h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">홈으로 가기</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + H</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">지도 보기</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + M</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">프로필 보기</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + P</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">검색 포커스</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + S</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">빠른 검색</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/</code>
            </div>
          </div>
          <button 
            data-close 
            class="mt-6 w-full bg-primary text-white py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    `

    const helpModal = document.createElement('div')
    helpModal.innerHTML = helpContent
    document.body.appendChild(helpModal)

    const dialog = helpModal.querySelector('[role="dialog"]') as HTMLElement
    const closeBtn = helpModal.querySelector('[data-close]') as HTMLElement

    // 포커스 트랩 설정
    const cleanupFocusTrap = this.setupFocusTrap(dialog)

    const close = () => {
      cleanupFocusTrap()
      helpModal.remove()
    }

    closeBtn.addEventListener('click', close)
    helpModal.addEventListener('click', e => {
      if (e.target === helpModal.firstElementChild) close()
    })
  }

  /**
   * 스킵 링크 추가
   */
  static addSkipLinks() {
    const skipLinks = `
      <div id="skip-links" class="sr-only focus:not-sr-only">
        <a href="#main" class="skip-link bg-primary text-white p-2 rounded">
          메인 콘텐츠로 건너뛰기
        </a>
        <a href="#navigation" class="skip-link bg-primary text-white p-2 rounded ml-2">
          내비게이션으로 건너뛰기
        </a>
      </div>
    `

    const skipContainer = document.createElement('div')
    skipContainer.innerHTML = skipLinks
    document.body.insertBefore(skipContainer, document.body.firstChild)

    // 스킵 링크 스타일 추가
    const style = document.createElement('style')
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 9999;
        transition: top 0.3s;
      }
      .skip-link:focus {
        top: 6px;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .sr-only.focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * 시각적 접근성 개선
 */
export class VisualAccessibility {
  /**
   * 고대비 모드 지원
   */
  static setupHighContrastMode(): () => void {
    const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    }

    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('high-contrast', e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  /**
   * 애니메이션 감소 설정
   */
  static setupReducedMotion(): () => void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    // CSS 애니메이션 비활성화
    if (prefersReducedMotion) {
      const style = document.createElement('style')
      style.textContent = `
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `
      document.head.appendChild(style)
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  /**
   * 포커스 표시 개선
   */
  static enhanceFocusIndicators() {
    const style = document.createElement('style')
    style.textContent = `
      /* 포커스 표시 개선 */
      *:focus {
        outline: 2px solid #10B981;
        outline-offset: 2px;
      }

      /* 버튼 포커스 */
      button:focus,
      .btn:focus {
        outline: 2px solid #10B981;
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
      }

      /* 입력 필드 포커스 */
      input:focus,
      textarea:focus,
      select:focus {
        outline: 2px solid #10B981;
        outline-offset: 2px;
        border-color: #10B981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      /* 링크 포커스 */
      a:focus {
        outline: 2px solid #10B981;
        outline-offset: 2px;
        background-color: rgba(16, 185, 129, 0.1);
        border-radius: 4px;
      }

      /* 마우스 사용자를 위한 포커스 숨김 */
      .js-focus-visible *:focus:not(.focus-visible) {
        outline: none;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 색상 대비 체크
   */
  static checkColorContrast(
    foreground: string,
    background: string
  ): { ratio: number; wcagLevel: 'AAA' | 'AA' | 'fail' } {
    // 간단한 대비 계산 (실제로는 더 복잡한 계산이 필요)
    const getLuminance = (_color: string): number => {
      // 이 부분은 실제 구현에서는 더 정확한 luminance 계산이 필요
      return 0.5 // 임시값
    }

    const fgLuminance = getLuminance(foreground)
    const bgLuminance = getLuminance(background)

    const ratio =
      (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)

    if (ratio >= 7) return { ratio, wcagLevel: 'AAA' }
    if (ratio >= 4.5) return { ratio, wcagLevel: 'AA' }
    return { ratio, wcagLevel: 'fail' }
  }
}

/**
 * 스크린 리더 지원
 */
export class ScreenReaderSupport {
  /**
   * 라이브 리전 설정
   */
  static setupLiveRegions() {
    // 상태 업데이트용 라이브 리전
    const statusRegion = document.createElement('div')
    statusRegion.id = 'status-live-region'
    statusRegion.setAttribute('aria-live', 'polite')
    statusRegion.setAttribute('aria-atomic', 'true')
    statusRegion.className = 'sr-only'
    document.body.appendChild(statusRegion)

    // 즉시 알림용 라이브 리전
    const alertRegion = document.createElement('div')
    alertRegion.id = 'alert-live-region'
    alertRegion.setAttribute('aria-live', 'assertive')
    alertRegion.setAttribute('aria-atomic', 'true')
    alertRegion.className = 'sr-only'
    document.body.appendChild(alertRegion)
  }

  /**
   * 라이브 리전에 메시지 전달
   */
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const regionId = priority === 'assertive' ? 'alert-live-region' : 'status-live-region'
    const region = document.getElementById(regionId)

    if (region) {
      region.textContent = message

      // 메시지를 지우기 위해 타이머 설정
      setTimeout(() => {
        region.textContent = ''
      }, 1000)
    }
  }

  /**
   * ARIA 속성 자동 추가
   */
  static enhanceARIA() {
    // 버튼에 적절한 역할 추가
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
      if (!btn.textContent?.trim()) {
        console.warn('Button without accessible name detected:', btn)
      }
    })

    // 입력 필드에 라벨 연결 확인
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
      const id = input.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (!label) {
          console.warn('Input without associated label detected:', input)
        }
      }
    })

    // 이미지에 alt 텍스트 확인
    document.querySelectorAll('img:not([alt])').forEach(img => {
      console.warn('Image without alt text detected:', img)
    })

    // 링크에 목적 설명 확인
    document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])').forEach(link => {
      if (
        !link.textContent?.trim() ||
        link.textContent.trim() === '더보기' ||
        link.textContent.trim() === '자세히'
      ) {
        console.warn('Link with unclear purpose detected:', link)
      }
    })
  }

  /**
   * 헤딩 구조 검증
   */
  static validateHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentLevel = 0
    let hasH1 = false

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))

      if (level === 1) {
        if (hasH1) {
          console.warn('Multiple H1 elements detected. Consider using only one H1 per page.')
        }
        hasH1 = true
      }

      if (level > currentLevel + 1) {
        console.warn(
          `Heading level skip detected: jumping from H${currentLevel} to H${level}`,
          heading
        )
      }

      currentLevel = level
    })

    if (!hasH1) {
      console.warn('No H1 element found. Consider adding a main heading to the page.')
    }
  }
}

/**
 * 사용성 개선
 */
export class UsabilityEnhancement {
  /**
   * 터치 대상 크기 확인
   */
  static validateTouchTargets() {
    const minSize = 44 // 44px 최소 권장 크기

    document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
      const rect = element.getBoundingClientRect()

      if (rect.width < minSize || rect.height < minSize) {
        console.warn(`Touch target too small (${rect.width}x${rect.height}):`, element)

        // 자동으로 최소 크기 보장 클래스 추가
        element.classList.add('touch-target-enhanced')
      }
    })

    // 최소 크기 보장 스타일 추가
    const style = document.createElement('style')
    style.textContent = `
      .touch-target-enhanced {
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 입력 도움말 및 유효성 검사 메시지
   */
  static enhanceFormAccessibility() {
    document.querySelectorAll('input, textarea, select').forEach(input => {
      // 필수 필드 표시
      if (input.hasAttribute('required')) {
        const label = document.querySelector(`label[for="${input.id}"]`)
        if (label && !label.textContent?.includes('*')) {
          label.innerHTML += ' <span aria-label="필수" class="text-red-500">*</span>'
        }
      }

      // 유효성 검사 메시지 개선
      input.addEventListener('invalid', e => {
        const target = e.target as HTMLInputElement
        const message = target.validationMessage

        ScreenReaderSupport.announceToScreenReader(
          `${target.labels?.[0]?.textContent || '입력 필드'}에 오류가 있습니다: ${message}`,
          'assertive'
        )
      })
    })
  }

  /**
   * 로딩 상태 접근성 개선
   */
  static enhanceLoadingStates() {
    // 모든 로딩 스피너에 적절한 레이블 추가
    document.querySelectorAll('.animate-spin, [data-loading]').forEach(spinner => {
      if (!spinner.getAttribute('aria-label') && !spinner.getAttribute('aria-labelledby')) {
        spinner.setAttribute('aria-label', '로딩 중')
        spinner.setAttribute('role', 'status')
      }
    })

    // 버튼 로딩 상태 개선
    const observeButtonLoading = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.target instanceof HTMLButtonElement) {
          const button = mutation.target
          const isLoading = button.disabled && button.querySelector('.animate-spin')

          if (isLoading) {
            button.setAttribute('aria-describedby', 'loading-description')

            if (!document.getElementById('loading-description')) {
              const desc = document.createElement('span')
              desc.id = 'loading-description'
              desc.className = 'sr-only'
              desc.textContent = '요청을 처리하고 있습니다. 잠시만 기다려주세요.'
              document.body.appendChild(desc)
            }
          } else {
            button.removeAttribute('aria-describedby')
          }
        }
      })
    })

    document.querySelectorAll('button').forEach(button => {
      observeButtonLoading.observe(button, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    })
  }
}

/**
 * 접근성 테스트 및 모니터링
 */
export class AccessibilityTesting {
  /**
   * 자동 접근성 검사 실행
   */
  static runAutomaticChecks(): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // 이미지 alt 텍스트 검사
    document.querySelectorAll('img:not([alt])').forEach(img => {
      errors.push(`이미지에 alt 텍스트가 없습니다: ${(img as HTMLImageElement).src}`)
    })

    // 폼 라벨 검사
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
      const id = input.getAttribute('id')
      if (!id || !document.querySelector(`label[for="${id}"]`)) {
        errors.push(
          `입력 필드에 라벨이 없습니다: ${(input as HTMLInputElement).name || (input as HTMLInputElement).type}`
        )
      }
    })

    // 헤딩 구조 검사
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    if (headings.length === 0) {
      warnings.push('페이지에 헤딩이 없습니다')
    } else if (!document.querySelector('h1')) {
      warnings.push('페이지에 H1 헤딩이 없습니다')
    }

    // 색상 대비 검사 (기본적인 검사)
    const style = getComputedStyle(document.body)
    const bgColor = style.backgroundColor
    const textColor = style.color

    if (bgColor === textColor) {
      errors.push('텍스트와 배경색이 동일합니다')
    }

    // 터치 대상 크기 검사
    document.querySelectorAll('button, a').forEach(element => {
      const rect = element.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        warnings.push(
          `터치 대상이 너무 작습니다 (${rect.width}x${rect.height}): ${element.textContent?.slice(0, 30)}`
        )
      }
    })

    return { errors, warnings }
  }

  /**
   * 접근성 점수 계산
   */
  static calculateA11yScore(): { score: number; details: any } {
    const checks = this.runAutomaticChecks()
    const totalElements = document.querySelectorAll('*').length
    const issues = checks.errors.length + checks.warnings.length * 0.5

    const score = Math.max(0, Math.min(100, 100 - (issues / totalElements) * 100))

    return {
      score: Math.round(score),
      details: {
        totalElements,
        errors: checks.errors.length,
        warnings: checks.warnings.length,
        errorsList: checks.errors,
        warningsList: checks.warnings,
      },
    }
  }

  /**
   * 접근성 보고서 생성
   */
  static generateReport(): string {
    const score = this.calculateA11yScore()

    return `
접근성 점수: ${score.score}/100

🔍 검사 결과:
- 전체 요소: ${score.details.totalElements}개
- 오류: ${score.details.errors}개
- 경고: ${score.details.warnings}개

${
  score.details.errors > 0
    ? `
❌ 오류 목록:
${score.details.errorsList.map((error: string) => `- ${error}`).join('\n')}
`
    : ''
}

${
  score.details.warnings > 0
    ? `
⚠️ 경고 목록:
${score.details.warningsList.map((warning: string) => `- ${warning}`).join('\n')}
`
    : ''
}

💡 개선 권장사항:
- 모든 이미지에 적절한 alt 텍스트 제공
- 폼 요소에 명확한 라벨 연결
- 적절한 헤딩 구조 사용
- 충분한 색상 대비 유지
- 터치 대상 최소 44px 확보
    `
  }
}

/**
 * 전역 접근성 개선 시스템 초기화
 */
export function initializeAccessibility(): () => void {
  console.log('♿ 접근성 개선 시스템 초기화 시작...')

  // 기본 접근성 설정
  KeyboardNavigation.addSkipLinks()
  const cleanupShortcuts = KeyboardNavigation.setupShortcuts()

  // 시각적 접근성
  const cleanupHighContrast = VisualAccessibility.setupHighContrastMode()
  const cleanupReducedMotion = VisualAccessibility.setupReducedMotion()
  VisualAccessibility.enhanceFocusIndicators()

  // 스크린 리더 지원
  ScreenReaderSupport.setupLiveRegions()
  ScreenReaderSupport.enhanceARIA()
  ScreenReaderSupport.validateHeadingStructure()

  // 사용성 개선
  UsabilityEnhancement.validateTouchTargets()
  UsabilityEnhancement.enhanceFormAccessibility()
  UsabilityEnhancement.enhanceLoadingStates()

  // 자동 접근성 검사 (개발 모드에서만)
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const report = AccessibilityTesting.generateReport()
      console.log('♿ 접근성 검사 결과:\n', report)
    }, 2000)
  }

  // 메인 콘텐츠 영역 식별
  const main = document.querySelector('main')
  if (main && !main.id) {
    main.id = 'main'
  }

  // 내비게이션 영역 식별
  const nav = document.querySelector('nav')
  if (nav && !nav.id) {
    nav.id = 'navigation'
  }

  console.log('✅ 접근성 개선 시스템 초기화 완료')

  // cleanup 함수 반환
  return () => {
    cleanupShortcuts()
    cleanupHighContrast()
    cleanupReducedMotion()
    console.log('♿ 접근성 개선 시스템 정리 완료')
  }
}

const a11yEnhancements = {
  KeyboardNavigation,
  VisualAccessibility,
  ScreenReaderSupport,
  UsabilityEnhancement,
  AccessibilityTesting,
  initializeAccessibility,
}

export default a11yEnhancements
