/* 파일경로: src/app/legal/location-terms/page.tsx */
import { brandMessages } from '@/lib/config/brand'

export const dynamic = 'force-static'

export default function LocationTermsPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-primary text-xl font-bold">📍 위치정보 이용약관</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="border-b pb-4 text-center">
            <h2 className="text-text text-2xl font-bold">위치정보 이용약관</h2>
            <p className="text-muted-foreground mt-2">
              {brandMessages.appName}의 위치기반서비스 이용에 관한 약관
            </p>
            <div className="text-muted-foreground mt-2 text-sm">최종 업데이트: 2024년 1월 1일</div>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="mb-2 text-lg font-semibold">1. 목적 및 근거</h3>
              <p className="text-muted-foreground">
                본 약관은 위치정보의 보호 및 이용 등에 관한 법률에 따라 {brandMessages.appName}이
                제공하는 위치기반서비스에 대한 권리, 의무 및 책임사항을 정합니다.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">2. 용어의 정의</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <strong>위치정보:</strong> 특정한 시간에 존재하는 장소에 관한 정보
                </li>
                <li>
                  <strong>위치기반서비스:</strong> 위치정보를 수집, 이용하는 서비스
                </li>
                <li>
                  <strong>개인위치정보:</strong> 특정 개인의 위치정보
                </li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">3. 개인위치정보의 수집·이용·제공</h3>
              <p className="text-muted-foreground">
                GPS 기반의 정확한 위치정보와 네트워크 기반의 대략적인 위치정보를 수집하여 모임 장소
                설정 및 추천, 근거리 사용자 매칭 서비스에 이용합니다.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">4. 위치정보 관리책임자</h3>
              <p className="text-muted-foreground">연락처: privacy@meetpin.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
