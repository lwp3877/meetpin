/* src/components/ui/HostMessageNotifications.tsx */
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import Bell from 'lucide-react/dist/esm/icons/bell'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import Clock from 'lucide-react/dist/esm/icons/clock'
import User from 'lucide-react/dist/esm/icons/user'
import X from 'lucide-react/dist/esm/icons/x'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface HostMessage {
  id: string
  room_id: string
  sender_uid: string
  text: string
  is_read: boolean
  created_at: string
  sender?: {
    nickname: string
    avatar_url?: string
  }
  room?: {
    title: string
  }
}

interface HostMessageNotificationsProps {
  onMessageClick?: (message: HostMessage) => void
}

export function HostMessageNotifications({ onMessageClick }: HostMessageNotificationsProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // 실시간 알림 훅 사용
  const { messages, unreadCount, loading, markAsRead } = useRealtimeNotifications({
    enabled: !!user,
    showToast: true, // 새 메시지 토스트 알림 활성화
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
  }

  const handleMessageClick = (message: HostMessage) => {
    markAsRead(message.id)
    onMessageClick?.(message)
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-xl dark:border-slate-600/50 dark:bg-slate-800/90 dark:hover:bg-slate-700"
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full right-0 z-50 mt-2 max-h-96 w-96 overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-2xl dark:border-slate-600/50 dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <MessageCircle className="text-primary h-5 w-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">호스트 메시지</h3>
                {unreadCount > 0 && (
                  <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {unreadCount}개 새 메시지
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Messages List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="border-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    메시지를 불러오는 중...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">아직 받은 메시지가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map(message => (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                        !message.is_read
                          ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="from-primary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-emerald-600 text-sm font-bold text-white">
                          {message.sender?.nickname?.charAt(0).toUpperCase() || (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {message.sender?.nickname || '알 수 없는 사용자'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTimeAgo(message.created_at)}
                            </div>
                          </div>
                          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                            {message.room?.title || '모임'}에서
                          </p>
                          <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {messages.length > 0 && (
              <div className="border-t border-gray-100 p-3 text-center dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/messages')
                    toast.success('전체 메시지 페이지로 이동합니다')
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  모든 메시지 보기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
