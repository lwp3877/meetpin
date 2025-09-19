/* src/components/LazyImageUploader.tsx */
'use client'

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// 이미지 업로더 컴포넌트를 동적으로 로드
const ImageUploader = dynamic(
  () => import('@/components/ui/ImageUploader').then(mod => ({ default: mod.ImageUploader })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-500 mt-2">업로더 준비 중...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

const ProfileImageUploader = dynamic(
  () => import('@/components/ui/ProfileImageUploader').then(mod => ({ default: mod.ProfileImageUploader })),
  {
    loading: () => (
      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
)

const RoomImageUploader = dynamic(
  () => import('@/components/ui/RoomImageUploader').then(mod => ({ default: mod.RoomImageUploader })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-500 mt-2">업로더 준비 중...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export { ImageUploader as LazyImageUploader, ProfileImageUploader as LazyProfileImageUploader, RoomImageUploader as LazyRoomImageUploader }