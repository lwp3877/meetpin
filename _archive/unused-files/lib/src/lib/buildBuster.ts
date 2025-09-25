/* src/lib/buildBuster.ts */
// 빌드 버전 캐시 무효화를 위한 식별자

export const BUILD_VERSION = '1.4.0-security-enhanced'
export const BUILD_TIMESTAMP = Date.now()
export const BUILD_HASH = `v${BUILD_VERSION}-${BUILD_TIMESTAMP}`

/**
 * 캐시 무효화를 위한 쿼리 스트링 생성
 * 정적 자산이나 API 엔드포인트에 사용
 */
export function getCacheBuster(): string {
  return `?v=${BUILD_HASH}`
}

/**
 * 개발 환경에서는 timestamp 사용, 프로덕션에서는 고정 해시 사용
 */
export function getVersionedUrl(baseUrl: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  const version = isDev ? Date.now() : BUILD_TIMESTAMP
  const separator = baseUrl.includes('?') ? '&' : '?'

  return `${baseUrl}${separator}v=${version}`
}

/**
 * 빌드 정보 메타데이터
 */
export const BUILD_INFO = {
  version: BUILD_VERSION,
  timestamp: BUILD_TIMESTAMP,
  hash: BUILD_HASH,
  buildDate: new Date().toISOString(),
  features: {
    securityEnhanced: true,
    rateLimitingUpgraded: true,
    apiConsistencyFixed: true,
    testingComplete: true,
  },
} as const

export default BUILD_INFO
