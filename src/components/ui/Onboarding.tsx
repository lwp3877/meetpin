/* src/components/ui/Onboarding.tsx */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { ModalAnimation } from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  image?: string
  action?: {
    label: string
    onClick: () => void
  }
  skipable?: boolean
}

interface OnboardingProps {
  isOpen: boolean
  onComplete: () => void
  onSkip?: () => void
  steps?: OnboardingStep[]
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '밋핀에 오신 것을 환영합니다! 🎉',
    description: '지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요!',
    icon: '📍',
    skipable: true
  },
  {
    id: 'create-profile',
    title: '프로필을 완성해주세요',
    description: '닉네임과 연령대를 설정하여 다른 사용자들에게 자신을 소개해보세요.',
    icon: '👤',
    action: {
      label: '프로필 설정하기',
      onClick: () => {}
    }
  },
  {
    id: 'explore-map',
    title: '지도에서 모임 찾기',
    description: '지도를 둘러보고 근처에서 열리는 다양한 모임들을 확인해보세요.',
    icon: '🗺️',
    action: {
      label: '지도 보기',
      onClick: () => {}
    }
  },
  {
    id: 'create-room',
    title: '첫 모임 만들기',
    description: '원하는 장소에 핀을 찍고 새로운 모임을 만들어보세요. 술친구, 운동 파트너, 취미 모임까지!',
    icon: '🎯',
    action: {
      label: '모임 만들기',
      onClick: () => {}
    }
  },
  {
    id: 'join-room',
    title: '모임에 참가하기',
    description: '관심있는 모임에 참가 신청을 보내고, 승인받으면 채팅을 시작할 수 있어요.',
    icon: '🙋‍♂️',
    skipable: true
  },
  {
    id: 'chat',
    title: '1:1 채팅으로 소통하기',
    description: '매치된 상대방과 실시간 채팅으로 만남을 조율해보세요.',
    icon: '💬',
    skipable: true
  }
]

export default function Onboarding({ 
  isOpen, 
  onComplete, 
  onSkip,
  steps = DEFAULT_STEPS 
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      handleComplete()
    }
    Toast.info('나중에 도움말에서 다시 볼 수 있어요')
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
      Toast.success('온보딩이 완료되었습니다! 🎉')
      
      // 온보딩 완료 상태를 로컬 스토리지에 저장
      localStorage.setItem('meetpin_onboarding_completed', 'true')
    }, 300)
  }

  const handleStepAction = (step: OnboardingStep) => {
    if (step.action?.onClick) {
      // 커스텀 액션이 있으면 실행
      step.action.onClick()
    } else {
      // 기본 라우팅 액션
      switch (step.id) {
        case 'create-profile':
          router.push('/profile')
          break
        case 'explore-map':
          router.push('/map')
          break
        case 'create-room':
          router.push('/room/new')
          break
        default:
          handleNext()
      }
    }
    handleComplete()
  }

  const current = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <ModalAnimation show={isVisible} onClose={handleSkip}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-auto p-8 m-4">
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Skip button */}
        {current.skipable && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm"
          >
            건너뛰기
          </button>
        )}

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="text-6xl mb-4 animate-bounce">
            {current.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {current.description}
          </p>

          {/* Image placeholder */}
          {current.image && (
            <div className="mb-6 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span className="text-gray-500">Image: {current.image}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {current.action ? (
              <EnhancedButton
                onClick={() => handleStepAction(current)}
                variant="primary"
                fullWidth
                size="lg"
                icon={current.icon}
                animation="glow"
              >
                {current.action.label}
              </EnhancedButton>
            ) : (
              <EnhancedButton
                onClick={handleNext}
                variant="primary"
                fullWidth
                size="lg"
                animation="scale"
              >
                {isLastStep ? '시작하기! 🚀' : '다음'}
              </EnhancedButton>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <EnhancedButton
                onClick={handlePrevious}
                variant="ghost"
                size="sm"
                disabled={currentStep === 0}
              >
                이전
              </EnhancedButton>
              
              <div className="flex space-x-2">
                <span className="text-sm text-gray-500">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>

              <EnhancedButton
                onClick={handleNext}
                variant="ghost"
                size="sm"
                disabled={isLastStep}
              >
                다음
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>
    </ModalAnimation>
  )
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false)

  useEffect(() => {
    // 온보딩이 완료되지 않은 경우에만 표시
    const isCompleted = localStorage.getItem('meetpin_onboarding_completed')
    if (!isCompleted) {
      setShouldShowOnboarding(true)
    }
  }, [])

  const completeOnboarding = () => {
    setShouldShowOnboarding(false)
    localStorage.setItem('meetpin_onboarding_completed', 'true')
  }

  const resetOnboarding = () => {
    setShouldShowOnboarding(true)
    localStorage.removeItem('meetpin_onboarding_completed')
  }

  return {
    shouldShowOnboarding,
    completeOnboarding,
    resetOnboarding
  }
}

// Onboarding trigger component
export function OnboardingTrigger() {
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding()

  if (!shouldShowOnboarding) return null

  return (
    <Onboarding
      isOpen={shouldShowOnboarding}
      onComplete={completeOnboarding}
      onSkip={completeOnboarding}
    />
  )
}