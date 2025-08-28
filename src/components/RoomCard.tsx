/* src/components/RoomCard.tsx */
'use client'

import { brandColors, getCategoryDisplay } from '@/lib/brand'
import { Button } from '@/components/ui/button'

interface Room {
  id: string
  host_uid: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  fee: number
  visibility: 'public' | 'private'
  boost_until?: string
  description?: string
  profiles: {
    nickname: string
    avatar_url?: string
    age_range: string
  }
}

interface RoomCardProps {
  room: Room
  currentUserId?: string
  onJoin?: (roomId: string) => void
  onView?: (roomId: string) => void
  onEdit?: (roomId: string) => void
  onDelete?: (roomId: string) => void
  className?: string
  showActions?: boolean
  compact?: boolean
}

export default function RoomCard({
  room,
  currentUserId,
  onJoin,
  onView,
  onEdit,
  onDelete,
  className = '',
  showActions = true,
  compact = false,
}: RoomCardProps) {
  const categoryDisplay = getCategoryDisplay(room.category)
  const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()
  const isOwner = currentUserId === room.host_uid
  const startDate = new Date(room.start_at)
  const now = new Date()
  const isStarted = startDate <= now
  const isToday = startDate.toDateString() === now.toDateString()

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    if (isToday) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`
    }
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 거리 계산 (임시로 랜덤값 사용, 실제로는 현재 위치와의 거리 계산)
  const distance = Math.floor(Math.random() * 2000) + 100 // 100m ~ 2.1km

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  const handleClick = () => {
    if (onView) {
      onView(room.id)
    }
  }

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onJoin) {
      onJoin(room.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(room.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && confirm('정말 이 모임을 삭제하시겠습니까?')) {
      onDelete(room.id)
    }
  }

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer
        ${isBoosted ? 'ring-2 ring-boost ring-opacity-20' : ''}
        ${compact ? 'p-4' : 'p-5'}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* 상단: 카테고리 배지 + 부스트 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div
            className="flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: categoryDisplay.color }}
          >
            <span className="mr-1">{categoryDisplay.emoji}</span>
            {categoryDisplay.label}
          </div>
          {room.visibility === 'private' && (
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
              <span className="text-xs text-gray-600">🔒 비공개</span>
            </div>
          )}
        </div>
        {isBoosted && (
          <div
            className="px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: brandColors.boost }}
          >
            ⭐ 부스트
          </div>
        )}
      </div>

      {/* 제목 */}
      <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-base' : 'text-lg'}`}>
        {room.title}
      </h3>

      {/* 장소 + 거리 */}
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <span className="mr-1">📍</span>
        <span className="truncate mr-2">{room.place_text}</span>
        <span className="text-primary font-medium">
          · {formatDistance(distance)}
        </span>
      </div>

      {/* 시간 */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <span className="mr-1">🕐</span>
        <span className={isStarted ? 'text-red-500 font-medium' : ''}>
          {formatTime(startDate)}
        </span>
        {isStarted && (
          <span className="ml-2 text-red-500 text-xs font-medium">
            진행 중
          </span>
        )}
      </div>

      {/* 참가비 + 인원 */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <span className="mr-1">
            {room.fee > 0 ? '💰' : '🆓'}
          </span>
          <span>
            {room.fee > 0 ? `${room.fee.toLocaleString()}원` : '무료'}
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">👥</span>
          <span>최대 {room.max_people}명</span>
        </div>
      </div>

      {/* 상세 설명 (컴팩트 모드가 아닐 때만) */}
      {!compact && room.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* 호스트 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {room.profiles?.avatar_url ? (
            <img
              src={room.profiles.avatar_url}
              alt={room.profiles.nickname}
              className="w-8 h-8 rounded-full mr-3"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <span className="text-gray-500 text-sm">👤</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {room.profiles?.nickname || '호스트'}
            </p>
            <p className="text-xs text-gray-500">
              {room.profiles?.age_range}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        {showActions && (
          <div className="flex gap-2">
            {isOwner ? (
              <>
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="text-xs"
                  >
                    수정
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                )}
              </>
            ) : (
              onJoin && !isStarted && (
                <Button
                  size="sm"
                  onClick={handleJoin}
                  className="text-xs"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  참가 신청
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}