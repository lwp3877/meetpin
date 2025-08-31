/* src/components/ui/ReferralSystem.tsx */
'use client'

import React, { useState, useEffect } from 'react'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { ModalAnimation, CardAnimation } from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/lib/useAuth'

interface ReferralData {
  referralCode: string
  referralLink: string
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  rewards: {
    points: number
    level: string
    nextLevelRequirement: number
  }
}

interface ReferralModalProps {
  isOpen: boolean
  onClose: () => void
  userData?: {
    nickname?: string
    referralCode?: string
  }
}

export function ReferralModal({ isOpen, onClose, userData }: ReferralModalProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [copiedText, setCopiedText] = useState('')

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    if (isOpen && userData) {
      setReferralData({
        referralCode: userData.referralCode || 'MEET' + userData.nickname?.toUpperCase()?.slice(0, 4) || 'USER',
        referralLink: `https://meetpin.app/invite/${userData.referralCode || 'demo'}`,
        totalReferrals: 3,
        successfulReferrals: 2,
        pendingReferrals: 1,
        rewards: {
          points: 150,
          level: 'Bronze',
          nextLevelRequirement: 5
        }
      })
    }
  }, [isOpen, userData])

  const handleCopyCode = async () => {
    if (!referralData) return
    
    try {
      await navigator.clipboard.writeText(referralData.referralCode)
      setCopiedText('code')
      Toast.success('추천 코드가 복사되었습니다!')
      setTimeout(() => setCopiedText(''), 2000)
    } catch {
      Toast.error('복사에 실패했습니다')
    }
  }

  const handleCopyLink = async () => {
    if (!referralData) return
    
    try {
      await navigator.clipboard.writeText(referralData.referralLink)
      setCopiedText('link')
      Toast.success('추천 링크가 복사되었습니다!')
      setTimeout(() => setCopiedText(''), 2000)
    } catch {
      Toast.error('복사에 실패했습니다')
    }
  }

  const handleShare = async () => {
    if (!referralData) return

    const shareData = {
      title: '밋핀에서 새로운 친구들을 만나보세요!',
      text: `${userData?.nickname || '친구'}님이 밋핀에 초대합니다! 지도에서 모임을 만들고 근처 사람들과 만나보세요.`,
      url: referralData.referralLink,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        Toast.success('공유되었습니다!')
      } catch {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      // Web Share API가 지원되지 않는 경우 링크 복사
      handleCopyLink()
    }
  }

  if (!referralData) return null

  return (
    <ModalAnimation show={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg mx-auto m-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-deep p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">친구 초대하기</h2>
              <p className="text-primary-light">친구를 초대하고 함께 밋핀을 즐겨보세요!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 리워드 현황 */}
          <CardAnimation delay={0}>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-amber-900">🏆 나의 추천 현황</h3>
                <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-sm font-semibold">
                  {referralData.rewards.level}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-amber-900">{referralData.totalReferrals}</div>
                  <div className="text-xs text-amber-700">총 초대</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{referralData.successfulReferrals}</div>
                  <div className="text-xs text-amber-700">가입 완료</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-amber-900">{referralData.rewards.points}</div>
                  <div className="text-xs text-amber-700">포인트</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-amber-700 mb-1">
                  <span>다음 레벨까지</span>
                  <span>{referralData.successfulReferrals}/{referralData.rewards.nextLevelRequirement}</span>
                </div>
                <div className="bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(referralData.successfulReferrals / referralData.rewards.nextLevelRequirement) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardAnimation>

          {/* 추천 코드 */}
          <CardAnimation delay={100}>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📱 추천 코드</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg text-center font-bold text-primary">
                  {referralData.referralCode}
                </div>
                <EnhancedButton
                  onClick={handleCopyCode}
                  variant={copiedText === 'code' ? 'success' : 'outline'}
                  size="md"
                  icon={copiedText === 'code' ? '✅' : '📋'}
                  animation="scale"
                >
                  {copiedText === 'code' ? '복사됨' : '복사'}
                </EnhancedButton>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                친구가 가입할 때 이 코드를 입력하면 둘 다 혜택을 받을 수 있어요!
              </p>
            </div>
          </CardAnimation>

          {/* 추천 링크 */}
          <CardAnimation delay={200}>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🔗 추천 링크</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 truncate">
                  {referralData.referralLink}
                </div>
                <EnhancedButton
                  onClick={handleCopyLink}
                  variant={copiedText === 'link' ? 'success' : 'outline'}
                  size="md"
                  icon={copiedText === 'link' ? '✅' : '📋'}
                  animation="scale"
                >
                  {copiedText === 'link' ? '복사됨' : '복사'}
                </EnhancedButton>
              </div>
            </div>
          </CardAnimation>

          {/* 공유 버튼들 */}
          <CardAnimation delay={300}>
            <div className="grid grid-cols-2 gap-3">
              <EnhancedButton
                onClick={handleShare}
                variant="primary"
                fullWidth
                icon="📤"
                animation="glow"
              >
                바로 공유하기
              </EnhancedButton>
              
              <EnhancedButton
                onClick={() => {
                  const message = `친구야! 밋핀에서 새로운 사람들과 만나보자! 내 추천코드: ${referralData.referralCode} 또는 링크: ${referralData.referralLink}`
                  const url = `https://open.kakao.com/o/s7QNHPxe?message=${encodeURIComponent(message)}`
                  window.open(url, '_blank')
                }}
                variant="warning"
                fullWidth
                icon="💬"
                animation="pulse"
              >
                카카오톡 공유
              </EnhancedButton>
            </div>
          </CardAnimation>

          {/* 혜택 안내 */}
          <CardAnimation delay={400}>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🎁 추천 혜택</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                  친구 가입 시: 나와 친구 각각 100 포인트
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                  친구 첫 모임 참가 시: 추가 50 포인트
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                  5명 추천 달성 시: 실버 배지 + 부스트 쿠폰
                </li>
              </ul>
            </div>
          </CardAnimation>
        </div>
      </div>
    </ModalAnimation>
  )
}

