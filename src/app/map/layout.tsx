/* src/app/map/layout.tsx */
// 🎯 지도 페이지 레이아웃 - 캐싱 최적화

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '밋핀 지도 - 주변 모임 찾기',
  description: '지도에서 내 주변의 모임을 찾아보세요. 술, 운동, 다양한 활동의 모임이 기다리고 있습니다.',
}

// 페이지 캐싱 설정
export const revalidate = 300 // 5분마다 재검증
export const dynamic = 'force-dynamic' // 사용자별 데이터로 인해 동적 렌더링 필요

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}