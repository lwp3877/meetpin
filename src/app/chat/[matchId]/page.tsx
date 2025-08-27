/* 파일경로: src/app/chat/[matchId]/page.tsx */
'use client'

import { brandMessages } from '@/lib/brand'
import { use, useState } from 'react'

export default function ChatPage({ 
  params 
}: { 
  params: Promise<{ matchId: string }> 
}) {
  const { matchId } = use(params)
  const [message, setMessage] = useState('')
  const [messages] = useState([
    {
      id: '1',
      text: '안녕하세요! 만나서 반가워요 😊',
      sender_uid: 'other',
      created_at: new Date().toISOString(),
    }
  ])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    console.log('Sending message:', { matchId, text: message })
    alert('메시지 전송 기능은 준비 중입니다. 곧 실시간 채팅을 지원할 예정입니다.')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 shrink-0">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            💬 채팅
          </h1>
          <p className="text-sm text-text-muted">
            매칭 ID: {matchId}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_uid === 'current-user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender_uid === 'current-user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-text'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="bg-white border-t p-4 shrink-0">
        <div className="container mx-auto flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-deep text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            전송
          </button>
        </div>
      </form>

      {/* Placeholder Info */}
      <div className="bg-yellow-50 border-t border-yellow-200 p-3">
        <div className="container mx-auto">
          <p className="text-xs text-yellow-800 text-center">
            🚧 <strong>개발 중:</strong> ChatPanel 컴포넌트와 실시간 메시징 기능을 구현 중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}