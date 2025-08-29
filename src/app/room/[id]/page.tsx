/* src/app/room/[id]/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getCategoryDisplay } from '@/lib/brand'
import { isFeatureEnabled } from '@/lib/features'
import toast from 'react-hot-toast'
import { MapPin, Clock, Users, DollarSign, Star, Edit, ArrowLeft, Navigation } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-700/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2 hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              뒤로
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">모임 상세</h1>
          </div>
          {room.is_host && (
            <Button
              onClick={handleEditRoom}
              size="sm"
              variant="outline"
              className="border-primary/20 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
            >
              <Edit className="w-4 h-4 mr-1" />
              수정
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Room Info Card */}
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-2xl mb-6">
          <CardHeader className="pb-6">
            {/* Category & Status Badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge
                className="text-white border-0"
                style={{ backgroundColor: categoryDisplay.color }}
              >
                {categoryDisplay.emoji} {categoryDisplay.label}
              </Badge>
              {isBoosted && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                  <Star className="w-3 h-3 mr-1" />
                  부스트
                </Badge>
              )}
              {isPast && (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                  종료된 모임
                </Badge>
              )}
              {isStartingSoon && !isPast && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  🔥 곧 시작
                </Badge>
              )}
            </div>

            {/* Title */}
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {room.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 장소 */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">모임 장소</div>
                  <div className="text-gray-600 dark:text-gray-300 mb-2">{room.place_text}</div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleViewOnMap}
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    지도에서 보기
                  </Button>
                </div>
              </div>

              {/* 시간 */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">시작 시간</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {new Date(room.start_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {new Date(room.start_at).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              {/* 인원 */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">참가 인원</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    현재 {room.participants_count}명 / 최대 {room.max_people}명
                  </div>
                </div>
              </div>

              {/* 참가비 */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">참가비</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {room.fee > 0 ? `${room.fee.toLocaleString()}원` : '무료'}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 호스트 정보 */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="w-14 h-14 mr-4 shadow-lg ring-2 ring-white dark:ring-slate-700">
                    <AvatarImage
                      src={room.host.avatar_url}
                      alt={room.host.nickname}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-600 text-white font-bold text-lg">
                      {room.host.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {room.host.nickname}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      {room.host.age_range} · 호스트
                    </div>
                  </div>
                </div>
                {room.is_host && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    내가 만든 모임
                  </Badge>
                )}
              </div>
            </div>

            {/* 설명 */}
            {room.description && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    📝 상세 설명
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!room.is_host && !isPast && (
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-2xl">
            <CardContent className="pt-6">
              <div className="text-center">
                {!user ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">참가하려면 로그인이 필요합니다</p>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => router.push('/auth/login')}
                          className="flex-1 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg"
                          size="lg"
                        >
                          로그인
                        </Button>
                        <Button
                          onClick={() => router.push('/auth/signup')}
                          variant="outline"
                          className="flex-1 border-primary/20 hover:bg-primary/5 dark:hover:bg-slate-800"
                          size="lg"
                        >
                          회원가입
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : room.user_request_status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-2xl p-6">
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center justify-center">
                        <Clock className="w-5 h-5 mr-2" />
                        승인 대기 중
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        참가 신청이 완료되었습니다. 호스트의 승인을 기다려주세요.
                      </p>
                    </div>
                    <Button
                      onClick={handleCancelRequest}
                      disabled={requesting}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {requesting ? '취소 중...' : '신청 취소'}
                    </Button>
                  </div>
                ) : room.user_request_status === 'approved' ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 rounded-2xl p-6">
                    <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center justify-center">
                      ✅ 참가 승인됨
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      모임 참가가 승인되었습니다! 시간에 맞춰 참석해주세요.
                    </p>
                  </div>
                ) : room.user_request_status === 'rejected' ? (
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-6">
                    <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">❌ 참가 거절됨</h3>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      죄송합니다. 이번 모임은 참가하실 수 없습니다.
                    </p>
                  </div>
                ) : room.participants_count >= room.max_people ? (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-700/50 border border-gray-200 dark:border-slate-600/30 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">😔 모집 마감</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      이미 모든 자리가 채워졌습니다.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinRequest}
                    disabled={requesting}
                    className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    size="lg"
                  >
                    {requesting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        신청 중...
                      </div>
                    ) : (
                      <div className="flex items-center text-lg font-medium">
                        🙋‍♂️ 참가 신청하기
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 관련 안내 */}
        <div className="mt-8 text-center">
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur border-white/20 dark:border-slate-700/30">
            <CardContent className="pt-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                문의사항이 있으시면 호스트에게 직접 연락해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}