/* src/components/ui/EnhancedButton.tsx */
import React from 'react'

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'none' | 'bounce' | 'pulse' | 'scale' | 'glow'
  children?: React.ReactNode
}

const baseClasses =
  'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

const variantClasses = {
  primary: `bg-gradient-to-r from-primary to-primary-deep text-white hover:from-primary-deep hover:to-primary shadow-lg hover:shadow-xl focus:ring-primary`,
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  outline:
    'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  ghost: 'text-primary hover:bg-primary/10 focus:ring-primary',
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl focus:ring-red-500',
  success:
    'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl focus:ring-green-500',
  warning:
    'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl focus:ring-yellow-500',
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm hover:shadow',
  md: 'shadow hover:shadow-md',
  lg: 'shadow-lg hover:shadow-xl',
  xl: 'shadow-xl hover:shadow-2xl',
}

const animationClasses = {
  none: '',
  bounce: 'hover:animate-bounce',
  pulse: 'hover:animate-pulse',
  scale: 'hover:scale-105 active:scale-95',
  glow: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500',
}

export default function EnhancedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'lg',
  shadow = 'none',
  animation = 'scale',
  disabled,
  className = '',
  children,
  ...props
}: EnhancedButtonProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    shadowClasses[shadow],
    animationClasses[animation],
    fullWidth ? 'w-full' : '',
    loading || disabled ? 'pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const LoadingSpinner = () => (
    <svg
      className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  )
}

// Preset button components for common use cases
export const ButtonPresets = {
  // Action buttons
  CreateRoom: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton
      variant="primary"
      size="lg"
      icon="➕"
      loading={loading}
      onClick={onClick}
      animation="glow"
    >
      모임 만들기
    </EnhancedButton>
  ),

  JoinRoom: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton
      variant="success"
      size="lg"
      icon="🙋‍♂️"
      loading={loading}
      onClick={onClick}
      fullWidth
    >
      참가 신청하기
    </EnhancedButton>
  ),

  StartChat: ({ onClick }: { onClick: () => void }) => (
    <EnhancedButton variant="primary" size="md" icon="💬" onClick={onClick}>
      채팅 시작
    </EnhancedButton>
  ),

  // Status buttons
  Approve: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton variant="success" size="sm" icon="✅" loading={loading} onClick={onClick}>
      승인
    </EnhancedButton>
  ),

  Reject: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton variant="danger" size="sm" icon="❌" loading={loading} onClick={onClick}>
      거절
    </EnhancedButton>
  ),

  Cancel: ({ onClick }: { onClick: () => void }) => (
    <EnhancedButton variant="outline" size="sm" icon="🚫" onClick={onClick}>
      취소
    </EnhancedButton>
  ),

  // Navigation buttons
  BackButton: ({ onClick }: { onClick: () => void }) => (
    <EnhancedButton variant="ghost" size="sm" icon="←" onClick={onClick}>
      뒤로
    </EnhancedButton>
  ),

  ViewOnMap: ({ onClick }: { onClick: () => void }) => (
    <EnhancedButton variant="outline" size="sm" icon="🗺️" onClick={onClick}>
      지도에서 보기
    </EnhancedButton>
  ),

  // Social buttons
  Share: ({ onClick }: { onClick: () => void }) => (
    <EnhancedButton variant="secondary" size="sm" icon="📤" onClick={onClick} rounded="full">
      공유
    </EnhancedButton>
  ),

  Like: ({ liked, onClick }: { liked: boolean; onClick: () => void }) => (
    <EnhancedButton
      variant={liked ? 'danger' : 'outline'}
      size="sm"
      icon={liked ? '❤️' : '🤍'}
      onClick={onClick}
      rounded="full"
      animation="pulse"
    >
      {liked ? '좋아요' : '좋아요'}
    </EnhancedButton>
  ),

  // Auth buttons
  LoginButton: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton
      variant="primary"
      size="lg"
      icon="🔐"
      loading={loading}
      onClick={onClick}
      fullWidth
      shadow="lg"
    >
      로그인
    </EnhancedButton>
  ),

  SignupButton: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <EnhancedButton
      variant="outline"
      size="lg"
      icon="🎯"
      loading={loading}
      onClick={onClick}
      fullWidth
    >
      회원가입
    </EnhancedButton>
  ),

  // Floating Action Button
  FloatingAction: ({
    onClick,
    icon = '➕',
    className = 'fixed bottom-6 right-6 z-50',
  }: {
    onClick: () => void
    icon?: React.ReactNode
    className?: string
  }) => (
    <EnhancedButton
      variant="primary"
      size="lg"
      icon={icon}
      onClick={onClick}
      rounded="full"
      shadow="xl"
      animation="scale"
      className={`h-14 w-14 ${className}`}
    >
      <span className="sr-only">빠른 액션</span>
    </EnhancedButton>
  ),
}
