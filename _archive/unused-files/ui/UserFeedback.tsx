/* src/components/ui/UserFeedback.tsx - 사용자 피드백 및 리뷰 시스템 */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Heart, Flag, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'

interface UserFeedbackProps {
  targetUserId: string
  meetingId: string
  type: 'after_meeting' | 'profile_view'
  onComplete?: () => void
}

interface FeedbackData {
  rating: number
  review: string
  tags: string[]
  wouldMeetAgain: boolean
}

const POSITIVE_TAGS = [
  '시간 약속을 잘 지켜요',
  '대화가 즐거워요',
  '매너가 좋아요',
  '유머감각이 있어요',
  '배려심이 깊어요',
  '진솔한 대화를 해요',
  '공통 관심사가 많아요',
  '분위기를 잘 띄워요',
]

const NEGATIVE_TAGS = [
  '약속시간에 늦었어요',
  '대화가 어색했어요',
  '매너가 아쉬워요',
  '연락이 부담스러워요',
  '관심사가 안 맞아요',
  '기대와 달랐어요',
]

export default function UserFeedback({
  targetUserId,
  meetingId,
  type,
  onComplete,
}: UserFeedbackProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    review: '',
    tags: [],
    wouldMeetAgain: false,
  })
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }))
    if (type === 'after_meeting') {
      setShowReviewForm(true)
    }
  }

  const handleTagToggle = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleSubmitFeedback = async () => {
    if (!user || feedback.rating === 0) {
      toast.error('평점을 선택해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          meetingId,
          type,
          rating: feedback.rating,
          review: feedback.review,
          tags: feedback.tags,
          wouldMeetAgain: feedback.wouldMeetAgain,
        }),
      })

      const result = await response.json()

      if (result.ok) {
        toast.success('피드백이 등록되었습니다!')
        onComplete?.()
      } else {
        toast.error(result.message || '피드백 등록에 실패했습니다')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast.error('피드백 등록 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReport = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      return
    }

    const reason = prompt('신고 사유를 입력해주세요:')
    if (!reason || reason.trim().length < 5) {
      toast.error('신고 사유를 5글자 이상 입력해주세요')
      return
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          meetingId,
          reason: reason.trim(),
          category: 'inappropriate_behavior',
        }),
      })

      const result = await response.json()

      if (result.ok) {
        toast.success('신고가 접수되었습니다')
      } else {
        toast.error(result.message || '신고 접수에 실패했습니다')
      }
    } catch (error) {
      console.error('Report submission error:', error)
      toast.error('신고 접수 중 오류가 발생했습니다')
    }
  }

  if (type === 'profile_view') {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="mb-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= feedback.rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                    } transition-colors hover:text-yellow-400`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">이 사용자는 어떠셨나요?</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">모임은 어떠셨나요?</h3>
          <p className="text-sm text-gray-600">
            솔직한 후기를 남겨주시면 더 좋은 매칭에 도움이 됩니다
          </p>
        </div>

        {/* 별점 */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className="p-1 focus:outline-none"
                disabled={isSubmitting}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= feedback.rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                  } transition-colors hover:text-yellow-400`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {feedback.rating > 0 && (
              <span className="font-medium text-gray-900">
                {feedback.rating === 5
                  ? '완벽해요!'
                  : feedback.rating === 4
                    ? '좋았어요!'
                    : feedback.rating === 3
                      ? '괜찮았어요'
                      : feedback.rating === 2
                        ? '아쉬웠어요'
                        : '별로였어요'}
              </span>
            )}
          </p>
        </div>

        {showReviewForm && (
          <>
            {/* 태그 선택 */}
            <div className="mb-6">
              <h4 className="mb-3 font-medium text-gray-900">
                어떤 점이 {feedback.rating >= 4 ? '좋았나요?' : '아쉬웠나요?'}
              </h4>
              <div className="space-y-2">
                {(feedback.rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`mr-2 mb-2 inline-block rounded-full px-3 py-1 text-sm transition-colors ${
                      feedback.tags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isSubmitting}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 다시 만날 의향 */}
            {feedback.rating >= 4 && (
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">다시 만나고 싶으신가요?</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedback(prev => ({ ...prev, wouldMeetAgain: true }))}
                    className={`flex-1 rounded-lg border p-3 transition-colors ${
                      feedback.wouldMeetAgain
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isSubmitting}
                  >
                    <Heart className="mr-2 inline h-4 w-4" />
                    네, 좋았어요!
                  </button>
                  <button
                    onClick={() => setFeedback(prev => ({ ...prev, wouldMeetAgain: false }))}
                    className={`flex-1 rounded-lg border p-3 transition-colors ${
                      !feedback.wouldMeetAgain && feedback.wouldMeetAgain !== undefined
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isSubmitting}
                  >
                    아니요
                  </button>
                </div>
              </div>
            )}

            {/* 자세한 리뷰 */}
            <div className="mb-6">
              <h4 className="mb-2 font-medium text-gray-900">자세한 후기 (선택사항)</h4>
              <textarea
                value={feedback.review}
                onChange={e => setFeedback(prev => ({ ...prev, review: e.target.value }))}
                placeholder="다른 사용자들에게 도움이 될 솔직한 후기를 남겨주세요..."
                className="focus:ring-primary w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2"
                rows={3}
                maxLength={200}
                disabled={isSubmitting}
              />
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500">{feedback.review.length}/200</span>
              </div>
            </div>

            {/* 제출 및 신고 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || feedback.rating === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    제출 중...
                  </div>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    후기 제출
                  </>
                )}
              </Button>
              <Button
                onClick={handleReport}
                variant="outline"
                disabled={isSubmitting}
                className="px-3"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-gray-500">
              후기는 익명으로 처리되며, 커뮤니티 개선을 위해 사용됩니다
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
