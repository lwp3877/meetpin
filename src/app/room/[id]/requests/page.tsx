/* src/app/room/[id]/requests/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  user: {
    id: string
    nickname: string
    age_range: string
    avatar_url?: string
    intro?: string
  }
}

interface Room {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  place_text: string
  start_at: string
  max_people: number
  participants_count: number
  is_host: boolean
}

export default function RoomRequestsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')

  const roomId = params?.id as string

  // 방 정보와 요청 목록 로드
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 방 정보 로드
      const roomResponse = await fetch(`/api/rooms/${roomId}`)
      const roomResult = await roomResponse.json()

      if (!roomResult.ok) {
        throw new Error(roomResult.message || '방 정보를 불러올 수 없습니다')
      }

      const roomData = roomResult.data.room

      if (!roomData.is_host) {
        throw new Error('이 방의 요청을 관리할 권한이 없습니다')
      }

      setRoom(roomData)

      // 요청 목록 로드
      const requestsResponse = await fetch(`/api/rooms/${roomId}/requests`)
      const requestsResult = await requestsResponse.json()

      if (!requestsResult.ok) {
        throw new Error(requestsResult.message || '요청 목록을 불러올 수 없습니다')
      }

      setRequests(requestsResult.data.requests || [])
    } catch (err: any) {
      console.error('Data load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 요청 처리 (승인/거절)
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(requestId)

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          reason
        }),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '요청 처리에 실패했습니다')
      }

      toast.success(action === 'approve' ? '참가 요청을 승인했습니다!' : '참가 요청을 거절했습니다')
      
      // 데이터 새로고침
      await loadData()
    } catch (err: any) {
      console.error('Request action error:', err)
      toast.error(err.message)
    } finally {
      setProcessing(null)
    }
  }

  // 승인 확인 다이얼로그
  const confirmApprove = (request: Request) => {
    if (!room) return

    const remainingSlots = room.max_people - room.participants_count
    
    if (remainingSlots <= 0) {
      toast.error('모집 인원이 가득 찼습니다')
      return
    }

    if (window.confirm(`${request.user.nickname}님의 참가 요청을 승인하시겠습니까?`)) {
      handleRequestAction(request.id, 'approve')
    }
  }

  // 거절 확인 다이얼로그
  const confirmReject = (request: Request) => {
    const reason = window.prompt(
      `${request.user.nickname}님의 참가 요청을 거절하는 이유를 입력해주세요 (선택사항):`
    )
    
    // null이면 취소, 빈 문자열이면 계속 진행
    if (reason !== null) {
      handleRequestAction(request.id, 'reject', reason || undefined)
    }
  }

  useEffect(() => {
    if (roomId) {
      loadData()
    }
  }, [roomId])

  // 인증 체크
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">요청 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 인증 실패
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">로그인 필요</h2>
          <p className="text-gray-600 mb-6">요청을 관리하려면 로그인이 필요합니다.</p>
          <Button onClick={() => router.push('/auth/login')}>
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  // 오류 또는 방 없음
  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">요청을 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '존재하지 않는 방이거나 권한이 없습니다.'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/rooms')} variant="outline">
              내 모임으로
            </Button>
            <Button onClick={loadData}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const categoryDisplay = getCategoryDisplay(room.category)
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')
  const filteredRequests = activeTab === 'pending' ? pendingRequests : requests
  const remainingSlots = room.max_people - room.participants_count

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
                onClick={() => router.push(`/room/${roomId}`)}
                className="mr-2"
              >
                ← 뒤로
              </Button>
              <h1 className="text-xl font-bold text-gray-900">참가 요청 관리</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Room Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: categoryDisplay.color }}
            >
              {categoryDisplay.emoji} {categoryDisplay.label}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{room.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              {room.place_text}
            </div>
            <div className="flex items-center">
              <span className="mr-2">🕐</span>
              {new Date(room.start_at).toLocaleDateString('ko-KR')} {new Date(room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              {room.participants_count}/{room.max_people}명 
              <span className="ml-2 text-primary">
                (남은 자리: {remainingSlots}개)
              </span>
            </div>
          </div>

          {remainingSlots <= 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 모집 인원이 가득 찼습니다. 추가 승인 시 최대 인원을 초과하게 됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border border-gray-100 border-b-0">
          <div className="px-6">
            <div className="flex space-x-8">
              {[
                { key: 'pending', label: '대기 중', count: pendingRequests.length },
                { key: 'all', label: '전체', count: requests.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-b-xl border border-gray-100 shadow-lg">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📮</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pending' ? '대기 중인 요청이 없습니다' : '요청이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending' 
                  ? '새로운 참가 요청이 들어오면 여기에 표시됩니다.' 
                  : '아직 아무도 참가 요청을 보내지 않았습니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex items-start flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mr-4 shadow-lg">
                        {request.user.avatar_url ? (
                          <img
                            src={request.user.avatar_url}
                            alt={request.user.nickname}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {request.user.nickname.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.user.nickname}
                          </h3>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {request.user.age_range}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'pending' ? '⏳ 대기 중' :
                             request.status === 'approved' ? '✅ 승인됨' :
                             '❌ 거절됨'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          <p>신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')} {new Date(request.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                          {request.status !== 'pending' && (
                            <p>처리일: {new Date(request.updated_at).toLocaleDateString('ko-KR')} {new Date(request.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                          )}
                        </div>

                        {request.user.intro && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">자기소개:</span> {request.user.intro}
                            </p>
                          </div>
                        )}

                        {request.message && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">요청 메시지:</span> {request.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => confirmApprove(request)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {processing === request.id ? '처리 중...' : '✅ 승인'}
                        </Button>
                        <Button
                          onClick={() => confirmReject(request)}
                          disabled={processing === request.id}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          {processing === request.id ? '처리 중...' : '❌ 거절'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {requests.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                <div className="text-sm text-gray-600">대기 중</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</div>
                <div className="text-sm text-gray-600">승인됨</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</div>
                <div className="text-sm text-gray-600">거절됨</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}