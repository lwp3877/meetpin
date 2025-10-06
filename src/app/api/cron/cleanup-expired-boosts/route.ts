/* src/app/api/cron/cleanup-expired-boosts/route.ts */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import type { PostgrestError } from '@supabase/supabase-js'
import { logger } from '@/lib/observability/logger'
// Vercel Cron Job - 만료된 부스트 정리
export async function GET(request: NextRequest) {
  try {
    // Cron Secret 검증 (Vercel Cron에서 자동으로 추가되는 헤더)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const now = new Date().toISOString()

    // 만료된 부스트 찾기 및 정리
    const { data: expiredBoosts, error: selectError } = await supabase
      .from('rooms')
      .select('id, title, boost_until')
      .not('boost_until', 'is', null)
      .lt('boost_until', now)

    if (selectError) {
      logger.error('Failed to select expired boosts:', { error: selectError instanceof Error ? selectError.message : String(selectError) })
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!expiredBoosts || expiredBoosts.length === 0) {
      return NextResponse.json({
        message: 'No expired boosts found',
        cleaned: 0,
        timestamp: now,
      })
    }

    // 만료된 부스트 NULL로 설정
    const { error: updateError } = (await (supabase as any)
      .from('rooms')
      .update({ boost_until: null, updated_at: now })
      .not('boost_until', 'is', null)
      .lt('boost_until', now)) as { error: PostgrestError | null }

    if (updateError) {
      logger.error('Failed to cleanup expired boosts:', { error: updateError instanceof Error ? updateError.message : String(updateError) })
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
    }

    logger.info(`[Cron] Cleaned up ${expiredBoosts.length} expired boosts`)

    return NextResponse.json({
      message: 'Expired boosts cleaned up successfully',
      cleaned: expiredBoosts.length,
      rooms: expiredBoosts.map((room: Record<string, unknown>) => ({
        id: room.id,
        title: room.title,
        expired_at: room.boost_until,
      })),
      timestamp: now,
    })
  } catch (error) {
    logger.error('Cron job error:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
