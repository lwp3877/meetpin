/* 파일경로: src/app/map/page.tsx */
import { brandMessages } from '@/lib/brand'

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            📍 {brandMessages.appName}
          </h1>
        </div>
      </header>

      {/* Map Placeholder */}
      <div className="relative h-[calc(100vh-64px)] bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold text-text">
              지도 페이지 준비 중
            </h2>
            <p className="text-text-muted max-w-md">
              카카오 지도 SDK 연동과 MapWithCluster 컴포넌트를 곧 추가할 예정입니다.
            </p>
          </div>

          {/* Future MapWithCluster Component Placeholder */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-lg">
            <div className="text-sm text-text-muted space-y-2">
              <p>🚧 <strong>향후 구현 예정:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>MapWithCluster 컴포넌트</li>
                <li>실시간 방 마커 표시</li>
                <li>지도 클릭으로 방 생성</li>
                <li>클러스터링으로 성능 최적화</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Placeholder */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full shadow-lg px-6 py-3 flex space-x-4">
            <button className="text-primary font-medium">지도</button>
            <button className="text-text-muted">요청함</button>
            <button className="text-text-muted">프로필</button>
          </div>
        </div>
      </div>
    </div>
  )
}