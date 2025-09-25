/* src/components/ui/HostMessageModal.tsx */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'

interface HostMessageModalProps {
  isOpen: boolean
  onClose: () => void
  hostName: string
  hostAvatar?: string
  roomId: string
}

export function HostMessageModal({
  isOpen,
  onClose,
  hostName,
  hostAvatar,
  roomId,
}: HostMessageModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { user } = useAuth()

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('메시지를 입력해주세요')
      return
    }

    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/host-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.message || '메시지 전송에 실패했습니다')
      }

      toast.success(`${hostName}님에게 메시지를 전송했습니다!`)
      setMessage('')
      onClose()
    } catch (error: any) {
      toast.error(error.message || '메시지 전송에 실패했습니다')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white/95 p-4 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            {hostAvatar && (
              <Image
                src={hostAvatar}
                alt={hostName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{hostName}님에게 메시지</h2>
              <p className="text-sm text-gray-500">호스트와 직접 소통해보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">메시지 내용</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="호스트에게 전달할 메시지를 입력하세요..."
              className="h-32 w-full resize-none rounded-2xl border border-gray-200 p-4 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500">{message.length}/500</div>
          </div>

          {/* Quick Message Templates */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">빠른 메시지 (선택)</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                '안녕하세요! 모임에 참여하고 싶습니다.',
                '모임 관련해서 궁금한 점이 있어요.',
                '혹시 준비물이 따로 필요한가요?',
                '장소에 대해 더 자세히 알고 싶어요.',
              ].map(template => (
                <button
                  key={template}
                  onClick={() => setMessage(template)}
                  className="rounded-xl bg-gray-50 p-3 text-left text-sm transition-colors hover:bg-gray-100"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex space-x-3 border-t border-gray-100 bg-white/95 p-4 backdrop-blur-md">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>전송</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
