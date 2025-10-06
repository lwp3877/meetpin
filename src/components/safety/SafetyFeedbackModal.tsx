'use client'

import { useState } from 'react'
import { X, AlertTriangle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/Toast'

interface SafetyFeedbackModalProps {
  roomId: string
  hostId: string
  roomTitle: string
  onClose: () => void
}

export function SafetyFeedbackModal({ roomId, hostId, roomTitle, onClose }: SafetyFeedbackModalProps) {
  const [safetyRating, setSafetyRating] = useState<number>(5)
  const [experienceRating, setExperienceRating] = useState<number>(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [hasConcern, setHasConcern] = useState(false)
  const [concernDetails, setConcernDetails] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 안전 체크리스트
  const [checklist, setChecklist] = useState({
    met_in_public: false,
    felt_safe: false,
    host_was_respectful: false,
    would_meet_again: false,
    emergency_contacts_available: false,
  })

  const handleSubmit = async () => {
    if (hasConcern && !concernDetails.trim()) {
      Toast.error('안전 문제에 대한 상세 설명을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/safety/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          host_id: hostId,
          safety_rating: safetyRating,
          experience_rating: experienceRating,
          feedback_text: feedbackText,
          safety_checklist: checklist,
          has_safety_concern: hasConcern,
          safety_concern_details: concernDetails,
          is_anonymous: isAnonymous,
        }),
      })

      if (!response.ok) {
        throw new Error('피드백 제출 실패')
      }

      Toast.success('피드백이 성공적으로 제출되었습니다')
      onClose()
    } catch (_error) {
      Toast.error('피드백 제출 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">안전 피드백</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">모임: {roomTitle}</p>
          </div>

          {/* 안전 평점 */}
          <div>
            <label className="block text-sm font-medium mb-2">안전 평점</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setSafetyRating(rating)}
                  className={`w-10 h-10 rounded-full ${
                    rating <= safetyRating
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* 경험 평점 */}
          <div>
            <label className="block text-sm font-medium mb-2">전체 경험</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setExperienceRating(rating)}
                  className={`w-10 h-10 rounded-full ${
                    rating <= experienceRating
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* 안전 체크리스트 */}
          <div>
            <label className="block text-sm font-medium mb-2">안전 체크리스트</label>
            <div className="space-y-2">
              {Object.entries(checklist).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e =>
                      setChecklist({ ...checklist, [key]: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {key === 'met_in_public' && '공공장소에서 만났습니다'}
                    {key === 'felt_safe' && '안전하다고 느꼈습니다'}
                    {key === 'host_was_respectful' && '호스트가 예의 바릅니다'}
                    {key === 'would_meet_again' && '다시 만나고 싶습니다'}
                    {key === 'emergency_contacts_available' && '긴급 연락처를 공유했습니다'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 피드백 */}
          <div>
            <label className="block text-sm font-medium mb-2">추가 피드백 (선택)</label>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="모임에 대한 피드백을 남겨주세요"
            />
          </div>

          {/* 안전 문제 */}
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={hasConcern}
                onChange={e => setHasConcern(e.target.checked)}
                className="w-4 h-4"
              />
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-medium">안전 문제가 있었습니다</span>
            </label>
            {hasConcern && (
              <textarea
                value={concernDetails}
                onChange={e => setConcernDetails(e.target.value)}
                className="w-full p-3 border rounded-lg mt-2"
                rows={3}
                placeholder="어떤 문제가 있었는지 상세히 설명해주세요. 이 정보는 관리자에게 전달됩니다."
              />
            )}
          </div>

          {/* 익명 제출 */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">익명으로 제출</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-primary"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
