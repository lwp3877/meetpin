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
import {
  Clock,
  MapPin,
  User,
  Calendar,
  MessageCircle,
  ClockIcon,
  CheckCircle,
  XCircle,
  Heart,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

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
  const acceptedRequests = myRequests.filter(r => r.status === 'accepted')
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


      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'requests' | 'matches')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="requests" className="relative">
              참가 요청 ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="relative">
              매치된 모임 ({myMatches.length})
              {myMatches.some(m => m.unread_count > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                  {myMatches.reduce((sum, m) => sum + m.unread_count, 0)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
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
                  <div className="text-2xl font-bold text-green-600">{acceptedRequests.length}</div>
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
                    <Card key={request.id} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <Badge
                                className="text-white border-0"
                                style={{ backgroundColor: categoryDisplay.color }}
                              >
                                {categoryDisplay.emoji} {categoryDisplay.label}
                              </Badge>
                              
                              <Badge 
                                variant={request.status === 'pending' ? 'secondary' : 
                                        request.status === 'accepted' ? 'default' : 'destructive'}
                                className={request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                                          request.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}
                              >
                                {request.status === 'pending' ? (
                                  <><ClockIcon className="w-3 h-3 mr-1" /> 대기 중</>
                                ) : request.status === 'accepted' ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" /> 승인됨</>
                                ) : (
                                  <><XCircle className="w-3 h-3 mr-1" /> 거절됨</>
                                )}
                              </Badge>
                            </div>

                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              {request.room.title}
                            </CardTitle>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{request.room.place_text}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(request.room.start_at).toLocaleDateString('ko-KR')} {new Date(request.room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>호스트: {request.room.host.nickname}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}</span>
                              </div>
                            </div>

                            {request.message && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <span className="font-medium">신청 메시지:</span> {request.message}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-6">
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
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg min-w-[100px]"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                채팅하기
                              </Button>
                            )}
                            
                            {request.status === 'pending' && isUpcoming && (
                              <Button
                                onClick={() => cancelRequest(request.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[100px]"
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
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-2xl">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-pink-500 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-3">매치된 모임이 없습니다</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">모임에 참가 신청을 보내고 승인받으면 여기에 표시됩니다!</p>
                  <Button
                    onClick={() => router.push('/map')}
                    className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg"
                    size="lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    모임 찾으러 가기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myMatches.map((match) => {
                      const categoryDisplay = getCategoryDisplay(match.room.category)
                      
                      return (
                        <Card key={match.id} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <Badge
                                    className="text-white border-0"
                                    style={{ backgroundColor: categoryDisplay.color }}
                                  >
                                    {categoryDisplay.emoji} {categoryDisplay.label}
                                  </Badge>
                                  
                                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200 border-0">
                                    <Heart className="w-3 h-3 mr-1" />
                                    매치 성공
                                  </Badge>

                                  {match.unread_count > 0 && (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      {match.unread_count}개 안읽음
                                    </Badge>
                                  )}
                                </div>

                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                  {match.room.title}
                                </CardTitle>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{match.room.place_text}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(match.room.start_at).toLocaleDateString('ko-KR')} {new Date(match.room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={match.other_user.avatar_url} alt={match.other_user.nickname} />
                                      <AvatarFallback className="text-xs">{match.other_user.nickname.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{match.other_user.nickname} ({match.other_user.age_range})</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Heart className="w-4 h-4" />
                                    <span>매치일: {new Date(match.created_at).toLocaleDateString('ko-KR')}</span>
                                  </div>
                                </div>

                                {match.last_message && (
                                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/30 rounded-xl">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      <span className="font-medium">최근 메시지:</span> {match.last_message.text}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      {new Date(match.last_message.created_at).toLocaleDateString('ko-KR')} {new Date(match.last_message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 ml-6">
                                <Button
                                  onClick={() => openChat(match.id)}
                                  size="sm"
                                  className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg min-w-[100px]"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  채팅하기
                                </Button>
                                
                                <Button
                                  onClick={() => router.push(`/room/${match.room.id}`)}
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