/* src/app/profile/[userId]/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import { useAuth } from '@/lib/useAuth'
import { mockUsers } from '@/lib/config/mockData'

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
  recentActivities: Array<{
    type: 'joined' | 'hosted' | 'completed'
    title: string
    date: string
    location: string
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: string
  }>
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'achievements'>('about')
  const [showReportModal, setShowReportModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mock 환경에서 사용자 정보 찾기 (인증 상태와 관계없이)
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
          '안녕하세요! 새로운 사람들과 만나며 다양한 경험을 쌓는 것을 좋아합니다. 특히 맛집 탐방과 운동, 문화 활동에 관심이 많아요. 함께 즐거운 시간을 보낼 수 있는 분들과 만나고 싶습니다! 🌟',
        interests: ['🍻 술', '💪 운동', '🍽️ 맛집', '🎨 문화', '🏃‍♀️ 러닝', '☕ 카페'],
        stats: {
          joinedRooms: Math.floor(Math.random() * 20) + 5,
          hostedRooms: Math.floor(Math.random() * 10) + 2,
          friends: Math.floor(Math.random() * 30) + 8,
          rating: 4.8,
          reviews: Math.floor(Math.random() * 15) + 3,
        },
        recentActivities: [
          {
            type: 'completed',
            title: '강남 와인바 투어',
            date: '2일 전',
            location: '강남역',
          },
          {
            type: 'hosted',
            title: '한강 러닝 모임',
            date: '1주 전',
            location: '반포한강공원',
          },
          {
            type: 'joined',
            title: '홍대 맛집 탐방',
            date: '2주 전',
            location: '홍대입구역',
          },
        ],
        achievements: [
          {
            id: 'early_adopter',
            title: '얼리 어답터',
            description: '밋핀 초기 사용자로 가입',
            icon: '🚀',
            unlockedAt: '2024-01-15',
          },
          {
            id: 'social_butterfly',
            title: '소셜 버터플라이',
            description: '10개 이상의 모임에 참가',
            icon: '🦋',
            unlockedAt: '2024-02-20',
          },
          {
            id: 'host_expert',
            title: '모임 전문가',
            description: '5개 이상의 성공적인 모임 주최',
            icon: '👑',
            unlockedAt: '2024-03-10',
          },
        ],
      })
    }

    setIsLoading(false)
  }, [userId])

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'joined':
        return '✅'
      case 'hosted':
        return '🎯'
      case 'completed':
        return '🎉'
      default:
        return '📅'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'joined':
        return 'bg-blue-100 text-blue-800'
      case 'hosted':
        return 'bg-emerald-100 text-emerald-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 로딩 중일 때
  if (isLoading) {
    return <PageLoader text="프로필을 불러오는 중..." />
  }

  // 사용자가 없을 때
  if (!userProfile) {
    return (
      <PageTransition type="slide">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
          <div className="rounded-3xl border border-white/50 bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm">
            <div className="mb-6 text-8xl">😅</div>
            <h1 className="mb-3 text-3xl font-bold text-gray-800">사용자를 찾을 수 없어요</h1>
            <p className="mb-8 text-lg text-gray-600">존재하지 않거나 삭제된 사용자입니다.</p>
            <Link
              href="/map"
              className="transform rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
            >
              🗺️ 지도로 돌아가기
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  // 자신의 프로필을 보려고 하면 본인 프로필 페이지로 리다이렉트
  if (currentUser && currentUser.id === userProfile.id) {
    router.push('/profile')
    return null
  }

  return (
    <PageTransition type="slide">
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => router.back()}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{userProfile.nickname}님의 프로필</h1>
            <button
              onClick={() => setShowReportModal(true)}
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 py-6">
          {/* Profile Header Card */}
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center">
                {/* Avatar with enhanced effects */}
                <div className="relative mx-auto mb-6 h-36 w-36">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 p-1">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 shadow-2xl">
                      {userProfile.avatar_url ? (
                        <Image
                          src={userProfile.avatar_url}
                          alt={`${userProfile.nickname}의 프로필 사진`}
                          width={144}
                          height={144}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-white">
                          {userProfile.nickname
                            ? userProfile.nickname.charAt(0).toUpperCase()
                            : '?'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Online status indicator */}
                  <div className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500 shadow-lg">
                    <div className="h-3 w-3 animate-ping rounded-full bg-white"></div>
                  </div>

                  {/* Verification badge */}
                  <div className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-500 shadow-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="mb-2 text-4xl font-bold text-gray-800">{userProfile.nickname}</h2>

                <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-5 py-2 text-sm font-semibold text-emerald-800">
                    {getAgeRangeLabel(userProfile.age_range)}
                  </span>
                  {userProfile.role === 'admin' && (
                    <span className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-5 py-2 text-sm font-bold text-white">
                      👑 관리자
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700">
                    ⭐ {userProfile.stats.rating}/5.0
                  </span>
                </div>

                <p className="mb-6 text-sm text-gray-500">
                  {formatJoinDate(userProfile.created_at)}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {userProfile.stats.joinedRooms}
                    </div>
                    <div className="text-xs font-medium text-gray-600">참여한 모임</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userProfile.stats.hostedRooms}
                    </div>
                    <div className="text-xs font-medium text-gray-600">주최한 모임</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userProfile.stats.friends}
                    </div>
                    <div className="text-xs font-medium text-gray-600">새로운 친구</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 rounded-2xl border border-white/50 bg-white/80 p-2 shadow-lg backdrop-blur-sm">
            <div className="flex">
              {[
                { id: 'about', label: '소개', icon: '👋' },
                { id: 'activity', label: '활동', icon: '📈' },
                { id: 'achievements', label: '업적', icon: '🏆' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <>
                {/* Introduction Card */}
                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-gray-800">
                    💭 자기소개
                  </h3>
                  <p className="text-lg leading-relaxed text-gray-700">{userProfile.intro}</p>
                </div>

                {/* Interest Tags */}
                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-4 flex items-center text-xl font-bold text-gray-800">
                    🏷️ 관심사
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {userProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 text-sm font-medium text-gray-800 transition-all hover:shadow-md"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                <h3 className="mb-6 flex items-center text-xl font-bold text-gray-800">
                  📈 최근 활동
                </h3>
                <div className="space-y-4">
                  {userProfile.recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-2xl border border-gray-100 bg-white/50 p-4 transition-all hover:shadow-lg"
                    >
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-md">
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 font-semibold text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.location}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getActivityColor(activity.type)}`}
                        >
                          {activity.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                <h3 className="mb-6 flex items-center text-xl font-bold text-gray-800">🏆 업적</h3>
                <div className="space-y-4">
                  {userProfile.achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className="flex items-center rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 shadow-sm"
                    >
                      <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                        <span className="text-2xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 font-bold text-gray-900">{achievement.title}</div>
                        <div className="mb-2 text-sm text-gray-600">{achievement.description}</div>
                        <div className="text-xs font-medium text-orange-600">
                          {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            {/* 1:1 채팅 */}
            <button
              disabled
              className="flex w-full transform items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            >
              <span className="mr-3 text-xl">💬</span>
              1:1 채팅하기 (준비 중)
            </button>

            {/* 지도에서 보기 */}
            <Link
              href="/map"
              className="block flex w-full transform items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-5 text-center text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <span className="mr-3 text-xl">🗺️</span>
              지도에서 모임 찾기
            </Link>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="mb-4 text-center text-xl font-bold text-gray-800">신고하기</h3>
              <p className="mb-6 text-center text-gray-600">
                이 사용자를 신고하는 이유를 선택해주세요.
              </p>

              <div className="mb-6 space-y-3">
                {['부적절한 언어 사용', '약속 시간 미준수', '사기 의심', '기타'].map(reason => (
                  <button
                    key={reason}
                    disabled
                    className="w-full rounded-2xl border border-gray-200 p-3 text-left transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  disabled
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  신고 (준비 중)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
