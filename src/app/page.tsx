/* 파일경로: src/app/page.tsx */
'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

// 홈페이지 컴포넌트 동적 로딩 - 초기 번들 크기 감소
const EnhancedLanding = dynamic(() => import('@/components/premium/enhanced-landing'), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
            <span className="text-2xl">📍</span>
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-300 font-semibold">밋핀 로딩 중...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">잠시만 기다려주세요</div>
        </CardContent>
      </Card>
    </div>
  )
})

export default function HomePage() {
  return <EnhancedLanding />
}