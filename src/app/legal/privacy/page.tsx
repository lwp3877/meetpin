/* 파일경로: src/app/legal/privacy/page.tsx */
import { brandMessages } from '@/lib/brand'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            🔒 개인정보처리방침
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-text">
              {brandMessages.appName} 개인정보처리방침
            </h2>
            <p className="text-text-muted mt-2">
              시행일: 2024년 1월 1일
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-text mb-3">1. 개인정보의 처리목적</h3>
              <p className="text-text-muted leading-relaxed">
                {brandMessages.appName}(이하 &ldquo;회사&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다. 
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 
                필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                <li>위치 기반 모임 서비스 제공</li>
                <li>고객 문의사항 응답, 불만처리 등 민원처리</li>
                <li>서비스 개선 및 신규서비스 개발</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">2. 개인정보의 처리 및 보유기간</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 
                개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>회원정보: 회원 탈퇴 후 5년</li>
                <li>위치정보: 서비스 제공 완료 후 즉시 삭제</li>
                <li>채팅 메시지: 대화 종료 후 1년</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">3. 개인정보의 제3자 제공</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 정보주체의 동의, 법률의 특별한 규정 등 
                개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">4. 개인정보처리의 위탁</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>Supabase Inc. - 데이터베이스 서비스 제공</li>
                <li>Stripe Inc. - 결제 처리 서비스</li>
                <li>카카오 - 지도 서비스 및 간편 로그인</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">5. 정보주체의 권리·의무 및 행사방법</h3>
              <p className="text-text-muted leading-relaxed">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>
            </section>
          </div>

          {/* Development Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🚧 <strong>법무 검토 중:</strong> 완전한 개인정보처리방침은 개인정보보호 전문가의 검토를 거쳐 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}