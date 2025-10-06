/**
 * 안전한 네비게이션 유틸리티
 * Next.js 환경에서 클라이언트 사이드 네비게이션을 안전하게 처리
 */

import { logger } from '@/lib/observability/logger'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Router instance를 위한 임시 저장소 (Next.js App Router instance)
let routerInstance: AppRouterInstance | null = null

// Router 인스턴스 설정 (컴포넌트에서 호출)
export function setRouterInstance(router: AppRouterInstance): void {
  routerInstance = router
}

// Next.js router를 사용한 안전한 네비게이션
export function safeNavigate(path: string): void {
  if (typeof window === 'undefined') {
    // Server-side에서는 실행하지 않음
    return
  }

  try {
    if (routerInstance && routerInstance.push) {
      routerInstance.push(path)
    } else {
      // Router가 없으면 fallback
      window.location.href = path
    }
  } catch (error) {
    // Router 사용 실패 시 fallback
    logger.warn('Next.js router failed, using window.location', { error: error instanceof Error ? error.message : String(error) })
    window.location.href = path
  }
}

// 안전한 리다이렉트 (HOC에서 사용)
export function safeRedirect(path: string): void {
  if (typeof window === 'undefined') return

  // 즉시 실행이 아닌 다음 tick에서 실행
  setTimeout(() => {
    safeNavigate(path)
  }, 0)
}

// 로그인 페이지로 리다이렉트
export function redirectToLogin(): void {
  safeRedirect('/auth/login')
}

// 홈으로 리다이렉트
export function redirectToHome(): void {
  safeRedirect('/')
}

// 이전 페이지로 이동
export function goBack(): void {
  if (typeof window === 'undefined') return

  if (window.history.length > 1) {
    window.history.back()
  } else {
    redirectToHome()
  }
}

// URL에 쿼리 파라미터 추가
export function addQueryParams(path: string, params: Record<string, string>): string {
  if (typeof window === 'undefined') return path

  const url = new URL(path, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.pathname + url.search
}

// 현재 페이지에서 특정 파라미터만 업데이트
export function updateQueryParams(params: Record<string, string | null>): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)

  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
  })

  const newUrl = url.pathname + url.search
  window.history.replaceState({}, '', newUrl)
}

export const navigationUtils = {
  safeNavigate,
  safeRedirect,
  redirectToLogin,
  redirectToHome,
  goBack,
  addQueryParams,
  updateQueryParams,
  setRouterInstance,
}

export default navigationUtils
