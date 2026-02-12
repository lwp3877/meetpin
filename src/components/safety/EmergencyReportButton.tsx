'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/Toast'

interface EmergencyReportButtonProps {
  reportedUserId?: string
  roomId?: string
  className?: string
}

export function EmergencyReportButton({
  reportedUserId,
  roomId,
  className = '',
}: EmergencyReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emergencyType, setEmergencyType] = useState('safety_threat')
  const [description, setDescription] = useState('')
  const [locationInfo, setLocationInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // ESC 닫기 + 열릴 때 첫 포커스 가능 요소로 이동
  useEffect(() => {
    if (!isModalOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    document.addEventListener('keydown', handleEsc)

    // 모달 내부 첫 포커스 가능 요소로 이동
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'select, input, textarea, button, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    return () => document.removeEventListener('keydown', handleEsc)
  }, [isModalOpen])

  // 간단한 포커스 트랩: Tab이 모달 밖으로 나가지 않도록
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'select, input, textarea, button, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const handleSubmit = async () => {
    if (!description.trim()) {
      Toast.error('신고 내용을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/safety/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          room_id: roomId,
          emergency_type: emergencyType,
          description,
          location_info: locationInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('신고 접수 실패')
      }

      Toast.success('긴급 신고가 접수되었습니다. 관리자가 빠르게 조치하겠습니다.')
      setIsModalOpen(false)
      setDescription('')
      setLocationInfo('')
    } catch (_error) {
      Toast.error('신고 접수 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className={`border-red-300 text-red-600 hover:bg-red-50 ${className}`}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        긴급 신고
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="emergency-report-title" onKeyDown={handleKeyDown}>
          <div ref={modalRef} className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
                <h2 id="emergency-report-title" className="text-xl font-bold">긴급 신고</h2>
              </div>

              <p className="text-sm text-gray-600">
                심각한 안전 위협이나 부적절한 행동을 신고해주세요. 관리자가 즉시 확인하고 조치하겠습니다.
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">신고 유형</label>
                <select
                  value={emergencyType}
                  onChange={e => setEmergencyType(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="safety_threat">안전 위협</option>
                  <option value="harassment">괴롭힘/성희롱</option>
                  <option value="fraud">사기/금전 요구</option>
                  <option value="inappropriate_behavior">부적절한 행동</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상세 내용 *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  placeholder="어떤 일이 있었는지 상세히 설명해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  장소 정보 (선택)
                </label>
                <input
                  type="text"
                  value={locationInfo}
                  onChange={e => setLocationInfo(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="사건 발생 장소"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {isSubmitting ? '신고 중...' : '신고하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
