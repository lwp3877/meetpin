/* src/components/RoomForm.tsx */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { brandColors, categoryLabels, categoryEmojis } from '@/lib/brand'
import LocationPicker from '@/components/LocationPicker'

// 방 생성 스키마 (클라이언트용)
const roomFormSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상 입력해주세요').max(50, '제목은 50자를 초과할 수 없습니다'),
  category: z.enum(['drink', 'exercise', 'other'], {
    message: '카테고리를 선택해주세요',
  }),
  place_text: z.string().min(5, '장소는 5자 이상 입력해주세요').max(100, '장소는 100자를 초과할 수 없습니다'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  start_at: z.string().min(1, '시작 시간을 선택해주세요'),
  max_people: z.number().min(2, '최소 2명 이상이어야 합니다').max(20, '최대 20명까지 가능합니다'),
  fee: z.number().min(0, '참가비는 0원 이상이어야 합니다').max(100000, '참가비는 10만원을 초과할 수 없습니다'),
  visibility: z.enum(['public', 'private']).optional(),
  description: z.string().max(500, '상세 설명은 500자를 초과할 수 없습니다').optional(),
})

type RoomFormData = z.infer<typeof roomFormSchema>

interface RoomFormProps {
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel?: () => void
  defaultLocation?: { lat: number; lng: number; place_text: string }
  initialData?: Partial<RoomFormData>
  isSubmitting?: boolean
  className?: string
}

