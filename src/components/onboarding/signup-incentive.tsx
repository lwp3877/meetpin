/**
 * 신규 가입자를 위한 특별 혜택 및 인센티브 시스템
 * 사용자 유입을 촉진하고 초기 참여도를 높이는 컴포넌트
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PremiumButton from '@/components/ui/premium-button'
import { Gift, Star, Users, Sparkles, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

interface SignupIncentiveProps {
  isVisible?: boolean
  onCTAClick?: () => void
}

export function SignupIncentive({ isVisible = true, onCTAClick }: SignupIncentiveProps) {
  // 모든 허위 정보 제거 - 실제 데이터로 교체 예정

  if (!isVisible) return null

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-yellow-200 dark:border-yellow-700 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header with animated background */}
          <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/80 via-orange-500/80 to-red-500/80 animate-pulse"></div>
            <div className="relative z-10 text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Gift className="h-8 w-8 animate-bounce" />
                <span className="text-2xl font-black">첫 가입 특혜</span>
                <Gift className="h-8 w-8 animate-bounce" />
              </div>
              <div className="text-4xl font-black">
                프리미엄 3일 무료!
              </div>
              <p className="text-yellow-100 font-medium">
                지금 가입하면 모든 프리미엄 기능을 무료로 체험하세요
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6 space-y-6">
            {/* Premium benefits showcase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-1">부스트 효과</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">내 방이 최상단 노출</p>
                <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  10배 더 빠른 매칭
                </Badge>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-1">VIP 혜택</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">우선 승인 & 특별 뱃지</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  프리미엄 사용자
                </Badge>
              </div>
            </div>

            {/* 실제 서비스 가치 제안 - 허위 정보 제거됨 */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                    새로운 만남의 시작
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    지도 기반으로 내 주변 사람들과 안전한 만남을 시작해보세요
                  </div>
                </div>
              </div>
            </div>

            {/* 실제 서비스 특징 강조 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
              <div className="text-center space-y-3">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">밋핀 서비스 특징</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>지도 기반 위치 매칭</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>실시간 채팅 시스템</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>안전한 모임 환경</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>카테고리별 모임 분류</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section - 허위 구독 정보 제거 */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">
                  지금 시작하기
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  무료로 밋핀을 시작해보세요
                </div>
              </div>

              <Link href="/auth/signup">
                <PremiumButton
                  variant="gradient"
                  glow
                  className="w-full py-4 text-lg font-bold shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300"
                  onClick={onCTAClick}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>밋핀 시작하기</span>
                    <Zap className="h-5 w-5" />
                  </span>
                </PremiumButton>
              </Link>

              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>회원가입 무료</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>기본 기능 무료</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>안전한 만남 보장</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupIncentive