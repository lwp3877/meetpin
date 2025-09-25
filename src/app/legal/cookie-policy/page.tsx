/* 파일경로: src/app/legal/cookie-policy/page.tsx */
import { brandMessages } from '@/lib/config/brand'

export const dynamic = 'force-static'

export default function CookiePolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-primary text-xl font-bold">🍪 쿠키 및 트래킹 정책</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="border-b pb-4 text-center">
            <h2 className="text-text text-2xl font-bold">쿠키 및 트래킹 정책</h2>
            <p className="text-muted-foreground mt-2">
              {brandMessages.appName}의 쿠키 사용 및 개인정보보호 정책
            </p>
            <div className="text-muted-foreground mt-2 text-sm">최종 업데이트: 2024년 1월 1일</div>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="mb-2 text-lg font-semibold">1. 쿠키 정책 개요</h3>
              <p className="text-muted-foreground">
                {brandMessages.appName}은 더 나은 서비스 제공을 위해 쿠키 및 유사한 트래킹 기술을
                사용합니다.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">2. 사용하는 쿠키의 종류</h3>

              <h4 className="text-md mb-2 font-medium">2.1 필수 쿠키</h4>
              <ul className="text-muted-foreground ml-4 space-y-1">
                <li>• 세션 관리: 로그인 상태 유지</li>
                <li>• 보안: CSRF 방지, 보안 토큰</li>
                <li>• 기능: 언어 설정, 지역 설정</li>
              </ul>

              <h4 className="text-md mt-3 mb-2 font-medium">2.2 기능 쿠키</h4>
              <ul className="text-muted-foreground ml-4 space-y-1">
                <li>• 사용자 설정: 테마, 알림 설정</li>
                <li>• 지도 설정: 마지막 조회 위치</li>
                <li>• 폼 데이터: 임시 저장된 작성 내용</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">3. 쿠키 동의 관리</h3>
              <p className="text-muted-foreground">
                웹사이트 첫 방문 시 쿠키 동의 배너가 표시되며, 카테고리별 선택적 동의가 가능합니다.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold">4. 연락처</h3>
              <p className="text-muted-foreground">쿠키 정책에 대한 문의: privacy@meetpin.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
