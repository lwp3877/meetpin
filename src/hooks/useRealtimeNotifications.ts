/* src/hooks/useRealtimeNotifications.ts */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from '@/lib/useAuth'
import toast from 'react-hot-toast'
import { MeetPinNotifications, NotificationSettings } from '@/lib/services/notifications'
import { logger } from '@/lib/observability/logger'

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

interface UseRealtimeNotificationsOptions {
  enabled?: boolean
  showToast?: boolean
}

export function useRealtimeNotifications({
  enabled = true,
  showToast = true,
}: UseRealtimeNotificationsOptions = {}) {
  const { user } = useAuth()
  const supabase = createBrowserSupabaseClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  const [messages, setMessages] = useState<HostMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    if (!user || !enabled) return

    // 개발 모드에서는 Mock 알림 데이터 사용
    if (process.env.NODE_ENV === 'development') {
      setLoading(true)

      // Mock 알림 데이터 생성
      const mockNotifications: HostMessage[] = [
        {
          id: '1',
          room_id: 'mock-room-1',
          sender_uid: 'mock-user-1',
          text: '모임 참가 신청드립니다!',
          is_read: false,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender: {
            nickname: '김철수',
            avatar_url:
              'https://api.dicebear.com/8.x/adventurer/svg?seed=kim&backgroundColor=b6e3f4,c0aede,d1d4f9',
          },
          room: {
            title: '한강 치킨 모임',
          },
        },
        {
          id: '2',
          room_id: 'mock-room-2',
          sender_uid: 'mock-user-2',
          text: '시간 변경 가능한가요?',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            nickname: '이영희',
            avatar_url:
              'https://api.dicebear.com/8.x/adventurer/svg?seed=lee&backgroundColor=ffd5dc,ffdfba,c7ceea',
          },
          room: {
            title: '강남 맛집 탐방',
          },
        },
      ]

      setTimeout(() => {
        setMessages(mockNotifications)
        setUnreadCount(2)
        setLoading(false)
      }, 500) // 로딩 시뮬레이션

      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/host-messages')
      const data = await response.json()

      if (data.ok) {
        const messages = data.data || []
        setMessages(messages)
        const unread = messages.filter((msg: HostMessage) => !msg.is_read).length
        setUnreadCount(unread)
      } else {
        throw new Error(data.message || '메시지를 불러오는데 실패했습니다')
      }
    } catch (err: any) {
      // 프로덕션 모드에서만 오류 로그 출력
      if (process.env.NODE_ENV === 'production') {
        logger.error('Failed to load notifications:', { error: err instanceof Error ? err.message : String(err) })
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [user, enabled])

  // 메시지 읽음 처리
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!user) return

      // 개발 모드에서는 Mock 읽음 처리
      if (process.env.NODE_ENV === 'development') {
        setMessages(prev =>
          prev.map(msg => (msg.id === messageId ? { ...msg, is_read: true } : msg))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        return
      }

      try {
        const response = await fetch(`/api/host-messages/${messageId}/read`, {
          method: 'PATCH',
        })

        if (response.ok) {
          setMessages(prev =>
            prev.map(msg => (msg.id === messageId ? { ...msg, is_read: true } : msg))
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else {
          throw new Error('읽음 처리에 실패했습니다')
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          logger.error('Failed to mark message as read:', { error: err instanceof Error ? err.message : String(err) })
        }
      }
    },
    [user]
  )

  // 모든 메시지 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    const unreadMessages = messages.filter(msg => !msg.is_read)

    try {
      await Promise.all(
        unreadMessages.map(msg =>
          fetch(`/api/host-messages/${msg.id}/read`, {
            method: 'PATCH',
          })
        )
      )

      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      logger.error('Failed to mark all messages as read:', { error: err instanceof Error ? err.message : String(err) })
    }
  }, [user, messages])

  // Realtime 설정
  useEffect(() => {
    if (!user || !enabled) return

    const channelName = `notifications:${user.id}`
    const channel = supabase.channel(channelName)

    // 새 메시지 실시간 수신 (내가 수신자인 경우)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'host_messages',
        filter: `receiver_uid=eq.${user.id}`,
      },
      async payload => {
        logger.debug('New notification received:', payload)

        try {
          // 새 메시지 정보를 가져와서 상태 업데이트
          const response = await fetch(`/api/host-messages/${payload.new.id}`)
          const data = await response.json()

          if (data.ok) {
            const newMessage = data.data

            setMessages(prev => {
              // 중복 방지
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev
              }
              return [newMessage, ...prev]
            })

            setUnreadCount(prev => prev + 1)

            // 토스트 알림 표시
            if (showToast) {
              toast.success(`${newMessage.sender?.nickname || '누군가'}님이 메시지를 보냈습니다`, {
                icon: '💬',
                duration: 4000,
              })
            }

            // 브라우저 푸시 알림 (창이 포커스되지 않은 경우)
            if (NotificationSettings.isTypeEnabled('messages') && !document.hasFocus()) {
              MeetPinNotifications.newMessage(
                newMessage.sender?.nickname || '알 수 없는 사용자',
                newMessage.text,
                newMessage.room?.title
              )
            }
          }
        } catch (err) {
          logger.error('Failed to process new message notification:', { error: err instanceof Error ? err.message : String(err) })
          // 실패해도 전체 목록을 다시 로드
          loadMessages()
        }
      }
    )

    // 메시지 읽음 상태 업데이트
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'host_messages',
        filter: `receiver_uid=eq.${user.id}`,
      },
      payload => {
        logger.debug('Message updated:', payload)

        if (payload.new.is_read !== payload.old.is_read) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, is_read: payload.new.is_read } : msg
            )
          )

          if (payload.new.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          } else {
            setUnreadCount(prev => prev + 1)
          }
        }
      }
    )

    // 메시지 삭제 처리
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'host_messages',
        filter: `receiver_uid=eq.${user.id}`,
      },
      payload => {
        logger.debug('Message deleted:', payload)

        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))

        if (!payload.old.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    )

    // 채널 구독
    channel.subscribe(status => {
      // 개발 모드에서만 상태 로그 출력 (CLOSED는 정상)
      if (process.env.NODE_ENV === 'development' && status !== 'CLOSED') {
        logger.info('Notifications channel status', { status })
      }

      if (status === 'SUBSCRIBED') {
        // 초기 데이터 로드
        loadMessages()
      }
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [user, enabled, showToast, loadMessages, supabase])

  // 초기 로드
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: loadMessages,
  }
}
