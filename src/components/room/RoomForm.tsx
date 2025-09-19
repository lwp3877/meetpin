/* src/components/RoomForm.tsx */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { categoryLabels, categoryEmojis } from '@/lib/config/brand'
import LocationPicker from '@/components/map/LocationPicker'

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
      <div className="space-y-3">
        <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">✨</span>
          모임 제목
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            {...register('title')}
            type="text"
            id="title"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="예: 강남에서 맥주 한 잔 하실 분! 🍻"
            disabled={isSubmitting}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-xs text-gray-400">{watch('title')?.length || 0}/50</span>
          </div>
        </div>
        {errors.title && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.title.message}
          </div>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div className="space-y-4">
        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">🏷️</span>
          모임 카테고리
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(['drink', 'exercise', 'other'] as const).map((category) => {
            const isSelected = selectedCategory === category
            const categoryInfo = categoryLabels[category]
            const emoji = categoryEmojis[category]
            
            const colors = {
              drink: { bg: 'from-amber-400 to-orange-500', border: 'border-amber-300', text: 'text-amber-700' },
              exercise: { bg: 'from-red-400 to-pink-500', border: 'border-red-300', text: 'text-red-700' },
              other: { bg: 'from-purple-400 to-indigo-500', border: 'border-purple-300', text: 'text-purple-700' }
            }
            
            return (
              <label
                key={category}
                className={`relative cursor-pointer rounded-xl border-2 p-5 focus:outline-none transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? `${colors[category].border} bg-gradient-to-br ${colors[category].bg} text-white shadow-lg`
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-800'
                }`}
              >
                <input
                  {...register('category')}
                  type="radio"
                  value={category}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="text-center space-y-2">
                  <div className={`text-3xl ${isSelected ? 'animate-bounce' : ''}`}>
                    {emoji}
                  </div>
                  <div className={`font-bold text-sm ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {categoryInfo}
                  </div>
                  <div className={`text-xs opacity-90 ${
                    isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {category === 'drink' && '술, 칵테일, 와인'}
                    {category === 'exercise' && '헬스, 러닝, 요가'}
                    {category === 'other' && '영화, 카페, 독서'}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-emerald-500 text-sm">✓</span>
                  </div>
                )}
              </label>
            )
          })}
        </div>
        {errors.category && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.category.message}
          </div>
        )}
      </div>

      {/* 모임 장소 */}
      <div className="space-y-4">
        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">📍</span>
          모임 장소
          <span className="text-red-500 ml-1">*</span>
        </label>
        {selectedLocation ? (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg mr-2">✅</span>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-100">선택된 장소</h4>
                </div>
                <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-1">
                  {selectedLocation.place_text}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full inline-block">
                  📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openLocationPicker}
                disabled={isSubmitting}
                className="ml-3 border-emerald-300 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
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
            className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20 transition-all duration-300 group rounded-xl"
            disabled={isSubmitting}
          >
            <div className="text-center space-y-3">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                📍
              </div>
              <div className="space-y-1">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  지도에서 장소 선택
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  클릭하여 모임 장소를 선택해주세요
                </div>
              </div>
            </div>
          </Button>
        )}
        {errors.place_text && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.place_text.message}
          </div>
        )}
      </div>

      {/* 시작 시간 */}
      <div className="space-y-3">
        <label htmlFor="start_at" className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">🕐</span>
          시작 시간
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            {...register('start_at')}
            type="datetime-local"
            id="start_at"
            min={getMinDateTime()}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
          <span className="mr-1">💡</span>
          최소 30분 후부터 설정 가능합니다
        </div>
        {errors.start_at && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.start_at.message}
          </div>
        )}
      </div>

      {/* 최대 인원 */}
      <div className="space-y-4">
        <label htmlFor="max_people" className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">👥</span>
          최대 인원
          <span className="ml-2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-full">
            {maxPeople}명
          </span>
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">2명</span>
            <input
              {...register('max_people', { valueAsNumber: true })}
              type="range"
              id="max_people"
              min="2"
              max="20"
              step="1"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">20명</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {maxPeople <= 4 ? '소규모 모임 🤝' : maxPeople <= 10 ? '중간 규모 모임 👫' : '대규모 모임 🎉'}
            </span>
          </div>
        </div>
        {errors.max_people && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.max_people.message}
          </div>
        )}
      </div>

      {/* 참가비 */}
      <div className="space-y-4">
        <label htmlFor="fee" className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">{fee === 0 ? '🆓' : '💰'}</span>
          참가비
          <span className={`ml-2 px-3 py-1 text-white text-sm font-bold rounded-full ${
            fee === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-amber-500'
          }`}>
            {fee === 0 ? '무료' : `${fee.toLocaleString()}원`}
          </span>
        </label>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">무료</span>
            <input
              {...register('fee', { valueAsNumber: true })}
              type="range"
              id="fee"
              min="0"
              max="100000"
              step="1000"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">10만원</span>
          </div>
          <div className="text-center">
            <span className={`text-xs px-3 py-1 rounded-full ${
              fee === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              fee <= 10000 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            }`}>
              {fee === 0 ? '🆓 무료로 더 많은 참가자를 만나보세요!' : 
               fee <= 10000 ? '💡 적당한 참가비로 진지한 참가자들과 만나요' :
               '💰 높은 참가비는 참가율을 낮출 수 있어요'}
            </span>
          </div>
        </div>
        {errors.fee && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.fee.message}
          </div>
        )}
      </div>

      {/* 상세 설명 */}
      <div className="space-y-3">
        <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">📝</span>
          상세 설명
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">선택사항</span>
        </label>
        <div className="relative">
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="예: '지침에는 천천히 주변을 감상하며 가볍게 맥주 한 잔 하려고 합니다. 편한 옷차림으로 오세요! 초보자도 환영합니다. 🍻'"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
            {watch('description')?.length || 0}/500
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <span className="font-semibold text-purple-700 dark:text-purple-300">💡 팁:</span>
            <span className="text-purple-600 dark:text-purple-400 ml-1">모임 분위기를 설명해주세요</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <span className="font-semibold text-blue-700 dark:text-blue-300">🎯 가이드:</span>
            <span className="text-blue-600 dark:text-blue-400 ml-1">준비물이나 주의사항 추가</span>
          </div>
        </div>
        {errors.description && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-1">⚠️</span>
            {errors.description.message}
          </div>
        )}
      </div>

      {/* 공개 설정 */}
      <div className="space-y-4">
        <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-2 text-lg">🔐</span>
          공개 설정
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
            watch('visibility') === 'public' 
              ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}>
            <input
              {...register('visibility')}
              type="radio"
              value="public"
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="text-center space-y-2">
              <div className="text-3xl">🌍</div>
              <div className={`font-bold text-sm ${
                watch('visibility') === 'public' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-gray-100'
              }`}>
                공개
              </div>
              <div className={`text-xs ${
                watch('visibility') === 'public' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                모든 사람이
                <br />볼 수 있어요
              </div>
            </div>
            {watch('visibility') === 'public' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </label>

          <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
            watch('visibility') === 'private' 
              ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}>
            <input
              {...register('visibility')}
              type="radio"
              value="private"
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="text-center space-y-2">
              <div className="text-3xl">🔒</div>
              <div className={`font-bold text-sm ${
                watch('visibility') === 'private' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'
              }`}>
                비공개
              </div>
              <div className={`text-xs ${
                watch('visibility') === 'private' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                초대받은 사람만
                <br />볼 수 있어요
              </div>
            </div>
            {watch('visibility') === 'private' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-4 pt-8">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-xl font-semibold"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !selectedLocation}
          className={`flex-1 py-3 text-white font-bold rounded-xl transition-all duration-300 shadow-lg ${
            isSubmitting || !selectedLocation 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-105 hover:shadow-emerald-500/25'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                생성 중...
              </>
            ) : (
              <>
                🎉 모임 만들기
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  )
}