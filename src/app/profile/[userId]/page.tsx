/* src/app/profile/[userId]/page-backup.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { mockUsers } from '@/lib/config/mockData'

interface UserProfile {
  id: string
  nickname: string
  age_range: string
  avatar_url: string
  created_at: string
  role: string
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getAgeRangeLabel = (value: string) => {
    const ageRanges = [
      { value: '20s_early', label: '20대 초반' },
      { value: '20s_late', label: '20대 후반' },
      { value: '30s_early', label: '30대 초반' },
      { value: '30s_late', label: '30대 후반' },
      { value: '40s', label: '40대' },
      { value: '50s+', label: '50세 이상' },
    ]
    return ageRanges.find(range => range.value === value)?.label || value
  }

  useEffect(() => {
    const foundUser = mockUsers.find(u => u.uid === userId)
      
    if (foundUser) {
      setUserProfile({
        id: foundUser.uid,
        nickname: foundUser.nickname,
        age_range: foundUser.age_range,
        avatar_url: foundUser.avatar_url,
        created_at: foundUser.created_at,
        role: foundUser.role,
      })
    }
      
    setIsLoading(false)
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-emerald-500 border-4 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
          <p className="mt-3 text-sm text-gray-600 animate-pulse">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="text-8xl mb-6">😅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">사용자를 찾을 수 없어요</h1>
          <p className="text-gray-600 mb-8 text-lg">존재하지 않거나 삭제된 사용자입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 text-center">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <Image 
                  src={userProfile.avatar_url} 
                  alt={`${userProfile.nickname}의 프로필 사진`} 
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-full border-4 border-emerald-500"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {userProfile.nickname}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                  {getAgeRangeLabel(userProfile.age_range)}
                </span>
                {userProfile.role === 'admin' && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    👑 관리자
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}