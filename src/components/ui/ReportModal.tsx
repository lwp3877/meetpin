/* src/components/ui/ReportModal.tsx */
'use client'

import { useState } from 'react'
import { X, AlertTriangle, Shield, MessageSquare, User } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { isDevelopmentMode } from '@/lib/config/mockData'
import toast from 'react-hot-toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportType: 'user' | 'room' | 'emergency'
  targetId?: string // 신고 대상 ID (사용자 ID 또는 방 ID)
  targetName?: string // 신고 대상 이름
  roomId?: string // 방에서 발생한 신고인 경우
  location?: { latitude: number; longitude: number; address?: string }
  onReportSuccess?: () => void
}

const REPORT_CATEGORIES = {
  user: [
    { id: 'harassment', label: '괴롭힘/욕설', description: '부적절한 언어나 괴롭힘 행위' },
    { id: 'inappropriate_behavior', label: '부적절한 행동', description: '성희롱, 스토킹 등 불쾌한 행동' },
    { id: 'fraud', label: '사기/거짓 정보', description: '거짓 정보 제공이나 사기 행위' },
    { id: 'spam', label: '스팸/광고', description: '무분별한 광고나 스팸 메시지' },
    { id: 'other', label: '기타', description: '위에 해당하지 않는 기타 문제' }
  ],
  room: [
    { id: 'inappropriate_content', label: '부적절한 내용', description: '불법적이거나 부적절한 모임 내용' },
    { id: 'false_information', label: '거짓 정보', description: '잘못된 장소나 시간 정보' },
    { id: 'dangerous_activity', label: '위험한 활동', description: '안전하지 않은 활동이나 장소' },
    { id: 'discrimination', label: '차별/혐오', description: '특정 집단에 대한 차별이나 혐오' },
    { id: 'other', label: '기타', description: '위에 해당하지 않는 기타 문제' }
  ],
  emergency: [
    { id: 'harassment', label: '괴롭힘/폭력', description: '신체적 또는 언어적 폭력' },
    { id: 'violence', label: '폭행/위협', description: '물리적 폭력이나 위협' },
    { id: 'medical_emergency', label: '의료 응급상황', description: '의료진이 필요한 응급상황' },
    { id: 'safety_concern', label: '안전 우려', description: '즉시 조치가 필요한 안전 문제' },
    { id: 'fraud', label: '사기/범죄', description: '금전적 사기나 기타 범죄 행위' },
    { id: 'other', label: '기타 긴급사항', description: '즉시 처리가 필요한 기타 문제' }
  ]
}

const PRIORITY_LEVELS = [
  { id: 'low', label: '낮음', description: '일반적인 문제', color: 'text-gray-600' },
  { id: 'medium', label: '보통', description: '빠른 처리 필요', color: 'text-yellow-600' },
  { id: 'high', label: '높음', description: '긴급 처리 필요', color: 'text-orange-600' },
  { id: 'critical', label: '매우 높음', description: '즉시 처리 필요', color: 'text-red-600' }
]

