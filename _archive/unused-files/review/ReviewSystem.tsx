/**
 * 모임 후기 및 평점 시스템
 * 사용자 신뢰도 구축을 위한 핵심 컴포넌트
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Flag, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Review {
  id: string
  reviewer_uid: string
  reviewed_uid: string
  room_id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    nickname: string
    avatar_url?: string
  }
  room: {
    title: string
  }
}

interface ReviewSystemProps {
  targetUserId: string
  roomId?: string
  onReviewSubmitted?: () => void
}

export function ReviewSystem({ targetUserId, roomId, onReviewSubmitted }: ReviewSystemProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const supabase = createBrowserSupabaseClient()

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          reviewer:profiles!reviews_reviewer_uid_fkey(nickname, avatar_url),
          room:rooms!reviews_room_id_fkey(title)
        `
        )
        .eq('reviewed_uid', targetUserId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setReviews(data)
      }
    } catch (_error) {
      console.error('리뷰 로딩 오류:', _error)
    }
  }, [targetUserId, supabase])

  const checkCanReview = useCallback(async () => {
    if (!user || user.id === targetUserId) {
      setCanReview(false)
      return
    }

    try {
      // 같은 방에 참여했는지 확인
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`host_uid.eq.${user.id},guest_uid.eq.${user.id}`)
        .or(`host_uid.eq.${targetUserId},guest_uid.eq.${targetUserId}`)

      // 이미 리뷰했는지 확인
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_uid', user.id)
        .eq('reviewed_uid', targetUserId)
        .single()

      setCanReview(!!matches && matches.length > 0 && !existingReview)
    } catch (_error) {
      setCanReview(false)
    }
  }, [user, targetUserId, supabase])

  useEffect(() => {
    fetchReviews()
    checkCanReview()
  }, [targetUserId, user, fetchReviews, checkCanReview])

  const handleSubmitReview = async () => {
    if (!user || rating === 0) {
      toast.error('별점을 선택해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await (supabase as any).from('reviews').insert({
        reviewer_uid: user.id,
        reviewed_uid: targetUserId,
        room_id: roomId,
        rating,
        comment: comment.trim(),
      })

      if (error) {
        throw error
      }

      toast.success('후기가 등록되었습니다!')
      setRating(0)
      setComment('')
      setShowReviewForm(false)
      setCanReview(false)
      fetchReviews()
      onReviewSubmitted?.()
    } catch (_error: any) {
      toast.error(_error.message || '후기 등록에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const StarRating = ({
    rating: currentRating,
    interactive = false,
    onRate,
  }: {
    rating: number
    interactive?: boolean
    onRate?: (rating: number) => void
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 평점 요약 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-primary text-3xl font-bold">{getAverageRating()}</div>
                <StarRating rating={parseFloat(getAverageRating().toString())} />
                <div className="mt-1 text-sm text-gray-500">{reviews.length}개 후기</div>
              </div>
            </div>

            {canReview && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                후기 작성
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 후기 작성 폼 */}
      {showReviewForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">후기 작성</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">별점 *</label>
                <StarRating rating={rating} interactive onRate={setRating} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">후기 (선택사항)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="모임은 어떠셨나요? 다른 사용자들에게 도움이 되는 솔직한 후기를 남겨주세요."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3"
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">{comment.length}/500자</div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || rating === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? '등록 중...' : '후기 등록'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false)
                    setRating(0)
                    setComment('')
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 후기 목록 */}
      <div className="space-y-4">
        <h3 className="font-semibold">후기 ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              아직 작성된 후기가 없습니다.
            </CardContent>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer.avatar_url} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium">{review.reviewer.nickname}</span>
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {review.room && (
                      <Badge variant="secondary" className="mb-2">
                        {review.room.title}
                      </Badge>
                    )}

                    {review.comment && (
                      <p className="text-sm leading-relaxed text-gray-700">{review.comment}</p>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewSystem
