/* src/app/room/[id]/edit/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { brandMessages } from '@/lib/config/brand'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

// RoomForm을 필요할 때만 로딩
const RoomForm = dynamic(() => import('@/components/room/RoomForm'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
})

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
  is_host: boolean
  participants_count: number
}

type RoomFormData = {
  title: string
  category: 'drink' | 'exercise' | 'other'
  place_text: string
  lat: number
  lng: number
  start_at: string
  max_people: number
  fee: number
  visibility?: 'public' | 'private'
  description?: string
}

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomId = params?.id as string

  // 방 정보 로드
  const loadRoom = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/rooms/${roomId}`)
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 정보를 불러올 수 없습니다')
      }

      const roomData = result.data.room
      
      // 호스트 권한 확인
      if (!roomData.is_host) {
        throw new Error('방을 수정할 권한이 없습니다')
      }

      setRoom(roomData)
    } catch (err: any) {
      console.error('Room load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // 방 수정 제출
  const handleSubmit = async (data: RoomFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 수정에 실패했습니다')
      }

      toast.success('방 정보가 성공적으로 수정되었습니다!')
      router.push(`/room/${roomId}`)
      
    } catch (err: any) {
      console.error('Room update error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 방 삭제
  const handleDeleteRoom = async () => {
    if (!room) return

    const confirmed = window.confirm(
      `정말로 "${room.title}" 모임을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 참가자들에게도 알림이 전송됩니다.`
    )

    if (!confirmed) return

    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 삭제에 실패했습니다')
      }

      toast.success('모임이 성공적으로 삭제되었습니다')
      router.push('/map')
      
    } catch (err: any) {
      console.error('Room delete error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/room/${roomId}`)
  }

  useEffect(() => {
    if (roomId) {
      loadRoom()
    }
  }, [roomId, loadRoom])

  // 인증 체크
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? '인증 확인 중...' : '방 정보를 불러오는 중...'}
          </p>
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
          <p className="text-gray-600 mb-6">방을 수정하려면 로그인이 필요합니다.</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">방을 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '존재하지 않는 방이거나 권한이 없습니다.'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/map')} variant="outline">
              지도로 돌아가기
            </Button>
            <Button onClick={loadRoom}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 모임이 이미 시작된 경우
  const hasStarted = new Date(room.start_at) <= new Date()
  const hasParticipants = room.participants_count > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="mr-2"
            >
              ← 뒤로
            </Button>
            <h1 className="text-xl font-bold text-gray-900">모임 수정</h1>
          </div>
          <div className="text-sm text-gray-600">
            {brandMessages.appName}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Warning Messages */}
        {hasStarted && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-900">이미 시작된 모임입니다</h3>
                <p className="text-sm text-yellow-800">
                  시작된 모임의 정보를 변경하면 참가자들에게 알림이 전송됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasParticipants && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-xl mr-3">👥</span>
              <div>
                <h3 className="font-medium text-blue-900">참가자가 있는 모임입니다</h3>
                <p className="text-sm text-blue-800">
                  현재 {room.participants_count}명이 참가 중입니다. 주요 정보 변경 시 참가자들에게 알림이 전송됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            &quot;{room.title}&quot; 수정하기
          </h2>

          <RoomForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={{
              title: room.title,
              category: room.category,
              place_text: room.place_text,
              lat: room.lat,
              lng: room.lng,
              start_at: room.start_at,
              max_people: room.max_people,
              fee: room.fee,
              visibility: room.visibility,
              description: room.description,
            }}
            isSubmitting={isSubmitting}
            // 초기값 설정을 위해 key prop 사용
            key={`edit-${roomId}`}
          />

          {/* Delete Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">⚠️ 위험 구역</h3>
              <p className="text-sm text-red-800 mb-4">
                모임을 삭제하면 모든 데이터가 영구적으로 삭제되며, 참가자들에게 취소 알림이 전송됩니다.
                이 작업은 되돌릴 수 없습니다.
              </p>
              <Button
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isDeleting ? '삭제 중...' : '🗑️ 모임 삭제'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📝 수정 시 주의사항
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <span><strong>시간 변경</strong>은 참가자들에게 즉시 알림이 전송됩니다</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <span><strong>장소 변경</strong> 시 참가자들이 혼란스러워할 수 있으니 신중히 결정하세요</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <span><strong>최대 인원 축소</strong> 시 현재 참가자보다 작게 설정할 수 없습니다</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
              <span><strong>참가비 변경</strong>은 이미 결제한 참가자에게 별도 안내가 필요합니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}