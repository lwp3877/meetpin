'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary - 주요 액션 (WCAG AA 준수)
        default: 'bg-primary text-white hover:bg-[#0D9F71] focus-visible:ring-primary shadow-sm hover:shadow-md',

        // Destructive - 삭제/위험 액션
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm hover:shadow-md',

        // Outline - 보조 액션
        outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-primary',

        // Secondary - 2차 액션
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',

        // Ghost - 최소 스타일
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',

        // Link - 링크 스타일
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',

        // Boost - 부스트 기능
        boost: 'bg-[#F59E0B] text-white hover:bg-[#E59307] focus-visible:ring-[#F59E0B] shadow-sm hover:shadow-md',

        // Accent - 강조 액션
        accent: 'bg-[#F97316] text-white hover:bg-[#E8670D] focus-visible:ring-[#F97316] shadow-sm hover:shadow-md',

        // Success - 성공 액션
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600 shadow-sm hover:shadow-md',

        // Warning - 경고 액션
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500 shadow-sm hover:shadow-md',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-9 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-base rounded-lg',
        xl: 'h-12 px-8 text-lg rounded-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    // Remove asChild prop to prevent DOM warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { asChild, ...buttonProps } = props

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...buttonProps}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
