'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'bordered'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  glow?: boolean
  children: React.ReactNode
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      relative
      rounded-2xl
      transition-all
      duration-300
      ease-in-out
      ${hover ? 'cursor-pointer group' : ''}
      ${glow ? 'hover:shadow-glow' : ''}
    `

    const variants = {
      default: `
        bg-white
        border border-neutral-200
        shadow-md
        ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
      `,
      elevated: `
        bg-white
        shadow-lg
        ${hover ? 'hover:shadow-xl hover:-translate-y-2' : ''}
      `,
      glass: `
        bg-white/80
        backdrop-blur-md
        border border-white/30
        shadow-lg
        ${hover ? 'hover:bg-white/90 hover:shadow-xl' : ''}
      `,
      gradient: `
        bg-gradient-to-br from-white to-neutral-50
        border border-neutral-200
        shadow-md
        ${hover ? 'hover:from-neutral-50 hover:to-neutral-100 hover:shadow-lg' : ''}
      `,
      bordered: `
        bg-white
        border-2 border-primary-200
        shadow-sm
        ${hover ? 'hover:border-primary-300 hover:shadow-md' : ''}
      `,
    }

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], paddings[padding], className)}
        {...props}
      >
        {/* 내용 */}
        <div className="relative z-10">{children}</div>

        {/* 호버 효과 오버레이 */}
        {hover && (
          <div className="from-primary-500/5 to-boost-500/5 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
      </div>
    )
  }
)

PremiumCard.displayName = 'PremiumCard'

export default PremiumCard

// 특화된 카드 컴포넌트들
export const RoomCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, children, ...props }, ref) => (
    <PremiumCard
      ref={ref}
      variant="elevated"
      padding="lg"
      hover
      glow
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {children}
    </PremiumCard>
  )
)

export const ProfileCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, children, ...props }, ref) => (
    <PremiumCard
      ref={ref}
      variant="gradient"
      padding="xl"
      className={cn('text-center', className)}
      {...props}
    >
      {children}
    </PremiumCard>
  )
)

export const StatsCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, children, ...props }, ref) => (
    <PremiumCard
      ref={ref}
      variant="glass"
      padding="md"
      hover
      className={cn('backdrop-blur-lg', className)}
      {...props}
    >
      {children}
    </PremiumCard>
  )
)

RoomCard.displayName = 'RoomCard'
ProfileCard.displayName = 'ProfileCard'
StatsCard.displayName = 'StatsCard'
