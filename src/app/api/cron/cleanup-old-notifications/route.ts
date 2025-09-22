/* src/app/api/cron/cleanup-old-notifications/route.ts */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

// Vercel Cron Job - 오래된 알림 정리 (30일 이상된 읽은 알림)
export async function GET(request: NextRequest) {
  try {
    // Cron Secret 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    // 30일 이상된 읽은 알림 찾기
    const { data: oldNotifications, error: selectError } = await supabase
      .from('host_messages')
      .select('id, created_at, is_read')
      .eq('is_read', true)
      .lt('created_at', thirtyDaysAgo)

    if (selectError) {
      console.error('Failed to select old notifications:', selectError)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!oldNotifications || oldNotifications.length === 0) {
      return NextResponse.json({
        message: 'No old notifications to clean up',
        deleted: 0,
        cutoff_date: thirtyDaysAgo,
        timestamp: now.toISOString()
      })
    }

    // 오래된 읽은 알림 삭제
    const { error: deleteError } = await supabase
      .from('host_messages')
      .delete()
      .eq('is_read', true)
      .lt('created_at', thirtyDaysAgo)

    if (deleteError) {
      console.error('Failed to delete old notifications:', deleteError)
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
    }

    console.log(`[Cron] Deleted ${oldNotifications.length} old notifications`)

    return NextResponse.json({
      message: 'Old notifications cleaned up successfully',
      deleted: oldNotifications.length,
      cutoff_date: thirtyDaysAgo,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Notification cleanup cron error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}