'use client'

import React, { useState } from 'react'
import { useConsent } from '@/lib/consent'
import { CONSENT_CATEGORIES } from '@/lib/consent/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp,
  Cookie,
  X,
} from 'lucide-react'

interface CookieBannerProps {
  className?: string
  position?: 'bottom' | 'top'
  theme?: 'light' | 'dark' | 'auto'
}

export default function CookieBanner({
  className = '',
  position = 'bottom',
  theme = 'auto',
}: CookieBannerProps) {
  const { shouldShowBanner, acceptAll, rejectAll, dismissBanner } = useConsent()

  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 배너가 표시되지 않아야 하면 null 반환
  if (!shouldShowBanner) {
    return null
  }

  const handleAcceptAll = async () => {
    setIsLoading(true)
    try {
      await acceptAll()
    } catch (error) {
      console.error('Failed to accept all cookies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectAll = async () => {
    setIsLoading(true)
    try {
      await rejectAll()
    } catch (error) {
      console.error('Failed to reject all cookies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    dismissBanner()
  }

  const positionClasses = {
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
    top: 'fixed top-0 left-0 right-0 z-50',
  }

  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-900 border-gray-700 text-white',
    auto: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
  }

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <Card className={`m-4 ${themeClasses[theme]} border shadow-lg`}>
        <CardContent className="p-6">
          {/* 헤더 */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center">
              <Cookie className="mr-3 h-6 w-6 text-amber-500" />
              <div>
                <h3 className="text-lg font-semibold">🍪 쿠키 및 개인정보 설정</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  더 나은 서비스 제공을 위해 쿠키를 사용합니다
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 기본 설명 */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              MeetPin은 웹사이트 기능과 서비스 개선을 위해 쿠키와 유사 기술을 사용합니다.
              <strong> 필수 쿠키는 항상 활성화</strong>되며, 분석 및 마케팅 쿠키는 선택할 수
              있습니다.
            </p>
          </div>

          {/* 상세 정보 토글 */}
          {showDetails && (
            <div className="mb-6 space-y-4">
              {/* 필수 쿠키 */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-green-500" />
                    <h4 className="font-medium">{CONSENT_CATEGORIES.necessary.title}</h4>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      필수
                    </Badge>
                  </div>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    항상 활성화
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {CONSENT_CATEGORIES.necessary.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <strong>포함 기능:</strong> {CONSENT_CATEGORIES.necessary.examples.join(', ')}
                </div>
              </div>

              {/* 분석 쿠키 */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">{CONSENT_CATEGORIES.analytics.title}</h4>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      선택
                    </Badge>
                  </div>
                </div>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {CONSENT_CATEGORIES.analytics.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <strong>포함 기능:</strong> {CONSENT_CATEGORIES.analytics.examples.join(', ')}
                </div>
              </div>

              {/* 마케팅 쿠키 */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">{CONSENT_CATEGORIES.marketing.title}</h4>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      선택
                    </Badge>
                  </div>
                </div>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {CONSENT_CATEGORIES.marketing.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <strong>포함 기능:</strong> {CONSENT_CATEGORIES.marketing.examples.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* 모두 허용 */}
            <Button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 flex-1 text-white"
            >
              {isLoading ? '처리 중...' : '모두 허용'}
            </Button>

            {/* 필수만 허용 */}
            <Button
              onClick={handleRejectAll}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? '처리 중...' : '필수만 허용'}
            </Button>

            {/* 상세 설정 */}
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="flex-1 sm:flex-none"
            >
              <Settings className="mr-2 h-4 w-4" />
              {showDetails ? (
                <>
                  간단히 보기
                  <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  상세 설정
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* 추가 링크 */}
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              <a
                href="/legal/privacy"
                className="hover:text-primary-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보처리방침
              </a>
              <a
                href="/legal/cookie-policy"
                className="hover:text-primary-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                쿠키 정책
              </a>
              <a
                href="/legal/terms"
                className="hover:text-primary-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                이용약관
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
