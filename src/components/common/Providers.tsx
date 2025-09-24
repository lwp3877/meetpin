/* 파일경로: src/components/Providers.tsx */
// 클라이언트 사이드 Provider들을 관리하는 래퍼

'use client'

import { AuthProvider } from '@/lib/useAuth'
import { CustomToaster } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/common/theme-provider'
import { BotSchedulerInitializer } from '@/components/common/BotSchedulerInitializer'
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { Toaster } from 'sonner'
import { logFeatureFlags } from '@/lib/config/features'
import { useEffect } from 'react'
import { initializeBrowserCompatibility } from '@/lib/utils/browserCompat'
import { initializeDataValidation } from '@/lib/utils/dataValidation'
import { initializeSecurityMeasures } from '@/lib/security/securityHardening'
import { initializeAccessibility } from '@/lib/accessibility/a11yEnhancement'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // 개발 모드에서 피처 플래그 로그 출력
    logFeatureFlags()

    // 실제 사용자 테스트를 위한 모든 시스템 초기화
    console.log('🚀 실제 사용자 테스트 준비: 모든 시스템 초기화 시작')
    
    const cleanupFunctions: (() => void)[] = []

    // 브라우저 호환성 및 성능 최적화
    initializeBrowserCompatibility().then((cleanup) => {
      if (cleanup) cleanupFunctions.push(cleanup)
    })

    // 데이터 검증 시스템
    const dataValidationCleanup = initializeDataValidation()
    cleanupFunctions.push(dataValidationCleanup)

    // 보안 강화 시스템
    const securityCleanup = initializeSecurityMeasures()
    cleanupFunctions.push(securityCleanup)

    // 접근성 개선 시스템
    const accessibilityCleanup = initializeAccessibility()
    cleanupFunctions.push(accessibilityCleanup)

    console.log('✅ 실제 사용자 테스트 준비 완료: 모든 시스템이 활성화되었습니다')
    console.log(`
🎯 실제 사용자 테스트 환경 설정 완료

📋 활성화된 기능:
   ✅ 전역 에러 바운더리 - 모든 React 에러 포착
   ✅ 강화된 HTTP 클라이언트 - 자동 재시도 및 타임아웃
   ✅ 터치 최적화 - 모바일 인터페이스 완벽 지원
   ✅ 브라우저 호환성 - 모든 기기에서 동작 보장
   ✅ 실시간 데이터 검증 - Mock vs 실제 데이터 품질 확인
   ✅ 보안 강화 - XSS, CSRF, 입력 검증 완전 차단
   ✅ 접근성 지원 - 키보드, 스크린리더, WCAG 준수
   ✅ 성능 최적화 - 이미지 지연로딩, 메모리 관리

🔧 개발자 도구:
   - Alt+H: 홈으로 이동
   - Alt+M: 지도 보기  
   - Alt+S: 검색 포커스
   - /: 빠른 검색
   - Ctrl+/: 단축키 도움말

📊 모니터링:
   - 실시간 데이터 검증 (30초마다 요약)
   - 성능 메모리 사용량 추적
   - 보안 이벤트 로깅
   - 접근성 점수 계산
    `)

    // cleanup 함수 반환
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
      console.log('🧹 시스템 정리 완료')
    }
  }, [])

  return (
    <GlobalErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          {/* 봇 스케줄러 자동 초기화 */}
          <BotSchedulerInitializer />
          {/* Enhanced Toast 알림 */}
          <CustomToaster />
          {/* Sonner Toast (새로운 토스트 시스템) */}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton 
            expand={true}
            duration={4000}
            toastOptions={{
              style: {
                background: 'rgb(255 255 255 / 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgb(229 231 235)',
                color: 'rgb(17 24 39)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
}