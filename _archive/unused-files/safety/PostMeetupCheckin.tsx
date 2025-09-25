/* src/components/safety/PostMeetupCheckin.tsx */
'use client'

import { useState, useEffect } from 'react'
import { Shield, Star, AlertTriangle, CheckCircle, Users, Clock } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { isDevelopmentMode } from '@/lib/config/mockData'
import toast from 'react-hot-toast'

interface PostMeetupCheckinProps {
  roomId: string
  roomTitle: string
  hostName: string
  meetupDate: string
  participants: string[]
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

interface SafetyRating {
  overall: number
  safety: number
  communication: number
  location: number
}

interface CheckinData {
  safetyRating: SafetyRating
  attendedSuccessfully: boolean
  noShowParticipants: string[]
  safetyIssues: string[]
  additionalComments: string
  wouldRecommend: boolean
  followUpNeeded: boolean
  emergencyContacted: boolean
}

const SAFETY_ISSUES = [
  { id: 'none', label: '문제없음', description: '모든 것이 안전하고 좋았습니다' },
  {
    id: 'location_unsafe',
    label: '장소가 안전하지 않음',
    description: '모임 장소가 위험하거나 부적절했습니다',
  },
  {
    id: 'participant_behavior',
    label: '참가자 부적절한 행동',
    description: '다른 참가자의 행동이 불편하거나 부적절했습니다',
  },
  {
    id: 'host_issues',
    label: '호스트 문제',
    description: '호스트의 행동이나 태도에 문제가 있었습니다',
  },
  { id: 'misleading_info', label: '잘못된 정보', description: '모임 정보와 실제가 달랐습니다' },
  {
    id: 'safety_protocols',
    label: '안전 수칙 미준수',
    description: '안전 규칙이나 가이드라인이 지켜지지 않았습니다',
  },
  {
    id: 'communication_poor',
    label: '소통 문제',
    description: '소통이 원활하지 않거나 정보 공유가 부족했습니다',
  },
  { id: 'other', label: '기타', description: '위에 해당하지 않는 기타 문제' },
]

const RATING_DESCRIPTIONS = {
  1: { label: '매우 나쁨', emoji: '😞', color: 'text-red-500' },
  2: { label: '나쁨', emoji: '😔', color: 'text-orange-500' },
  3: { label: '보통', emoji: '😐', color: 'text-yellow-500' },
  4: { label: '좋음', emoji: '😊', color: 'text-green-500' },
  5: { label: '매우 좋음', emoji: '😍', color: 'text-green-600' },
}

export function PostMeetupCheckin({
  roomId,
  roomTitle,
  hostName,
  meetupDate,
  participants,
  isVisible,
  onComplete,
  onSkip,
}: PostMeetupCheckinProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [checkinData, setCheckinData] = useState<CheckinData>({
    safetyRating: {
      overall: 5,
      safety: 5,
      communication: 5,
      location: 5,
    },
    attendedSuccessfully: true,
    noShowParticipants: [],
    safetyIssues: ['none'],
    additionalComments: '',
    wouldRecommend: true,
    followUpNeeded: false,
    emergencyContacted: false,
  })

  // 24시간 후 자동으로 표시되는 로직 (실제 구현시 서버에서 처리)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const meetupTime = new Date(meetupDate).getTime()
      const currentTime = new Date().getTime()
      const timeDiff = currentTime - meetupTime

      // 모임 후 1시간 이후에 체크인 가능
      if (timeDiff > 60 * 60 * 1000) {
        setShouldShow(true)
      } else {
        // 개발 모드에서는 즉시 표시
        if (isDevelopmentMode) {
          setShouldShow(true)
        }
      }
    }
  }, [isVisible, meetupDate])

  const updateRating = (type: keyof SafetyRating, value: number) => {
    setCheckinData(prev => ({
      ...prev,
      safetyRating: {
        ...prev.safetyRating,
        [type]: value,
      },
    }))
  }

  const toggleSafetyIssue = (issueId: string) => {
    if (issueId === 'none') {
      // "문제없음" 선택시 다른 모든 항목 해제
      setCheckinData(prev => ({
        ...prev,
        safetyIssues: ['none'],
      }))
    } else {
      // 다른 항목 선택시 "문제없음" 해제하고 해당 항목 토글
      setCheckinData(prev => {
        const newIssues = prev.safetyIssues.filter(id => id !== 'none')
        const isSelected = newIssues.includes(issueId)

        if (isSelected) {
          const filtered = newIssues.filter(id => id !== issueId)
          return {
            ...prev,
            safetyIssues: filtered.length === 0 ? ['none'] : filtered,
          }
        } else {
          return {
            ...prev,
            safetyIssues: [...newIssues, issueId],
          }
        }
      })
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    setSubmitting(true)

    try {
      const submitData = {
        roomId,
        meetupDate,
        ...checkinData,
        checkinCompletedAt: new Date().toISOString(),
        userId: user.id,
      }

      if (isDevelopmentMode) {
        // 개발 모드에서는 로컬 처리
        console.log('Post-meetup checkin data:', submitData)

        // 안전 문제가 있는 경우 특별 처리
        const hasIssues = !checkinData.safetyIssues.includes('none')
        if (hasIssues) {
          toast.success('체크인 완료. 신고해주신 내용을 검토하겠습니다.')
        } else {
          toast.success('안전 체크인이 완료되었습니다!')
        }
      } else {
        // 실제 API 호출
        const response = await fetch('/api/meetup-checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || '체크인 처리에 실패했습니다')
        }

        toast.success(result.message || '안전 체크인이 완료되었습니다')
      }

      onComplete()
    } catch (error: any) {
      console.error('Post-meetup checkin error:', error)
      toast.error(error.message || '체크인 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isVisible || !shouldShow) return null

  const RatingStars = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (value: number) => void
    label: string
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              star <= value
                ? 'bg-yellow-100 text-yellow-500'
                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Star className={`h-5 w-5 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">안전 체크인</h2>
              <p className="text-sm opacity-90">모임이 어떠셨나요?</p>
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="h-2 flex-1 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{step}/3</span>
          </div>
        </div>

        <div className="max-h-[calc(90vh-160px)] space-y-6 overflow-y-auto p-6">
          {/* 모임 정보 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 font-medium text-gray-900">{roomTitle}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>호스트: {hostName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(meetupDate).toLocaleString('ko-KR')}</span>
              </div>
            </div>
          </div>

          {/* Step 1: 기본 확인 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900">모임 참여 확인</h3>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checkinData.attendedSuccessfully}
                      onChange={e =>
                        setCheckinData(prev => ({
                          ...prev,
                          attendedSuccessfully: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-gray-700">모임에 성공적으로 참여했습니다</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checkinData.wouldRecommend}
                      onChange={e =>
                        setCheckinData(prev => ({
                          ...prev,
                          wouldRecommend: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-gray-700">다른 사람들에게 추천하고 싶습니다</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checkinData.emergencyContacted}
                      onChange={e =>
                        setCheckinData(prev => ({
                          ...prev,
                          emergencyContacted: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-gray-700">응급상황으로 112/119에 신고했습니다</span>
                  </label>
                </div>

                {checkinData.emergencyContacted && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">응급상황 신고 확인</span>
                    </div>
                    <p className="mt-1 text-sm text-red-700">
                      응급상황 신고 내용이 관리팀에 즉시 전달됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 평가 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900">모임 평가</h3>
                <div className="space-y-4">
                  <RatingStars
                    value={checkinData.safetyRating.overall}
                    onChange={value => updateRating('overall', value)}
                    label="전반적인 만족도"
                  />
                  <RatingStars
                    value={checkinData.safetyRating.safety}
                    onChange={value => updateRating('safety', value)}
                    label="안전성"
                  />
                  <RatingStars
                    value={checkinData.safetyRating.communication}
                    onChange={value => updateRating('communication', value)}
                    label="소통"
                  />
                  <RatingStars
                    value={checkinData.safetyRating.location}
                    onChange={value => updateRating('location', value)}
                    label="장소"
                  />
                </div>

                <div className="mt-4 text-center">
                  <div className="mb-2 text-4xl">
                    {
                      RATING_DESCRIPTIONS[
                        checkinData.safetyRating.overall as keyof typeof RATING_DESCRIPTIONS
                      ]?.emoji
                    }
                  </div>
                  <div
                    className={`font-medium ${RATING_DESCRIPTIONS[checkinData.safetyRating.overall as keyof typeof RATING_DESCRIPTIONS]?.color}`}
                  >
                    {
                      RATING_DESCRIPTIONS[
                        checkinData.safetyRating.overall as keyof typeof RATING_DESCRIPTIONS
                      ]?.label
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 안전 문제 및 추가 의견 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900">안전 관련 사항</h3>
                <div className="space-y-2">
                  {SAFETY_ISSUES.map(issue => (
                    <label
                      key={issue.id}
                      className={`block cursor-pointer rounded-xl border-2 p-3 transition-all ${
                        checkinData.safetyIssues.includes(issue.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkinData.safetyIssues.includes(issue.id)}
                        onChange={() => toggleSafetyIssue(issue.id)}
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900">{issue.label}</div>
                      <div className="text-sm text-gray-600">{issue.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-900">추가 의견 (선택사항)</h3>
                <textarea
                  value={checkinData.additionalComments}
                  onChange={e =>
                    setCheckinData(prev => ({
                      ...prev,
                      additionalComments: e.target.value,
                    }))
                  }
                  placeholder="모임에 대한 추가적인 의견이나 개선사항을 알려주세요..."
                  className="h-24 w-full resize-none rounded-xl border border-gray-200 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {checkinData.additionalComments.length}/500자
                </div>
              </div>

              {!checkinData.safetyIssues.includes('none') && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">안전 문제 신고</span>
                  </div>
                  <p className="mt-1 text-sm text-orange-700">
                    신고해주신 내용은 관리팀에서 검토하여 적절한 조치를 취하겠습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 border-t border-gray-100 p-6">
          {step === 1 ? (
            <>
              <button
                onClick={onSkip}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                나중에
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
              >
                다음
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
              >
                다음
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(2)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex flex-2 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>처리 중...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>체크인 완료</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
