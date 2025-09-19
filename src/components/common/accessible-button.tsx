/* src/components/accessible-button.tsx - 접근성이 향상된 버튼 컴포넌트 */
'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loadingText?: string
  isLoading?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  ariaLabel?: string
  ariaDescribedBy?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    loadingText = '로딩 중...', 
    isLoading = false, 
    variant = 'default',
    size = 'default',
    ariaLabel,
    ariaDescribedBy,
    icon,
    iconPosition = 'left',
    className,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={isDisabled}
        className={cn(
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none',
          'transition-all duration-200',
          isLoading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{loadingText}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
            )}
          </div>
        )}
      </Button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'