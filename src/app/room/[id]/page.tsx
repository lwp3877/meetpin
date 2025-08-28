/* src/app/room/[id]/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { getCategoryDisplay } from '@/lib/brand'
import toast from 'react-hot-toast'

interface Room {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  fee: number
  visibility: 'public' | 'private'
  description?: string
  boost_until?: string
  created_at: string
  host: {
    id: string
    nickname: string
    avatar_url?: string
    age_range: string
  }
  participants_count: number
  user_request_status?: 'pending' | 'approved' | 'rejected' | null
  is_host: boolean
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomId = params?.id as string

  // 방 정보 로드
  const loadRoom = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/rooms/${roomId}`)
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 정보를 불러올 수 없습니다')
      }

      setRoom(result.data.room)
    } catch (err: any) {
      console.error('Room load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 참가 신청
  const handleJoinRequest = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      router.push('/auth/login')
      return
    }

    try {
      setRequesting(true)
      
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '참가 신청에 실패했습니다')
      }

      toast.success('참가 신청이 완료되었습니다!')
      // 방 정보 새로고침
      await loadRoom()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRequesting(false)
    }
  }

  // 신청 취소
  const handleCancelRequest = async () => {
    if (!room?.user_request_status) return

    try {
      setRequesting(true)
      
      const response = await fetch(`/api/requests/${roomId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '신청 취소에 실패했습니다')
      }

      toast.success('참가 신청이 취소되었습니다')
      await loadRoom()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRequesting(false)
    }
  }

  // 방 수정 페이지로 이동
  const handleEditRoom = () => {
    router.push(`/room/${roomId}/edit`)
  }

  // 지도에서 위치 보기
  const handleViewOnMap = () => {
    router.push(`/map?room=${roomId}`)
  }

  useEffect(() => {
    if (roomId) {
      loadRoom()
    }
  }, [roomId])

  // 인증 체크
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">방 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">방을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '존재하지 않는 방이거나 권한이 없습니다.'}</p>
          <Button onClick={() => router.push('/map')} variant="outline">
            지도로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const categoryDisplay = getCategoryDisplay(room.category)
  const isStartingSoon = new Date(room.start_at).getTime() - new Date().getTime() < 30 * 60 * 1000 // 30분 이내
  const isPast = new Date(room.start_at) < new Date()
  const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              ← 뒤로
            </Button>
            <h1 className="text-xl font-bold text-gray-900">모임 상세</h1>
          </div>
          {room.is_host && (
            <Button
              onClick={handleEditRoom}
              size="sm"
              variant="outline"
            >
              ✏️ 수정
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Room Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          {/* Category & Status Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: categoryDisplay.color }}
            >
              {categoryDisplay.emoji} {categoryDisplay.label}
            </span>
            {isBoosted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ 부스트
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                종료된 모임
              </span>
            )}
            {isStartingSoon && !isPast && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🔥 곧 시작
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {room.title}
          </h2>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 장소 */}
            <div className="flex items-start">
              <span className="text-2xl mr-3">📍</span>
              <div>
                <div className="font-medium text-gray-900">모임 장소</div>
                <div className="text-gray-600">{room.place_text}</div>
                <button
                  onClick={handleViewOnMap}
                  className="text-primary text-sm hover:underline mt-1"
                >
                  지도에서 보기 →
                </button>
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-start">
              <span className="text-2xl mr-3">🕐</span>
              <div>
                <div className="font-medium text-gray-900">시작 시간</div>
                <div className="text-gray-600">
                  {new Date(room.start_at).toLocaleDateString('ko-KR')}
                </div>
                <div className="text-gray-600">
                  {new Date(room.start_at).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            {/* 인원 */}
            <div className="flex items-start">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <div className="font-medium text-gray-900">참가 인원</div>
                <div className="text-gray-600">
                  현재 {room.participants_count}명 / 최대 {room.max_people}명
                </div>
              </div>
            </div>

            {/* 참가비 */}
            <div className="flex items-start">
              <span className="text-2xl mr-3">{room.fee > 0 ? '💰' : '🆓'}</span>
              <div>
                <div className="font-medium text-gray-900">참가비</div>
                <div className="text-gray-600">
                  {room.fee > 0 ? `${room.fee.toLocaleString()}원` : '무료'}
                </div>
              </div>
            </div>
          </div>

          {/* 호스트 정보 */}
          <div className="border-t pt-6">
            <div className="flex items-center">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mr-4 shadow-lg">
                  {room.host.avatar_url ? (
                    <Image
                      src={room.host.avatar_url}
                      alt={room.host.nickname}
                      width={48}
                      height={48}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {room.host.nickname.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    호스트: {room.host.nickname}
                  </div>
                  <div className="text-sm text-gray-600">
                    {room.host.age_range} · 호스트
                  </div>
                </div>
              </div>
              {room.is_host && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  내가 만든 모임
                </span>
              )}
            </div>
          </div>

          {/* 설명 */}
          {room.description && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-3">📝 상세 설명</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {room.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!room.is_host && !isPast && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center">
              {!user ? (
                <div className="space-y-4">
                  <p className="text-gray-600">참가하려면 로그인이 필요합니다</p>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => router.push('/auth/login')}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      로그인
                    </Button>
                    <Button
                      onClick={() => router.push('/auth/signup')}
                      variant="outline"
                      className="flex-1"
                    >
                      회원가입
                    </Button>
                  </div>
                </div>
              ) : room.user_request_status === 'pending' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-1">⏳ 승인 대기 중</h3>
                    <p className="text-sm text-yellow-800">
                      참가 신청이 완료되었습니다. 호스트의 승인을 기다려주세요.
                    </p>
                  </div>
                  <Button
                    onClick={handleCancelRequest}
                    disabled={requesting}
                    variant="outline"
                    className="w-full"
                  >
                    {requesting ? '취소 중...' : '신청 취소'}
                  </Button>
                </div>
              ) : room.user_request_status === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-1">✅ 참가 승인됨</h3>
                  <p className="text-sm text-green-800">
                    모임 참가가 승인되었습니다! 시간에 맞춰 참석해주세요.
                  </p>
                </div>
              ) : room.user_request_status === 'rejected' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-1">❌ 참가 거절됨</h3>
                  <p className="text-sm text-red-800">
                    죄송합니다. 이번 모임은 참가하실 수 없습니다.
                  </p>
                </div>
              ) : room.participants_count >= room.max_people ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">😔 모집 마감</h3>
                    <p className="text-sm text-gray-600">
                      이미 모든 자리가 채워졌습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleJoinRequest}
                  disabled={requesting}
                  className="w-full bg-primary hover:bg-primary/90 py-4 text-lg font-medium"
                >
                  {requesting ? '신청 중...' : '🙋‍♂️ 참가 신청하기'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 관련 안내 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            문의사항이 있으시면 호스트에게 직접 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}