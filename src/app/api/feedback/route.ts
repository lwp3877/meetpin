/* src/app/api/feedback/route.ts - 사용자 피드백 API */
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    // IP 기반 Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'anonymous'
    if (!rateLimit(`feedback:${clientIP}`, 10, 60000)) {
      return NextResponse.json({ ok: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    // 피드백 API는 준비 중입니다
    return NextResponse.json({
      ok: true,
      message: '피드백이 등록되었습니다 (준비 중 - 곧 지원 예정)',
      data: {
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({
      ok: false,
      message: '피드백 처리 중 오류가 발생했습니다'
    }, { status: 500 })
  }
}