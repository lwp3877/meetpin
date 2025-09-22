/**
 * 신규 가입자를 위한 특별 혜택 및 인센티브 시스템
 * 사용자 유입을 촉진하고 초기 참여도를 높이는 컴포넌트
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
// Button component not used in current implementation
import { Badge } from '@/components/ui/badge'
import PremiumButton from '@/components/ui/premium-button'
import { Gift, Star, Users, Clock, Sparkles, Crown, Heart, Zap } from 'lucide-react'
import Link from 'next/link'

interface SignupIncentiveProps {
  isVisible?: boolean
  onCTAClick?: () => void
}

export function SignupIncentive({ isVisible = true, onCTAClick }: SignupIncentiveProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  const [userCount, setUserCount] = useState(2847)

  useEffect(() => {
    // 가짜 카운트다운 효과
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // 가짜 사용자 수 증가 효과
    const userTimer = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)

    return () => clearInterval(userTimer)
  }, [])

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

            {/* Social proof */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">
                      {userCount.toLocaleString()}명
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      오늘 새로 가입
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl">🔥</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">실시간 증가중</div>
                </div>
              </div>
            </div>

            {/* Limited time offer */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-red-200 dark:border-red-700">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="font-bold text-red-700 dark:text-red-300">한정 특가 마감까지</span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-2xl font-black">
                  <div className="text-center">
                    <div className="text-red-600 dark:text-red-400">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500">시간</div>
                  </div>
                  <div className="text-red-500">:</div>
                  <div className="text-center">
                    <div className="text-red-600 dark:text-red-400">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500">분</div>
                  </div>
                  <div className="text-red-500">:</div>
                  <div className="text-center">
                    <div className="text-red-600 dark:text-red-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500">초</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  놓치면 정말 후회하는 기회예요!
                </p>
              </div>
            </div>

            {/* Success stories */}
            <div className="space-y-3">
              <h4 className="font-bold text-center text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5 text-red-500 fill-current" />
                <span>실제 성공 후기</span>
                <Heart className="h-5 w-5 text-red-500 fill-current" />
              </h4>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      민
                    </div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">민주님</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "첫날부터 3명이랑 연락이 닿았어요! 부스트 효과가 정말 대단해요 ✨"
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      준
                    </div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">준호님</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "운동 메이트 찾기가 이렇게 쉬울 줄 몰랐어요! 지금 매주 만나고 있어요 💪"
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  정가 <span className="line-through">월 9,900원</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">
                  지금 무료!
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  3일 후 자동으로 해지돼요 (별도 요금 없음)
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
                    <span>지금 무료로 시작하기</span>
                    <Zap className="h-5 w-5" />
                  </span>
                </PremiumButton>
              </Link>

              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>언제든 해지 가능</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>100% 무료 체험</span>
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