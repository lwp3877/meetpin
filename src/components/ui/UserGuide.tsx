/* src/components/ui/UserGuide.tsx */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import EnhancedButton from '@/components/ui/EnhancedButton'
import Toast from '@/components/ui/Toast'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  disabled?: boolean
  className?: string
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  trigger = 'hover',
  disabled = false,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        break
      case 'bottom':
        top = triggerRect.bottom + 8
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.left - tooltipRect.width - 8
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.right + 8
        break
    }

    // 화면 경계 체크 및 조정
    if (left < 8) left = 8
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8
    }
    if (top < 8) top = 8
    if (top + tooltipRect.height > viewport.height - 8) {
      top = viewport.height - tooltipRect.height - 8
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000
    })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
    }
  }, [isVisible, position])

  const handleShow = () => {
    if (!disabled) {
      setIsVisible(true)
    }
  }

  const handleHide = () => {
    setIsVisible(false)
  }

  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  const triggerProps = {
    ref: triggerRef,
    className,
    ...(trigger === 'hover' && {
      onMouseEnter: handleShow,
      onMouseLeave: handleHide
    }),
    ...(trigger === 'click' && {
      onClick: handleToggle
    }),
    ...(trigger === 'focus' && {
      onFocus: handleShow,
      onBlur: handleHide
    })
  }

  return (
    <>
      <div {...triggerProps}>
        {children}
      </div>
      
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs animate-in fade-in-50 zoom-in-95 duration-200"
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -z-10" 
               style={{
                 top: position === 'bottom' ? '-4px' : position === 'top' ? '100%' : '50%',
                 left: position === 'right' ? '-4px' : position === 'left' ? '100%' : '50%',
                 marginTop: position === 'top' ? '-4px' : position === 'bottom' ? '0' : '-4px',
                 marginLeft: position === 'left' ? '-4px' : position === 'right' ? '0' : '-4px'
               }}
          />
        </div>
      )}
    </>
  )
}

interface FeatureHighlightProps {
  targetId: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
  onComplete?: () => void
  isFirst?: boolean
  isLast?: boolean
  step?: number
  totalSteps?: number
}

export function FeatureHighlight({
  targetId,
  title,
  description,
  position = 'bottom',
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  isFirst = false,
  isLast = false,
  step = 1,
  totalSteps = 1
}: FeatureHighlightProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const targetElement = document.getElementById(targetId)
    if (!targetElement) return

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect()
      
      // 하이라이트 오버레이 위치
      setOverlayStyle({
        position: 'fixed',
        top: `${rect.top - 4}px`,
        left: `${rect.left - 4}px`,
        width: `${rect.width + 8}px`,
        height: `${rect.height + 8}px`,
        zIndex: 999,
        pointerEvents: 'none'
      })

      // 툴팁 위치
      let tooltipTop = 0
      let tooltipLeft = 0

      switch (position) {
        case 'top':
          tooltipTop = rect.top - 120
          tooltipLeft = rect.left + (rect.width / 2) - 150
          break
        case 'bottom':
          tooltipTop = rect.bottom + 16
          tooltipLeft = rect.left + (rect.width / 2) - 150
          break
        case 'left':
          tooltipTop = rect.top + (rect.height / 2) - 60
          tooltipLeft = rect.left - 316
          break
        case 'right':
          tooltipTop = rect.top + (rect.height / 2) - 60
          tooltipLeft = rect.right + 16
          break
      }

      setTooltipStyle({
        position: 'fixed',
        top: `${Math.max(16, tooltipTop)}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 316, tooltipLeft))}px`,
        zIndex: 1000
      })
    }

    setIsVisible(true)
    updatePosition()

    const handleResize = () => updatePosition()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [targetId, position])

  const handleClose = () => {
    setIsVisible(false)
    if (onSkip) onSkip()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-998" />
      
      {/* Highlight overlay */}
      <div
        style={overlayStyle}
        className="border-2 border-primary rounded-lg bg-primary bg-opacity-10 animate-pulse"
      />
      
      {/* Tooltip */}
      <div style={tooltipStyle} className="w-80">
        <div className="bg-white rounded-lg shadow-2xl p-6 border-2 border-primary">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-primary text-white text-sm px-2 py-1 rounded-full font-semibold">
                {step}/{totalSteps}
              </span>
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          {/* Content */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {!isFirst && onPrevious && (
                <EnhancedButton
                  onClick={onPrevious}
                  variant="ghost"
                  size="sm"
                >
                  이전
                </EnhancedButton>
              )}
            </div>
            
            <div className="flex space-x-2">
              <EnhancedButton
                onClick={handleClose}
                variant="outline"
                size="sm"
              >
                건너뛰기
              </EnhancedButton>
              
              <EnhancedButton
                onClick={isLast ? onComplete : onNext}
                variant="primary"
                size="sm"
                animation="scale"
              >
                {isLast ? '완료' : '다음'}
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface GuideStep {
  id: string
  targetId: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface FeatureTourProps {
  steps: GuideStep[]
  isActive: boolean
  onComplete: () => void
  onSkip?: () => void
}

export function FeatureTour({ steps, isActive, onComplete, onSkip }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
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
      onComplete()
    }
  }

  if (!isActive || steps.length === 0) return null

  const currentGuideStep = steps[currentStep]

  return (
    <FeatureHighlight
      key={`${currentGuideStep.id}-${currentStep}`}
      targetId={currentGuideStep.targetId}
      title={currentGuideStep.title}
      description={currentGuideStep.description}
      position={currentGuideStep.position}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      onComplete={onComplete}
      isFirst={currentStep === 0}
      isLast={currentStep === steps.length - 1}
      step={currentStep + 1}
      totalSteps={steps.length}
    />
  )
}

// Help center component
export function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false)

  const helpTopics = [
    {
      title: '🏠 모임 만들기',
      description: '새로운 모임을 생성하고 관리하는 방법',
      action: () => Toast.info('모임 만들기 가이드를 준비 중입니다!')
    },
    {
      title: '🙋‍♂️모임 참가하기',
      description: '관심있는 모임에 참가 신청하는 방법',
      action: () => Toast.info('참가 가이드를 준비 중입니다!')
    },
    {
      title: '💬 채팅하기',
      description: '매치된 상대방과 채팅하는 방법',
      action: () => Toast.info('채팅 가이드를 준비 중입니다!')
    },
    {
      title: '👤 프로필 관리',
      description: '프로필 설정 및 개인정보 관리',
      action: () => Toast.info('프로필 관리 가이드를 준비 중입니다!')
    },
    {
      title: '❓ 자주 묻는 질문',
      description: '사용자들이 자주 묻는 질문들',
      action: () => Toast.info('FAQ를 준비 중입니다!')
    }
  ]

  return (
    <>
      {/* Help trigger button */}
      <div className="fixed bottom-20 right-6 z-50">
        <Tooltip content="도움말" position="left">
          <EnhancedButton
            onClick={() => setIsOpen(true)}
            variant="secondary"
            size="md"
            icon="❓"
            rounded="full"
            shadow="lg"
            animation="bounce"
            className="w-12 h-12"
          >
            
          </EnhancedButton>
        </Tooltip>
      </div>

      {/* Help modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">도움말 센터</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {helpTopics.map((topic, index) => (
                <div
                  key={index}
                  onClick={topic.action}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 text-center">
                  더 궁금한 점이 있으시면 문의해주세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}