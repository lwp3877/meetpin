/* src/components/ui/EmptyState.tsx */
import React from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'p-8',
    icon: 'w-12 h-12 text-3xl',
    title: 'text-lg',
    description: 'text-sm',
  },
  md: {
    container: 'p-12',
    icon: 'w-16 h-16 text-4xl',
    title: 'text-xl',
    description: 'text-base',
  },
  lg: {
    container: 'p-16',
    icon: 'w-20 h-20 text-5xl',
    title: 'text-2xl',
    description: 'text-lg',
  },
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white text-center ${sizeClass.container} ${className}`}
    >
      {icon && (
        <div
          className={`mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 ${sizeClass.icon}`}
        >
          <span>{icon}</span>
        </div>
      )}

      <h3 className={`mb-2 font-medium text-gray-900 ${sizeClass.title}`}>{title}</h3>

      <p className={`mx-auto mb-6 max-w-md leading-relaxed text-gray-600 ${sizeClass.description}`}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant}
              className={size === 'sm' ? 'px-4 py-2 text-sm' : ''}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              className={size === 'sm' ? 'px-4 py-2 text-sm' : ''}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Preset empty states for common scenarios
export const EmptyStatePresets = {
  // Room related
  NoRooms: ({ onCreateRoom }: { onCreateRoom: () => void }) => (
    <EmptyState
      icon="🏠"
      title="아직 만든 모임이 없습니다"
      description="새로운 모임을 만들어 근처 사람들과 만나보세요!"
      action={{
        label: '첫 모임 만들기',
        onClick: onCreateRoom,
      }}
    />
  ),

  NoActiveRooms: ({
    onCreateRoom,
    onViewAll,
  }: {
    onCreateRoom: () => void
    onViewAll: () => void
  }) => (
    <EmptyState
      icon="🔥"
      title="현재 활성 모임이 없습니다"
      description="새로운 모임을 만들거나 완료된 모임을 확인해보세요."
      action={{
        label: '새 모임 만들기',
        onClick: onCreateRoom,
      }}
      secondaryAction={{
        label: '전체 모임 보기',
        onClick: onViewAll,
        variant: 'outline',
      }}
    />
  ),

  NoRoomsOnMap: ({ onExpandSearch }: { onExpandSearch: () => void }) => (
    <EmptyState
      icon="🗺️"
      title="이 지역에 모임이 없습니다"
      description="다른 지역을 검색하거나 직접 모임을 만들어보세요."
      action={{
        label: '검색 범위 확대',
        onClick: onExpandSearch,
      }}
      size="sm"
    />
  ),

  // Request related
  NoRequests: ({ onFindRooms }: { onFindRooms: () => void }) => (
    <EmptyState
      icon="📤"
      title="보낸 요청이 없습니다"
      description="관심있는 모임에 참가 신청을 보내보세요!"
      action={{
        label: '모임 찾으러 가기',
        onClick: onFindRooms,
      }}
    />
  ),

  NoPendingRequests: () => (
    <EmptyState
      icon="⏳"
      title="대기 중인 요청이 없습니다"
      description="새로운 참가 요청이 들어오면 여기에 표시됩니다."
      size="sm"
    />
  ),

  NoMatches: ({ onFindRooms }: { onFindRooms: () => void }) => (
    <EmptyState
      icon="💕"
      title="매치된 모임이 없습니다"
      description="모임에 참가 신청을 보내고 승인받으면 여기에 표시됩니다!"
      action={{
        label: '모임 찾으러 가기',
        onClick: onFindRooms,
      }}
    />
  ),

  // Chat related
  NoMessages: () => (
    <EmptyState
      icon="💬"
      title="아직 메시지가 없습니다"
      description="첫 메시지를 보내서 대화를 시작해보세요!"
      size="sm"
    />
  ),

  // Search related
  NoSearchResults: ({ query, onClearSearch }: { query: string; onClearSearch: () => void }) => (
    <EmptyState
      icon="🔍"
      title={`"${query}"에 대한 검색 결과가 없습니다`}
      description="다른 검색어를 시도하거나 필터를 조정해보세요."
      action={{
        label: '검색 초기화',
        onClick: onClearSearch,
        variant: 'outline',
      }}
    />
  ),

  // Network related
  NetworkError: ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
      icon="📶"
      title="네트워크 연결 오류"
      description="인터넷 연결을 확인하고 다시 시도해주세요."
      action={{
        label: '다시 시도',
        onClick: onRetry,
      }}
    />
  ),

  // Permission related
  LocationPermissionDenied: ({ onRequestPermission }: { onRequestPermission: () => void }) => (
    <EmptyState
      icon="📍"
      title="위치 권한이 필요합니다"
      description="근처 모임을 찾기 위해 위치 접근 권한을 허용해주세요."
      action={{
        label: '위치 권한 허용',
        onClick: onRequestPermission,
      }}
    />
  ),

  // Authentication related
  LoginRequired: ({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) => (
    <EmptyState
      icon="🔐"
      title="로그인이 필요합니다"
      description="모든 기능을 사용하려면 먼저 로그인해주세요."
      action={{
        label: '로그인',
        onClick: onLogin,
      }}
      secondaryAction={{
        label: '회원가입',
        onClick: onSignup,
        variant: 'outline',
      }}
    />
  ),

  // Maintenance related
  UnderMaintenance: () => (
    <EmptyState
      icon="🚧"
      title="점검 중입니다"
      description="더 나은 서비스를 위해 시스템 점검 중입니다. 잠시 후 다시 이용해주세요."
      size="lg"
    />
  ),

  // Success states
  RequestSent: ({ onViewRequests }: { onViewRequests: () => void }) => (
    <EmptyState
      icon="🎉"
      title="요청이 전송되었습니다!"
      description="호스트의 승인을 기다려주세요. 요청 상태는 요청함에서 확인할 수 있습니다."
      action={{
        label: '요청함 보기',
        onClick: onViewRequests,
      }}
    />
  ),

  RoomCreated: ({ roomTitle, onViewRoom }: { roomTitle: string; onViewRoom: () => void }) => (
    <EmptyState
      icon="✅"
      title="모임이 생성되었습니다!"
      description={`"${roomTitle}" 모임이 성공적으로 만들어졌습니다. 참가자들의 신청을 기다려보세요!`}
      action={{
        label: '모임 보기',
        onClick: onViewRoom,
      }}
    />
  ),
}

// Loading empty state
export function LoadingEmptyState({
  title = '불러오는 중...',
  description = '잠시만 기다려주세요.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
      <div className="border-primary mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
      <h3 className="mb-2 text-xl font-medium text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
