/* src/components/loading-spinner.tsx - 접근성을 고려한 로딩 스피너 */
'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorClasses = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-gray-400 border-t-transparent',
  white: 'border-white border-t-transparent',
}

export function LoadingSpinner({
  size = 'md',
  text = '로딩 중...',
  className = '',
  color = 'primary',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn('animate-spin rounded-full border-2', sizeClasses[size], colorClasses[color])}
        role="status"
        aria-label={text}
      />
      {text && <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-purple-900/30">
      <div className="space-y-4 text-center">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl">
          <span className="text-2xl">📍</span>
        </div>
        <LoadingSpinner size="lg" text="밋핀 로딩 중..." />
      </div>
    </div>
  )
}
