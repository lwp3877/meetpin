/* src/components/RequestCard.tsx */
'use client'

import { brandColors, getCategoryDisplay } from '@/lib/brand'
import { Button } from '@/components/ui/button'

interface Request {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  reason?: string
  room: {
    id: string
    title: string
    category: 'drink' | 'exercise' | 'other'
    place_text: string
    start_at: string
    max_people: number
    fee: number
    host: {
      id: string
      nickname: string
      avatar_url?: string
    }
  }
  requester: {
    id: string
    nickname: string
    age_range: string
    avatar_url?: string
    intro?: string
  }
}

interface RequestCardProps {
  request: Request
  currentUserId: string
  viewType: 'my_requests' | 'my_rooms' // 내가 보낸 요청 vs 내 방에 온 요청
  onAccept?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onCancel?: (requestId: string) => void
  onChat?: (matchId: string) => void
  className?: string
}

export default function RequestCard({
  request,
  currentUserId,
  viewType,
  onAccept,
  onReject,
  onCancel,
  onChat,
  className = '',
}: RequestCardProps) {
  const categoryDisplay = getCategoryDisplay(request.room.category)
  const isMyRequest = viewType === 'my_requests'
  const startDate = new Date(request.room.start_at)
  const createdDate = new Date(request.created_at)
  const now = new Date()

  // 상태별 스타일링
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'accepted':
        return '수락됨'
      case 'rejected':
        return '거절됨'
      default:
        return '알 수 없음'
    }
  }

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatMeetingTime = (date: Date) => {
    const isToday = date.toDateString() === now.toDateString()
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

  const handleAccept = () => {
    if (onAccept) {
      onAccept(request.id)
    }
  }

  const handleReject = () => {
    if (onReject && confirm('이 참가 요청을 거절하시겠습니까?')) {
      onReject(request.id)
    }
  }

  const handleCancel = () => {
    if (onCancel && confirm('참가 요청을 취소하시겠습니까?')) {
      onCancel(request.id)
    }
  }

  const handleChat = () => {
    if (onChat) {
      // 실제로는 매칭 ID를 찾아서 전달해야 함
      onChat('temp-match-id')
    }
  }

  const otherUser = isMyRequest ? request.room.host : request.requester
  const otherUserTitle = isMyRequest ? '호스트' : '참가 희망자'

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* 헤더: 상태 + 시간 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(request.status)}`}>
            {getStatusText(request.status)}
          </div>
          <span className="text-xs text-gray-500">
            {formatTime(createdDate)}
          </span>
        </div>
      </div>

      {/* 모임 정보 */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: categoryDisplay.color }}
          >
            {categoryDisplay.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">
              {request.room.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <span className="mr-1">📍</span>
              <span className="truncate">{request.room.place_text}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-1">🕐</span>
              <span>{formatMeetingTime(startDate)}</span>
              <span className="mx-2">·</span>
              <span className="mr-1">
                {request.room.fee > 0 ? '💰' : '🆓'}
              </span>
              <span>
                {request.room.fee > 0 ? `${request.room.fee.toLocaleString()}원` : '무료'}
              </span>
            </div>
          </div>
        </div>

        {/* 상대방 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {otherUser.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.nickname}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                <span className="text-gray-500">👤</span>
              </div>
            )}
            <div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-2">
                  {otherUser.nickname}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {otherUserTitle}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {request.requester.age_range}
              </p>
            </div>
          </div>
        </div>

        {/* 요청 메시지 (있는 경우) */}
        {request.reason && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">메시지:</span> {request.reason}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 justify-end">
          {request.status === 'pending' && (
            <>
              {isMyRequest ? (
                // 내가 보낸 요청 - 취소 버튼
                onCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700"
                  >
                    요청 취소
                  </Button>
                )
              ) : (
                // 내 방에 온 요청 - 수락/거절 버튼
                <>
                  {onReject && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReject}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      거절
                    </Button>
                  )}
                  {onAccept && (
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      수락
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {request.status === 'accepted' && onChat && (
            <Button
              size="sm"
              onClick={handleChat}
              style={{ backgroundColor: brandColors.primary }}
            >
              💬 채팅하기
            </Button>
          )}

          {request.status === 'rejected' && isMyRequest && (
            <div className="text-sm text-red-600">
              아쉽지만 다른 모임을 찾아보세요 😢
            </div>
          )}
        </div>
      </div>
    </div>
  )
}