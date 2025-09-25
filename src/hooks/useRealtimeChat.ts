/**
 * 실시간 채팅 훅 (useRealtimeChat)
 *
 * Supabase Realtime을 사용하여 WebSocket 기반의 실시간 채팅을 구현합니다.
 * 호스트와 참가자 간의 1:1 메시지 교환을 위한 훅입니다.
 *
 * @features
 * - 실시간 메시지 송수신
 * - 타이핑 상태 표시 (typing indicators)
 * - 온라인 사용자 상태 추적
 * - 메시지 읽음 상태 관리
 * - 연결 상태 모니터링
 *
 * @params
 * - roomId: 채팅이 연결된 방의 ID
 * - otherUserId: 대화 상대방의 사용자 ID
 * - enabled: 훅 활성화 여부 (기본: true)
 *
 * @returns
 * - messages: 채팅 메시지 목록
 * - loading: 로딩 상태
 * - error: 에러 메시지
 * - typingUsers: 현재 타이핑 중인 사용자 목록
 * - onlineUsers: 온라인 사용자 목록
 * - connectionStatus: WebSocket 연결 상태
 * - sendMessage: 메시지 전송 함수
 * - markAsRead: 메시지 읽음 처리 함수
 * - sendTyping: 타이핑 상태 전송 함수
 * - stopTyping: 타이핑 상태 중지 함수
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from '@/lib/useAuth'
import { logger } from '@/lib/utils/logger'

interface ChatMessage {
  id: string
  room_id: string
  sender_uid: string
  receiver_uid: string
  text: string
  is_read: boolean
  created_at: string
  sender_profile?: {
    nickname: string
    avatar_url?: string
  }
  receiver_profile?: {
    nickname: string
    avatar_url?: string
  }
}

interface TypingUser {
  uid: string
  nickname: string
  timestamp: number
}

interface OnlineUser {
  uid: string
  nickname: string
  last_seen: string
  presence_ref?: string
}

interface UseRealtimeChatOptions {
  roomId?: string
  otherUserId?: string
  enabled?: boolean
}

export function useRealtimeChat({ roomId, otherUserId, enabled = true }: UseRealtimeChatOptions) {
  const { user } = useAuth()
  const supabase = createBrowserSupabaseClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    if (!user || !enabled) return

    // 개발 모드에서는 Mock 데이터 사용
    if (process.env.NODE_ENV === 'development') {
      setLoading(false)
      // Mock 메시지 데이터 생성
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          room_id: roomId || 'mock-room',
          sender_uid: 'mock-host-123',
          receiver_uid: user.id,
          text: '안녕하세요! 모임에 관심 가져주셔서 감사합니다.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
          sender_profile: {
            nickname: '모임 호스트',
            avatar_url:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
        },
        {
          id: '2',
          room_id: roomId || 'mock-room',
          sender_uid: user.id,
          receiver_uid: 'mock-host-123',
          text: '모임에 참여하고 싶습니다!',
          is_read: true,
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30분 전
          receiver_profile: {
            nickname: '모임 호스트',
            avatar_url:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
        },
      ]
      setMessages(mockMessages)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 조건에 따라 메시지 필터링
      let query = supabase
        .from('host_messages')
        .select(
          `
          *,
          sender_profile:profiles!sender_uid(nickname, avatar_url),
          receiver_profile:profiles!receiver_uid(nickname, avatar_url)
        `
        )
        .order('created_at', { ascending: true })

      // 특정 방의 메시지만 가져오기
      if (roomId) {
        query = query.eq('room_id', roomId)
      }

      // 특정 사용자와의 대화만 가져오기
      if (otherUserId) {
        query = query.or(
          `and(sender_uid.eq.${user.id},receiver_uid.eq.${otherUserId}),and(sender_uid.eq.${otherUserId},receiver_uid.eq.${user.id})`
        )
      } else {
        // 사용자가 송신자이거나 수신자인 메시지만
        query = query.or(`sender_uid.eq.${user.id},receiver_uid.eq.${user.id}`)
      }

      const { data, error } = await query

      if (error) throw error

      setMessages(data || [])
    } catch (err: any) {
      // 프로덕션 모드에서만 오류 로그 출력
      if (process.env.NODE_ENV === 'production') {
        console.error('Failed to load messages:', err)
        setError(err.message || '메시지를 불러오는데 실패했습니다')
      }
    } finally {
      setLoading(false)
    }
  }, [user, roomId, otherUserId, enabled, supabase])

  // 메시지 전송
  const sendMessage = useCallback(
    async (text: string, receiverUid: string) => {
      if (!user || !text.trim()) return false

      // 개발 모드에서는 Mock 메시지 추가
      if (process.env.NODE_ENV === 'development') {
        // Mock 메시지를 현재 메시지 목록에 추가
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          room_id: roomId || 'mock-room',
          sender_uid: user.id,
          receiver_uid: receiverUid,
          text: text.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
          sender_profile: {
            nickname: user.email?.split('@')[0] || '나',
            avatar_url: user.avatar_url,
          },
        }

        setMessages(prev => [...prev, newMessage])

        // 2초 후 자동 응답 Mock
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            room_id: roomId || 'mock-room',
            sender_uid: receiverUid,
            receiver_uid: user.id,
            text: '메시지 잘 받았습니다! 곧 답변드릴게요.',
            is_read: false,
            created_at: new Date().toISOString(),
            sender_profile: {
              nickname: '모임 호스트',
              avatar_url:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            },
          }
          setMessages(prev => [...prev, autoReply])
        }, 2000)

        return true
      }

      try {
        const { error } = await (supabase as any).from('host_messages').insert({
          room_id: roomId || '',
          sender_uid: user.id,
          receiver_uid: receiverUid,
          text: text.trim(),
          is_read: false,
        })

        if (error) throw error

        return true
      } catch (err: any) {
        // 프로덕션 모드에서만 오류 로그 출력
        if (process.env.NODE_ENV === 'production') {
          console.error('Failed to send message:', err)
          setError(err.message || '메시지 전송에 실패했습니다')
        }
        return false
      }
    },
    [user, roomId, supabase]
  )

  // 메시지 읽음 처리
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!user) return

      try {
        const { error } = await (supabase as any)
          .from('host_messages')
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq('id', messageId)
          .eq('receiver_uid', user.id)

        if (error) throw error
      } catch (err: any) {
        console.error('Failed to mark message as read:', err)
      }
    },
    [user, supabase]
  )

  // 타이핑 상태 전송
  const sendTyping = useCallback(() => {
    if (!channelRef.current || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        uid: user.id,
        nickname: user.nickname,
        timestamp: Date.now(),
      },
    })
  }, [user])

  // 타이핑 상태 중지
  const stopTyping = useCallback(() => {
    if (!channelRef.current || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: {
        uid: user.id,
      },
    })
  }, [user])

  // Realtime 채널 설정
  useEffect(() => {
    if (!user || !enabled) return

    // 개발 모드에서는 실시간 채널 설정 건너뛰기
    if (process.env.NODE_ENV === 'development') {
      setConnectionStatus('connected')
      return
    }

    const channelName = roomId ? `chat:room:${roomId}` : `chat:user:${user.id}`
    const channel = supabase.channel(channelName)

    // 새 메시지 실시간 수신
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'host_messages',
        filter: roomId ? `room_id=eq.${roomId}` : `sender_uid=eq.${user.id}`,
      },
      payload => {
        logger.debug('New message received:', payload)
        loadMessages() // 새 메시지가 오면 다시 로드
      }
    )

    // 메시지 읽음 상태 업데이트
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'host_messages',
        filter: roomId ? `room_id=eq.${roomId}` : `receiver_uid=eq.${user.id}`,
      },
      payload => {
        logger.debug('Message updated:', payload)
        loadMessages()
      }
    )

    // 타이핑 상태 수신
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.uid !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.uid !== payload.uid)
          return [
            ...filtered,
            {
              uid: payload.uid,
              nickname: payload.nickname,
              timestamp: payload.timestamp,
            },
          ]
        })
      }
    })

    // 타이핑 중지 수신
    channel.on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
      setTypingUsers(prev => prev.filter(u => u.uid !== payload.uid))
    })

    // Presence 설정 (온라인 사용자)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const online = Object.values(state)
        .flat()
        .map((presence: any) => ({
          uid: presence.uid,
          nickname: presence.nickname,
          last_seen: presence.last_seen,
          presence_ref: presence.presence_ref,
        })) as OnlineUser[]
      setOnlineUsers(online)
    })

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      logger.debug('User joined:', key, newPresences)
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      logger.debug('User left:', key, leftPresences)
    })

    // 채널 구독 먼저 수행
    channel.subscribe(status => {
      // 개발 모드에서는 로그 출력 안함
      if (process.env.NODE_ENV !== 'development') {
        logger.info('Chat channel status:', status)
      }
      setConnectionStatus(
        status === 'SUBSCRIBED'
          ? 'connected'
          : status === 'CHANNEL_ERROR'
            ? 'disconnected'
            : 'connecting'
      )

      if (status === 'SUBSCRIBED') {
        // 구독 완료 후 presence 추적 시작
        channel.track({
          uid: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          last_seen: new Date().toISOString(),
        })
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
  }, [user, roomId, enabled, loadMessages, supabase])

  // 타이핑 상태 정리 (5초 후 자동 제거)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => prev.filter(user => now - user.timestamp < 5000))
    }, 1000)

    return () => clearInterval(cleanup)
  }, [])

  // 초기 로드
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    loading,
    error,
    typingUsers,
    onlineUsers,
    connectionStatus,
    sendMessage,
    markAsRead,
    sendTyping,
    stopTyping,
    refetch: loadMessages,
  }
}
