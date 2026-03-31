import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // API 경로에만 CORS 제한 적용
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');

    // CSRF Protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const referer = request.headers.get('referer');

      // Allow webhook endpoints and health checks without CSRF
      const csrfExemptPaths = [
        '/api/payments/stripe/webhook',
        '/api/healthz',
        '/api/livez',
        '/api/ready',
        '/api/readyz',
        '/api/status',
        '/api/health',
        '/api/cron/',
      ];

      const isExempt = csrfExemptPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
      );

      // Strict same-origin check for non-exempt paths.
      //
      // 보안 원칙: origin 헤더가 있다는 건 브라우저가 명시적으로 출처를 알린 것.
      // 이 경우 referer도 반드시 같은 출처여야 함.
      // - referer 없음(null) + origin 있음: CSRF 공격자가 referer를 제거한 패턴 → 차단
      // - referer 있음 + origin 불일치: 명백한 크로스오리진 요청 → 차단
      // - origin 없음: 서버-서버 직접 호출 또는 구형 브라우저 → 허용 (origin 기반 체크만)
      if (!isExempt && origin && (!referer || !referer.startsWith(origin))) {
        return new NextResponse('CSRF validation failed', { status: 403 });
      }
    }

    // 허용된 오리진 화이트리스트
    const allowedOrigins = [
      'https://meetpin-umber.vercel.app',
      'https://meetpin-umber.vercel.app',
      'https://meetpin.com',
      process.env.SITE_URL || null,
      process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null,
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
    ].filter(Boolean) as string[];

    // Origin이 허용 목록에 있을 경우에만 CORS 허용
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      response.headers.set('Access-Control-Max-Age', '86400'); // 24시간
    }

    // OPTIONS 프리플라이트 요청 처리
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
