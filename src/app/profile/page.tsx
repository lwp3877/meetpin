/* src/app/profile/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EnhancedButton, { ButtonPresets } from '@/components/ui/EnhancedButton'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { ReferralModal } from '@/components/ui/ReferralSystem'
import { brandMessages } from '@/lib/brand'
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/map">
                <ButtonPresets.BackButton onClick={() => {}} />
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              내 프로필
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="text-center mb-6">
            {/* Avatar */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl text-white font-bold">
                {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {user.nickname || '닉네임 없음'}
            </h2>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {user.age_range ? getAgeRangeLabel(user.age_range) : '연령대 미설정'}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' ? '👑 관리자' : '👤 일반 회원'}
              </span>
            </div>

            <p className="text-gray-500 text-sm mt-2">
              가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Edit/Save Buttons */}
          <div className="text-center mb-6">
            {!isEditing ? (
              <EnhancedButton
                onClick={() => setIsEditing(true)}
                variant="primary"
                size="lg"
                icon="✏️"
                animation="glow"
              >
                프로필 편집
              </EnhancedButton>
            ) : (
              <div className="flex justify-center space-x-4">
                <EnhancedButton
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="success"
                  size="lg"
                  icon="💾"
                >
                  저장
                </EnhancedButton>
                <ButtonPresets.Cancel
                  onClick={() => {
                    setIsEditing(false)
                    // 원래 값으로 복원
                    setFormData({
                      nickname: user.nickname || '',
                      age_range: user.age_range || '',
                      intro: user.intro || ''
                    })
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📝 프로필 정보</h3>
          
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="멋진 닉네임을 입력하세요"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.nickname.length}/20자
                  </p>
                </>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                  {user.nickname || '닉네임 없음'}
                </div>
              )}
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연령대 *
              </label>
              {isEditing ? (
                <select
                  value={formData.age_range}
                  onChange={(e) => handleInputChange('age_range', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                >
                  <option value="">연령대를 선택하세요</option>
                  {ageRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                  {user.age_range ? getAgeRangeLabel(user.age_range) : '연령대 미설정'}
                </div>
              )}
            </div>

            {/* Introduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              {isEditing ? (
                <>
                  <textarea
                    value={formData.intro}
                    onChange={(e) => handleInputChange('intro', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="자신을 소개해주세요! 어떤 모임을 좋아하는지, 취미가 무엇인지 알려주세요."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.intro.length}/500자
                  </p>
                </>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[100px]">
                  {user.intro || '아직 자기소개가 없습니다. 편집을 통해 추가해보세요!'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">⚙️ 계정 설정</h3>
          
          <div className="space-y-4">
            {/* My Rooms */}
            <Link href="/rooms" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🏠</span>
                    <div>
                      <div className="font-medium text-gray-900">내가 만든 모임</div>
                      <div className="text-sm text-gray-600">생성한 모임들을 관리하세요</div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </Link>

            {/* My Requests */}
            <Link href="/requests" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📮</span>
                    <div>
                      <div className="font-medium text-gray-900">요청함</div>
                      <div className="text-sm text-gray-600">참가 요청과 받은 요청을 확인하세요</div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </Link>

            {/* Referral Program */}
            <div
              onClick={() => setShowReferralModal(true)}
              className="p-4 border border-amber-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🎁</span>
                  <div>
                    <div className="font-medium text-amber-900">친구 초대하기</div>
                    <div className="text-sm text-amber-600">친구를 초대하고 함께 혜택을 받아보세요</div>
                  </div>
                </div>
                <span className="text-amber-400">→</span>
              </div>
            </div>

            {/* Admin Panel (관리자만) */}
            {user.role === 'admin' && (
              <Link href="/admin" className="block">
                <div className="p-4 border border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">👑</span>
                      <div>
                        <div className="font-medium text-red-900">관리자 패널</div>
                        <div className="text-sm text-red-600">시스템 관리 및 사용자 관리</div>
                      </div>
                    </div>
                    <span className="text-red-400">→</span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <EnhancedButton
              onClick={handleSignOut}
              variant="danger"
              fullWidth
              icon="🚪"
              animation="scale"
            >
              로그아웃
            </EnhancedButton>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{brandMessages.appName} v1.0</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/legal/terms" className="hover:text-primary">이용약관</Link>
            <Link href="/legal/privacy" className="hover:text-primary">개인정보처리방침</Link>
          </div>
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