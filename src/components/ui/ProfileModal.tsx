/* src/components/ui/ProfileModal.tsx */
'use client'

import { useState, useEffect } from 'react'
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
          intro: '새로운 사람들과 만나며 다양한 경험을 쌓는 것을 좋아해요! 특히 맛집 탐방과 운동에 관심이 많습니다. 함께 즐거운 시간을 보낼 수 있는 분들과 만나고 싶어요! ✨',
          interests: ['🍻 술', '💪 운동', '🍽️ 맛집', '🎨 문화', '☕ 카페'],
          stats: {
            joinedRooms: Math.floor(Math.random() * 15) + 3,
            hostedRooms: Math.floor(Math.random() * 8) + 1,
            friends: Math.floor(Math.random() * 25) + 5,
            rating: 4.6 + Math.random() * 0.4,
            reviews: Math.floor(Math.random() * 10) + 2
          }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">사용자 프로필</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userProfile ? (
            <>
              {/* Profile Header */}
              <div className="text-center mb-6">
                {/* Avatar with enhanced effects */}
                <div className="relative mx-auto w-28 h-28 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 rounded-full p-1">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
                      {userProfile.avatar_url ? (
                        <Image 
                          src={userProfile.avatar_url} 
                          alt={`${userProfile.nickname}의 프로필 사진`} 
                          width={112}
                          height={112}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-4xl text-white font-bold">
                          {userProfile.nickname ? userProfile.nickname.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Online status */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  
                  {/* Verification badge */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {userProfile.nickname}
                </h3>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <span className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-medium">
                    {getAgeRangeLabel(userProfile.age_range)}
                  </span>
                  {userProfile.role === 'admin' && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      👑 관리자
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
                    ⭐ {userProfile.stats.rating.toFixed(1)}/5.0
                  </span>
                </div>

                <p className="text-gray-500 text-sm">
                  {formatJoinDate(userProfile.created_at)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-600">{userProfile.stats.joinedRooms}</div>
                  <div className="text-xs text-gray-600 font-medium">참여한 모임</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{userProfile.stats.hostedRooms}</div>
                  <div className="text-xs text-gray-600 font-medium">주최한 모임</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{userProfile.stats.friends}</div>
                  <div className="text-xs text-gray-600 font-medium">새로운 친구</div>
                </div>
              </div>

              {/* Introduction */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">💭</span>
                  자기소개
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {userProfile.intro}
                </p>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🏷️</span>
                  관심사
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-emerald-100 to-blue-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200"
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
                  className="block w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold text-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2">👤</span>
                  전체 프로필 보기
                </Link>

                {/* Chat */}
                <button 
                  onClick={() => {
                    // 간단한 1:1 채팅 기능 구현
                    toast.success(`${userProfile.nickname}님과의 채팅방이 개설되었습니다! 곧 채팅 기능을 이용하실 수 있습니다.`);
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-semibold transition-all hover:shadow-lg transform hover:scale-105"
                >
                  <span className="mr-2">💬</span>
                  1:1 채팅하기
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">사용자를 찾을 수 없어요</h3>
              <p className="text-gray-600">존재하지 않거나 삭제된 사용자입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}