/* src/app/chat/[matchId]/page.tsx */
'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ChatPanel from '@/components/chat/ChatPanel'
import { AlertCircle, ArrowLeft } from 'lucide-react'

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

        // matchId 유효성 검증
        if (!matchId || matchId === 'undefined' || matchId === 'null') {
          throw new Error('올바르지 않은 채팅 ID입니다')
        }

        // UUID 형식 검증
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(matchId)) {
          throw new Error('잘못된 채팅 ID 형식입니다')
        }

        // 타임아웃 처리를 위한 AbortController
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        clearTimeout(timeoutId)
        
        if (userError) {
          if (userError.message.includes('session_expired')) {
            throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요')
          } else if (userError.message.includes('invalid_token')) {
            throw new Error('인증 토큰이 유효하지 않습니다. 다시 로그인해주세요')
          }
          throw new Error('인증 정보를 확인할 수 없습니다')
        }
        
        if (!user) {
          throw new Error('로그인이 필요합니다')
        }

        // 매치 접근 권한 확인
        const matchResponse = await fetch(`/api/matches/${matchId}/verify`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        })

        if (!matchResponse.ok) {
          if (matchResponse.status === 404) {
            throw new Error('존재하지 않는 채팅입니다')
          } else if (matchResponse.status === 403) {
            throw new Error('이 채팅에 접근할 권한이 없습니다')
          }
          throw new Error('채팅 접근 권한을 확인할 수 없습니다')
        }

        setCurrentUserId(user.id)
      } catch (err: any) {
        console.error('User fetch error:', err)
        
        if (err.name === 'AbortError') {
          setError('요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요')
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('네트워크 연결을 확인해주세요')
        } else {
          setError(err.message || '채팅을 불러오는 중 오류가 발생했습니다')
        }
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentUser()
  }, [supabase, matchId])

  const handleClose = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-2xl max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-300">채팅을 준비하는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-2xl max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">채팅 오류</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{error || '인증 정보를 가져올 수 없습니다'}</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => router.push('/auth')} 
                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg"
              >
                로그인
              </Button>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1" />
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      <ChatPanel
        matchId={matchId}
        currentUserId={currentUserId}
        onClose={handleClose}
        className="flex-1"
      />
    </div>
  )
}