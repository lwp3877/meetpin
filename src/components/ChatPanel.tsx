/* src/components/ChatPanel.tsx */
'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { Send } from 'lucide-react'

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

// 매칭 정보 타입
interface Match {
  id: string
  room_id: string
  host_uid: string
  guest_uid: string
}

// 메시지 폼 스키마
const messageFormSchema = z.object({
  text: z.string().min(1, '메시지를 입력해주세요').max(1000, '메시지는 1000자를 초과할 수 없습니다'),
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
  const [match, setMatch] = useState<Match | null>(null)
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
  const loadMessages = async () => {
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
      setMatch(result.data.match)

      // 상대방 정보 조회
      if (result.data.match) {
        const otherUserId = result.data.match.host_uid === currentUserId 
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
    } catch (err: any) {
      console.error('Messages load error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
    } catch (err: any) {
      console.error('Message send error:', err)
      setError(err.message)
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
  }, [matchId])

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
        (payload) => {
          const newMessage = payload.new as any
          if (newMessage.sender_uid !== currentUserId) {
            // 상대방의 새 메시지만 추가
            setMessages(prev => [...prev, {
              ...newMessage,
              sender: otherUser || { id: newMessage.sender_uid, nickname: '상대방' }
            }])
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
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">메시지를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">❌</div>
            <p className="text-sm text-red-600">{error}</p>
            <Button
              onClick={loadMessages}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.nickname}
              className="w-8 h-8 rounded-full mr-3"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <span className="text-sm text-gray-500">👤</span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">
              {otherUser?.nickname || '상대방'}
            </h3>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-500 text-sm">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_uid === currentUserId
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                  {!isMyMessage && (
                    <div className="flex items-center mb-1">
                      {message.sender?.avatar_url ? (
                        <img
                          src={message.sender.avatar_url}
                          alt={message.sender.nickname}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 mr-2"></div>
                      )}
                      <span className="text-xs text-gray-500">
                        {message.sender?.nickname}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.created_at)}
                    {isMyMessage && message.read_at && (
                      <span className="ml-1">읽음</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="border-t border-white/20 dark:border-slate-700/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit(sendMessage)}>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  {...register('text')}
                  ref={textareaRef}
                  placeholder="메시지를 입력하세요..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg transition-all duration-200"
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
              className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg p-3 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {/* 도움말 */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Shift+Enter로 줄바꿈</span>
            <span>전송은 Enter 키로 합니다</span>
          </div>
        </form>
      </div>
    </div>
  )
}