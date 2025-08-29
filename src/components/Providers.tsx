/* 파일경로: src/components/Providers.tsx */
// 클라이언트 사이드 Provider들을 관리하는 래퍼

'use client'

import { AuthProvider } from '@/lib/useAuth'
import { CustomToaster } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { logFeatureFlags } from '@/lib/features'
import { useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // 개발 모드에서 피처 플래그 로그 출력
    logFeatureFlags()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
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
  )
}