export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'

export async function GET() {
  const startTime = Date.now()
  const checks = {
    migrationsApplied: { status: 'unknown', responseTime: 0 },
    rateLimitPing: { status: 'unknown', responseTime: 0 },
    webhookReachable: { status: 'unknown', responseTime: 0 }
  }

  let overallStatus = 200
  const timeout = 1500 // 1.5s timeout

  // Check if essential tables exist (migration check)
  try {
    const migStart = Date.now()
    const supabase = await createServerSupabaseClient()

    // Try to access core tables to verify migrations
    const { data: _profilesData, error: profilesError } = await Promise.race([
      supabase.from('profiles').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]) as any

    const { data: _roomsData, error: roomsError } = await Promise.race([
      supabase.from('rooms').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]) as any

    checks.migrationsApplied.responseTime = Date.now() - migStart

    if (profilesError?.message?.includes('relation') || roomsError?.message?.includes('relation')) {
      checks.migrationsApplied.status = 'missing_tables'
      overallStatus = 503
    } else {
      checks.migrationsApplied.status = 'applied'
    }
  } catch (_error) {
    checks.migrationsApplied.status = 'timeout'
    checks.migrationsApplied.responseTime = timeout
    overallStatus = 503
  }

  // Rate limit ping test
  try {
    const rlStart = Date.now()
    // Simple rate limit module check
    const hasRateLimit = !!(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL)

    if (hasRateLimit) {
      // Try to import rate limit (dynamic to avoid build issues)
      try {
        const { rateLimit: _rateLimit } = await import('@/lib/rateLimit')
        checks.rateLimitPing.status = 'configured'
      } catch {
        checks.rateLimitPing.status = 'import_failed'
        overallStatus = 503
      }
    } else {
      checks.rateLimitPing.status = 'not_configured'
    }

    checks.rateLimitPing.responseTime = Date.now() - rlStart
  } catch (_error) {
    checks.rateLimitPing.status = 'error'
    overallStatus = 503
  }

  // Webhook reachability (check if webhook endpoints are configured)
  try {
    const whStart = Date.now()
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const siteUrl = process.env.SITE_URL || process.env.VERCEL_URL

    if (stripeWebhookSecret && siteUrl) {
      checks.webhookReachable.status = 'configured'
    } else if (!stripeWebhookSecret) {
      checks.webhookReachable.status = 'stripe_webhook_missing'
    } else {
      checks.webhookReachable.status = 'site_url_missing'
    }

    checks.webhookReachable.responseTime = Date.now() - whStart
  } catch (_error) {
    checks.webhookReachable.status = 'error'
    overallStatus = 503
  }

  const response = {
    status: overallStatus === 200 ? 'ready' : 'not_ready',
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