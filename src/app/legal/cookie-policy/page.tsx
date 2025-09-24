export const dynamic = 'force-static'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            쿠키 및 트래킹 정책
          </h1>
          <p className="text-gray-600">
            MeetPin의 쿠키 사용 및 개인정보보호 정책
          </p>
          <div className="mt-4 text-sm text-gray-500">
            최종 업데이트: 2024년 1월 1일
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. 쿠키 정책 개요</h2>
            <p>MeetPin은 더 나은 서비스 제공을 위해 쿠키 및 유사한 트래킹 기술을 사용합니다.</p>
            
            <h2>2. 사용하는 쿠키의 종류</h2>
            <h3>2.1 필수 쿠키</h3>
            <ul>
              <li>세션 관리: 로그인 상태 유지</li>
              <li>보안: CSRF 방지, 보안 토큰</li>
              <li>기능: 언어 설정, 지역 설정</li>
            </ul>
            
            <h3>2.2 기능 쿠키</h3>
            <ul>
              <li>사용자 설정: 테마, 알림 설정</li>
              <li>지도 설정: 마지막 조회 위치</li>
              <li>폼 데이터: 임시 저장된 작성 내용</li>
            </ul>
            
            <h2>3. 쿠키 동의 관리</h2>
            <p>웹사이트 첫 방문 시 쿠키 동의 배너가 표시되며, 카테고리별 선택적 동의가 가능합니다.</p>
            
            <h2>4. 연락처</h2>
            <p>쿠키 정책에 대한 문의: privacy@meetpin.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}