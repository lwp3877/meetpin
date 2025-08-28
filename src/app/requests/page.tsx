/* src/app/requests/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { getCategoryDisplay } from '@/lib/brand'
import toast from 'react-hot-toast'

interface Request {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  message?: string
  room: {
    id: string
    title: string
    category: 'drink' | 'exercise' | 'other'
    place_text: string
    start_at: string
    host: {
      nickname: string
      avatar_url?: string
    }
  }
  match_id?: string // 승인된 경우 매치 ID
}

interface Match {
  id: string
  room_id: string
  created_at: string
  room: {
    id: string
    title: string
    category: 'drink' | 'exercise' | 'other'
    place_text: string
    start_at: string
  }
  other_user: {
    id: string
    nickname: string
    avatar_url?: string
    age_range: string
  }
  last_message?: {
    text: string
    created_at: string
  }
  unread_count: number
}

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'requests' | 'matches'>('requests')
  const router = useRouter()

  // 내 요청 목록 로드
  const loadMyRequests = async () => {
    try {
      const response = await fetch('/api/requests/my')
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '요청 목록을 불러올 수 없습니다')
      }

      setMyRequests(result.data.requests || [])
    } catch (err: any) {
      console.error('My requests load error:', err)
      setError(err.message)
    }
  }

  // 내 매치 목록 로드
  const loadMyMatches = async () => {
    try {
      const response = await fetch('/api/matches/my')
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '매치 목록을 불러올 수 없습니다')
      }

      setMyMatches(result.data.matches || [])
    } catch (err: any) {
      console.error('My matches load error:', err)
      setError(err.message)
    }
  }

  // 전체 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([loadMyRequests(), loadMyMatches()])
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  // 요청 취소
  const cancelRequest = async (requestId: string) => {
    if (!window.confirm('정말로 참가 요청을 취소하시겠습니까?')) return

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '요청 취소에 실패했습니다')
      }

      toast.success('요청이 취소되었습니다')
      await loadMyRequests()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // 채팅방으로 이동
  const openChat = (matchId: string) => {
    router.push(`/chat/${matchId}`)
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading, loadData])

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">요청함을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

  const pendingRequests = myRequests.filter(r => r.status === 'pending')
  const approvedRequests = myRequests.filter(r => r.status === 'approved')
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-2"
              >
                ← 뒤로
              </Button>
              <h1 className="text-xl font-bold text-gray-900">요청함</h1>
            </div>
            <Button
              onClick={() => router.push('/map')}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              🗺️ 모임 찾기
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              참가 요청 ({myRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'matches'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              매치된 모임 ({myMatches.length})
              {myMatches.some(m => m.unread_count > 0) && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                  {myMatches.reduce((sum, m) => sum + m.unread_count, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                  <div className="text-sm text-gray-600">대기 중</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
                  <div className="text-sm text-gray-600">승인됨</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
                  <div className="text-sm text-gray-600">거절됨</div>
                </div>
              </div>
            </div>

            {/* Requests List */}
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📤</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">보낸 요청이 없습니다</h3>
                <p className="text-gray-600 mb-6">관심있는 모임에 참가 신청을 보내보세요!</p>
                <Button
                  onClick={() => router.push('/map')}
                  className="bg-primary hover:bg-primary/90"
                >
                  모임 찾으러 가기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => {
                  const categoryDisplay = getCategoryDisplay(request.room.category)
                  const isUpcoming = new Date(request.room.start_at) > new Date()
                  
                  return (
                    <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: categoryDisplay.color }}
                            >
                              {categoryDisplay.emoji} {categoryDisplay.label}
                            </span>
                            
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status === 'pending' ? '⏳ 대기 중' :
                               request.status === 'approved' ? '✅ 승인됨' :
                               '❌ 거절됨'}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {request.room.title}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <span className="mr-2">📍</span>
                              {request.room.place_text}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🕐</span>
                              {new Date(request.room.start_at).toLocaleDateString('ko-KR')} {new Date(request.room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">👤</span>
                              호스트: {request.room.host.nickname}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">📅</span>
                              신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>

                          {request.message && (
                            <div className="p-3 bg-blue-50 rounded-lg mb-3">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">신청 메시지:</span> {request.message}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => router.push(`/room/${request.room.id}`)}
                            size="sm"
                            variant="outline"
                          >
                            모임 보기
                          </Button>
                          
                          {request.status === 'approved' && request.match_id && (
                            <Button
                              onClick={() => openChat(request.match_id!)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              💬 채팅하기
                            </Button>
                          )}
                          
                          {request.status === 'pending' && isUpcoming && (
                            <Button
                              onClick={() => cancelRequest(request.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              요청 취소
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            {myMatches.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💕</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">매치된 모임이 없습니다</h3>
                <p className="text-gray-600 mb-6">모임에 참가 신청을 보내고 승인받으면 여기에 표시됩니다!</p>
                <Button
                  onClick={() => router.push('/map')}
                  className="bg-primary hover:bg-primary/90"
                >
                  모임 찾으러 가기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myMatches.map((match) => {
                  const categoryDisplay = getCategoryDisplay(match.room.category)
                  
                  return (
                    <div key={match.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: categoryDisplay.color }}
                            >
                              {categoryDisplay.emoji} {categoryDisplay.label}
                            </span>
                            
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              💕 매치 성공
                            </span>

                            {match.unread_count > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {match.unread_count}개 안읽음
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {match.room.title}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <span className="mr-2">📍</span>
                              {match.room.place_text}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🕐</span>
                              {new Date(match.room.start_at).toLocaleDateString('ko-KR')} {new Date(match.room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">👤</span>
                              상대방: {match.other_user.nickname} ({match.other_user.age_range})
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">💕</span>
                              매치일: {new Date(match.created_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>

                          {match.last_message && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">최근 메시지:</span> {match.last_message.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(match.last_message.created_at).toLocaleDateString('ko-KR')} {new Date(match.last_message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => openChat(match.id)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                          >
                            💬 채팅하기
                          </Button>
                          
                          <Button
                            onClick={() => router.push(`/room/${match.room.id}`)}
                            size="sm"
                            variant="outline"
                          >
                            모임 보기
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}