/* src/components/ui/LoadingStates.tsx */
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Wifi,
  MapPin,
  Users,
  MessageCircle,
  Search,
  Heart,
  Zap,
  RefreshCw,
} from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
}

/**
 * 다양한 크기와 스타일의 로딩 스피너
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  }

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    />
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  progress?: number
  className?: string
}

/**
 * 카드 형태의 로딩 상태
 */
export function LoadingCard({
  title = '로딩 중...',
  description,
  icon,
  progress,
  className = '',
}: LoadingCardProps) {
  return (
    <Card
      className={`border-white/20 bg-white/95 shadow-2xl backdrop-blur-lg dark:border-slate-700/30 dark:bg-slate-900/95 ${className}`}
    >
      <CardContent className="pt-12 pb-12 text-center">
        <div className="space-y-6">
          {/* 아이콘 또는 기본 스피너 */}
          <div className="relative">
            {icon ? (
              <div className="from-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br to-emerald-600 shadow-2xl">
                {icon}
              </div>
            ) : (
              <div className="border-primary/30 border-t-primary mx-auto h-16 w-16 animate-spin rounded-full border-4"></div>
            )}

            {/* 진행률 표시 */}
            {progress !== undefined && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="from-primary h-full bg-gradient-to-r to-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>

          {/* 텍스트 */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="mx-auto max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 위치 확인 중 로딩
 */
export function LocationLoadingCard() {
  return (
    <LoadingCard
      title="위치 확인 중..."
      description="현재 위치를 찾고 있습니다. 위치 권한을 허용해주세요."
      icon={<MapPin className="h-8 w-8 animate-pulse text-white" />}
    />
  )
}

/**
 * 네트워크 연결 중 로딩
 */
export function NetworkLoadingCard() {
  return (
    <LoadingCard
      title="연결 중..."
      description="서버에 연결하고 있습니다. 잠시만 기다려주세요."
      icon={<Wifi className="h-8 w-8 animate-pulse text-white" />}
    />
  )
}

/**
 * 모임 검색 중 로딩
 */
export function RoomSearchLoadingCard() {
  return (
    <LoadingCard
      title="모임 찾는 중..."
      description="근처에 있는 멋진 모임들을 찾고 있어요!"
      icon={<Search className="h-8 w-8 animate-pulse text-white" />}
    />
  )
}

/**
 * 채팅 로딩
 */
export function ChatLoadingCard() {
  return (
    <LoadingCard
      title="채팅 준비 중..."
      description="상대방과의 채팅을 준비하고 있습니다."
      icon={<MessageCircle className="h-8 w-8 animate-pulse text-white" />}
    />
  )
}

/**
 * 매칭 중 로딩
 */
export function MatchingLoadingCard() {
  return (
    <LoadingCard
      title="매칭 중..."
      description="완벽한 매치를 찾고 있어요! 조금만 기다려주세요."
      icon={<Heart className="h-8 w-8 animate-pulse text-white" />}
    />
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * 스켈레톤 로딩 (콘텐츠 모양을 흉내내는 로딩)
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-24',
    circular: 'rounded-full aspect-square',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // 실제로는 더 복잡한 wave 애니메이션을 구현할 수 있음
    none: '',
  }

  return (
    <div
      className={`rounded bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
    />
  )
}

/**
 * 방 카드 스켈레톤
 */
export function RoomCardSkeleton() {
  return (
    <Card className="border-white/20 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-700/30 dark:bg-slate-900/90">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="circular" className="h-8 w-8" />
          </div>

          {/* 제목 */}
          <Skeleton variant="text" className="h-7 w-3/4" />

          {/* 설명 */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>

          {/* 정보 */}
          <div className="flex justify-between">
            <Skeleton variant="text" className="h-5 w-20" />
            <Skeleton variant="text" className="h-5 w-16" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 사용자 프로필 스켈레톤
 */
export function UserProfileSkeleton() {
  return (
    <div className="flex animate-pulse items-center space-x-4 p-4">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-5 w-32" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
    </div>
  )
}

/**
 * 빈 상태 컴포넌트
 */
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`px-6 py-12 text-center ${className}`}>
      <div className="space-y-6">
        {/* 아이콘 */}
        {icon && (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 shadow-lg dark:bg-gray-800">
            {icon}
          </div>
        )}

        {/* 텍스트 */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mx-auto max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        {action && <div className="pt-4">{action}</div>}
      </div>
    </div>
  )
}

/**
 * 모임이 없을 때 빈 상태
 */
export function NoRoomsEmptyState({ onCreateRoom }: { onCreateRoom?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-gray-400" />}
      title="아직 모임이 없어요"
      description="이 지역에 첫 번째 모임을 만들어보세요! 새로운 인연을 만날 수 있는 기회입니다."
      action={
        onCreateRoom && (
          <button
            onClick={onCreateRoom}
            className="from-primary rounded-xl bg-gradient-to-r to-emerald-600 px-6 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <Zap className="mr-2 inline h-5 w-5" />첫 모임 만들기
          </button>
        )
      }
    />
  )
}

/**
 * 연결 실패 상태
 */
export function ConnectionErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<Wifi className="h-12 w-12 text-red-400" />}
      title="연결에 실패했어요"
      description="인터넷 연결을 확인하고 다시 시도해주세요."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <RefreshCw className="mr-2 inline h-5 w-5" />
            다시 시도
          </button>
        )
      }
    />
  )
}

/**
 * 실시간 상태 인디케이터
 */
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function StatusIndicator({
  status,
  size = 'md',
  showText = false,
  className = '',
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const statusConfig = {
    online: { color: 'bg-green-500', text: '온라인', animation: '' },
    offline: { color: 'bg-gray-400', text: '오프라인', animation: '' },
    loading: { color: 'bg-yellow-500', text: '연결 중...', animation: 'animate-pulse' },
    error: { color: 'bg-red-500', text: '연결 실패', animation: 'animate-pulse' },
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${config.color} ${config.animation} rounded-full shadow-sm`}
      />
      {showText && <span className="text-sm text-gray-600 dark:text-gray-300">{config.text}</span>}
    </div>
  )
}

export default {
  LoadingSpinner,
  LoadingCard,
  LocationLoadingCard,
  NetworkLoadingCard,
  RoomSearchLoadingCard,
  ChatLoadingCard,
  MatchingLoadingCard,
  Skeleton,
  RoomCardSkeleton,
  UserProfileSkeleton,
  EmptyState,
  NoRoomsEmptyState,
  ConnectionErrorState,
  StatusIndicator,
}
