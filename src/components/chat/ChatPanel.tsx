/* src/components/ChatPanel.tsx */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import Send from 'lucide-react/dist/esm/icons/send'
import { logger } from '@/lib/observability/logger'

// 메시지 타입
interface Message {
  id: string
  match_id: string
  sender_uid: string
  text: string
  created_at: string
  read_at?: string
  sender: {
    id: string
    nickname: string
    avatar_url?: string
  }
}

// 메시지 폼 스키마
const messageFormSchema = z.object({
  text: z
    .string()
    .min(1, '메시지를 입력해주세요')
    .max(1000, '메시지는 1000자를 초과할 수 없습니다'),
})

type MessageFormData = z.infer<typeof messageFormSchema>

interface ChatPanelProps {
  matchId: string
  currentUserId: string
  className?: string
  onClose?: () => void
}

export default function ChatPanel({
  matchId,
  currentUserId,
  className = '',
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<{ nickname: string; avatar_url?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createBrowserSupabaseClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
  })

  const messageText = watch('text')

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/matches/${matchId}/messages?limit=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '메시지를 불러올 수 없습니다')
      }

      setMessages(result.data.messages || [])

      // 상대방 정보 조회
      if (result.data.match) {
        const otherUserId =
          result.data.match.host_uid === currentUserId
            ? result.data.match.guest_uid
            : result.data.match.host_uid

        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname, avatar_url')
          .eq('id', otherUserId)
          .single()

        if (profile) {
          setOtherUser(profile)
        }
      }
    } catch (err: unknown) {
      logger.error('Messages load error:', { error: err instanceof Error ? err.message : String(err) })
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [matchId, currentUserId, supabase])

  // 메시지 전송
  const sendMessage = async (data: MessageFormData) => {
    try {
      setIsSending(true)
      setError(null)

      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '메시지 전송에 실패했습니다')
      }

      // 새 메시지를 목록에 추가
      setMessages(prev => [...prev, result.data])
      reset()

      // 텍스트 영역 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err: unknown) {
      logger.error('Message send error:', { error: err instanceof Error ? err.message : String(err) })
      setError((err as Error).message)
    } finally {
      setIsSending(false)
    }
  }

  // 텍스트 영역 자동 높이 조절
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  // Enter 키 전송 (Shift+Enter는 줄바꿈)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (messageText?.trim() && !isSending) {
        handleSubmit(sendMessage)()
      }
    }
  }

  // 메시지 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 시간 포맷팅
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
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

  // 컴포넌트 마운트 시 메시지 로드
  useEffect(() => {
    loadMessages()
  }, [matchId, loadMessages])

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 실시간 메시지 구독 (Supabase Realtime)
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        payload => {
          const newMessage = payload.new as Message
          if (newMessage.sender_uid !== currentUserId) {
            // 상대방의 새 메시지만 추가
            setMessages(prev => [
              ...prev,
              {
                ...newMessage,
                sender: otherUser || { id: newMessage.sender_uid, nickname: '상대방' },
              } as Message,
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUserId, otherUser, supabase])

  if (isLoading) {
    return (
      <div className={`flex h-full flex-col ${className}`}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-sm text-gray-600">메시지를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex h-full flex-col ${className}`}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-red-500">❌</div>
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={loadMessages} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center">
          {otherUser?.avatar_url ? (
            <Image
              src={otherUser.avatar_url}
              alt={otherUser.nickname}
              width={32}
              height={32}
              className="mr-3 h-8 w-8 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <span className="text-sm text-gray-500">👤</span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{otherUser?.nickname || '상대방'}</h3>
            <p className="text-xs text-gray-500">
              {messages.length > 0 ? `${messages.length}개 메시지` : '대화 시작'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl">💬</div>
            <p className="text-sm text-gray-500">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map(message => {
            const isMyMessage = message.sender_uid === currentUserId

            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                  {!isMyMessage && (
                    <div className="mb-1 flex items-center">
                      {message.sender?.avatar_url ? (
                        <Image
                          src={message.sender.avatar_url}
                          alt={message.sender.nickname}
                          width={20}
                          height={20}
                          className="mr-2 h-5 w-5 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="mr-2 h-5 w-5 rounded-full bg-gray-200"></div>
                      )}
                      <span className="text-xs text-gray-500">{message.sender?.nickname}</span>
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isMyMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <div
                    className={`mt-1 text-xs text-gray-400 ${isMyMessage ? 'text-right' : 'text-left'}`}
                  >
                    {formatMessageTime(message.created_at)}
                    {isMyMessage && message.read_at && <span className="ml-1">읽음</span>}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="border-t border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/50">
        <form onSubmit={handleSubmit(sendMessage)}>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  {...register('text')}
                  ref={textareaRef}
                  placeholder="메시지를 입력하세요..."
                  rows={1}
                  className="focus:ring-primary w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 shadow-lg transition-all duration-200 focus:border-transparent focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
                  onInput={adjustTextareaHeight}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                  {messageText?.length || 0}/1000
                </div>
              </div>
              {errors.text && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.text.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!messageText?.trim() || isSending}
              className="from-primary hover:from-primary/90 rounded-2xl bg-gradient-to-r to-emerald-600 p-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:to-emerald-600/90"
            >
              {isSending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* 도움말 */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Shift+Enter로 줄바꿈</span>
            <span>전송은 Enter 키로 합니다</span>
          </div>
        </form>
      </div>
    </div>
  )
}
