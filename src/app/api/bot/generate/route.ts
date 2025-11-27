import { NextRequest, NextResponse } from 'next/server'
import { BotManager } from '@/lib/bot/bot-scheduler'
import { rateLimit, requireAdmin } from '@/lib/api'

import { logger } from '@/lib/observability/logger'
/**
 * 봇 방 수동 생성 API
 * POST /api/bot/generate
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 API 키 확인 (외부 스크립트용)
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    // API 키가 있으면 검증, 없으면 일반 관리자 인증
    let adminId = 'api-key'
    if (apiKey && process.env.ADMIN_API_KEY) {
      if (apiKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json(
          {
            ok: false,
            message: '유효하지 않은 API 키입니다',
          },
          { status: 401 }
        )
      }
      // API 키 검증 성공 - 관리자로 간주
      adminId = 'api-key'
    } else {
      // API 키가 없으면 일반 Supabase 관리자 인증
      const admin = await requireAdmin()
      adminId = admin.id
    }

    // Rate limiting (관리자 기준)
    const rateLimitResult = rateLimit(
      `bot-generate:${adminId}`,
      5, // 5회
      60 * 1000 // 1분
    )

    if (!rateLimitResult) {
      return NextResponse.json(
        {
          ok: false,
          message: '요청 제한 초과',
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { count = 3, district } = body

    let rooms = []

    if (district) {
      // 특정 지역 봇 방 생성
      const { generatePopularTimeRooms } = await import('@/lib/bot/smart-room-generator')
      rooms = await generatePopularTimeRooms(district, count)
    } else {
      // 일반 봇 방 생성
      rooms = await BotManager.createManualBots(count)
    }

    return NextResponse.json({
      ok: true,
      data: {
        generated: rooms.length,
        rooms: rooms.map(room => ({
          title: room.title,
          category: room.category,
          location: room.place_text,
          start_at: room.start_at,
          host: room.botProfile.nickname,
        })),
      },
      message: `${rooms.length}개의 봇 방이 생성되었습니다`,
    })
  } catch (error) {
    logger.error('봇 방 생성 API 오류:', { error: error instanceof Error ? error.message : String(error) })

    return NextResponse.json(
      {
        ok: false,
        message: '봇 방 생성 중 오류가 발생했습니다',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * 봇 상태 조회 API
 * GET /api/bot/generate
 */
export async function GET() {
  try {
    // 관리자만 봇 상태 조회 가능
    await requireAdmin()

    const stats = BotManager.getStats()

    return NextResponse.json({
      ok: true,
      data: {
        isActive: stats.isActive,
        dailyCount: stats.dailyCount,
        lastGeneration: stats.lastGeneration,
        status: stats.isActive ? 'running' : 'stopped',
      },
    })
  } catch (error) {
    logger.error('봇 상태 조회 오류:', { error: error instanceof Error ? error.message : String(error) })

    return NextResponse.json(
      {
        ok: false,
        message: '봇 상태 조회 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
