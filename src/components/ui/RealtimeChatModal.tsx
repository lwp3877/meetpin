/* src/components/ui/RealtimeChatModal.tsx */
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Send, Wifi, WifiOff, User } from 'lucide-react'
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
  roomId 
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
    stopTyping
  } = useRealtimeChat({
    roomId,
    otherUserId: hostId,
    enabled: isOpen && !!user
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

    const unreadMessages = messages.filter(msg => 
      msg.receiver_uid === user.id && !msg.is_read
    )

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
        hour12: true 
      })
    } else if (diffDays === 1) {
      return '어제 ' + date.toLocaleTimeString('ko-KR', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // 호스트가 온라인인지 확인
  const isHostOnline = onlineUsers.some(u => u.uid === hostId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[80vh] max-h-[600px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {hostAvatar ? (
                <Image 
                  src={hostAvatar} 
                  alt={hostName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              
              {/* 온라인 상태 표시 */}
              {isHostOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>{hostName}</span>
                {isHostOnline && <span className="text-xs text-green-600">온라인</span>}
              </h2>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                <p className="text-sm text-gray-500">
                  {connectionStatus === 'connected' ? '실시간 연결됨' : 
                   connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">메시지를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>메시지를 불러오지 못했습니다</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 메시지가 없습니다</p>
              <p className="text-sm mt-1">{hostName}님과 대화를 시작해보세요!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMine = msg.sender_uid === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isMine ? 'order-2' : 'order-1'}`}>
                      <div className={`p-3 rounded-2xl ${
                        isMine 
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}>
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
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
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
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`${hostName}님에게 메시지를 입력하세요...`}
                className="w-full p-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors max-h-24"
                rows={1}
                maxLength={500}
                disabled={connectionStatus !== 'connected'}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {message.length}/500
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || connectionStatus !== 'connected'}
              className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}