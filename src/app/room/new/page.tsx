/* src/app/room/new/page.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RoomForm from '@/components/room/RoomForm'
import PageTransition, { CardAnimation } from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { ButtonPresets } from '@/components/ui/EnhancedButton'
import { logger } from '@/lib/observability/logger'

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

export default function NewRoomPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: RoomFormData) => {
    const loadingToastId = Toast.loading('모임을 생성하는 중...')

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 생성에 실패했습니다')
      }

      Toast.dismiss(loadingToastId)
      Toast.success('🎉 새로운 모임이 생성되었습니다!')

      // 생성된 방으로 이동
      router.push(`/room/${result.data.id}`)
    } catch (err: any) {
      logger.error('Room creation error:', { error: err instanceof Error ? err.message : String(err) })
      Toast.dismiss(loadingToastId)
      Toast.error(err.message || '모임 생성 중 오류가 발생했습니다')
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <PageTransition type="slide">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <ButtonPresets.BackButton onClick={() => router.back()} />
              <h1 className="text-primary text-xl font-bold">➕ 새 모임 만들기</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* 안내 메시지 */}
          <CardAnimation delay={0} className="mb-8">
            <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50 p-8 shadow-xl backdrop-blur-sm dark:border-emerald-800/50 dark:from-gray-900 dark:to-emerald-950">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <span className="animate-bounce text-3xl">🎯</span>
                </div>
                <h2 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-black text-gray-900 text-transparent dark:text-gray-100">
                  어떤 모임을 만들까요?
                </h2>
                <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  지도에서 핀을 찍고, 근처 사람들과 함께할{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    특별한 모임
                  </span>
                  을 만들어보세요!
                </p>
                <div className="flex items-center justify-center gap-6 pt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-500">✓</span>
                    무료로 시작
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">✓</span>
                    간편한 관리
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-purple-500">✓</span>
                    즉시 매칭
                  </div>
                </div>
              </div>
            </div>
          </CardAnimation>

          {/* 에러 메시지 */}
          {error && (
            <CardAnimation delay={100} className="mb-6">
              <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </CardAnimation>
          )}

          {/* 방 생성 폼 */}
          <CardAnimation delay={200} className="mb-8">
            <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
              <RoomForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </CardAnimation>

          {/* 추가 안내 */}
          <CardAnimation delay={300}>
            <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 p-8 shadow-lg backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                🎯 성공적인 모임 만들기 팁
              </h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">
                    1
                  </span>
                  <span>
                    <strong>구체적인 제목</strong>으로 모임의 성격을 명확히 해주세요
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">
                    2
                  </span>
                  <span>
                    <strong>접근하기 쉬운 장소</strong>를 선택하면 참가율이 높아져요
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">
                    3
                  </span>
                  <span>
                    <strong>적정한 시간</strong>(평일 저녁, 주말)에 모임을 계획해보세요
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">
                    4
                  </span>
                  <span>
                    <strong>상세 설명</strong>으로 모임 분위기와 준비물을 알려주세요
                  </span>
                </li>
              </ul>
            </div>
          </CardAnimation>
        </div>
      </div>
    </PageTransition>
  )
}
