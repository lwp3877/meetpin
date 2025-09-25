/* src/app/api/feedback/route.ts - 사용자 피드백 API */
import { NextRequest, NextResponse } from 'next/server'
import {
  rateLimit,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
} from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'

// 피드백 검증 스키마
const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  title: z
    .string()
    .min(5, '제목은 5자 이상 입력해주세요')
    .max(100, '제목은 100자를 초과할 수 없습니다'),
  content: z
    .string()
    .min(10, '내용은 10자 이상 입력해주세요')
    .max(1000, '내용은 1000자를 초과할 수 없습니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
})

export async function POST(request: NextRequest) {
  try {
    // 인증된 사용자만 피드백 작성 가능
    const user = await getAuthenticatedUser()

    // 사용자별 Rate limiting (인증된 사용자 기준)
    if (!rateLimit(`feedback:${user.id}`, 5, 300000)) {
      // 5분에 5개로 제한
      return NextResponse.json(
        { ok: false, message: '피드백 작성 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // 요청 본문 검증
    const feedbackData = await parseAndValidateBody(request, feedbackSchema)

    // 금칙어 필터링
    const forbiddenWords = ['시발', '씨발', '개새끼', '병신']
    const containsForbiddenWords = (text: string) => {
      const lowerText = text.toLowerCase()
      return forbiddenWords.some(word => lowerText.includes(word))
    }

    if (
      containsForbiddenWords(feedbackData.title) ||
      containsForbiddenWords(feedbackData.content)
    ) {
      return NextResponse.json(
        { ok: false, message: '부적절한 내용이 포함되어 있습니다' },
        { status: 422 }
      )
    }

    // Supabase에 피드백 저장
    const supabase = await createServerSupabaseClient()
    const { data: feedback, error } = await (supabase as any)
      .from('feedback')
      .insert({
        user_id: user.id,
        type: feedbackData.type,
        title: feedbackData.title,
        content: feedbackData.content,
        contact_email: feedbackData.email || user.email,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Feedback creation error:', error)
      return NextResponse.json(
        {
          ok: false,
          message: '피드백 저장에 실패했습니다',
        },
        { status: 500 }
      )
    }

    return createSuccessResponse(
      feedback,
      '소중한 피드백이 등록되었습니다. 검토 후 답변드리겠습니다!',
      201
    )
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      {
        ok: false,
        message: '피드백 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
