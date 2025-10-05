/* src/app/rooms/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { getCategoryDisplay } from '@/lib/config/brand'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

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
    } catch (err: unknown) {
      logger.error('My rooms load error:', { error: err instanceof Error ? err.message : String(err) })
      setError((err as Error).message)
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

      toast.success(
        newStatus === 'cancelled' ? '모임이 취소되었습니다' : '모임이 재활성화되었습니다'
      )
      await loadMyRooms()
    } catch (err: unknown) {
      toast.error((err as Error).message)
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
    } catch (err: unknown) {
      toast.error((err as Error).message)
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
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
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
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
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              {
                key: 'active',
                label: '활성 모임',
                count: rooms.filter(r => r.status === 'active').length,
              },
              {
                key: 'completed',
                label: '완료/취소',
                count: rooms.filter(r => r.status !== 'active').length,
              },
              { key: 'all', label: '전체', count: rooms.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
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
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadMyRooms} variant="outline" size="sm" className="mt-2">
              다시 시도
            </Button>
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">🏠</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {activeTab === 'active'
                ? '활성 모임이 없습니다'
                : activeTab === 'completed'
                  ? '완료된 모임이 없습니다'
                  : '만든 모임이 없습니다'}
            </h3>
            <p className="mb-6 text-gray-600">
              {activeTab === 'active'
                ? '새로운 모임을 만들어 사람들을 만나보세요!'
                : activeTab === 'completed'
                  ? '아직 완료된 모임이 없습니다.'
                  : '첫 번째 모임을 만들어보세요!'}
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
            {filteredRooms.map(room => {
              const categoryDisplay = getCategoryDisplay(room.category)
              const isUpcoming = new Date(room.start_at) > new Date()
              const isStartingSoon =
                new Date(room.start_at).getTime() - new Date().getTime() < 30 * 60 * 1000
              const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()
              const hasPendingRequests = room.pending_requests_count > 0

              return (
                <div
                  key={room.id}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    {/* Room Info */}
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white"
                          style={{ backgroundColor: categoryDisplay.color }}
                        >
                          {categoryDisplay.emoji} {categoryDisplay.label}
                        </span>

                        {room.status === 'cancelled' && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            취소됨
                          </span>
                        )}

                        {room.status === 'completed' && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            완료
                          </span>
                        )}

                        {isBoosted && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            ⭐ 부스트
                          </span>
                        )}

                        {isStartingSoon && isUpcoming && room.status === 'active' && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            🔥 곧 시작
                          </span>
                        )}

                        {hasPendingRequests && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            📮 {room.pending_requests_count}개 신청
                          </span>
                        )}
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{room.title}</h3>

                      <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {room.place_text}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">🕐</span>
                          {new Date(room.start_at).toLocaleDateString('ko-KR')}{' '}
                          {new Date(room.start_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
                    <div className="ml-4 flex flex-col gap-2">
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
                              className="bg-blue-600 text-white hover:bg-blue-700"
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
                          className="bg-green-600 text-white hover:bg-green-700"
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
      <div className="fixed right-6 bottom-6">
        <Button
          onClick={() => router.push('/room/new')}
          className="bg-primary hover:bg-primary/90 h-14 w-14 rounded-full shadow-lg"
          title="새 모임 만들기"
        >
          ➕
        </Button>
      </div>
    </div>
  )
}
