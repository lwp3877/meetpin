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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex flex-col items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"
            role="status"
            aria-label="Loading"
          ></div>
          <p className="mt-3 animate-pulse text-sm text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
        <div className="rounded-3xl border border-white/50 bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-8xl">😅</div>
          <h1 className="mb-3 text-3xl font-bold text-gray-800">사용자를 찾을 수 없어요</h1>
          <p className="mb-8 text-lg text-gray-600">존재하지 않거나 삭제된 사용자입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
            <div className="p-8 text-center">
              <div className="relative mx-auto mb-6 h-32 w-32">
                <Image
                  src={userProfile.avatar_url}
                  alt={`${userProfile.nickname}의 프로필 사진`}
                  width={128}
                  height={128}
                  className="h-full w-full rounded-full border-4 border-emerald-500 object-cover"
                />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">{userProfile.nickname}</h2>
              <div className="flex items-center justify-center gap-3">
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                  {getAgeRangeLabel(userProfile.age_range)}
                </span>
                {userProfile.role === 'admin' && (
                  <span className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-bold text-white">
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
