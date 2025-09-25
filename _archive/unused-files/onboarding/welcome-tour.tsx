/**
 * 신규 사용자를 위한 웰컴 투어 및 온보딩 시스템
 * 사용자 경험을 개선하고 플랫폼 이해도를 높이는 단계별 안내
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PremiumButton from '@/components/ui/premium-button'
import { MapPin, Users, Heart, Star, ChevronRight, X, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WelcomeTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '🎉 밋핀에 오신 것을 환영해요!',
    description: '위치 기반으로 새로운 인연을 만나는 특별한 공간입니다',
    content: (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-6 dark:from-emerald-900/20 dark:to-teal-900/20">
          <div className="space-y-3 text-center">
            <div className="text-4xl">🗺️</div>
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              지도에서 쉽게 만나요
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              원하는 장소에 핀을 찍고 근처 사람들과 연결되세요
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Badge
            variant="secondary"
            className="bg-amber-100 py-2 text-center text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          >
            🍻 술친구
          </Badge>
          <Badge
            variant="secondary"
            className="bg-red-100 py-2 text-center text-red-800 dark:bg-red-900/30 dark:text-red-300"
          >
            💪 운동메이트
          </Badge>
          <Badge
            variant="secondary"
            className="bg-purple-100 py-2 text-center text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
          >
            ✨ 취미친구
          </Badge>
        </div>
      </div>
    ),
    cta: '다음으로',
    highlight: 'brand',
  },
  {
    id: 'how-it-works',
    title: '💫 이렇게 만나요',
    description: '간단한 3단계로 새로운 인연을 시작해보세요',
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              1
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                방 찾기 또는 만들기
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                지도에서 근처 방을 찾거나 새로운 방을 만드세요
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
              2
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                참여 요청 보내기
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                마음에 드는 방에 간단한 메시지와 함께 요청해요
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
              3
            </div>
            <div>
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                실시간 채팅 시작
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                승인되면 1:1 채팅으로 만날 약속을 잡아요
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    cta: '다음으로',
    highlight: 'process',
  },
  {
    id: 'popular-spots',
    title: '🔥 인기 핫스팟',
    description: '지금 가장 활발한 지역들을 확인해보세요',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-3 text-center dark:from-orange-900/20 dark:to-red-900/20">
            <div className="mb-1 text-2xl">🏢</div>
            <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">강남역</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">52개 활성방</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-pink-50 to-red-50 p-3 text-center dark:from-pink-900/20 dark:to-red-900/20">
            <div className="mb-1 text-2xl">🎨</div>
            <div className="text-sm font-semibold text-pink-700 dark:text-pink-300">홍대입구</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">38개 활성방</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 text-center dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="mb-1 text-2xl">🌉</div>
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">한강공원</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">29개 활성방</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-center dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="mb-1 text-2xl">🏛️</div>
            <div className="text-sm font-semibold text-green-700 dark:text-green-300">이태원</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">24개 활성방</div>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold">💡 꿀팁</span>
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            인기 지역일수록 더 빠르게 매칭될 확률이 높아요!
          </p>
        </div>
      </div>
    ),
    cta: '다음으로',
    highlight: 'locations',
  },
  {
    id: 'safety-features',
    title: '🛡️ 안전한 만남',
    description: '밋핀에서는 이런 기능들로 안전을 보장해요',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
                프로필 인증
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                모든 사용자는 신원 확인을 거쳐요
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                신고 시스템
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                부적절한 행동은 즉시 신고할 수 있어요
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                공개 장소 만남
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                모든 만남은 공개된 안전한 장소에서
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center dark:from-emerald-900/20 dark:to-teal-900/20">
          <div className="mb-2 text-2xl">🏆</div>
          <h4 className="mb-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            평점 시스템
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            모든 만남 후 서로에 대한 후기를 남겨 더 안전한 커뮤니티를 만들어요
          </p>
        </div>
      </div>
    ),
    cta: '다음으로',
    highlight: 'safety',
  },
  {
    id: 'premium-benefits',
    title: '✨ 프리미엄 혜택',
    description: '더 많은 기회를 위한 특별한 기능들',
    content: (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-4 dark:border-yellow-700 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Gift className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                첫 가입 특혜
              </span>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-2xl font-black text-transparent">
              3일 무료 프리미엄!
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              지금 가입하면 프리미엄 부스트를 3일간 무료로 체험해보세요
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="space-y-1 text-center">
              <Star className="mx-auto h-6 w-6 fill-current text-purple-500" />
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">부스트</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">내 방이 상위 노출</p>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-1 text-center">
              <Heart className="mx-auto h-6 w-6 fill-current text-blue-500" />
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">우선 매칭</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">더 빠른 승인</p>
            </div>
          </div>
        </div>
      </div>
    ),
    cta: '지금 시작하기',
    highlight: 'premium',
  },
]

export function WelcomeTour({ isOpen, onClose, onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    onComplete()
    router.push('/map')
  }

  const handleSkip = () => {
    onClose()
    router.push('/map')
  }

  if (!isOpen) return null

  const currentStepData = TOUR_STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Tour Modal */}
      <Card
        className={`relative w-full max-w-md transform border-0 bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-300 dark:bg-gray-900/95 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 p-6 dark:from-emerald-800/20 dark:via-blue-800/20 dark:to-purple-800/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">{currentStepData.content}</div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 dark:bg-gray-800/50">
            {/* Progress */}
            <div className="mb-4 flex justify-center space-x-2">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-emerald-500'
                      : index < currentStep
                        ? 'bg-emerald-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                건너뛰기
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStep + 1} / {TOUR_STEPS.length}
                </span>
                <PremiumButton
                  onClick={handleNext}
                  variant={currentStep === TOUR_STEPS.length - 1 ? 'gradient' : 'primary'}
                  glow={currentStep === TOUR_STEPS.length - 1}
                  className="px-6"
                >
                  <span className="flex items-center gap-2">
                    {currentStepData.cta}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </PremiumButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WelcomeTour
