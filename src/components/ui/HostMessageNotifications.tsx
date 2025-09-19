/* src/components/ui/HostMessageNotifications.tsx */
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { Bell, MessageCircle, Clock, User, X } from 'lucide-react'
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
  const {
    messages,
    unreadCount,
    loading,
    markAsRead
  } = useRealtimeNotifications({
    enabled: !!user,
    showToast: true // 새 메시지 토스트 알림 활성화
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
        className="relative p-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-600/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-600/50 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900 dark:text-white">호스트 메시지</h3>
                {unreadCount > 0 && (
                  <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    {unreadCount}개 새 메시지
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Messages List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">메시지를 불러오는 중...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">아직 받은 메시지가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        !message.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {message.sender?.nickname?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {message.sender?.nickname || '알 수 없는 사용자'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(message.created_at)}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {message.room?.title || '모임'}에서
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
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
              <div className="p-3 border-t border-gray-100 dark:border-slate-700 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/messages')
                    toast.success('전체 메시지 페이지로 이동합니다')
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
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