export function ReportModal({ 
  isOpen, 
  onClose, 
  reportType,
  targetId,
  targetName,
  roomId,
  location,
  onReportSuccess 
}: ReportModalProps) {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>(reportType === 'emergency' ? 'high' : 'medium')
  const [anonymousReport, setAnonymousReport] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(location || null)

  const categories = REPORT_CATEGORIES[reportType] || []
  const isEmergency = reportType === 'emergency'

  const getLocation = () => {
    if (currentLocation) return

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          toast.success('현재 위치가 설정되었습니다')
        },
        (error) => {
          console.warn('Geolocation error:', error)
          toast.error('위치 정보를 가져올 수 없습니다')
        }
      )
    } else {
      toast.error('이 브라우저는 위치 서비스를 지원하지 않습니다')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('신고 유형을 선택해주세요')
      return
    }

    if (description.trim().length < 10) {
      toast.error('신고 내용을 최소 10자 이상 입력해주세요')
      return
    }

    if (!user && !anonymousReport && !isEmergency) {
      toast.error('로그인이 필요하거나 익명 신고를 선택해주세요')
      return
    }

    setSubmitting(true)

    try {
      let endpoint = ''
      let requestData: any = {}

      if (isEmergency) {
        // 긴급 신고 API
        endpoint = '/api/emergency-report'
        requestData = {
          reportType: selectedCategory,
          description: description.trim(),
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude,
          locationAddress: currentLocation?.address,
          roomId: roomId,
          reportedUserId: targetId,
          priority,
          anonymousReport: anonymousReport || !user
        }
      } else {
        // 일반 신고 API (reports 테이블)
        endpoint = '/api/reports'
        requestData = {
          reportType: selectedCategory,
          description: description.trim(),
          targetType: reportType === 'user' ? 'user' : 'room',
          targetId: targetId,
          roomId: roomId,
          anonymousReport
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '신고 처리에 실패했습니다')
      }

      if (isDevelopmentMode) {
        // 개발 모드에서는 성공 가정
        toast.success(isEmergency ? 
          '긴급 신고가 접수되었습니다. 즉시 검토하겠습니다.' : 
          '신고가 접수되었습니다. 검토 후 조치하겠습니다.'
        )
      } else {
        toast.success(result.message || '신고가 성공적으로 접수되었습니다')
      }

      onReportSuccess?.()
      onClose()
      
      // 폼 초기화
      setSelectedCategory('')
      setDescription('')
      setPriority(isEmergency ? 'high' : 'medium')
      setAnonymousReport(false)
      
    } catch (error: any) {
      console.error('Report submission error:', error)
      toast.error(error.message || '신고 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const getModalIcon = () => {
    switch (reportType) {
      case 'emergency':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'user':
        return <User className="w-6 h-6 text-orange-500" />
      case 'room':
        return <MessageSquare className="w-6 h-6 text-blue-500" />
      default:
        return <Shield className="w-6 h-6 text-gray-500" />
    }
  }

  const getModalTitle = () => {
    switch (reportType) {
      case 'emergency':
        return '긴급 신고'
      case 'user':
        return '사용자 신고'
      case 'room':
        return '모임 신고'
      default:
        return '신고하기'
    }
  }

  const getModalColor = () => {
    switch (reportType) {
      case 'emergency':
        return 'from-red-500 to-red-600'
      case 'user':
        return 'from-orange-500 to-orange-600'
      case 'room':
        return 'from-blue-500 to-blue-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getModalColor()} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {getModalIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{getModalTitle()}</h2>
                {targetName && (
                  <p className="opacity-90 text-sm">대상: {targetName}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* 긴급 신고 안내 */}
          {isEmergency && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">긴급 상황 신고</p>
                  <p className="text-xs">
                    생명이 위험하거나 즉시 도움이 필요한 경우 112 또는 119에 먼저 신고해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 신고 유형 선택 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">신고 유형</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`block p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* 신고 내용 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">신고 내용</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구체적인 신고 내용을 입력해주세요. (최소 10자)"
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/1000자
            </div>
          </div>

          {/* 긴급도 선택 (긴급 신고인 경우) */}
          {isEmergency && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">긴급도</h3>
              <div className="space-y-2">
                {PRIORITY_LEVELS.map((level) => (
                  <label
                    key={level.id}
                    className={`block p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      priority === level.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level.id}
                      checked={priority === level.id}
                      onChange={(e) => setPriority(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`font-medium ${level.color}`}>{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 위치 정보 (긴급 신고인 경우) */}
          {isEmergency && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">위치 정보</h3>
              {currentLocation ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-800">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">위치가 설정되었습니다</span>
                  </div>
                  {currentLocation.address && (
                    <p className="text-xs text-green-700 mt-1">{currentLocation.address}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={getLocation}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <MapPin className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">현재 위치 설정 (선택사항)</span>
                </button>
              )}
            </div>
          )}

          {/* 익명 신고 옵션 */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymousReport}
              onChange={(e) => setAnonymousReport(e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              익명으로 신고하기
            </label>
          </div>

          {/* 안내사항 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">신고 관련 안내</p>
                <ul className="space-y-1 text-xs">
                  <li>• 허위 신고는 서비스 이용에 제재를 받을 수 있습니다</li>
                  <li>• 신고 내용은 관리팀에서 검토 후 조치됩니다</li>
                  <li>• {isEmergency ? '긴급 신고는 24시간 내에 처리됩니다' : '일반 신고는 2-3일 내에 처리됩니다'}</li>
                  <li>• 개인정보는 신고 처리 목적으로만 사용됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCategory || description.trim().length < 10}
            className={`flex-2 px-6 py-3 bg-gradient-to-r ${getModalColor()} text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>{isEmergency ? '긴급 신고' : '신고하기'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}