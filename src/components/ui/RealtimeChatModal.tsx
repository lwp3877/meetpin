/* src/components/ui/RealtimeChatModal.tsx */
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import X from 'lucide-react/dist/esm/icons/x'
import Send from 'lucide-react/dist/esm/icons/send'
import Wifi from 'lucide-react/dist/esm/icons/wifi'
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off'
import User from 'lucide-react/dist/esm/icons/user'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'

interface RealtimeChatModalProps {
  isOpen: boolean
  onClose: () => void
  hostName: string
  hostAvatar?: string
  hostId: string
  roomId: string
}

export function RealtimeChatModal({
  isOpen,
  onClose,
  hostName,
  hostAvatar,
  hostId,
  roomId,
}: RealtimeChatModalProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const {
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
  } = useRealtimeChat({
    roomId,
    otherUserId: hostId,
    enabled: isOpen && !!user,
  })

  // 메시지 영역 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 읽지 않은 메시지 자동 읽음 처리
  useEffect(() => {
    if (!isOpen || !user) return

    const unreadMessages = messages.filter(msg => msg.receiver_uid === user.id && !msg.is_read)

    unreadMessages.forEach(msg => {
      markAsRead(msg.id)
    })
  }, [messages, isOpen, user, markAsRead])

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    const success = await sendMessage(message, hostId)
    if (success) {
      setMessage('')
      stopTyping()
      setIsTyping(false)
      inputRef.current?.focus()
    } else {
      toast.error('메시지 전송에 실패했습니다')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    // 타이핑 상태 관리
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      sendTyping()
    }

    // 타이핑 중지 타이머 설정
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        stopTyping()
      }
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } else if (diffDays === 1) {
      return (
        '어제 ' +
        date.toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // 호스트가 온라인인지 확인
  const isHostOnline = onlineUsers.some(u => u.uid === hostId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] max-h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white/95 p-4 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {hostAvatar ? (
                <Image
                  src={hostAvatar}
                  alt={hostName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              )}

              {/* 온라인 상태 표시 */}
              {isHostOnline && (
                <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
              )}
            </div>
            <div>
              <h2 className="flex items-center space-x-2 text-lg font-bold text-gray-900">
                <span>{hostName}</span>
                {isHostOnline && <span className="text-xs text-green-600">온라인</span>}
              </h2>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <p className="text-sm text-gray-500">
                  {connectionStatus === 'connected'
                    ? '실시간 연결됨'
                    : connectionStatus === 'connecting'
                      ? '연결 중...'
                      : '연결 끊김'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">메시지를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">
              <p>메시지를 불러오지 못했습니다</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>아직 메시지가 없습니다</p>
              <p className="mt-1 text-sm">{hostName}님과 대화를 시작해보세요!</p>
            </div>
          ) : (
            <>
              {messages.map(msg => {
                const isMine = msg.sender_uid === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isMine ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl p-3 ${
                          isMine
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <div
                        className={`mt-1 flex items-center space-x-1 text-xs text-gray-500 ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatTime(msg.created_at)}</span>
                        {isMine && (
                          <span className={msg.is_read ? 'text-blue-500' : 'text-gray-400'}>
                            {msg.is_read ? '읽음' : '전송됨'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* 타이핑 인디케이터 */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="rounded-2xl bg-gray-100 p-3">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {typingUsers.map(u => u.nickname).join(', ')}님이 입력 중...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 p-4 backdrop-blur-md">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`${hostName}님에게 메시지를 입력하세요...`}
                className="max-h-24 w-full resize-none rounded-2xl border border-gray-200 p-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                rows={1}
                maxLength={500}
                disabled={connectionStatus !== 'connected'}
              />
              <div className="mt-1 text-right text-xs text-gray-500">{message.length}/500</div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || connectionStatus !== 'connected'}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 p-3 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
