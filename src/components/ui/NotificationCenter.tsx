/* src/components/ui/NotificationCenter.tsx - 실시간 알림 센터 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, X, Check, Users, MessageSquare, Star, Gift } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { ko } from 'date-fns/locale/ko'

interface Notification {
  id: string
  type: 'room_request' | 'message' | 'room_full' | 'review' | 'boost_reminder' | 'match_success'
  title: string
  message: string
  createdAt: string
  read: boolean
  actionUrl?: string
  data?: any
}

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 고도화된 폴링 시스템
  const etagRef = useRef<string | null>(null)
  const retryCountRef = useRef(0)
  const [_lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [_isPolling, setIsPolling] = useState(false)

  // 지능형 폴링 간격 계산
  const getPollingInterval = useCallback(() => {
    if (retryCountRef.current === 0) return 15000 // 정상: 15초
    return Math.min(30000, 5000 * Math.pow(2, retryCountRef.current)) // 백오프: 최대 30초
  }, [])

  // 알림 목록 가져오기 (ETag 지원)
  const fetchNotifications = useCallback(
    async (force = false) => {
      if (!user) return

      setIsPolling(true)
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // 강제 새로고침이 아니고 ETag가 있으면 If-None-Match 헤더 추가
        if (!force && etagRef.current) {
          headers['If-None-Match'] = etagRef.current
        }

        const response = await fetch('/api/notifications', { headers })

        // 304 Not Modified - 변경사항 없음
        if (response.status === 304) {
          retryCountRef.current = 0
          setLastUpdated(new Date())
          return
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (result.ok) {
          // ETag 저장
          const newEtag = response.headers.get('ETag')
          if (newEtag) {
            etagRef.current = newEtag
          }

          setNotifications(result.data || [])
          setUnreadCount(result.data?.filter((n: Notification) => !n.read).length || 0)
          setLastUpdated(new Date())
          retryCountRef.current = 0
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        retryCountRef.current = Math.min(retryCountRef.current + 1, 5)

        // 첫 번째 에러가 아니면 토스트 표시
        if (retryCountRef.current > 1) {
          // toast.error('알림을 불러오는데 실패했습니다. 재시도 중...')
        }
      } finally {
        setIsPolling(false)
      }
    },
    [user]
  )

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (unreadCount === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 알림 삭제
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // 알림 클릭 처리
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  // 알림 아이콘 가져오기
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'room_request':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-600" />
      case 'room_full':
        return <Users className="h-5 w-5 text-orange-600" />
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />
      case 'boost_reminder':
        return <Gift className="h-5 w-5 text-purple-600" />
      case 'match_success':
        return <Star className="h-5 w-5 text-pink-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  // 실시간 폴링 설정 (15초 간격 + 지능형 백오프)
  useEffect(() => {
    if (user) {
      fetchNotifications(true) // 초기 로드

      const startPolling = () => {
        intervalRef.current = setInterval(() => fetchNotifications(), getPollingInterval())
      }

      startPolling()

      // 윈도우 포커스 시 즉시 새로고침
      const handleFocus = () => {
        fetchNotifications(true)
      }

      // Visibility API로 백그라운드 최적화
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchNotifications(true)
        }
      }

      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user, fetchNotifications, getPollingInterval])

  // 에러 발생 시 폴링 간격 조정
  useEffect(() => {
    if (intervalRef.current && retryCountRef.current > 0) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => fetchNotifications(), getPollingInterval())
    }
  }, [fetchNotifications, getPollingInterval])

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!user) return null

  return (
    <div className={`relative ${className}`}>
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:ring-primary relative rounded-full p-2 text-gray-600 transition-all duration-200 hover:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-label="알림"
        data-testid="notification-bell"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
            data-testid="notification-badge"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 패널 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* 알림 리스트 */}
          <Card
            className="absolute top-full right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden shadow-xl"
            data-testid="notification-panel"
          >
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <h3 className="font-semibold text-gray-900">알림</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="h-7 text-xs"
                    data-testid="mark-all-read-btn"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    모두 읽음
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="close-notification-panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500" data-testid="empty-notifications">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm">새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                        !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium text-gray-900 ${
                              !notification.read ? 'font-semibold' : ''
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                          data-testid={`delete-notification-${notification.id}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    window.location.href = '/notifications'
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                  data-testid="view-all-notifications"
                >
                  모든 알림 보기
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
