/* src/components/ui/ProfileModal.tsx */
'use client'

import { useState, useEffect } from 'react'
import { firstGraphemeUpper } from '@/lib/utils/textSafe'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { mockUsers } from '@/lib/config/mockData'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface UserProfile {
  id: string
  nickname: string
  age_range: string
  avatar_url: string
  created_at: string
  role: string
  intro: string
  interests: string[]
  stats: {
    joinedRooms: number
    hostedRooms: number
    friends: number
    rating: number
    reviews: number
  }
}

export function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && userId) {
      // Mock 환경에서 사용자 정보 찾기
      const foundUser = mockUsers.find(u => u.uid === userId)

      if (foundUser) {
        setUserProfile({
          id: foundUser.uid,
          nickname: foundUser.nickname,
          age_range: foundUser.age_range,
          avatar_url: foundUser.avatar_url,
          created_at: foundUser.created_at,
          role: foundUser.role,
          intro:
            '새로운 사람들과 만나며 다양한 경험을 쌓는 것을 좋아해요! 특히 맛집 탐방과 운동에 관심이 많습니다. 함께 즐거운 시간을 보낼 수 있는 분들과 만나고 싶어요! ✨',
          interests: ['🍻 술', '💪 운동', '🍽️ 맛집', '🎨 문화', '☕ 카페'],
          stats: {
            joinedRooms: Math.floor(Math.random() * 15) + 3,
            hostedRooms: Math.floor(Math.random() * 8) + 1,
            friends: Math.floor(Math.random() * 25) + 5,
            rating: 4.6 + Math.random() * 0.4,
            reviews: Math.floor(Math.random() * 10) + 2,
          },
        })
      }

      setIsLoading(false)
    }
  }, [isOpen, userId])

  const ageRanges = [
    { value: '20s_early', label: '20대 초반' },
    { value: '20s_late', label: '20대 후반' },
    { value: '30s_early', label: '30대 초반' },
    { value: '30s_late', label: '30대 후반' },
    { value: '40s', label: '40대' },
    { value: '50s+', label: '50세 이상' },
  ]

  const getAgeRangeLabel = (value: string) => {
    return ageRanges.find(range => range.value === value)?.label || value
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays}일 전 가입`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months}개월 전 가입`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years}년 전 가입`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white/95 p-4 backdrop-blur-md">
          <h2 className="text-lg font-bold text-gray-900">사용자 프로필</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : userProfile ? (
            <>
              {/* Profile Header */}
              <div className="mb-6 text-center">
                {/* Avatar with enhanced effects */}
                <div className="relative mx-auto mb-4 h-28 w-28">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 p-1">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 shadow-xl">
                      {userProfile.avatar_url ? (
                        <Image
                          src={userProfile.avatar_url}
                          alt={`${userProfile.nickname}의 프로필 사진`}
                          width={112}
                          height={112}
                          className="h-full w-full rounded-full object-cover"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {userProfile.nickname
                            ? firstGraphemeUpper(userProfile.nickname)
                            : '?'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Online status */}
                  <div className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg">
                    <div className="h-2 w-2 animate-ping rounded-full bg-white"></div>
                  </div>

                  {/* Verification badge */}
                  <div className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="mb-2 text-2xl font-bold text-gray-900">{userProfile.nickname}</h3>

                <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
                    {getAgeRangeLabel(userProfile.age_range)}
                  </span>
                  {userProfile.role === 'admin' && (
                    <span className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-1 text-sm font-bold text-white">
                      👑 관리자
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700">
                    ⭐ {userProfile.stats.rating.toFixed(1)}/5.0
                  </span>
                </div>

                <p className="text-sm text-gray-500">{formatJoinDate(userProfile.created_at)}</p>
              </div>

              {/* Quick Stats */}
              <div className="mb-6 grid grid-cols-3 gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-600">
                    {userProfile.stats.joinedRooms}
                  </div>
                  <div className="text-xs font-medium text-gray-600">참여한 모임</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {userProfile.stats.hostedRooms}
                  </div>
                  <div className="text-xs font-medium text-gray-600">주최한 모임</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {userProfile.stats.friends}
                  </div>
                  <div className="text-xs font-medium text-gray-600">새로운 친구</div>
                </div>
              </div>

              {/* Introduction */}
              <div className="mb-6">
                <h4 className="mb-3 flex items-center text-lg font-bold text-gray-800">
                  <span className="mr-2">💭</span>
                  자기소개
                </h4>
                <p className="leading-relaxed text-gray-700">{userProfile.intro}</p>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h4 className="mb-3 flex items-center text-lg font-bold text-gray-800">
                  <span className="mr-2">🏷️</span>
                  관심사
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-blue-100 px-3 py-1 text-sm font-medium text-gray-800"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* View Full Profile */}
                <Link
                  href={`/profile/${userId}`}
                  onClick={onClose}
                  className="block w-full transform rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 px-6 py-4 text-center font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <span className="mr-2">👤</span>
                  전체 프로필 보기
                </Link>

                {/* Chat */}
                <button
                  onClick={() => {
                    // 간단한 1:1 채팅 기능 구현
                    toast.success(
                      `${userProfile.nickname}님과의 채팅방이 개설되었습니다! 곧 채팅 기능을 이용하실 수 있습니다.`
                    )
                    onClose()
                  }}
                  className="w-full transform rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                >
                  <span className="mr-2">💬</span>
                  1:1 채팅하기
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">😅</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">사용자를 찾을 수 없어요</h3>
              <p className="text-gray-600">존재하지 않거나 삭제된 사용자입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
