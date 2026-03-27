/* src/app/requests/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getCategoryDisplay } from '@/lib/config/brand'
import Clock from 'lucide-react/dist/esm/icons/clock'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import User from 'lucide-react/dist/esm/icons/user'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import XCircle from 'lucide-react/dist/esm/icons/x-circle'
import Heart from 'lucide-react/dist/esm/icons/heart'
import Search from 'lucide-react/dist/esm/icons/search'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

interface Request {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
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

interface MatchProfile {
  nickname: string
  avatar_url?: string
  age_range: string
}

interface Match {
  id: string
  room_id: string
  host_uid: string
  guest_uid: string
  created_at: string
  rooms: {
    id: string
    title: string
    category: 'drink' | 'exercise' | 'other'
    place_text: string
    start_at: string
  }
  host_profile: MatchProfile
  guest_profile: MatchProfile
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
    } catch (err: unknown) {
      logger.error('My requests load error:', { error: err instanceof Error ? err.message : String(err) })
      setError((err as Error).message)
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
    } catch (err: unknown) {
      logger.error('My matches load error:', { error: err instanceof Error ? err.message : String(err) })
      setError((err as Error).message)
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
    } catch (err: unknown) {
      toast.error((err as Error).message)
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-600">요청함을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

  const pendingRequests = myRequests.filter(r => r.status === 'pending')
  const acceptedRequests = myRequests.filter(r => r.status === 'accepted')
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
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

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'requests' | 'matches')}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="requests" className="relative">
              참가 요청 ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="relative">
              매치된 모임 ({myMatches.length})
              {myMatches.some(m => m.unread_count > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                  {myMatches.reduce((sum, m) => sum + m.unread_count, 0)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                  <div className="text-sm text-gray-600">대기 중</div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{acceptedRequests.length}</div>
                  <div className="text-sm text-gray-600">승인됨</div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
                  <div className="text-sm text-gray-600">거절됨</div>
                </div>
              </div>
            </div>

            {/* Requests List */}
            {myRequests.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-2xl">📤</span>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">보낸 요청이 없습니다</h3>
                <p className="mb-6 text-gray-600">관심있는 모임에 참가 신청을 보내보세요!</p>
                <Button
                  onClick={() => router.push('/map')}
                  className="bg-primary hover:bg-primary/90"
                >
                  모임 찾으러 가기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(request => {
                  const categoryDisplay = getCategoryDisplay(request.room.category)
                  const isUpcoming = new Date(request.room.start_at) > new Date()

                  return (
                    <Card
                      key={request.id}
                      className="border-white/20 bg-white/95 shadow-xl backdrop-blur-lg transition-all duration-200 hover:shadow-2xl dark:border-slate-700/30 dark:bg-slate-900/95"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-4 flex items-center gap-3">
                              <Badge
                                className="border-0 text-white"
                                style={{ backgroundColor: categoryDisplay.color }}
                              >
                                {categoryDisplay.emoji} {categoryDisplay.label}
                              </Badge>

                              <Badge
                                variant={
                                  request.status === 'pending'
                                    ? 'secondary'
                                    : request.status === 'accepted'
                                      ? 'default'
                                      : 'destructive'
                                }
                                className={
                                  request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                    : request.status === 'accepted'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                }
                              >
                                {request.status === 'pending' ? (
                                  <>
                                    <Clock className="mr-1 h-3 w-3" /> 대기 중
                                  </>
                                ) : request.status === 'accepted' ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" /> 승인됨
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3 w-3" /> 거절됨
                                  </>
                                )}
                              </Badge>
                            </div>

                            <CardTitle className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                              {request.room.title}
                            </CardTitle>

                            <div className="mb-4 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-300">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{request.room.place_text}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(request.room.start_at).toLocaleDateString('ko-KR')}{' '}
                                  {new Date(request.room.start_at).toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>호스트: {request.room.host.nickname}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>

                            {request.message && (
                              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <span className="font-medium">신청 메시지:</span>{' '}
                                  {request.message}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="ml-6 flex flex-col gap-2">
                            <Button
                              onClick={() => router.push(`/room/${request.room.id}`)}
                              size="sm"
                              variant="outline"
                              className="min-w-[100px]"
                            >
                              모임 보기
                            </Button>

                            {request.status === 'accepted' && request.match_id && (
                              <Button
                                onClick={() => openChat(request.match_id!)}
                                size="sm"
                                className="min-w-[100px] bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700"
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                채팅하기
                              </Button>
                            )}

                            {request.status === 'pending' && isUpcoming && (
                              <Button
                                onClick={() => cancelRequest(request.id)}
                                size="sm"
                                variant="outline"
                                className="min-w-[100px] border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                요청 취소
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {myMatches.length === 0 ? (
              <Card className="border-white/20 bg-white/95 shadow-2xl backdrop-blur-lg dark:border-slate-700/30 dark:bg-slate-900/95">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-200 shadow-lg dark:from-pink-900/30 dark:to-rose-900/30">
                    <Heart className="h-8 w-8 text-pink-500 dark:text-pink-400" />
                  </div>
                  <CardTitle className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    매치된 모임이 없습니다
                  </CardTitle>
                  <p className="mb-8 text-gray-600 dark:text-gray-300">
                    모임에 참가 신청을 보내고 승인받으면 여기에 표시됩니다!
                  </p>
                  <Button
                    onClick={() => router.push('/map')}
                    className="from-primary hover:from-primary/90 bg-gradient-to-r to-emerald-600 text-white shadow-lg hover:to-emerald-600/90"
                    size="lg"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    모임 찾으러 가기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myMatches.map(match => {
                  const categoryDisplay = getCategoryDisplay(match.rooms?.category)
                  // 나와 다른 쪽 프로필 계산
                  const otherUser = match.host_uid === user?.id ? match.guest_profile : match.host_profile

                  return (
                    <Card
                      key={match.id}
                      className="border-white/20 bg-white/95 shadow-xl backdrop-blur-lg transition-all duration-200 hover:shadow-2xl dark:border-slate-700/30 dark:bg-slate-900/95"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-4 flex items-center gap-3">
                              <Badge
                                className="border-0 text-white"
                                style={{ backgroundColor: categoryDisplay.color }}
                              >
                                {categoryDisplay.emoji} {categoryDisplay.label}
                              </Badge>

                              <Badge className="border-0 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200">
                                <Heart className="mr-1 h-3 w-3" />
                                매치 성공
                              </Badge>

                              {match.unread_count > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                >
                                  <MessageCircle className="mr-1 h-3 w-3" />
                                  {match.unread_count}개 안읽음
                                </Badge>
                              )}
                            </div>

                            <CardTitle className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                              {match.rooms?.title}
                            </CardTitle>

                            <div className="mb-4 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-300">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{match.rooms?.place_text}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {match.rooms?.start_at && new Date(match.rooms.start_at).toLocaleDateString('ko-KR')}{' '}
                                  {match.rooms?.start_at && new Date(match.rooms.start_at).toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={otherUser?.avatar_url}
                                    alt={otherUser?.nickname}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {otherUser?.nickname?.charAt(0) ?? '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {otherUser?.nickname ?? '알 수 없음'} ({otherUser?.age_range ?? '-'})
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4" />
                                <span>
                                  매치일: {new Date(match.created_at).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>

                            {match.last_message && (
                              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700/30 dark:bg-slate-800/50">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">최근 메시지:</span>{' '}
                                  {match.last_message.text}
                                </p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(match.last_message.created_at).toLocaleDateString(
                                    'ko-KR'
                                  )}{' '}
                                  {new Date(match.last_message.created_at).toLocaleTimeString(
                                    'ko-KR',
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="ml-6 flex flex-col gap-2">
                            <Button
                              onClick={() => openChat(match.id)}
                              size="sm"
                              className="from-primary hover:from-primary/90 min-w-[100px] bg-gradient-to-r to-emerald-600 text-white shadow-lg hover:to-emerald-600/90"
                            >
                              <MessageCircle className="mr-1 h-4 w-4" />
                              채팅하기
                            </Button>

                            <Button
                              onClick={() => router.push(`/room/${match.rooms?.id}`)}
                              size="sm"
                              variant="outline"
                              className="min-w-[100px]"
                            >
                              모임 보기
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
