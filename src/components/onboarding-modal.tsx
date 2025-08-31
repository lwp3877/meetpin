/* 파일경로: src/components/onboarding-modal.tsx */
'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, ChevronLeft, MapPin, Users, MessageCircle } from 'lucide-react'
import { isFeatureEnabled, trackFeatureUsage } from '@/lib/features'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  content: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: '지도에서 모임 찾기',
    description: '내 주변 모임을 지도에서 쉽게 찾을 수 있어요',
    icon: <MapPin className="h-8 w-8 text-emerald-500" />,
    content: '지도를 보며 가까운 곳의 모임을 찾아보세요. 카테고리별로 필터링하여 원하는 모임을 쉽게 찾을 수 있습니다.',
  },
  {
    id: 2,
    title: '모임 참가 요청',
    description: '마음에 드는 모임에 참가 요청을 보내세요',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    content: '모임 상세 정보를 확인하고 호스트에게 참가 요청을 보낼 수 있어요. 간단한 메시지와 함께 자신을 어필해보세요.',
  },
  {
    id: 3,
    title: '채팅으로 소통',
    description: '승인되면 1:1 채팅으로 모임 준비를 해요',
    icon: <MessageCircle className="h-8 w-8 text-pink-500" />,
    content: '참가가 승인되면 호스트와 1:1 채팅을 시작할 수 있어요. 모임 장소나 시간 등 자세한 내용을 논의해보세요.',
  },
]

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_ONBOARDING_MODAL')) return

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('meetpin-onboarding-completed')
    if (!hasSeenOnboarding) {
      setIsOpen(true)
      trackFeatureUsage()
    }
  }, [])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      trackFeatureUsage()
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('meetpin-onboarding-completed', 'true')
    setIsOpen(false)
    trackFeatureUsage()
    router.push('/map')
  }

  const handleSkip = () => {
    localStorage.setItem('meetpin-onboarding-completed', 'true')
    setIsOpen(false)
    trackFeatureUsage()
  }

  if (!isFeatureEnabled('ENABLE_ONBOARDING_MODAL')) {
    return null
  }

  const currentStepData = ONBOARDING_STEPS[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-4 rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-900 p-0 overflow-hidden">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>

          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="sr-only">온보딩</DialogTitle>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  {currentStepData.icon}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentStepData.description}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                  {currentStepData.content}
                </p>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>

              <div className="flex space-x-2">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-emerald-500'
                        : index < currentStep
                        ? 'bg-emerald-300'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? '시작하기' : '다음'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Skip Button */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                건너뛰기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}