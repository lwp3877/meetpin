/* src/lib/cache/pageCache.ts */
// 🚀 페이지 레벨 캐시 최적화 - 핵심 라우트 캐싱

import { NextRequest, NextResponse } from 'next/server'

// 페이지별 캐시 설정
export const PAGE_CACHE_CONFIG = {
  // 정적 페이지들 - 장기 캐싱
  '/': { maxAge: 3600, staleWhileRevalidate: 86400 }, // 1시간 + 1일 SWR
  '/about': { maxAge: 86400, staleWhileRevalidate: 604800 }, // 1일 + 1주 SWR
  '/contact': { maxAge: 86400, staleWhileRevalidate: 604800 },
  '/help': { maxAge: 86400, staleWhileRevalidate: 604800 },
  '/legal/terms': { maxAge: 604800, staleWhileRevalidate: 2592000 }, // 1주 + 1달 SWR
  '/legal/privacy': { maxAge: 604800, staleWhileRevalidate: 2592000 },
  '/legal/location': { maxAge: 604800, staleWhileRevalidate: 2592000 },

  // 동적이지만 자주 변하지 않는 페이지들
  '/auth/login': { maxAge: 1800, staleWhileRevalidate: 3600 }, // 30분 + 1시간 SWR
  '/auth/signup': { maxAge: 1800, staleWhileRevalidate: 3600 },
  '/room/new': { maxAge: 900, staleWhileRevalidate: 1800 }, // 15분 + 30분 SWR

  // 사용자별 페이지들 - 짧은 캐싱
  '/map': { maxAge: 300, staleWhileRevalidate: 900 }, // 5분 + 15분 SWR (자주 업데이트되는 방 목록)
  '/profile': { maxAge: 600, staleWhileRevalidate: 1800 }, // 10분 + 30분 SWR
  '/requests': { maxAge: 120, staleWhileRevalidate: 300 }, // 2분 + 5분 SWR (실시간성 중요)
  '/rooms': { maxAge: 300, staleWhileRevalidate: 900 }, // 5분 + 15분 SWR
}

// Cache-Control 헤더 생성
export function createCacheHeaders(path: string): Record<string, string> {
  const config = PAGE_CACHE_CONFIG[path as keyof typeof PAGE_CACHE_CONFIG]

  if (!config) {
    // 기본값: 동적 페이지
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }
  }

  const { maxAge, staleWhileRevalidate } = config

  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    Vary: 'Accept-Encoding, User-Agent',
  }
}

// API 라우트용 캐시 헤더
export const API_CACHE_CONFIG = {
  // 정적 데이터
  '/api/health': { maxAge: 300, staleWhileRevalidate: 600 }, // 5분 + 10분

  // 실시간성이 중요한 API
  '/api/rooms': { maxAge: 60, staleWhileRevalidate: 180 }, // 1분 + 3분 SWR
  '/api/requests': { maxAge: 30, staleWhileRevalidate: 120 }, // 30초 + 2분 SWR
  '/api/matches': { maxAge: 30, staleWhileRevalidate: 120 },
  '/api/notifications': { maxAge: 15, staleWhileRevalidate: 60 }, // 15초 + 1분 SWR

  // 사용자 데이터
  '/api/profile': { maxAge: 300, staleWhileRevalidate: 900 }, // 5분 + 15분 SWR

  // 인증 관련
  '/api/auth': { maxAge: 0, staleWhileRevalidate: 0 }, // 캐시 안함
}

export function createApiCacheHeaders(path: string): Record<string, string> {
  const config = API_CACHE_CONFIG[path as keyof typeof API_CACHE_CONFIG]

  if (!config || config.maxAge === 0) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }
  }

  const { maxAge, staleWhileRevalidate } = config

  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    Vary: 'Accept-Encoding, Authorization',
  }
}

// 조건부 캐싱 미들웨어
export function withCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req)

    // API 경로 체크
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const cacheHeaders = createApiCacheHeaders(req.nextUrl.pathname)
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    } else {
      // 페이지 경로
      const cacheHeaders = createCacheHeaders(req.nextUrl.pathname)
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return response
  }
}

// ETags를 위한 콘텐츠 해시 생성
export function generateETag(content: string): string {
  if (typeof window === 'undefined') {
    // Node.js 환경에서만 crypto 사용
    const crypto = eval('require')('crypto')
    return crypto.createHash('md5').update(content).digest('hex')
  }
  // 브라우저 환경에서는 간단한 해시 생성
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 32비트 정수로 변환
  }
  return Math.abs(hash).toString(16)
}

// 조건부 요청 처리
export function handleConditionalRequest(req: NextRequest, etag: string): NextResponse | null {
  const ifNoneMatch = req.headers.get('if-none-match')

  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'Cache-Control': 'public, max-age=300',
        ETag: etag,
      },
    })
  }

  return null
}