// 추천 코드 입력 컴포넌트
interface ReferralInputProps {
  onSubmit: (code: string) => void
  isLoading?: boolean
}

export function ReferralInput({ onSubmit, isLoading = false }: ReferralInputProps) {
  const [referralCode, setReferralCode] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (referralCode.trim()) {
      onSubmit(referralCode.trim())
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎁</span>
          <span className="font-medium text-purple-900">친구 추천코드가 있나요?</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          {isExpanded ? '접기' : '입력하기'}
        </button>
      </div>

      {isExpanded && (
        <CardAnimation delay={0} className="mt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="추천코드를 입력해주세요"
              className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={10}
            />
            <EnhancedButton
              onClick={handleSubmit}
              disabled={!referralCode.trim() || isLoading}
              loading={isLoading}
              variant="success"
              size="md"
              icon="✨"
            >
              적용
            </EnhancedButton>
          </div>
          <p className="text-sm text-purple-600 mt-2">
            추천코드를 입력하면 100 포인트를 받을 수 있어요!
          </p>
        </CardAnimation>
      )}
    </div>
  )
}

// 추천 플로팅 버튼
export function ReferralFloatingButton() {
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      <div className="fixed bottom-32 right-6 z-40">
        <EnhancedButton
          onClick={() => setShowModal(true)}
          variant="secondary"
          size="md"
          icon="🎁"
          rounded="full"
          shadow="lg"
          animation="pulse"
          className="w-12 h-12"
        >
          
        </EnhancedButton>
      </div>

      <ReferralModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userData={{
          nickname: user.nickname,
          referralCode: user.referral_code
        }}
      />
    </>
  )
}

// 추천 프로그램 페이지 컴포넌트
export function ReferralProgram() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const benefits = [
    {
      icon: '🎯',
      title: '친구 초대하기',
      description: '추천코드나 링크로 친구들을 초대해보세요',
      reward: '각각 100포인트'
    },
    {
      icon: '🚀',
      title: '첫 모임 참가',
      description: '초대한 친구가 첫 모임에 참가하면',
      reward: '추가 50포인트'
    },
    {
      icon: '👑',
      title: '레벨 업 혜택',
      description: '5명 이상 초대 시 특별 혜택',
      reward: '부스트 쿠폰 + 배지'
    },
    {
      icon: '🎉',
      title: '이벤트 참여',
      description: '특별 이벤트와 경품 추첨 기회',
      reward: '한정판 굿즈'
    }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎁</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">친구 추천 프로그램</h1>
        <p className="text-gray-600">
          친구들을 밋핀에 초대하고 함께 특별한 혜택을 받아보세요!
        </p>
      </div>

      {/* 혜택 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {benefits.map((benefit, index) => (
          <CardAnimation key={index} delay={index * 100}>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:border-primary hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
              <div className="bg-primary-light px-3 py-1 rounded-full text-primary text-sm font-semibold">
                {benefit.reward}
              </div>
            </div>
          </CardAnimation>
        ))}
      </div>

      {/* CTA 버튼 */}
      <CardAnimation delay={500} className="text-center">
        <EnhancedButton
          onClick={() => setShowModal(true)}
          variant="primary"
          size="xl"
          icon="🚀"
          animation="glow"
          className="px-12"
        >
          지금 친구 초대하기
        </EnhancedButton>
      </CardAnimation>

      <ReferralModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userData={{
          nickname: user?.nickname,
          referralCode: user?.referral_code
        }}
      />
    </div>
  )
}