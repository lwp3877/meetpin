/* 파일경로: src/app/legal/terms/page.tsx */
import { brandMessages } from '@/lib/brand'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            📋 이용약관
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-text">
              {brandMessages.appName} 이용약관
            </h2>
            <p className="text-text-muted mt-2">
              시행일: 2024년 1월 1일
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제1조 (목적)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관은 {brandMessages.appName}(이하 &ldquo;서비스&rdquo;)의 이용에 관한 조건 및 절차, 
                이용자와 회사 간의 권리와 의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제2조 (정의)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>&ldquo;서비스&rdquo;란 회사가 제공하는 위치 기반 소셜 모임 플랫폼을 의미합니다.</li>
                <li>&ldquo;이용자&rdquo;란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.</li>
                <li>&ldquo;방&rdquo;이란 이용자가 생성한 모임 공간을 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제3조 (약관의 효력 및 변경)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 
                회사는 합리적인 사유가 발생할 경우 본 약관을 변경할 수 있으며, 
                약관이 변경되는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 
                적용일자 7일 이전부터 공지합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제4조 (서비스의 제공 및 변경)</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>위치 기반 모임 방 생성 및 참여 서비스</li>
                <li>실시간 채팅 메시지 서비스</li>
                <li>사용자 프로필 관리 서비스</li>
                <li>기타 회사가 추가로 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
            </section>
          </div>

          {/* Development Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🚧 <strong>법무 검토 중:</strong> 완전한 이용약관은 법무팀 검토를 거쳐 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}