export default function RoomForm({
  onSubmit,
  onCancel,
  defaultLocation,
  initialData,
  isSubmitting = false,
  className = '',
}: RoomFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    place_text: string
  } | null>(
    defaultLocation || 
    (initialData && initialData.lat && initialData.lng && initialData.place_text ? {
      lat: initialData.lat,
      lng: initialData.lng,
      place_text: initialData.place_text
    } : null)
  )
  
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      category: initialData?.category || 'drink',
      max_people: initialData?.max_people || 4,
      fee: initialData?.fee || 0,
      visibility: initialData?.visibility || 'public',
      title: initialData?.title || '',
      description: initialData?.description || '',
      start_at: initialData?.start_at || '',
      ...(defaultLocation && {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        place_text: defaultLocation.place_text,
      }),
      ...(initialData && {
        lat: initialData.lat,
        lng: initialData.lng,
        place_text: initialData.place_text,
      }),
    },
  })

  const selectedCategory = watch('category')
  const maxPeople = watch('max_people')
  const fee = watch('fee')

  // 최소 시작 시간 계산 (30분 후)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM 형식
  }

  // 위치 선택 핸들러
  const handleLocationSelect = (location: { lat: number; lng: number; place_text: string }) => {
    setSelectedLocation(location)
    setValue('lat', location.lat)
    setValue('lng', location.lng)
    setValue('place_text', location.place_text)
    setShowLocationPicker(false)
  }

  const openLocationPicker = () => {
    setShowLocationPicker(true)
  }

  const onFormSubmit = async (data: RoomFormData) => {
    if (!selectedLocation) {
      alert('모임 장소를 선택해주세요.')
      return
    }

    // 시작 시간 검증
    const startTime = new Date(data.start_at)
    const now = new Date()
    const minStartTime = new Date(now.getTime() + 30 * 60 * 1000)

    if (startTime < minStartTime) {
      alert('모임 시작 시간은 최소 30분 후여야 합니다.')
      return
    }

    await onSubmit({
      ...data,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      place_text: selectedLocation.place_text,
    })
  }

  // LocationPicker 모드일 때
  if (showLocationPicker) {
    return (
      <div className={className}>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowLocationPicker(false)}
          initialLocation={selectedLocation || undefined}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`space-y-6 ${className}`}>
      {/* 모임 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          모임 제목 *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="예: 강남에서 맥주 한 잔 하실 분!"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          모임 카테고리 *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['drink', 'exercise', 'other'] as const).map((category) => {
            const isSelected = selectedCategory === category
            const categoryInfo = categoryLabels[category]
            const emoji = categoryEmojis[category]
            
            return (
              <label
                key={category}
                className={`relative cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  {...register('category')}
                  type="radio"
                  value={category}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className={`font-medium text-sm ${
                    isSelected ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {categoryInfo}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* 모임 장소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          모임 장소 *
        </label>
        {selectedLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">✅ 선택된 장소</h4>
                <p className="text-sm text-green-800">{selectedLocation.place_text}</p>
                <p className="text-xs text-green-700 mt-1">
                  위도: {selectedLocation.lat.toFixed(6)}, 경도: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openLocationPicker}
                disabled={isSubmitting}
              >
                변경
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={openLocationPicker}
            className="w-full py-8 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5"
            disabled={isSubmitting}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📍</div>
              <div className="font-medium text-gray-900 mb-1">지도에서 장소 선택</div>
              <div className="text-sm text-gray-500">클릭하여 모임 장소를 선택해주세요</div>
            </div>
          </Button>
        )}
        {errors.place_text && (
          <p className="mt-1 text-sm text-red-600">{errors.place_text.message}</p>
        )}
      </div>

      {/* 시작 시간 */}
      <div>
        <label htmlFor="start_at" className="block text-sm font-medium text-gray-700 mb-2">
          시작 시간 *
        </label>
        <input
          {...register('start_at')}
          type="datetime-local"
          id="start_at"
          min={getMinDateTime()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">최소 30분 후부터 설정 가능합니다</p>
        {errors.start_at && (
          <p className="mt-1 text-sm text-red-600">{errors.start_at.message}</p>
        )}
      </div>

      {/* 최대 인원 */}
      <div>
        <label htmlFor="max_people" className="block text-sm font-medium text-gray-700 mb-2">
          최대 인원: {maxPeople}명
        </label>
        <div className="flex items-center space-x-4">
          <input
            {...register('max_people', { valueAsNumber: true })}
            type="range"
            id="max_people"
            min="2"
            max="20"
            step="1"
            className="flex-1"
            disabled={isSubmitting}
          />
          <div className="text-sm text-gray-600 min-w-[60px]">2-20명</div>
        </div>
        {errors.max_people && (
          <p className="mt-1 text-sm text-red-600">{errors.max_people.message}</p>
        )}
      </div>

      {/* 참가비 */}
      <div>
        <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">
          참가비: {fee.toLocaleString()}원
        </label>
        <div className="flex items-center space-x-4">
          <input
            {...register('fee', { valueAsNumber: true })}
            type="range"
            id="fee"
            min="0"
            max="100000"
            step="1000"
            className="flex-1"
            disabled={isSubmitting}
          />
          <div className="text-sm text-gray-600 min-w-[100px]">0-10만원</div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {fee === 0 ? '🆓 무료 모임' : `💰 ${fee.toLocaleString()}원`}
        </p>
        {errors.fee && (
          <p className="mt-1 text-sm text-red-600">{errors.fee.message}</p>
        )}
      </div>

      {/* 상세 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          상세 설명
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="모임에 대한 자세한 설명을 적어주세요. 어떤 분위기인지, 무엇을 준비해야 하는지 등을 알려주면 좋아요!"
          disabled={isSubmitting}
        />
        <div className="mt-1 flex justify-between">
          <div></div>
          <div className="text-xs text-gray-500">
            {watch('description')?.length || 0}/500자
          </div>
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* 공개 설정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공개 설정
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              {...register('visibility')}
              type="radio"
              value="public"
              className="mr-3 text-primary focus:ring-primary"
              disabled={isSubmitting}
            />
            <div>
              <div className="font-medium text-gray-900">🌍 공개</div>
              <div className="text-sm text-gray-600">모든 사람이 볼 수 있어요</div>
            </div>
          </label>
          <label className="flex items-center">
            <input
              {...register('visibility')}
              type="radio"
              value="private"
              className="mr-3 text-primary focus:ring-primary"
              disabled={isSubmitting}
            />
            <div>
              <div className="font-medium text-gray-900">🔒 비공개</div>
              <div className="text-sm text-gray-600">초대받은 사람만 볼 수 있어요</div>
            </div>
          </label>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !selectedLocation}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? '생성 중...' : '모임 만들기'}
        </Button>
      </div>
    </form>
  )
}