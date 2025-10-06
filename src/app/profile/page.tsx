/* src/app/profile/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { ReferralModal } from '@/components/ui/ReferralSystem'
import { EnhancedProfile } from '@/components/ui/EnhancedProfile'
import { ProfileImageUploader } from '@/components/ui/ProfileImageUploader'
import { useAuth } from '@/lib/useAuth'

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nickname: '',
    age_range: '',
    intro: '',
  })
  const router = useRouter()

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        age_range: user.age_range || '',
        intro: user.intro || '',
      })
      setCurrentAvatarUrl(user.avatar_url || null)
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarChanged = (newAvatarUrl: string | null) => {
    setCurrentAvatarUrl(newAvatarUrl)
    // useAuth의 user 상태도 업데이트하면 더 좋지만,
    // 다음 페이지 로드시 최신 정보가 반영됩니다
  }

  const handleSaveProfile = async () => {
    if (!formData.nickname.trim()) {
      Toast.error('닉네임을 입력해주세요')
      return
    }

    if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      Toast.error('닉네임은 2~20자 사이여야 합니다')
      return
    }

    if (!formData.age_range) {
      Toast.error('연령대를 선택해주세요')
      return
    }

    if (formData.intro.length > 500) {
      Toast.error('자기소개는 500자 이하여야 합니다')
      return
    }

    setIsLoading(true)

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        Toast.success('프로필이 성공적으로 업데이트되었습니다!')
        setIsEditing(false)
      } else {
        Toast.error(result.error || '프로필 업데이트에 실패했습니다')
      }
    } catch (error: unknown) {
      Toast.error((error as Error).message || '프로필 업데이트 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

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

  // 로딩 중일 때
  if (loading) {
    return <PageLoader text="프로필을 불러오는 중..." />
  }

  // 사용자가 없을 때 (리다이렉트 처리)
  if (!user) {
    return null
  }

  return (
    <PageTransition type="slide">
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/map" className="rounded-full p-2 transition-colors hover:bg-gray-100">
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
            </Link>
            <h1 className="text-xl font-bold text-gray-900">내 프로필</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 py-6">
          {/* Profile Header Card */}
          <div className="mb-6 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            <div className="text-center">
              {/* Avatar with gradient ring */}
              <div className="relative mx-auto mb-6 h-28 w-28">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 p-1">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-600">
                    {currentAvatarUrl ? (
                      <Image
                        src={currentAvatarUrl}
                        alt="프로필 사진"
                        width={112}
                        height={112}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
                  <span className="text-xs">✓</span>
                </div>
              </div>

              <h2 className="mb-2 text-3xl font-bold text-gray-800">
                {user.nickname || '닉네임 설정 필요'}
              </h2>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                  {user.age_range ? getAgeRangeLabel(user.age_range) : '연령대 미설정'}
                </span>
                {user.role === 'admin' && (
                  <span className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-bold text-white">
                    👑 관리자
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                부터 밋핀과 함께
              </p>
            </div>

            {/* Edit/Save Buttons */}
            <div className="mt-8">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full transform rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-600 hover:to-blue-600"
                >
                  ✏️ 프로필 편집하기
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        저장 중...
                      </div>
                    ) : (
                      '💾 저장'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        nickname: user.nickname || '',
                        age_range: user.age_range || '',
                        intro: user.intro || '',
                      })
                    }}
                    className="rounded-2xl border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition-all hover:border-gray-400"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          {isEditing && (
            <div className="space-y-6">
              {/* Profile Image Uploader */}
              <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
                  📷 프로필 사진 변경
                </h3>
                <ProfileImageUploader
                  currentAvatarUrl={currentAvatarUrl || undefined}
                  onAvatarChanged={handleAvatarChanged}
                  size="large"
                  showRandomGenerator={true}
                />
              </div>

              {/* Profile Details Form */}
              <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
                  ✨ 기본 정보 편집
                </h3>

                <div className="space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">📧 이메일</label>
                    <div className="w-full rounded-2xl border-2 border-gray-200 bg-gray-100 px-5 py-4 font-medium text-gray-600">
                      {user.email}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">이메일은 변경할 수 없어요</p>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">
                      ✨ 닉네임 *
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={e => handleInputChange('nickname', e.target.value)}
                      className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0"
                      placeholder="멋진 닉네임을 입력하세요"
                      maxLength={20}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">다른 사용자에게 보여질 이름이에요</p>
                      <p className="font-mono text-xs text-gray-400">
                        {formData.nickname.length}/20
                      </p>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">
                      🎂 연령대 *
                    </label>
                    <select
                      value={formData.age_range}
                      onChange={e => handleInputChange('age_range', e.target.value)}
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 font-medium text-gray-800 transition-all focus:border-emerald-500 focus:ring-0"
                    >
                      <option value="">연령대를 선택하세요</option>
                      {ageRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Introduction */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">
                      💭 자기소개
                    </label>
                    <textarea
                      value={formData.intro}
                      onChange={e => handleInputChange('intro', e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-2xl border-2 border-gray-200 px-5 py-4 font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0"
                      placeholder="자신을 소개해주세요! 어떤 모임을 좋아하는지, 취미가 무엇인지 알려주세요."
                      maxLength={500}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">다른 사용자가 참고할 수 있어요</p>
                      <p className="font-mono text-xs text-gray-400">{formData.intro.length}/500</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Profile Stats */}
          {!isEditing && <EnhancedProfile className="mb-6" />}

          {/* Action Menu */}
          <div className="mb-6 space-y-3">
            {/* My Rooms */}
            <Link href="/map" className="block">
              <div className="transform rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-xl">🗺️</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">지도에서 모임 찾기</div>
                      <div className="text-sm text-gray-600">새로운 모임을 찾아보세요</div>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Create Room */}
            <Link href="/room/new" className="block">
              <div className="transform rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                      <span className="text-xl">➕</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">새 모임 만들기</div>
                      <div className="text-sm text-gray-600">모임을 주최해보세요</div>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* My Requests */}
            <Link href="/requests" className="block">
              <div className="transform rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                      <span className="text-xl">📮</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">요청함</div>
                      <div className="text-sm text-gray-600">참가 요청과 받은 요청 확인</div>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Referral Program */}
            <div
              onClick={() => setShowReferralModal(true)}
              className="transform cursor-pointer rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-5 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <span className="text-xl">🎁</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">친구 초대하기</div>
                    <div className="text-sm text-white/80">초대하고 함께 혜택 받기</div>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Notification Settings */}
            <Link href="/settings/notifications" className="block">
              <div className="transform rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-xl">🔔</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">알림 설정</div>
                      <div className="text-sm text-gray-600">푸시 알림 및 소식 설정</div>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Safety Settings */}
            <Link href="/settings/safety" className="block">
              <div className="transform rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                      <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">안전 설정</div>
                      <div className="text-sm text-gray-600">안전 옵션 및 본인 인증</div>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Admin Panel (관리자만) */}
            {user.role === 'admin' && (
              <Link href="/admin" className="block">
                <div className="transform rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 p-5 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                        <span className="text-xl">👑</span>
                      </div>
                      <div>
                        <div className="font-bold text-white">관리자 패널</div>
                        <div className="text-sm text-white/80">시스템 관리 및 사용자 관리</div>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-white/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* App Info */}
          <div className="mt-4 text-center text-sm text-gray-400">
            <p className="mb-3 font-medium">밋핀(MeetPin) v1.0</p>
            <div className="flex justify-center space-x-6">
              <Link href="/legal/terms" className="transition-colors hover:text-emerald-500">
                이용약관
              </Link>
              <Link href="/legal/privacy" className="transition-colors hover:text-emerald-500">
                개인정보처리방침
              </Link>
            </div>
            <p className="mt-3 text-xs">© 2024 MeetPin. Made with ❤️</p>
          </div>
        </div>

        {/* Referral Modal */}
        <ReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          userData={{
            nickname: user?.nickname,
            referralCode: user?.referral_code,
          }}
        />
      </div>
    </PageTransition>
  )
}
