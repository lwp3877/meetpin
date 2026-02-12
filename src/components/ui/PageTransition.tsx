/* src/components/ui/PageTransition.tsx */
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  duration?: number
  type?: 'fade' | 'slide' | 'scale' | 'none'
}

export default function PageTransition({
  children,
  className = '',
  duration = 300,
  type = 'fade',
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(true) // 초기값을 true로 변경
  const [isMounted, setIsMounted] = useState(false) // 마운트 상태 추가
  const pathname = usePathname()

  // 클라이언트에서만 애니메이션 활성화
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return // 마운트되지 않았으면 애니메이션 건너뛰기

    setIsVisible(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname, isMounted])

  const durationClass =
    duration <= 150 ? 'duration-150' :
    duration <= 200 ? 'duration-200' :
    duration <= 300 ? 'duration-300' :
    duration <= 500 ? 'duration-500' :
    'duration-700'

  const getTransitionClasses = () => {
    if (!isMounted) return '' // 마운트되지 않았으면 애니메이션 없음

    const baseClasses = `transition-all ${durationClass} ease-out`

    switch (type) {
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`

      case 'slide':
        return `${baseClasses} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`

      case 'scale':
        return `${baseClasses} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`

      case 'none':
      default:
        return ''
    }
  }

  return <div className={`${getTransitionClasses()} ${className}`}>{children}</div>
}

// Loading overlay component for page transitions
export function PageLoadingOverlay({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 transition-all duration-300 ${
        show ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="animate-pulse text-gray-600">페이지를 불러오는 중...</p>
      </div>
    </div>
  )
}

// Card animation wrapper
export function CardAnimation({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(true) // 초기값을 true로 변경
  const [isMounted, setIsMounted] = useState(false) // 마운트 상태 추가

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    setIsVisible(false)
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, isMounted])

  return (
    <div
      className={`${isMounted ? 'transition-all duration-500 ease-out' : ''} ${
        isMounted && isVisible
          ? 'translate-y-0 opacity-100'
          : isMounted
            ? 'translate-y-4 opacity-0'
            : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Staggered list animation
export function StaggeredList({
  children,
  staggerDelay = 100,
  className = '',
}: {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <CardAnimation key={index} delay={index * staggerDelay}>
          {child}
        </CardAnimation>
      ))}
    </div>
  )
}

// Modal animation wrapper
export function ModalAnimation({
  show,
  children,
  onClose,
}: {
  show: boolean
  children: React.ReactNode
  onClose?: () => void
}) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          show ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all duration-300 ${
            show ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// Toast-like notification animation
export function NotificationSlide({
  show,
  children,
  position = 'top-right',
}: {
  show: boolean
  children: React.ReactNode
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  const slideClasses = {
    'top-left': show ? 'translate-x-0' : '-translate-x-full',
    'top-right': show ? 'translate-x-0' : 'translate-x-full',
    'bottom-left': show ? 'translate-x-0' : '-translate-x-full',
    'bottom-right': show ? 'translate-x-0' : 'translate-x-full',
  }

  return (
    <div
      className={`fixed z-50 max-w-sm transition-all duration-300 ease-out ${
        positionClasses[position]
      } ${slideClasses[position]} ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  )
}

// Progress animation
export function ProgressAnimation({
  progress,
  className = '',
  showPercentage = false,
}: {
  progress: number
  className?: string
  showPercentage?: boolean
}) {
  return (
    <div className={`h-2.5 w-full rounded-full bg-gray-200 ${className}`}>
      <div
        className="from-primary to-primary-deep h-2.5 rounded-full bg-gradient-to-r transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
      {showPercentage && (
        <div className="mt-2 text-center text-sm text-gray-600">{Math.round(progress)}%</div>
      )}
    </div>
  )
}

// Skeleton loading animation
export function SkeletonLoader({
  lines = 3,
  className = '',
  width = 'full',
}: {
  lines?: number
  className?: string
  width?: 'full' | 'half' | 'quarter'
}) {
  const widthClasses = {
    full: 'w-full',
    half: 'w-1/2',
    quarter: 'w-1/4',
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`mb-3 h-4 rounded bg-gray-200 ${widthClasses[width]}`}
          style={{
            width: width === 'full' ? `${100 - Math.random() * 25}%` : undefined,
          }}
        />
      ))}
    </div>
  )
}

// Bounce entrance animation
export function BounceIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(true) // 초기값을 true로 변경
  const [isMounted, setIsMounted] = useState(false) // 마운트 상태 추가

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    setIsVisible(false)
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, isMounted])

  return (
    <div
      className={`${isMounted ? 'transition-all duration-600 ease-out' : ''} ${
        isMounted && isVisible
          ? 'translate-y-0 scale-100 opacity-100'
          : isMounted
            ? 'translate-y-8 scale-95 opacity-0'
            : ''
      } ${className}`}
      style={{
        transitionTimingFunction:
          isMounted && isVisible ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' : undefined,
      }}
    >
      {children}
    </div>
  )
}
