/* src/components/ui/BoostModal.tsx */
'use client'

import { useState } from 'react'
import { X, Star, Zap, Clock, Users, TrendingUp, CreditCard, Check } from 'lucide-react'
import { 
  BOOST_PLANS, 
  type BoostPlanId, 
  formatPrice, 
  processBoostPayment,
  mockPaymentProcess 
} from '@/lib/services/stripe'
import { useAuth } from '@/lib/useAuth'
import { isDevelopmentMode } from '@/lib/config/mockData'
import toast from 'react-hot-toast'

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
  onBoostSuccess 
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
    } catch (error: any) {
      console.error('Boost purchase error:', error)
      toast.error('결제 중 오류가 발생했습니다')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  const selectedPlanData = BOOST_PLANS[selectedPlan]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-100 fill-current" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">모임 부스트</h2>
                <p className="opacity-90 text-sm">더 많은 사람들에게 노출시키세요!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* 모임 정보 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">부스트할 모임</h3>
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-gray-800">{roomTitle}</span>
            </div>
          </div>

          {/* 부스트 효과 */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              부스트 효과
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">더 많은 노출</p>
                <p className="text-xs text-blue-700">상단에 우선 표시</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <p className="text-sm font-medium text-blue-900">특별한 표시</p>
                <p className="text-xs text-blue-700">부스트 배지 표시</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">즉시 활성화</p>
                <p className="text-xs text-blue-700">결제 후 바로 적용</p>
              </div>
            </div>
          </div>

          {/* 플랜 선택 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">부스트 기간 선택</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(BOOST_PLANS).map(([planId, plan]) => {
                const isSelected = selectedPlan === planId
                const isPopular = plan.popular
                
                return (
                  <div
                    key={planId}
                    className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(planId as BoostPlanId)}
                  >
                    {isPopular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          인기
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {isSelected && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-2xl font-black text-gray-900">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {plan.duration}일 동안
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="text-xs text-gray-700 flex items-center">
                            <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start space-x-2">
              <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 fill-current" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">결제 후 즉시 적용됩니다</p>
                <ul className="space-y-1 text-xs">
                  <li>• 부스트는 결제 완료 후 바로 활성화됩니다</li>
                  <li>• 모임 목록 상단에 우선 노출됩니다</li>
                  <li>• ⭐ 부스트 배지가 표시됩니다</li>
                  <li>• {isDevelopmentMode ? '개발 모드: 실제 결제되지 않습니다' : '안전한 Stripe 결제 시스템을 사용합니다'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-6 flex space-x-4">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            나중에
          </button>
          <button
            onClick={handleBoostPurchase}
            disabled={processing || !user}
            className="flex-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isDevelopmentMode ? '처리 중...' : '결제 페이지로 이동 중...'}</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>
                  {formatPrice(selectedPlanData.price)} 결제하기
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}