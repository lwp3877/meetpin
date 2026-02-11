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

      // Strict same-origin check for non-exempt paths
      if (!isExempt && origin && referer && !referer.startsWith(origin)) {
        return new NextResponse('CSRF validation failed', { status: 403 });
      }
    }

    // 허용된 오리진 화이트리스트
    const allowedOrigins = [
      'https://meetpin-weld.vercel.app',
      'https://meetpin.com',
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
