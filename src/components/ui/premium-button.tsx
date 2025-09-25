'use client'

import React from 'react'
import { cn } from '@/lib/utils'
// Premium theme utilities for future enhancements

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  glow?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      glow = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      relative
      inline-flex
      items-center
      justify-center
      font-medium
      rounded-xl
      transition-all
      duration-300
      ease-in-out
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      active:scale-95
      disabled:opacity-50
      disabled:cursor-not-allowed
      disabled:transform-none
      ${fullWidth ? 'w-full' : ''}
      ${glow ? 'shadow-glow' : ''}
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-primary-500 to-primary-600
        hover:from-primary-600 hover:to-primary-700
        text-white
        shadow-lg
        hover:shadow-xl
        focus:ring-primary-500
      `,
      secondary: `
        bg-gradient-to-r from-neutral-100 to-neutral-200
        hover:from-neutral-200 hover:to-neutral-300
        text-neutral-800
        border border-neutral-300
        shadow-md
        hover:shadow-lg
        focus:ring-neutral-500
      `,
      outline: `
        bg-transparent
        border-2 border-primary-500
        text-primary-600
        hover:bg-primary-50
        hover:border-primary-600
        shadow-sm
        hover:shadow-md
        focus:ring-primary-500
      `,
      ghost: `
        bg-transparent
        text-neutral-600
        hover:bg-neutral-100
        hover:text-neutral-800
        focus:ring-neutral-500
      `,
      gradient: `
        bg-gradient-to-r from-primary-500 via-boost-500 to-accent-500
        hover:from-primary-600 hover:via-boost-600 hover:to-accent-600
        text-white
        shadow-lg
        hover:shadow-xl
        focus:ring-primary-500
      `,
      glass: `
        bg-white/20
        backdrop-blur-md
        border border-white/30
        text-white
        shadow-lg
        hover:bg-white/30
        hover:shadow-xl
        focus:ring-white/50
      `,
    }

    const sizes = {
      sm: `
        px-3 py-1.5
        text-sm
        min-h-[2rem]
        gap-1.5
      `,
      md: `
        px-4 py-2.5
        text-base
        min-h-[2.75rem]
        gap-2
      `,
      lg: `
        px-6 py-3
        text-lg
        min-h-[3.25rem]
        gap-2.5
      `,
      xl: `
        px-8 py-4
        text-xl
        min-h-[3.5rem]
        gap-3
      `,
    }

    const LoadingSpinner = () => (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {/* 로딩 상태 */}
        {loading && <LoadingSpinner />}

        {/* 왼쪽 아이콘 */}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {/* 버튼 텍스트 */}
        {children && <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>}

        {/* 오른쪽 아이콘 */}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {/* Ripple 효과를 위한 오버레이 */}
        <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-300 group-active:opacity-100" />
      </button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'

export default PremiumButton
