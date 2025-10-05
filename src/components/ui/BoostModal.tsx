/* src/components/ui/BoostModal.tsx */
'use client'

import { useState } from 'react'
import X from 'lucide-react/dist/esm/icons/x'
import Star from 'lucide-react/dist/esm/icons/star'
import Zap from 'lucide-react/dist/esm/icons/zap'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Users from 'lucide-react/dist/esm/icons/users'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import CreditCard from 'lucide-react/dist/esm/icons/credit-card'
import Check from 'lucide-react/dist/esm/icons/check'
import {
  BOOST_PLANS,
  type BoostPlanId,
  formatPrice,
  processBoostPayment,
  mockPaymentProcess,
} from '@/lib/services/stripe'
import { useAuth } from '@/lib/useAuth'
import { isDevelopmentMode } from '@/lib/config/flags'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

interface BoostModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
  onBoostSuccess?: () => void
}

export function BoostModal({
  isOpen,
  onClose,
  roomId,
  roomTitle,
  onBoostSuccess,
}: BoostModalProps) {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<BoostPlanId>('3')
  const [processing, setProcessing] = useState(false)

  const handleBoostPurchase = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setProcessing(true)

    try {
      let result

      if (isDevelopmentMode) {
        // 개발 모드에서는 모의 결제 처리
        result = await mockPaymentProcess(roomId, selectedPlan)

        if (result.success) {
          toast.success('부스트가 활성화되었습니다! 🚀')
          onBoostSuccess?.()
          onClose()
        } else {
          toast.error(result.error || '결제에 실패했습니다')
        }
      } else {
        // 프로덕션 모드에서는 실제 Stripe 결제
        result = await processBoostPayment(roomId, selectedPlan)

        if (!result.success) {
          toast.error(result.error || '결제 처리에 실패했습니다')
        }
        // 성공시에는 Stripe으로 리다이렉트됨
      }
    } catch (error: unknown) {
      logger.error('Boost purchase error:', { error: error instanceof Error ? error.message : String(error) })
      toast.error('결제 중 오류가 발생했습니다')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  const selectedPlanData = BOOST_PLANS[selectedPlan]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Star className="h-6 w-6 fill-current text-yellow-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">모임 부스트</h2>
                <p className="text-sm opacity-90">더 많은 사람들에게 노출시키세요!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="rounded-full p-2 transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-140px)] space-y-6 overflow-y-auto p-6">
          {/* 모임 정보 */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">부스트할 모임</h3>
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-gray-800">{roomTitle}</span>
            </div>
          </div>

          {/* 부스트 효과 */}
          <div className="rounded-2xl bg-blue-50 p-6">
            <h3 className="mb-4 flex items-center font-bold text-blue-900">
              <TrendingUp className="mr-2 h-5 w-5" />
              부스트 효과
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">더 많은 노출</p>
                <p className="text-xs text-blue-700">상단에 우선 표시</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                  <Star className="h-6 w-6 fill-current text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">특별한 표시</p>
                <p className="text-xs text-blue-700">부스트 배지 표시</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">즉시 활성화</p>
                <p className="text-xs text-blue-700">결제 후 바로 적용</p>
              </div>
            </div>
          </div>

          {/* 플랜 선택 */}
          <div>
            <h3 className="mb-4 font-bold text-gray-900">부스트 기간 선택</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(BOOST_PLANS).map(([planId, plan]) => {
                const isSelected = selectedPlan === planId
                const isPopular = plan.popular

                return (
                  <div
                    key={planId}
                    className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(planId as BoostPlanId)}
                  >
                    {isPopular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                        <div className="rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-3 py-1 text-xs font-bold text-white">
                          인기
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center">
                        {isSelected && (
                          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                      </div>

                      <div className="mb-3">
                        <div className="text-2xl font-black text-gray-900">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-sm text-gray-600">{plan.duration}일 동안</div>
                      </div>

                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-700">
                            <Check className="mr-1 h-3 w-3 flex-shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start space-x-2">
              <Star className="mt-0.5 h-5 w-5 flex-shrink-0 fill-current text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="mb-1 font-medium">결제 후 즉시 적용됩니다</p>
                <ul className="space-y-1 text-xs">
                  <li>• 부스트는 결제 완료 후 바로 활성화됩니다</li>
                  <li>• 모임 목록 상단에 우선 노출됩니다</li>
                  <li>• ⭐ 부스트 배지가 표시됩니다</li>
                  <li>
                    •{' '}
                    {isDevelopmentMode
                      ? '개발 모드: 실제 결제되지 않습니다'
                      : '안전한 Stripe 결제 시스템을 사용합니다'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex space-x-4 border-t border-gray-100 bg-white/95 p-6 backdrop-blur-md">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            나중에
          </button>
          <button
            onClick={handleBoostPurchase}
            disabled={processing || !user}
            className="flex flex-2 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 font-bold text-white shadow-lg transition-all hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{isDevelopmentMode ? '처리 중...' : '결제 페이지로 이동 중...'}</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>{formatPrice(selectedPlanData.price)} 결제하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
