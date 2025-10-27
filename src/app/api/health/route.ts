/* src/app/api/health/route.ts - 프로덕션 헬스체크 API */

import { NextRequest } from 'next/server'
import { ApiResponse, apiUtils, requireAdmin } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'
import { logger } from '@/lib/observability/logger'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
    auth: 'configured' | 'missing_keys' | 'error'
    maps: 'configured' | 'missing_key' | 'error'
    payments: 'configured' | 'missing_keys' | 'disabled' | 'error'
  }
  additional_services?: {
    maps: 'configured' | 'missing_key' | 'error'
    payments: 'configured' | 'missing_keys' | 'disabled' | 'error'
  }
  performance: {
    uptime: number
    memory_usage: number
  }
  build_info: {
    build_time: string
    commit_hash?: string
    deploy_env: string
  }
}

export async function GET(_request: NextRequest): Promise<Response> {
  const startTime = Date.now()

  try {
    // 환경 정보 수집
    const environment = isDevelopmentMode ? 'development-mock' : 'production'
    const version = process.env.npm_package_version || '1.4.22'

    // Mock 모드에서는 항상 정상 상태 반환
    if (isDevelopmentMode) {
      const mockServices = {
        database: 'connected' as const,
        auth: 'configured' as const,
        maps: 'configured' as const,
        payments: 'configured' as const,
      }

      const healthResult: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version,
        environment: 'mock-mode',
        services: mockServices,
        additional_services: {
          maps: 'configured',
          payments: 'configured',
        },
        performance: {
          uptime: process.uptime(),
          memory_usage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        },
        build_info: {
          build_time: new Date().toISOString(),
          commit_hash: process.env.VERCEL_GIT_COMMIT_SHA,
          deploy_env: process.env.VERCEL_ENV || 'mock',
        },
      }

      const responseTime = Date.now() - startTime

      return Response.json(
        {
          ok: true,
          data: healthResult,
          meta: {
            response_time_ms: responseTime,
            checks_performed: 4,
            mode: 'mock-development',
          },
        } as ApiResponse<HealthCheckResult>,
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Health-Check': 'meetpin-mock',
            'X-Response-Time': `${responseTime}ms`,
            'X-Service-Status': 'healthy',
            'X-Mock-Mode': 'true',
          },
        }
      )
    }

    // 서비스 상태 체크 (Non-Mock 모드)
    const services = await checkServices()

    // 성능 메트릭 수집
    const performance = {
      uptime: process.uptime(),
      memory_usage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100, // MB
    }

    // 빌드 정보
    const build_info = {
      build_time: new Date().toISOString(),
      commit_hash: process.env.VERCEL_GIT_COMMIT_SHA,
      deploy_env: process.env.VERCEL_ENV || 'local',
    }

    // 전체 상태 판단 (핵심 서비스만 체크, 부가 기능은 제외)
    const coreServicesHealthy = isDevelopmentMode
      ? true // 개발 모드에서는 항상 정상
      : services.database === 'connected' &&
        (services.auth === 'configured' || services.auth === 'missing_keys')

    // 부가 서비스 상태 (maps, payments는 경고만 표시)
    const additionalServices = {
      maps: services.maps,
      payments: services.payments
    }

    const overallStatus = coreServicesHealthy ? 'healthy' : 'unhealthy'

    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version,
      environment,
      services,
      additional_services: additionalServices,
      performance,
      build_info,
    }

    const responseTime = Date.now() - startTime

    return Response.json(
      {
        ok: true,
        data: healthResult,
        meta: {
          response_time_ms: responseTime,
          checks_performed: Object.keys(services).length,
        },
      } as ApiResponse<HealthCheckResult>,
      {
        status: overallStatus === 'unhealthy' ? 503 : 200, // healthy나 degraded는 200, unhealthy만 503
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'meetpin-v1',
          'X-Response-Time': `${responseTime}ms`,
          'X-Service-Status': overallStatus,
        },
      }
    )
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error),
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
      isDevelopmentMode,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasKakaoKey: !!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
    })

    return Response.json(
      {
        ok: false,
        message: '헬스체크 중 오류가 발생했습니다',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          debug_info: {
            isDevelopmentMode,
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKakaoKey: !!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
          },
        },
      } as ApiResponse<any>,
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'meetpin-v1',
        },
      }
    )
  }
}

