/* src/components/ui/ProfileImageUploader.tsx */
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { ImageUploader } from './ImageUploader'
import { getRandomKoreanAvatar } from '@/lib/koreanAvatars'
import { User, Shuffle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ImageUploadResult } from '@/lib/imageUpload'

interface ProfileImageUploaderProps {
  currentAvatarUrl?: string
  onAvatarChanged: (newAvatarUrl: string | null) => void
  size?: 'small' | 'medium' | 'large'
  showRandomGenerator?: boolean
  showPresets?: boolean
}

export function ProfileImageUploader({
  currentAvatarUrl,
  onAvatarChanged,
  size = 'large',
  showRandomGenerator = true
}: ProfileImageUploaderProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const handleImageUploaded = async (result: ImageUploadResult) => {
    if (!result.success || !result.url) return

    try {
      setSaving(true)
      
      // 프로필 업데이트 API 호출
      const response = await fetch('/api/profile/avatar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: result.url })
      })

      const data = await response.json()

      if (data.ok) {
        onAvatarChanged(result.url)
        toast.success('프로필 사진이 업데이트되었습니다!')
      } else {
        toast.error(data.message || '프로필 사진 업데이트에 실패했습니다')
      }
    } catch (error) {
      console.error('Profile avatar update error:', error)
      toast.error('프로필 사진 업데이트 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleImageDeleted = async () => {
    try {
      setSaving(true)
      
      // 프로필에서 아바타 제거
      const response = await fetch('/api/profile/avatar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: null })
      })

      const data = await response.json()

      if (data.ok) {
        onAvatarChanged(null)
        toast.success('프로필 사진이 삭제되었습니다')
      } else {
        toast.error(data.message || '프로필 사진 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Profile avatar delete error:', error)
      toast.error('프로필 사진 삭제 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleRandomAvatar = async () => {
    try {
      setSaving(true)
      
      const randomAvatarUrl = getRandomKoreanAvatar()
      
      // 랜덤 아바타로 프로필 업데이트
      const response = await fetch('/api/profile/avatar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: randomAvatarUrl })
      })

      const data = await response.json()

      if (data.ok) {
        onAvatarChanged(randomAvatarUrl)
        toast.success('랜덤 프로필 사진이 설정되었습니다!')
      } else {
        toast.error(data.message || '프로필 사진 설정에 실패했습니다')
      }
    } catch (error) {
      console.error('Random avatar update error:', error)
      toast.error('프로필 사진 설정 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-4">
      {/* 현재 프로필 이미지 */}
      <div className="flex flex-col items-center space-y-4">
        <ImageUploader
          currentImageUrl={currentAvatarUrl}
          onImageUploaded={handleImageUploaded}
          onImageDeleted={handleImageDeleted}
          folder="avatars"
          placeholder="프로필 사진 추가"
          size={size}
          shape="circle"
          options={{
            maxSizeMB: 3,
            maxWidth: 400,
            maxHeight: 400,
            quality: 0.9
          }}
        />
        
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white">
            {user.nickname}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            프로필 사진을 변경하세요
          </p>
        </div>
      </div>

      {/* 추가 옵션 버튼들 */}
      <div className="flex flex-col space-y-2">
        {showRandomGenerator && (
          <button
            onClick={handleRandomAvatar}
            disabled={saving}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            <span>랜덤 프로필 생성</span>
          </button>
        )}
        
        <button
          onClick={handleImageDeleted}
          disabled={saving || !currentAvatarUrl}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <User className="w-4 h-4" />
          <span>기본 이미지로 변경</span>
        </button>
      </div>

      {/* 업로드 가이드라인 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          프로필 사진 가이드라인
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• 최대 파일 크기: 3MB</li>
          <li>• 권장 형식: JPG, PNG, WebP</li>
          <li>• 권장 크기: 400x400px 이상</li>
          <li>• 얼굴이 명확히 보이는 사진을 권장합니다</li>
        </ul>
      </div>

      {/* 로딩 상태 */}
      {saving && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">프로필을 업데이트하는 중...</span>
          </div>
        </div>
      )}
    </div>
  )
}