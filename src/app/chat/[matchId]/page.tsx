/* src/app/chat/[matchId]/page.tsx */
'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import ChatPanel from '@/components/ChatPanel'

export default function ChatPage({ 
  params 
}: { 
  params: Promise<{ matchId: string }> 
}) {
  const { matchId } = use(params)
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserSupabaseClient()

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error('로그인이 필요합니다')
        }

        setCurrentUserId(user.id)
      } catch (err: any) {
        console.error('User fetch error:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentUser()
  }, [supabase])

  const handleClose = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">채팅을 준비하는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">채팅 오류</h2>
          <p className="text-gray-600 mb-6">{error || '인증 정보를 가져올 수 없습니다'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/auth')} className="bg-primary">
              로그인
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ChatPanel
        matchId={matchId}
        currentUserId={currentUserId}
        onClose={handleClose}
        className="flex-1"
      />
    </div>
  )
}