async function checkServices() {
  const services = {
    database: 'error' as 'connected' | 'disconnected' | 'error',
    auth: 'error' as 'configured' | 'missing_keys' | 'error',
    maps: 'error' as 'configured' | 'missing_key' | 'error',
    payments: 'error' as 'configured' | 'missing_keys' | 'disabled' | 'error',
  }

  // 1. 데이터베이스 연결 체크
  try {
    if (isDevelopmentMode) {
      services.database = 'connected' // Mock 모드에서는 항상 연결됨
    } else {
      const supabase = await createServerSupabaseClient()
      const { data: _data, error } = await supabase.from('profiles').select('uid').limit(1)

      services.database = error ? 'disconnected' : 'connected'
    }
  } catch (_error) {
    services.database = 'error'
  }

  // 2. Supabase 인증 설정 체크
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
      // 키 형식 검증
      const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
      const isValidAnonKey = supabaseAnonKey.startsWith('eyJ')
      const isValidServiceKey = supabaseServiceKey.startsWith('eyJ')

      services.auth =
        isValidUrl && isValidAnonKey && isValidServiceKey ? 'configured' : 'missing_keys'
    } else {
      services.auth = 'missing_keys'
    }
  } catch (_error) {
    services.auth = 'error'
  }

  // 3. 카카오맵 API 키 체크
  try {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    services.maps = kakaoKey && kakaoKey !== 'your-kakao-key' ? 'configured' : 'missing_key'
  } catch (_error) {
    services.maps = 'error'
  }

  // 4. Stripe 결제 설정 체크
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (stripeSecretKey && stripePublishableKey && stripeWebhookSecret) {
      const isValidSecretKey = stripeSecretKey.startsWith('sk_')
      const isValidPublishableKey = stripePublishableKey.startsWith('pk_')
      const isValidWebhookSecret = stripeWebhookSecret.startsWith('whsec_')

      services.payments =
        isValidSecretKey && isValidPublishableKey && isValidWebhookSecret
          ? 'configured'
          : 'missing_keys'
    } else {
      services.payments = 'disabled'
    }
  } catch (_error) {
    services.payments = 'error'
  }

  return services
}

// POST 요청으로 상세 진단 정보 제공 (관리자 전용)
export async function POST(_request: NextRequest): Promise<Response> {
  try {
    // 관리자 인증 필요
    await requireAdmin()

    // 상세 진단 정보 수집
    const diagnostics = await collectDetailedDiagnostics()

    return Response.json({
      ok: true,
      data: diagnostics,
      message: '상세 진단 정보입니다',
    } as ApiResponse<any>)
  } catch (error) {
    logger.error('Detailed diagnostics failed', { error: error instanceof Error ? error.message : String(error) })
    return apiUtils.error('진단 정보 수집에 실패했습니다', 500)
  }
}

async function collectDetailedDiagnostics() {
  return {
    environment_variables: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      vercel_region: process.env.VERCEL_REGION,
      vercel_url: process.env.VERCEL_URL,
      is_development_mode: isDevelopmentMode,
      supabase_configured: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      kakao_maps_configured: !!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
      stripe_configured: !!(
        process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ),
    },
    system_info: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime_seconds: process.uptime(),
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
    },
    feature_flags: {
      use_mock_data: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
      enable_analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enable_admin_panel: process.env.NEXT_PUBLIC_ENABLE_ADMIN_PANEL !== 'false',
      enable_realtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'false',
      enable_file_upload: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD !== 'false',
    },
    build_info: {
      vercel_git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA,
      vercel_git_commit_ref: process.env.VERCEL_GIT_COMMIT_REF,
      vercel_git_repo_slug: process.env.VERCEL_GIT_REPO_SLUG,
      vercel_git_commit_message: process.env.VERCEL_GIT_COMMIT_MESSAGE,
    },
  }
}
