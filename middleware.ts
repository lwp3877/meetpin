import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rate limiting을 위한 간단한 메모리 저장소
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const key = `middleware:${ip}`
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const clientIP =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const pathname = request.nextUrl.pathname

  // 🔒 SAFE_MODE: Block write operations (emergency read-only mode)
  if (process.env.SAFE_MODE === 'true') {
    const isWriteOperation = request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS'
    const isWriteAPI = pathname.startsWith('/api/') &&
      !pathname.includes('/health') &&
      !pathname.includes('/status') &&
      !pathname.includes('/ready') &&
      !pathname.includes('/livez') &&
      !pathname.includes('/readyz') &&
      !pathname.includes('/monitoring')

    if (isWriteOperation && isWriteAPI) {
      console.warn(`[SAFE_MODE] Blocked write operation: ${request.method} ${pathname} from ${clientIP}`)
      return new NextResponse(
        JSON.stringify({
          error: 'Service Temporarily Read-Only',
          message: 'Read-only window',
          code: 'SAFE_MODE_ENABLED'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes
          }
        }
      )
    }
  }

  // 기본적인 Rate limiting (전역)
  if (!simpleRateLimit(clientIP, 100, 60000)) {
    // 1분에 100요청
    console.warn(`[Security] Rate limit exceeded for IP: ${clientIP}, Path: ${pathname}`)
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      },
    })
  }

  // Suspicious request patterns 감지
  if (
    pathname.includes('..') ||
    pathname.includes('//') ||
    pathname.toLowerCase().includes('script') ||
    pathname.toLowerCase().includes('eval') ||
    (userAgent.toLowerCase().includes('bot') && !userAgent.toLowerCase().includes('googlebot'))
  ) {
    console.warn(
      `[Security] Suspicious request detected - IP: ${clientIP}, Path: ${pathname}, UA: ${userAgent}`
    )
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Supabase 클라이언트 설정
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 사용자 인증 상태 새로고침
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // API 라우트에 대한 추가 CORS 헤더 설정
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // CORS 헤더 추가
    supabaseResponse.headers.set(
      'Access-Control-Allow-Origin',
      process.env.SITE_URL || 'https://meetpin-weld.vercel.app'
    )
    supabaseResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    )
    supabaseResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
    supabaseResponse.headers.set('Access-Control-Max-Age', '86400')

    // API 호출 로깅 (민감한 정보 제외)
    if (process.env.NODE_ENV === 'production') {
      const duration = Date.now() - startTime
      console.log(`[API] ${request.method} ${pathname} - ${clientIP} - ${duration}ms`)
    }
  }

  // 강화된 보안 헤더 추가
  supabaseResponse.headers.set('X-Request-ID', crypto.randomUUID())
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // HSTS (HTTPS에서만)
  if (request.nextUrl.protocol === 'https:') {
    supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // CSP 헤더 - Kakao Maps, Stripe, Supabase 허용
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.kakaocdn.net https://*.supabase.co https://*.stripe.com",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://dapi.kakao.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')

  supabaseResponse.headers.set('Content-Security-Policy', cspPolicy)

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
