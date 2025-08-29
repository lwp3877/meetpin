/* src/app/profile/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// import EnhancedButton, { ButtonPresets } from '@/components/ui/EnhancedButton'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { ReferralModal } from '@/components/ui/ReferralSystem'
// import { brandMessages } from '@/lib/brand'
import { useAuth } from '@/lib/useAuth'

export default function ProfilePage() {
  const { user, loading, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    age_range: '',
    intro: ''
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
        intro: user.intro || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    } catch (error: any) {
      Toast.error(error.message || '프로필 업데이트 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      await signOut()
      Toast.success('로그아웃되었습니다')
      router.push('/')
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
        <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/map" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              내 프로필
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border border-white/50">
          <div className="text-center">
            {/* Avatar with gradient ring */}
            <div className="relative mx-auto w-28 h-28 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 rounded-full p-1">
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {user.nickname || '닉네임 설정 필요'}
            </h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                {user.age_range ? getAgeRangeLabel(user.age_range) : '연령대 미설정'}
              </span>
              {user.role === 'admin' && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  👑 관리자
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm">
              {new Date(user.created_at).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}부터 밋핀과 함께
            </p>
          </div>

          {/* Edit/Save Buttons */}
          <div className="mt-8">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                ✏️ 프로필 편집하기
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
                      intro: user.intro || ''
                    })
                  }}
                  className="px-6 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-2xl font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        {isEditing && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-white/50">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">✨ 프로필 편집</h3>
          
            <div className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📧 이메일
                </label>
                <div className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-600 font-medium">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-2">이메일은 변경할 수 없어요</p>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  ✨ 닉네임 *
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-0 focus:border-emerald-500 transition-all text-gray-800 font-medium placeholder:text-gray-400"
                  placeholder="멋진 닉네임을 입력하세요"
                  maxLength={20}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">다른 사용자에게 보여질 이름이에요</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {formData.nickname.length}/20
                  </p>
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  🎂 연령대 *
                </label>
                <select
                  value={formData.age_range}
                  onChange={(e) => handleInputChange('age_range', e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-0 focus:border-emerald-500 transition-all bg-white text-gray-800 font-medium"
                >
                  <option value="">연령대를 선택하세요</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Introduction */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  💭 자기소개
                </label>
                <textarea
                  value={formData.intro}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-0 focus:border-emerald-500 transition-all resize-none text-gray-800 font-medium placeholder:text-gray-400"
                  placeholder="자신을 소개해주세요! 어떤 모임을 좋아하는지, 취미가 무엇인지 알려주세요."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">다른 사용자가 참고할 수 있어요</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {formData.intro.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Menu */}
        <div className="space-y-3 mb-6">
          {/* My Rooms */}
          <Link href="/map" className="block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">지도에서 모임 찾기</div>
                    <div className="text-sm text-gray-600">새로운 모임을 찾아보세요</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Create Room */}
          <Link href="/room/new" className="block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">➕</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">새 모임 만들기</div>
                    <div className="text-sm text-gray-600">모임을 주최해보세요</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* My Requests */}
          <Link href="/requests" className="block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📮</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">요청함</div>
                    <div className="text-sm text-gray-600">참가 요청과 받은 요청 확인</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Referral Program */}
          <div
            onClick={() => setShowReferralModal(true)}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">🎁</span>
                </div>
                <div>
                  <div className="font-bold text-white">친구 초대하기</div>
                  <div className="text-sm text-white/80">초대하고 함께 혜택 받기</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Admin Panel (관리자만) */}
          {user.role === 'admin' && (
            <Link href="/admin" className="block">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-xl">👑</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">관리자 패널</div>
                      <div className="text-sm text-white/80">시스템 관리 및 사용자 관리</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )}
        </div>


        {/* App Info */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          <p className="font-medium mb-3">밋핀(MeetPin) v1.0</p>
          <div className="flex justify-center space-x-6">
            <Link href="/legal/terms" className="hover:text-emerald-500 transition-colors">
              이용약관
            </Link>
            <Link href="/legal/privacy" className="hover:text-emerald-500 transition-colors">
              개인정보처리방침
            </Link>
          </div>
          <p className="mt-3 text-xs">
            © 2024 MeetPin. Made with ❤️
          </p>
        </div>
      </div>

      {/* Referral Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        userData={{
          nickname: user?.nickname,
          referralCode: user?.referral_code
        }}
      />
      </div>
    </PageTransition>
  )
}