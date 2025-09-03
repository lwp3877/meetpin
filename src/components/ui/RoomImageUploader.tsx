/* src/components/ui/RoomImageUploader.tsx */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageUploader } from './ImageUploader'
import { getCategoryDisplay } from '@/lib/brand'
import { Palette, Sparkles, Camera } from 'lucide-react'
import type { ImageUploadResult } from '@/lib/imageUpload'

interface RoomImageUploaderProps {
  currentImageUrl?: string
  onImageChanged: (newImageUrl: string | null) => void
  roomCategory?: 'drink' | 'exercise' | 'other'
  roomTitle?: string
  size?: 'medium' | 'large'
  showGradientOptions?: boolean
}

const categoryGradients = {
  drink: [
    'linear-gradient(135deg, #FF6B6B, #FF8E8E, #FFB4B4)',
    'linear-gradient(135deg, #E11D48, #F43F5E, #FB7185)',
    'linear-gradient(135deg, #DC2626, #EF4444, #F87171)',
    'linear-gradient(135deg, #7C3AED, #A855F7, #C084FC)',
  ],
  exercise: [
    'linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)',
    'linear-gradient(135deg, #0EA5E9, #38BDF8, #7DD3FC)',
    'linear-gradient(135deg, #06B6D4, #22D3EE, #67E8F9)',
    'linear-gradient(135deg, #10B981, #34D399, #6EE7B7)',
  ],
  other: [
    'linear-gradient(135deg, #8B5CF6, #A78BFA, #C4B5FD)',
    'linear-gradient(135deg, #F59E0B, #FBBF24, #FCD34D)',
    'linear-gradient(135deg, #EF4444, #F87171, #FCA5A5)',
    'linear-gradient(135deg, #10B981, #34D399, #6EE7B7)',
  ]
}

export function RoomImageUploader({
  currentImageUrl,
  onImageChanged,
  roomCategory = 'other',
  roomTitle = '새로운 모임',
  size = 'large',
  showGradientOptions = true
}: RoomImageUploaderProps) {
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null)
  
  const categoryDisplay = getCategoryDisplay(roomCategory)
  const gradients = categoryGradients[roomCategory]

  const handleImageUploaded = (result: ImageUploadResult) => {
    if (result.success && result.url) {
      onImageChanged(result.url)
      setSelectedGradient(null) // 이미지 업로드시 그라디언트 선택 해제
    }
  }

  const handleImageDeleted = () => {
    onImageChanged(null)
  }

  const handleGradientSelect = (gradient: string) => {
    setSelectedGradient(gradient)
    onImageChanged(null) // 이미지 제거하고 그라디언트 사용
  }

  const currentBackground = currentImageUrl || selectedGradient

  return (
    <div className="space-y-6">
      {/* 메인 이미지 업로더 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            모임 커버 이미지
          </h3>
        </div>
        
        <div className="relative">
          {currentBackground ? (
            <div className="relative">
              {/* 실제 이미지나 그라디언트 미리보기 */}
              <div 
                className={`${size === 'large' ? 'h-48' : 'h-32'} w-full rounded-2xl overflow-hidden relative`}
                style={{
                  background: selectedGradient || undefined
                }}
              >
                {currentImageUrl && (
                  <Image
                    src={currentImageUrl}
                    alt="방 커버 이미지"
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* 오버레이 텍스트 */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">{categoryDisplay.emoji}</div>
                    <h2 className="text-xl font-bold drop-shadow-lg">{roomTitle}</h2>
                    <div className="mt-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      {categoryDisplay.label}
                    </div>
                  </div>
                </div>
                
                {/* 삭제 버튼 */}
                <button
                  onClick={handleImageDeleted}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* 이미지 교체 버튼 */}
              <div className="mt-3">
                <ImageUploader
                  currentImageUrl={undefined}
                  onImageUploaded={handleImageUploaded}
                  folder="rooms"
                  placeholder="새 이미지 업로드"
                  size="medium"
                  shape="rectangle"
                  showDeleteButton={false}
                  options={{
                    maxSizeMB: 8,
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85
                  }}
                />
              </div>
            </div>
          ) : (
            <ImageUploader
              currentImageUrl={currentImageUrl}
              onImageUploaded={handleImageUploaded}
              onImageDeleted={handleImageDeleted}
              folder="rooms"
              placeholder="모임 커버 이미지 추가"
              size={size}
              shape="rectangle"
              options={{
                maxSizeMB: 8,
                maxWidth: 1200,
                maxHeight: 800,
                quality: 0.85
              }}
            />
          )}
        </div>
      </div>

      {/* 그라디언트 옵션 */}
      {showGradientOptions && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              색상 테마 선택
            </h3>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                onClick={() => handleGradientSelect(gradient)}
                className={`
                  h-16 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${selectedGradient === gradient ? 'ring-4 ring-primary ring-offset-2' : ''}
                `}
                style={{ background: gradient }}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {categoryDisplay.emoji}
                </div>
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            카테고리에 맞는 색상 테마를 선택하거나 직접 이미지를 업로드하세요
          </p>
        </div>
      )}

      {/* 업로드 가이드라인 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
          <Camera className="w-4 h-4 mr-2" />
          이미지 업로드 가이드
        </h4>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
          <li>• 최대 파일 크기: 8MB</li>
          <li>• 권장 형식: JPG, PNG, WebP</li>
          <li>• 권장 비율: 16:9 (1200x675px)</li>
          <li>• 모임 분위기가 잘 드러나는 이미지를 선택하세요</li>
          <li>• 이미지 없이 색상 테마만 사용해도 좋습니다</li>
        </ul>
      </div>
    </div>
  )
}