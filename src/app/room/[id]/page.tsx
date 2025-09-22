/* src/app/room/[id]/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getCategoryDisplay } from '@/lib/config/brand'
import toast from 'react-hot-toast'
import { MapPin, Clock, Users, DollarSign, Star, Edit, ArrowLeft, Navigation, Heart, Share2 } from 'lucide-react'
import { RealtimeChatModal } from '@/components/ui/RealtimeChatModal'
import { BoostModal } from '@/components/ui/BoostModal'
import { ProfileModal } from '@/components/ui/ProfileModal'

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
    age_range: string
    avatar_url?: string
    intro?: string
  }
  participants_count: number
  is_host: boolean
}

export default function RoomDetailPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showHostMessageModal, setShowHostMessageModal] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const fetchRoom = useCallback(async () => {
    if (!params?.id || params.id === 'undefined' || params.id === 'null') {
      console.warn('Invalid room ID:', params?.id)
      toast.error('올바르지 않은 방 ID입니다')
      router.push('/map')
      return
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      toast.error('잘못된 방 ID 형식입니다')
      router.push('/map')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/rooms/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()

      if (result.ok && result.data?.room) {
        setRoom(result.data.room)
      } else {
        toast.error(result.message || '방 정보를 찾을 수 없습니다')
        router.push('/map')
      }
    } catch (error: any) {
      console.error('Error fetching room:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 연결을 확인해주세요')
      } else if (error.message.includes('404')) {
        toast.error('존재하지 않는 방입니다')
      } else {
        toast.error('방 정보를 불러오는 중 오류가 발생했습니다')
      }
      router.push('/map')
    } finally {
      setIsLoading(false)
    }
  }, [params?.id, router])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
    
    if (user) {
      fetchRoom()
    }
  }, [user, loading, fetchRoom, router])

  const handleJoinRequest = async () => {
    if (!room || !user) return
    setRequesting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id }),
      })

      const result = await response.json()
      if (result.ok) {
        toast.success('참가 신청이 완료되었습니다!')
      } else {
        toast.error(result.message || '참가 신청에 실패했습니다')
      }
    } catch {
      toast.error('참가 신청 중 오류가 발생했습니다')
    } finally {
      setRequesting(false)
    }
  }

  const handleViewOnMap = () => {
    router.push(`/map?room=${room?.id}&lat=${room?.lat}&lng=${room?.lng}`)
  }

  const handleEditRoom = () => {
    router.push(`/room/${room?.id}/edit`)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">모임 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return null
  }

  const categoryDisplay = getCategoryDisplay(room.category)
  const isPast = new Date(room.start_at) < new Date()
  const isStartingSoon = new Date(room.start_at) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && !isPast
  const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-600/50 flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">모임 상세</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Meet & Connect</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toast.success('좋아요!')}
              className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-600/50 flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: room.title,
                    text: `${room.title} - 밋핀에서 함께해요!`,
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('링크가 복사되었습니다!')
                }
              }}
              className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-600/50 flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {room.is_host && (
              <button
                onClick={handleEditRoom}
                className="ml-2 px-4 py-2 bg-gradient-to-r from-primary/90 to-emerald-500/90 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center"
              >
                <Edit className="w-4 h-4 mr-1.5" />
                수정하기
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Hero Image Card */}
        <div className="relative mb-8 h-64 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-emerald-600/70 to-blue-600/80" style={{ background: `linear-gradient(135deg, ${categoryDisplay.color}cc, ${categoryDisplay.color}99, #10B98199)` }}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">{categoryDisplay.emoji}</div>
                <h1 className="text-3xl font-black mb-2 drop-shadow-lg">{room.title}</h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {categoryDisplay.label}
                  </div>
                  {isBoosted && (
                    <div className="px-3 py-1 bg-yellow-400/90 text-yellow-900 backdrop-blur-sm rounded-full text-sm font-bold flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      부스트
                    </div>
                  )}
                  {isPast && (
                    <div className="px-3 py-1 bg-gray-600/80 text-white backdrop-blur-sm rounded-full text-sm font-medium">
                      종료된 모임
                    </div>
                  )}
                  {isStartingSoon && !isPast && (
                    <div className="px-3 py-1 bg-red-500/90 text-white backdrop-blur-sm rounded-full text-sm font-bold animate-pulse">
                      🔥 곧 시작
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Location Card */}
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">모임 장소</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{room.place_text}</p>
                  <button
                    onClick={handleViewOnMap}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    지도에서 보기
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Card */}
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">시작 시간</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                    {new Date(room.start_at).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                    {new Date(room.start_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {isStartingSoon && (
                    <div className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-full mt-2">
                      🔥 곧 시작합니다!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants & Fee Card */}
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">참가 인원</h3>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {room.participants_count} / {room.max_people}명
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">참가비용</h3>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {room.fee === 0 ? '무료' : `${room.fee.toLocaleString()}원`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Host Info Card */}
        <Card className="bg-gradient-to-br from-gray-50/90 to-white/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-xl border-0 shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 shadow-2xl ring-4 ring-white dark:ring-slate-600">
                    <AvatarImage
                      src={room.host.avatar_url}
                      alt={room.host.nickname}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-600 text-white font-black text-2xl">
                      {room.host.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-2xl mb-1">
                    {room.host.nickname}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-sm font-bold">
                      {room.host.age_range}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                      👑 호스트
                    </span>
                    {room.is_host && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                        내 모임
                      </span>
                    )}
                  </div>
                  {room.host.intro && (
                    <p className="text-gray-600 dark:text-gray-300 mt-3 text-base leading-relaxed">
                      {room.host.intro}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => setShowHostMessageModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                >
                  호스트에게 메시지
                </button>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  프로필 보기
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        {room.is_host ? (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="container mx-auto max-w-4xl">
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/room/${room.id}/requests`)}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                >
                  📝 신청 내역
                </button>
                <button
                  onClick={handleEditRoom}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                >
                  ⚙️ 수정
                </button>
                <button
                  onClick={() => setShowBoostModal(true)}
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                >
                  {isBoosted ? '🚀 부스트 중' : '⭐ 부스트'}
                </button>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3">
                호스트로서 모임을 관리할 수 있습니다
              </p>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="container mx-auto max-w-4xl">
              {isPast ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😅</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">종료된 모임</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    이 모임은 이미 종료되었습니다.
                  </p>
                </div>
              ) : room.participants_count >= room.max_people ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😔</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">모집 마감</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    이미 모든 자리가 채워졌습니다.
                  </p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleJoinRequest}
                    disabled={requesting}
                    className="w-full py-5 bg-gradient-to-r from-primary via-emerald-500 to-emerald-600 hover:from-primary/90 hover:via-emerald-500/90 hover:to-emerald-600/90 text-white font-black text-xl rounded-2xl shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {requesting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        신청 중...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="text-2xl mr-3">🙋‍♂️</span>
                        지금 바로 참가신청하기
                      </div>
                    )}
                  </button>
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3">
                    참가 신청 후 호스트 승인을 기다리세요
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Spacing for Fixed Button */}
        <div className="h-32"></div>
      </div>
      
      {/* Realtime Chat Modal */}
      {room && (
        <RealtimeChatModal
          isOpen={showHostMessageModal}
          onClose={() => setShowHostMessageModal(false)}
          hostName={room.host.nickname}
          hostAvatar={room.host.avatar_url}
          hostId={room.host.id}
          roomId={room.id}
        />
      )}
      
      {/* Boost Modal */}
      {room && (
        <BoostModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          roomId={room.id}
          roomTitle={room.title}
          onBoostSuccess={() => {
            setShowBoostModal(false)
            // 페이지 새로고침으로 부스트 상태 업데이트
            fetchRoom()
          }}
        />
      )}
      
      {/* Profile Modal */}
      {room && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={room.host.id}
        />
      )}
    </div>
  )
}