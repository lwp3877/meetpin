/* 파일경로: src/app/page.tsx */
'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

// 프로덕션급 랜딩 페이지
const ProLanding = dynamic(() => import('@/components/landing/ProLanding'), {
  ssr: true,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="mx-4 w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-xl">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-blue-600 shadow-2xl mx-auto">
            <span className="text-2xl">📍</span>
          </div>
          <div className="text-lg font-semibold text-gray-600">
            밋핀 로딩 중...
          </div>
          <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
        </CardContent>
      </Card>
    </div>
  ),
})

export default function HomePage() {
  return <ProLanding />
}
