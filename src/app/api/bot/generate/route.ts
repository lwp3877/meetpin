import { NextRequest, NextResponse } from 'next/server'
import { BotManager } from '@/lib/bot/bot-scheduler'
import { rateLimit } from '@/lib/api'

/**
 * 봇 방 수동 생성 API
 * POST /api/bot/generate
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 전용 기능으로 제한
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('admin_key')
    
    if (adminKey !== process.env.BOT_ADMIN_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { ok: false, message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = rateLimit(
      `bot-generate:${clientIP}`,
      5, // 5회
      60 * 1000 // 1분
    )

    if (!rateLimitResult) {
      return NextResponse.json(
        { 
          ok: false, 
          message: '요청 제한 초과' 
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
        }))
      },
      message: `${rooms.length}개의 봇 방이 생성되었습니다`
    })

  } catch (error) {
    console.error('봇 방 생성 API 오류:', error)
    
    return NextResponse.json({
      ok: false,
      message: '봇 방 생성 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

/**
 * 봇 상태 조회 API
 * GET /api/bot/generate
 */
export async function GET() {
  try {
    const stats = BotManager.getStats()
    
    return NextResponse.json({
      ok: true,
      data: {
        isActive: stats.isActive,
        dailyCount: stats.dailyCount,
        lastGeneration: stats.lastGeneration,
        status: stats.isActive ? 'running' : 'stopped'
      }
    })

  } catch (error) {
    console.error('봇 상태 조회 오류:', error)
    
    return NextResponse.json({
      ok: false,
      message: '봇 상태 조회 중 오류가 발생했습니다'
    }, { status: 500 })
  }
}