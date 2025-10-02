/* src/app/room/[id]/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getCategoryDisplay } from '@/lib/config/brand'
import toast from 'react-hot-toast'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Users from 'lucide-react/dist/esm/icons/users'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign'
import Star from 'lucide-react/dist/esm/icons/star'
import Edit from 'lucide-react/dist/esm/icons/edit'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left'
import Navigation from 'lucide-react/dist/esm/icons/navigation'
import Heart from 'lucide-react/dist/esm/icons/heart'
import Share2 from 'lucide-react/dist/esm/icons/share-2'
import dynamic from 'next/dynamic'

// 모달 컴포넌트들을 필요할 때만 로딩
const RealtimeChatModal = dynamic(
  () =>
    import('@/components/ui/RealtimeChatModal').then(mod => ({ default: mod.RealtimeChatModal })),
  {
    ssr: false,
    loading: () => null,
  }
)

const BoostModal = dynamic(
  () => import('@/components/ui/BoostModal').then(mod => ({ default: mod.BoostModal })),
  {
    ssr: false,
    loading: () => null,
  }
)

const ProfileModal = dynamic(
  () => import('@/components/ui/ProfileModal').then(mod => ({ default: mod.ProfileModal })),
  {
    ssr: false,
    loading: () => null,
  }
)

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
    if (!uuidRegex.test(Array.isArray(params.id) ? params.id[0] : params.id)) {
      toast.error('잘못된 방 ID 형식입니다')
      router.push('/map')
      return
    }

    const loadingToastId = toast.loading('모임 정보를 불러오는 중...', { duration: 10000 })

    try {
      setIsLoading(true)

      // AbortController로 타임아웃 처리
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`/api/rooms/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ROOM_NOT_FOUND')
        } else if (response.status === 403) {
          throw new Error('ROOM_ACCESS_DENIED')
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.ok && result.data?.room) {
        setRoom(result.data.room)
        toast.dismiss(loadingToastId)
        toast.success('모임 정보를 불러왔습니다')
      } else {
        throw new Error(result.message || 'INVALID_RESPONSE')
      }
    } catch (error: any) {
      console.error('Error fetching room:', error)
      toast.dismiss(loadingToastId)

      if (error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요')
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 연결을 확인해주세요. Wi-Fi 또는 모바일 데이터를 확인하세요')
      } else if (error.message === 'ROOM_NOT_FOUND') {
        toast.error('존재하지 않는 모임입니다')
      } else if (error.message === 'ROOM_ACCESS_DENIED') {
        toast.error('접근 권한이 없는 모임입니다')
      } else if (error.message === 'SERVER_ERROR') {
        toast.error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요')
      } else {
        toast.error('모임 정보를 불러오는 중 오류가 발생했습니다')
      }

      // 3초 후 자동으로 지도로 이동
      setTimeout(() => {
        router.push('/map')
      }, 3000)
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
    if (!room || !user) {
      toast.error('로그인이 필요합니다')
      return
    }

    if (requesting) return // 중복 요청 방지

    setRequesting(true)
    const loadingToastId = toast.loading('참가 신청하는 중...', { duration: 10000 })

    try {
      // AbortController로 타임아웃 처리
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      toast.dismiss(loadingToastId)

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('ALREADY_REQUESTED')
        } else if (response.status === 403) {
          throw new Error('ACCESS_DENIED')
        } else if (response.status === 400) {
          throw new Error('INVALID_REQUEST')
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      if (result.ok) {
        toast.success('🎉 참가 신청이 완료되었습니다!', {
          duration: 4000,
          icon: '✅',
        })
        // 선택적으로 방 정보 새로고침
        setTimeout(() => fetchRoom(), 1000)
      } else {
        throw new Error(result.message || 'UNKNOWN_ERROR')
      }
    } catch (error: any) {
      console.error('Join request error:', error)
      toast.dismiss(loadingToastId)

      if (error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요')
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 연결을 확인해주세요')
      } else if (error.message === 'ALREADY_REQUESTED') {
        toast.error('이미 참가 신청한 모임입니다')
      } else if (error.message === 'ACCESS_DENIED') {
        toast.error('이 모임에 참가할 권한이 없습니다')
      } else if (error.message === 'INVALID_REQUEST') {
        toast.error('잘못된 참가 신청입니다')
      } else if (error.message === 'SERVER_ERROR') {
        toast.error('서버 오류로 참가 신청에 실패했습니다. 잠시 후 다시 시도해주세요')
      } else {
        toast.error('참가 신청 중 오류가 발생했습니다')
      }
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="border-primary/30 border-t-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4"></div>
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
  const isStartingSoon =
    new Date(room.start_at) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && !isPast
  const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-gradient-to-r from-white/95 to-gray-50/95 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:from-slate-900/95 dark:to-slate-800/95">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-md dark:border-slate-600/50 dark:bg-slate-800/80 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">모임 상세</h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Meet & Connect</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('좋아요!')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-md dark:border-slate-600/50 dark:bg-slate-800/80 dark:hover:bg-slate-700"
            >
              <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: room.title,
                    text: `${room.title} - 밋핀에서 함께해요!`,
                    url: window.location.href,
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('링크가 복사되었습니다!')
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-md dark:border-slate-600/50 dark:bg-slate-800/80 dark:hover:bg-slate-700"
            >
              <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            {room.is_host && (
              <button
                onClick={handleEditRoom}
                className="from-primary/90 ml-2 flex items-center rounded-xl bg-gradient-to-r to-emerald-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <Edit className="mr-1.5 h-4 w-4" />
                수정하기
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Hero Image Card */}
        <div className="relative mb-8 h-64 overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="from-primary/80 absolute inset-0 bg-gradient-to-br via-emerald-600/70 to-blue-600/80"
            style={{
              background: `linear-gradient(135deg, ${categoryDisplay.color}cc, ${categoryDisplay.color}99, #10B98199)`,
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-4 text-6xl">{categoryDisplay.emoji}</div>
                <h1 className="mb-2 text-3xl font-black drop-shadow-lg">{room.title}</h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    {categoryDisplay.label}
                  </div>
                  {isBoosted && (
                    <div className="flex items-center rounded-full bg-yellow-400/90 px-3 py-1 text-sm font-bold text-yellow-900 backdrop-blur-sm">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      부스트
                    </div>
                  )}
                  {isPast && (
                    <div className="rounded-full bg-gray-600/80 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      종료된 모임
                    </div>
                  )}
                  {isStartingSoon && !isPast && (
                    <div className="animate-pulse rounded-full bg-red-500/90 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
                      🔥 곧 시작
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Location Card */}
          <Card className="hover:shadow-3xl border-0 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:bg-slate-900/90">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    모임 장소
                  </h3>
                  <p className="mb-3 leading-relaxed text-gray-600 dark:text-gray-300">
                    {room.place_text}
                  </p>
                  <button
                    onClick={handleViewOnMap}
                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    지도에서 보기
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Card */}
          <Card className="hover:shadow-3xl border-0 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:bg-slate-900/90">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    시작 시간
                  </h3>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {new Date(room.start_at).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {new Date(room.start_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {isStartingSoon && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      🔥 곧 시작합니다!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants & Fee Card */}
          <Card className="hover:shadow-3xl border-0 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:bg-slate-900/90">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">참가 인원</h3>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {room.participants_count} / {room.max_people}명
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">참가비용</h3>
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
        <Card className="mb-8 border-0 bg-gradient-to-br from-gray-50/90 to-white/90 shadow-2xl backdrop-blur-xl dark:from-slate-800/90 dark:to-slate-700/90">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 shadow-2xl ring-4 ring-white dark:ring-slate-600">
                    <AvatarImage
                      src={room.host.avatar_url}
                      alt={room.host.nickname}
                      className="object-cover"
                    />
                    <AvatarFallback className="from-primary bg-gradient-to-br to-emerald-600 text-2xl font-black text-white">
                      {room.host.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500 shadow-lg dark:border-slate-700">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-2xl font-black text-gray-900 dark:text-white">
                    {room.host.nickname}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-sm font-bold">
                      {room.host.age_range}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      👑 호스트
                    </span>
                    {room.is_host && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        내 모임
                      </span>
                    )}
                  </div>
                  {room.host.intro && (
                    <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {room.host.intro}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowHostMessageModal(true)}
                  className="from-primary rounded-xl bg-gradient-to-r to-emerald-600 px-6 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                >
                  호스트에게 메시지
                </button>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300"
                >
                  프로필 보기
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        {room.is_host ? (
          <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200/50 bg-gradient-to-t from-white via-white/95 to-transparent p-6 backdrop-blur-xl dark:border-slate-700/50 dark:from-slate-900 dark:via-slate-900/95">
            <div className="container mx-auto max-w-4xl">
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/room/${room.id}/requests`)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                >
                  📝 신청 내역
                </button>
                <button
                  onClick={handleEditRoom}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                >
                  ⚙️ 수정
                </button>
                <button
                  onClick={() => setShowBoostModal(true)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                >
                  {isBoosted ? '🚀 부스트 중' : '⭐ 부스트'}
                </button>
              </div>
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                호스트로서 모임을 관리할 수 있습니다
              </p>
            </div>
          </div>
        ) : (
          <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200/50 bg-gradient-to-t from-white via-white/95 to-transparent p-6 backdrop-blur-xl dark:border-slate-700/50 dark:from-slate-900 dark:via-slate-900/95">
            <div className="container mx-auto max-w-4xl">
              {isPast ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                    <span className="text-2xl">😅</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-200">
                    종료된 모임
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">이 모임은 이미 종료되었습니다.</p>
                </div>
              ) : room.participants_count >= room.max_people ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <span className="text-2xl">😔</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-200">
                    모집 마감
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">이미 모든 자리가 채워졌습니다.</p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleJoinRequest}
                    disabled={requesting}
                    className="from-primary hover:from-primary/90 w-full transform rounded-2xl bg-gradient-to-r via-emerald-500 to-emerald-600 py-5 text-xl font-black text-white shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:via-emerald-500/90 hover:to-emerald-600/90 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {requesting ? (
                      <div className="flex items-center justify-center">
                        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                        신청 중...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="mr-3 text-2xl">🙋‍♂️</span>
                        지금 바로 참가신청하기
                      </div>
                    )}
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
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
