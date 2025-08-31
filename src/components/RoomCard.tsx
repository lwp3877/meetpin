/* src/components/RoomCard.tsx */
'use client'

import Image from 'next/image'
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
        group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl dark:shadow-gray-900/20 transition-all duration-300 cursor-pointer overflow-hidden
        ${isBoosted ? 'ring-2 ring-yellow-400/30 shadow-yellow-100 dark:shadow-yellow-900/20' : ''}
        ${compact ? 'p-4' : 'p-6'}
        hover:scale-[1.02] hover:-translate-y-1
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Boost glow effect */}
      {isBoosted && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 dark:from-yellow-400/10 dark:to-amber-500/10 rounded-xl"></div>
      )}
      {/* 상단: 카테고리 배지 + 부스트 */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-sm ring-1 ring-white/20"
            style={{ backgroundColor: categoryDisplay.color }}
          >
            <span className="mr-1.5 text-sm">{categoryDisplay.emoji}</span>
            {categoryDisplay.label}
          </div>
          {room.visibility === 'private' && (
            <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">🔒 비공개</span>
            </div>
          )}
        </div>
        {isBoosted && (
          <div className="relative">
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm animate-pulse"
              style={{ backgroundColor: brandColors.boost }}
            >
              <span className="animate-bounce inline-block">⭐</span>
              <span className="ml-1">부스트</span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur animate-pulse"></div>
          </div>
        )}
      </div>

      {/* 제목 */}
      <div className="relative z-10 mb-4">
        <h3 className={`font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 ${compact ? 'text-base' : 'text-lg leading-tight'}`}>
          {room.title}
        </h3>
      </div>

      {/* 정보 카드들 */}
      <div className="relative z-10 space-y-3 mb-4">
        {/* 장소 + 거리 */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors duration-300">
          <span className="text-emerald-500 mr-2 text-lg">📍</span>
          <span className="truncate text-sm text-gray-700 dark:text-gray-300 mr-2 flex-1">{room.place_text}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {formatDistance(distance)}
          </span>
        </div>

        {/* 시간 */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
          <span className="text-blue-500 mr-2 text-lg">🕐</span>
          <span className={`text-sm flex-1 ${isStarted ? 'text-red-500 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
            {formatTime(startDate)}
          </span>
          {isStarted && (
            <span className="text-red-500 text-xs font-bold bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
              진행 중
            </span>
          )}
        </div>

        {/* 참가비 + 인원 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors duration-300">
            <span className="text-purple-500 mr-2">
              {room.fee > 0 ? '💰' : '🆓'}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {room.fee > 0 ? `${room.fee.toLocaleString()}원` : '무료'}
            </span>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors duration-300">
            <span className="text-indigo-500 mr-2">👥</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              최대 {room.max_people}명
            </span>
          </div>
        </div>
      </div>

      {/* 상세 설명 (컴팩트 모드가 아닐 때만) */}
      {!compact && room.description && (
        <div className="relative z-10 mb-4 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border-l-4 border-emerald-400">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        </div>
      )}

      {/* 호스트 정보 및 액션 */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center">
          <div className="relative">
            {room.profiles?.avatar_url ? (
              <Image
                src={room.profiles.avatar_url}
                alt={room.profiles.nickname}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-md">
                <span className="text-white text-lg">👤</span>
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {room.profiles?.nickname || '호스트'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {room.profiles?.age_range} • 호스트
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
                    className="text-xs px-3 py-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  >
                    수정
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="text-xs px-3 py-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
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
                  className="text-xs px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 rounded-full font-medium"
                >
                  <span className="flex items-center gap-1">
                    참가 신청
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </span>
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}