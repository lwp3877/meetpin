/* src/components/DynamicMap.tsx */
'use client'

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// 카카오맵 컴포넌트를 동적으로 로드 - 초기 페이지 로딩 성능 향상
const DynamicMapComponent = dynamic(
  () => import('@/components/MapWithCluster'),
  {
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">지도를 불러오는 중...</p>
        </div>
      </div>
    ),
    ssr: false // 클라이언트에서만 렌더링
  }
)

export default DynamicMapComponent