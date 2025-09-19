/* src/lib/touchUtils.ts */

// Touch event utilities for better mobile experience

/**
 * Haptic feedback utility for touch interactions
 */
export const hapticFeedback = {
  // Light impact for subtle interactions
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  
  // Medium impact for button presses
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  
  // Heavy impact for important actions
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  },
  
  // Success pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20])
    }
  },
  
  // Error pattern
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 20, 50, 20, 50])
    }
  }
}

/**
 * Touch gesture detection utility
 */
export class TouchGesture {
  private startX: number = 0
  private startY: number = 0
  private startTime: number = 0
  private element: HTMLElement
  private options: {
    threshold: number
    timeout: number
  }

  constructor(element: HTMLElement, options = { threshold: 50, timeout: 300 }) {
    this.element = element
    this.options = options
    this.setupListeners()
  }

  private setupListeners() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startTime = Date.now()
  }

  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY
    const deltaTime = Date.now() - this.startTime
    
    if (deltaTime > this.options.timeout) return

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance < this.options.threshold) return

    // Determine swipe direction
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
    let direction: 'left' | 'right' | 'up' | 'down'
    
    if (angle >= -45 && angle < 45) {
      direction = 'right'
    } else if (angle >= 45 && angle < 135) {
      direction = 'down'
    } else if (angle >= 135 || angle < -135) {
      direction = 'left'
    } else {
      direction = 'up'
    }

    // Dispatch custom event
    const event = new CustomEvent('swipe', {
      detail: { direction, deltaX, deltaY, distance }
    })
    this.element.dispatchEvent(event)
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
  }
}

/**
 * Enhanced button component with touch optimization
 */
export const createTouchOptimizedButton = (element: HTMLButtonElement) => {
  let touchStartTime = 0

  const handleTouchStart = (e: TouchEvent) => {
    touchStartTime = Date.now()
    element.classList.add('touch-pressed')
    hapticFeedback.light()
    
    // Prevent ghost clicks
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime
    
    setTimeout(() => {
      element.classList.remove('touch-pressed')
    }, 100)

    // Only trigger click if touch was brief (not a long press)
    if (touchDuration < 500) {
      hapticFeedback.medium()
      // Simulate click after a brief delay for visual feedback
      setTimeout(() => {
        if (!element.disabled) {
          element.click()
        }
      }, 50)
    }
  }

  const handleTouchCancel = () => {
    element.classList.remove('touch-pressed')
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: false })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

  // Add touch-optimized styles
  element.style.touchAction = 'manipulation'
  element.style.userSelect = 'none'
  ;(element.style as any).webkitTapHighlightColor = 'transparent'

  return {
    destroy: () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }
}

/**
 * Disable bounce/overscroll on iOS
 */
export const disableBounce = (element?: HTMLElement) => {
  const target = element || document.body
  
  let startY = 0
  let isScrollable = false

  const preventBounce = (e: TouchEvent) => {
    const touch = e.touches[0]
    const currentY = touch.clientY

    if (e.type === 'touchstart') {
      startY = currentY
      isScrollable = target.scrollHeight > target.clientHeight
    } else if (e.type === 'touchmove' && isScrollable) {
      const deltaY = currentY - startY
      const scrollTop = target.scrollTop
      const maxScroll = target.scrollHeight - target.clientHeight

      // Prevent overscroll at top and bottom
      if ((scrollTop <= 0 && deltaY > 0) || (scrollTop >= maxScroll && deltaY < 0)) {
        e.preventDefault()
      }
    }
  }

  target.addEventListener('touchstart', preventBounce, { passive: false })
  target.addEventListener('touchmove', preventBounce, { passive: false })

  return {
    destroy: () => {
      target.removeEventListener('touchstart', preventBounce)
      target.removeEventListener('touchmove', preventBounce)
    }
  }
}

/**
 * Smooth scroll utility with momentum
 */
export const smoothScroll = (element: HTMLElement, options: {
  behavior?: 'smooth' | 'instant'
  block?: 'start' | 'center' | 'end' | 'nearest'
  inline?: 'start' | 'center' | 'end' | 'nearest'
} = {}) => {
  if ('scrollIntoView' in element) {
    element.scrollIntoView({
      behavior: options.behavior || 'smooth',
      block: options.block || 'nearest',
      inline: options.inline || 'nearest'
    })
  }
}

/**
 * Touch-friendly dropdown/select enhancement
 */
export const enhanceSelectForTouch = (select: HTMLSelectElement) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'touch-select-wrapper'
  
  select.parentNode?.insertBefore(wrapper, select)
  wrapper.appendChild(select)

  // Add touch-friendly styling
  select.style.fontSize = '16px' // Prevents zoom on iOS
  select.style.minHeight = '44px'
  select.style.padding = '12px'

  return wrapper
}

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 ||
         // @ts-expect-error Legacy IE property
         navigator.msMaxTouchPoints > 0
}

/**
 * Get touch point relative to element
 */
export const getTouchPosition = (e: TouchEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const touch = e.touches[0] || e.changedTouches[0]
  
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    relativeX: (touch.clientX - rect.left) / rect.width,
    relativeY: (touch.clientY - rect.top) / rect.height
  }
}