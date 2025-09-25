/* 파일경로: src/app/page.tsx */
'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

// 홈페이지 컴포넌트 동적 로딩 - 초기 번들 크기 감소
const EnhancedLanding = dynamic(() => import('@/components/premium/enhanced-landing'), {
  ssr: true,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20">
      <Card className="mx-4 w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-900/90">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl">
            <span className="text-2xl">📍</span>
          </div>
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            밋핀 로딩 중...
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">잠시만 기다려주세요</div>
        </CardContent>
      </Card>
    </div>
  ),
})

export default function HomePage() {
  return <EnhancedLanding />
}
