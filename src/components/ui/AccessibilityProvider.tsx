/* src/components/ui/AccessibilityProvider.tsx */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
  prefersReducedMotion: boolean
  highContrastMode: boolean
  focusVisible: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)

  useEffect(() => {
    // Detect reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionMediaQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    motionMediaQuery.addEventListener('change', handleMotionChange)

    // Detect high contrast preference
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrastMode(contrastMediaQuery.matches)

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrastMode(e.matches)
    }

    contrastMediaQuery.addEventListener('change', handleContrastChange)

    // Focus-visible detection for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true)
      }
    }

    const handleMouseDown = () => {
      setFocusVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange)
      contrastMediaQuery.removeEventListener('change', handleContrastChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Apply global CSS classes based on preferences
  useEffect(() => {
    const root = document.documentElement

    if (prefersReducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    if (highContrastMode) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (focusVisible) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }
  }, [prefersReducedMotion, highContrastMode, focusVisible])

  return (
    <AccessibilityContext.Provider
      value={{
        prefersReducedMotion,
        highContrastMode,
        focusVisible,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

// Skip Link Component for keyboard users
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="bg-primary sr-only z-50 rounded-lg px-4 py-2 text-white transition-all duration-200 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      onFocus={e => e.currentTarget.scrollIntoView({ block: 'center' })}
    >
      {children}
    </a>
  )
}
