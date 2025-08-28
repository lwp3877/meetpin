/* src/components/Providers.tsx */
// 클라이언트 사이드 Provider들을 관리하는 래퍼

'use client'

import { AuthProvider } from '@/lib/useAuth'
import { CustomToaster } from '@/components/ui/Toast'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      {/* Enhanced Toast 알림 */}
      <CustomToaster />
    </AuthProvider>
  )
}