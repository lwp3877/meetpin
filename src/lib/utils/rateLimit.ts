/* src/lib/utils/rateLimit.ts */
// 레거시 호환성을 위한 래퍼 - 새로운 어댑터 시스템으로 이관됨
// 새 코드는 @/lib/rateLimit를 사용하세요

import {
  checkRateLimit,
  checkTypedRateLimit,
  checkIPRateLimit,
  checkUserRateLimit,
  checkUserIPRateLimit,
  getRateLimitInfo,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStats,
  rateLimit,
  defaultLimits,
  type RateLimitOptions,
  type RateLimitType,
} from '@/lib/rateLimit'

// 레거시 export (하위 호환성)
export {
  checkRateLimit,
  checkTypedRateLimit,
  checkIPRateLimit,
  checkUserRateLimit,
  checkUserIPRateLimit,
  getRateLimitInfo,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStats,
  rateLimit,
  defaultLimits,
  type RateLimitOptions,
  type RateLimitType,
}

// 레거시 유틸리티 객체
const rateLimitUtils = {
  check: checkRateLimit,
  checkTyped: checkTypedRateLimit,
  checkIP: checkIPRateLimit,
  checkUser: checkUserRateLimit,
  checkUserIP: checkUserIPRateLimit,
  getInfo: getRateLimitInfo,
  reset: resetRateLimit,
  resetAll: resetAllRateLimits,
  getStats: getRateLimitStats,
  limits: defaultLimits,
}

export default rateLimitUtils
