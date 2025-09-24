/* 파일경로: src/app/legal/cookie-policy/page.tsx */
import { brandMessages } from '@/lib/config/brand'

export const dynamic = 'force-static'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            🍪 쿠키 및 트래킹 정책
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-text">
              쿠키 및 트래킹 정책
            </h2>
            <p className="text-muted-foreground mt-2">
              {brandMessages.appName}의 쿠키 사용 및 개인정보보호 정책
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              최종 업데이트: 2024년 1월 1일
            </div>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-semibold mb-2">1. 쿠키 정책 개요</h3>
              <p className="text-muted-foreground">
                {brandMessages.appName}은 더 나은 서비스 제공을 위해 쿠키 및 유사한 트래킹 기술을 사용합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">2. 사용하는 쿠키의 종류</h3>
              
              <h4 className="text-md font-medium mb-2">2.1 필수 쿠키</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• 세션 관리: 로그인 상태 유지</li>
                <li>• 보안: CSRF 방지, 보안 토큰</li>
                <li>• 기능: 언어 설정, 지역 설정</li>
              </ul>

              <h4 className="text-md font-medium mb-2 mt-3">2.2 기능 쿠키</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• 사용자 설정: 테마, 알림 설정</li>
                <li>• 지도 설정: 마지막 조회 위치</li>
                <li>• 폼 데이터: 임시 저장된 작성 내용</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">3. 쿠키 동의 관리</h3>
              <p className="text-muted-foreground">
                웹사이트 첫 방문 시 쿠키 동의 배너가 표시되며, 카테고리별 선택적 동의가 가능합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">4. 연락처</h3>
              <p className="text-muted-foreground">
                쿠키 정책에 대한 문의: privacy@meetpin.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}