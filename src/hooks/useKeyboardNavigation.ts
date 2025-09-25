/* src/hooks/useKeyboardNavigation.ts */
import { useEffect, useRef, useCallback, useState } from 'react'

interface KeyboardNavigationOptions {
  // 키보드로 네비게이션할 요소들의 셀렉터
  selector?: string
  // 방향키 네비게이션 활성화
  enableArrowKeys?: boolean
  // 엔터/스페이스 활성화
  enableActivation?: boolean
  // 포커스 트랩 활성화 (모달용)
  trapFocus?: boolean
  // 초기 포커스할 요소 인덱스
  initialFocusIndex?: number
  // 순환 네비게이션 (마지막에서 처음으로)
  loop?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    selector = '[data-keyboard-nav], button, a, input, select, textarea, [tabindex="0"]',
    enableArrowKeys = true,
    enableActivation = true,
    trapFocus = false,
    initialFocusIndex = 0,
    loop = true,
  } = options

  const containerRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(initialFocusIndex)
  const [isActive, setIsActive] = useState(false)

  // 네비게이션 가능한 요소들 가져오기
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const elements = Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[]
    return elements.filter(el => {
      return (
        !(el as any).disabled &&
        el.tabIndex !== -1 &&
        el.offsetParent !== null && // 화면에 보이는 요소만
        !el.getAttribute('aria-hidden')
      )
    })
  }, [selector])

  // 특정 인덱스로 포커스 이동
  const focusElement = useCallback(
    (index: number) => {
      const elements = getFocusableElements()
      if (elements.length === 0) return

      let targetIndex = index
      if (loop) {
        targetIndex = ((index % elements.length) + elements.length) % elements.length
      } else {
        targetIndex = Math.max(0, Math.min(index, elements.length - 1))
      }

      const targetElement = elements[targetIndex]
      if (targetElement) {
        targetElement.focus()
        setCurrentIndex(targetIndex)

        // 스크롤하여 요소를 화면에 표시
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }
    },
    [getFocusableElements, loop]
  )

  // 다음 요소로 포커스 이동
  const focusNext = useCallback(() => {
    focusElement(currentIndex + 1)
  }, [currentIndex, focusElement])

  // 이전 요소로 포커스 이동
  const focusPrevious = useCallback(() => {
    focusElement(currentIndex - 1)
  }, [currentIndex, focusElement])

  // 첫 번째 요소로 포커스 이동
  const focusFirst = useCallback(() => {
    focusElement(0)
  }, [focusElement])

  // 마지막 요소로 포커스 이동
  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    focusElement(elements.length - 1)
  }, [getFocusableElements, focusElement])

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return

      const { key, ctrlKey, metaKey, altKey } = e

      // 수정자 키가 눌린 경우 무시 (브라우저 단축키 우선)
      if (ctrlKey || metaKey || altKey) return

      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          if (enableArrowKeys) {
            e.preventDefault()
            focusNext()
          }
          break

        case 'ArrowUp':
        case 'ArrowLeft':
          if (enableArrowKeys) {
            e.preventDefault()
            focusPrevious()
          }
          break

        case 'Home':
          if (enableArrowKeys) {
            e.preventDefault()
            focusFirst()
          }
          break

        case 'End':
          if (enableArrowKeys) {
            e.preventDefault()
            focusLast()
          }
          break

        case 'Tab':
          if (trapFocus) {
            e.preventDefault()
            if (e.shiftKey) {
              focusPrevious()
            } else {
              focusNext()
            }
          }
          break

        case 'Enter':
        case ' ': // 스페이스바
          if (enableActivation) {
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && getFocusableElements().includes(activeElement)) {
              // 엔터는 항상 처리, 스페이스는 버튼/링크만
              if (
                key === 'Enter' ||
                activeElement.tagName === 'BUTTON' ||
                activeElement.getAttribute('role') === 'button'
              ) {
                e.preventDefault()
                activeElement.click()
              }
            }
          }
          break

        case 'Escape':
          if (trapFocus) {
            // 포커스 트랩에서 벗어나기
            setIsActive(false)
          }
          break
      }
    },
    [
      isActive,
      enableArrowKeys,
      enableActivation,
      trapFocus,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      getFocusableElements,
    ]
  )

  // 포커스 이벤트 핸들러
  const handleFocus = useCallback(
    (e: FocusEvent) => {
      const elements = getFocusableElements()
      const focusedIndex = elements.indexOf(e.target as HTMLElement)
      if (focusedIndex !== -1) {
        setCurrentIndex(focusedIndex)
      }
    },
    [getFocusableElements]
  )

  // 키보드 네비게이션 활성화/비활성화
  const activate = useCallback(() => {
    setIsActive(true)
    focusElement(initialFocusIndex)
  }, [focusElement, initialFocusIndex])

  const deactivate = useCallback(() => {
    setIsActive(false)
  }, [])

  // 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('focusin', handleFocus)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('focusin', handleFocus)
    }
  }, [handleKeyDown, handleFocus])

  // 포커스 트랩이 활성화된 경우 초기 포커스 설정
  useEffect(() => {
    if (trapFocus && isActive) {
      activate()
    }
  }, [trapFocus, isActive, activate])

  return {
    containerRef,
    currentIndex,
    isActive,
    activate,
    deactivate,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElement,
    getFocusableElements,
  }
}

// 포커스 트랩 훅 (모달, 드롭다운 등용)
export function useFocusTrap(isOpen: boolean) {
  const navigation = useKeyboardNavigation({
    trapFocus: true,
    enableArrowKeys: true,
    enableActivation: true,
    loop: true,
  })

  useEffect(() => {
    if (isOpen) {
      navigation.activate()
    } else {
      navigation.deactivate()
    }
  }, [isOpen, navigation])

  // 외부 클릭 시 포커스 트랩 내부로 포커스 되돌리기
  useEffect(() => {
    if (!isOpen) return

    const handleFocusOut = (e: FocusEvent) => {
      const container = navigation.containerRef.current
      if (!container) return

      const relatedTarget = e.relatedTarget as HTMLElement
      if (relatedTarget && !container.contains(relatedTarget)) {
        // 포커스가 컨테이너 외부로 나가려 할 때 첫 번째 요소로 되돌리기
        setTimeout(() => navigation.focusFirst(), 0)
      }
    }

    document.addEventListener('focusout', handleFocusOut)
    return () => document.removeEventListener('focusout', handleFocusOut)
  }, [isOpen, navigation])

  return navigation
}

// 키보드 단축키 훅
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = e

      // 수정자 키 조합 생성
      let combination = ''
      if (ctrlKey || metaKey) combination += 'ctrl+'
      if (shiftKey) combination += 'shift+'
      if (altKey) combination += 'alt+'
      combination += key.toLowerCase()

      const handler = shortcuts[combination]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// 포커스 관리 유틸리티
export const focusUtils = {
  // 포커스 가능한 요소들의 셀렉터
  FOCUSABLE_SELECTOR:
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]',

  // 요소에 포커스를 맞추고 스크롤
  focusWithScroll: (element: HTMLElement) => {
    element.focus()
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  },

  // 포커스 표시 강화
  enhanceFocusVisibility: (element: HTMLElement) => {
    element.setAttribute('data-focus-enhanced', 'true')
    element.style.outline = '2px solid var(--primary)'
    element.style.outlineOffset = '2px'
  },

  // 포커스 표시 제거
  removeFocusVisibility: (element: HTMLElement) => {
    element.removeAttribute('data-focus-enhanced')
    element.style.outline = ''
    element.style.outlineOffset = ''
  },
}
