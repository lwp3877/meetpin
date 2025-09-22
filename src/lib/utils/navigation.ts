/**
 * 안전한 네비게이션 유틸리티
 * Next.js 환경에서 클라이언트 사이드 네비게이션을 안전하게 처리
 */

// Next.js router를 동적으로 import하여 사용
export async function safeNavigate(path: string): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side에서는 실행하지 않음
    return
  }

  try {
    // Next.js router를 동적으로 import
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push(path)
  } catch (error) {
    // Router import 실패 시 fallback
    console.warn('Next.js router import failed, using window.location:', error)
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
}

export default navigationUtils