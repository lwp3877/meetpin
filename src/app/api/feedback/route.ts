/* src/app/api/feedback/route.ts - 사용자 피드백 API */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isDevelopmentMode } from '@/lib/flags'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await rateLimit(request, 'feedback', 10, 60000) // 10 requests per minute

    // 인증 확인
    const user = await getAuthenticatedUser(request)

    const body = await request.json()
    const {
      targetUserId,
      meetingId,
      type,
      rating,
      review,
      tags,
      wouldMeetAgain
    } = body

    // 입력 검증
    if (!targetUserId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        ok: false,
        message: '필수 정보가 누락되었습니다'
      })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({
        ok: false,
        message: '자기 자신에게는 피드백을 남길 수 없습니다'
      })
    }

    // 개발 모드에서는 Mock 데이터 처리
    if (isDevelopmentMode) {
      // Mock 피드백 저장
      const mockFeedback = {
        id: `feedback_${Date.now()}`,
        fromUserId: user.id,
        targetUserId,
        meetingId: meetingId || null,
        type: type || 'after_meeting',
        rating,
        review: review || '',
        tags: tags || [],
        wouldMeetAgain: wouldMeetAgain || false,
        createdAt: new Date().toISOString()
      }

      console.log('[Mock] Feedback created:', mockFeedback)

      return NextResponse.json({
        ok: true,
        message: '피드백이 등록되었습니다',
        data: mockFeedback
      })
    }

    // 프로덕션에서는 실제 Supabase 처리
    try {
      // 중복 피드백 확인
      if (meetingId) {
        const { data: existingFeedback } = await supabaseAdmin
          .from('user_feedback')
          .select('id')
          .eq('from_user_id', user.id)
          .eq('target_user_id', targetUserId)
          .eq('meeting_id', meetingId)
          .single()

        if (existingFeedback) {
          return NextResponse.json({
            ok: false,
            message: '이미 피드백을 작성하셨습니다'
          })
        }
      }

      // 피드백 저장
      const { data: feedback, error } = await supabaseAdmin
        .from('user_feedback')
        .insert({
          from_user_id: user.id,
          target_user_id: targetUserId,
          meeting_id: meetingId,
          type: type || 'after_meeting',
          rating,
          review: review || '',
          tags: tags || [],
          would_meet_again: wouldMeetAgain || false
        })
        .select()
        .single()

      if (error) {
        throw new ApiError('피드백 저장에 실패했습니다', 500, error)
      }

      // 타겟 사용자의 평균 평점 업데이트
      const { data: avgRating } = await supabaseAdmin
        .from('user_feedback')
        .select('rating')
        .eq('target_user_id', targetUserId)

      if (avgRating && avgRating.length > 0) {
        const average = avgRating.reduce((sum, item) => sum + item.rating, 0) / avgRating.length
        
        await supabaseAdmin
          .from('profiles')
          .update({ average_rating: Math.round(average * 10) / 10 })
          .eq('id', targetUserId)
      }

      return NextResponse.json({
        ok: true,
        message: '피드백이 등록되었습니다',
        data: feedback
      })

    } catch (dbError) {
      console.error('Database error in feedback:', dbError)
      throw new ApiError('피드백 처리 중 오류가 발생했습니다', 500, dbError)
    }

  } catch (error) {
    console.error('Feedback API error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json({
        ok: false,
        message: error.message,
        code: error.code
      }, { status: error.status })
    }

    return NextResponse.json({
      ok: false,
      message: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    await rateLimit(request, 'feedback-read', 100, 60000)

    const user = await getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    if (!targetUserId) {
      return NextResponse.json({
        ok: false,
        message: 'targetUserId가 필요합니다'
      })
    }

    // 개발 모드에서는 Mock 데이터 반환
    if (isDevelopmentMode) {
      const mockFeedbacks = [
        {
          id: 'feedback_1',
          rating: 5,
          review: '정말 즐거운 시간이었어요! 대화도 재미있고 매너도 좋으셨습니다.',
          tags: ['시간 약속을 잘 지켜요', '대화가 즐거워요', '매너가 좋아요'],
          wouldMeetAgain: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          fromUser: {
            nickname: '익명의 후기',
            ageRange: '20대 후반'
          }
        },
        {
          id: 'feedback_2',
          rating: 4,
          review: '좋은 사람이에요. 다음에도 만나고 싶습니다.',
          tags: ['배려심이 깊어요', '유머감각이 있어요'],
          wouldMeetAgain: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          fromUser: {
            nickname: '익명의 후기',
            ageRange: '30대 초반'
          }
        }
      ]

      return NextResponse.json({
        ok: true,
        data: mockFeedbacks,
        pagination: {
          page,
          limit,
          total: mockFeedbacks.length,
          pages: 1
        }
      })
    }

    // 프로덕션에서는 실제 데이터 조회
    const offset = (page - 1) * limit

    const { data: feedbacks, error, count } = await supabaseAdmin
      .from('user_feedback')
      .select(`
        id,
        rating,
        review,
        tags,
        would_meet_again,
        created_at,
        from_user:from_user_id (
          nickname,
          age_range
        )
      `, { count: 'exact' })
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new ApiError('피드백을 불러오는데 실패했습니다', 500, error)
    }

    return NextResponse.json({
      ok: true,
      data: feedbacks || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Feedback GET API error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json({
        ok: false,
        message: error.message,
        code: error.code
      }, { status: error.status })
    }

    return NextResponse.json({
      ok: false,
      message: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}