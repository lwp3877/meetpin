/* src/app/rooms/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { brandMessages, getCategoryDisplay } from '@/lib/brand'
import toast from 'react-hot-toast'

interface Room {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  place_text: string
  start_at: string
  max_people: number
  fee: number
  boost_until?: string
  created_at: string
  participants_count: number
  pending_requests_count: number
  status: 'active' | 'completed' | 'cancelled'
}

export default function MyRoomsPage() {
  const { user, loading: authLoading } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const router = useRouter()

  // 내 방 목록 로드
  const loadMyRooms = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/rooms/my')
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 목록을 불러올 수 없습니다')
      }

      setRooms(result.data.rooms || [])
    } catch (err: any) {
      console.error('My rooms load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 방 상태 변경 (취소/재활성화)
  const toggleRoomStatus = async (roomId: string, newStatus: 'active' | 'cancelled') => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '상태 변경에 실패했습니다')
      }

      toast.success(newStatus === 'cancelled' ? '모임이 취소되었습니다' : '모임이 재활성화되었습니다')
      await loadMyRooms()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // 방 삭제
  const deleteRoom = async (roomId: string, title: string) => {
    if (!window.confirm(`정말로 "${title}" 모임을 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '삭제에 실패했습니다')
      }

      toast.success('모임이 삭제되었습니다')
      await loadMyRooms()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadMyRooms()
    }
  }, [user, authLoading])

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // 필터링된 방 목록
  const filteredRooms = rooms.filter(room => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return room.status === 'active'
    if (activeTab === 'completed') return room.status === 'completed' || room.status === 'cancelled'
    return true
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">내 모임을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

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
              <h1 className="text-xl font-bold text-gray-900">내가 만든 모임</h1>
            </div>
            <Button
              onClick={() => router.push('/room/new')}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              ➕ 새 모임
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'active', label: '활성 모임', count: rooms.filter(r => r.status === 'active').length },
              { key: 'completed', label: '완료/취소', count: rooms.filter(r => r.status !== 'active').length },
              { key: 'all', label: '전체', count: rooms.length },
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

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadMyRooms} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'active' ? '활성 모임이 없습니다' : 
               activeTab === 'completed' ? '완료된 모임이 없습니다' : 
               '만든 모임이 없습니다'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' ? '새로운 모임을 만들어 사람들을 만나보세요!' :
               activeTab === 'completed' ? '아직 완료된 모임이 없습니다.' :
               '첫 번째 모임을 만들어보세요!'}
            </p>
            <Button
              onClick={() => router.push('/room/new')}
              className="bg-primary hover:bg-primary/90"
            >
              ➕ 모임 만들기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRooms.map((room) => {
              const categoryDisplay = getCategoryDisplay(room.category)
              const isUpcoming = new Date(room.start_at) > new Date()
              const isStartingSoon = new Date(room.start_at).getTime() - new Date().getTime() < 30 * 60 * 1000
              const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()
              const hasPendingRequests = room.pending_requests_count > 0

              return (
                <div key={room.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-start justify-between">
                    {/* Room Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: categoryDisplay.color }}
                        >
                          {categoryDisplay.emoji} {categoryDisplay.label}
                        </span>
                        
                        {room.status === 'cancelled' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            취소됨
                          </span>
                        )}
                        
                        {room.status === 'completed' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            완료
                          </span>
                        )}

                        {isBoosted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ 부스트
                          </span>
                        )}

                        {isStartingSoon && isUpcoming && room.status === 'active' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔥 곧 시작
                          </span>
                        )}

                        {hasPendingRequests && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📮 {room.pending_requests_count}개 신청
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
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
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">{room.fee > 0 ? '💰' : '🆓'}</span>
                          {room.fee > 0 ? `${room.fee.toLocaleString()}원` : '무료'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => router.push(`/room/${room.id}`)}
                        size="sm"
                        variant="outline"
                      >
                        상세보기
                      </Button>
                      
                      {room.status === 'active' && (
                        <>
                          <Button
                            onClick={() => router.push(`/room/${room.id}/edit`)}
                            size="sm"
                            variant="outline"
                          >
                            수정
                          </Button>
                          
                          {hasPendingRequests && (
                            <Button
                              onClick={() => router.push(`/room/${room.id}/requests`)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              신청 관리
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => toggleRoomStatus(room.id, 'cancelled')}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            취소
                          </Button>
                        </>
                      )}
                      
                      {room.status === 'cancelled' && (
                        <Button
                          onClick={() => toggleRoomStatus(room.id, 'active')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          재활성화
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => deleteRoom(room.id, room.title)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => router.push('/room/new')}
          className="bg-primary hover:bg-primary/90 rounded-full w-14 h-14 shadow-lg"
          title="새 모임 만들기"
        >
          ➕
        </Button>
      </div>
    </div>
  )
}