export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

export async function GET() {
  const startTime = Date.now()
  const checks = {
    db: { status: 'unknown', responseTime: 0 },
    redis: { status: 'unknown', responseTime: 0 },
    stripeCfg: { status: 'unknown', responseTime: 0 },
    kakaoCfg: { status: 'unknown', responseTime: 0 }
  }

  let overallStatus = 200
  const timeout = 1500 // 1.5s timeout

  // Database check
  try {
    const dbStart = Date.now()
    const supabase = await createServerSupabaseClient()

    const { data: _data, error } = await Promise.race([
      supabase.from('profiles').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]) as any

    checks.db.responseTime = Date.now() - dbStart

    if (error && !error.message.includes('RLS')) {
      checks.db.status = 'error'
      overallStatus = 503
    } else {
      checks.db.status = 'healthy'
    }
  } catch (_error) {
    checks.db.status = 'timeout'
    checks.db.responseTime = timeout
    overallStatus = 503
  }

  // Redis check (if configured)
  try {
    const redisStart = Date.now()
    // Simple config check - Redis is optional
    if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
      checks.redis.status = 'configured'
    } else {
      checks.redis.status = 'not_configured'
    }
    checks.redis.responseTime = Date.now() - redisStart
  } catch {
    checks.redis.status = 'error'
    overallStatus = 503
  }

  // Stripe config check
  try {
    const stripeStart = Date.now()
    const hasStripeKey = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    checks.stripeCfg.status = hasStripeKey ? 'configured' : 'not_configured'
    checks.stripeCfg.responseTime = Date.now() - stripeStart
  } catch {
    checks.stripeCfg.status = 'error'
  }

  // Kakao config check
  try {
    const kakaoStart = Date.now()
    const hasKakaoKey = !!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    checks.kakaoCfg.status = hasKakaoKey ? 'configured' : 'not_configured'
    checks.kakaoCfg.responseTime = Date.now() - kakaoStart
  } catch {
    checks.kakaoCfg.status = 'error'
  }

  const response = {
    status: overallStatus === 200 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    totalResponseTime: Date.now() - startTime
  }

  return NextResponse.json(response, {
    status: overallStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}
