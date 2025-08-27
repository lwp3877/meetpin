/* 파일경로: src/app/legal/location/page.tsx */
import { brandMessages } from '@/lib/brand'

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            📍 위치정보이용약관
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-text">
              {brandMessages.appName} 위치정보이용약관
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
                본 약관은 {brandMessages.appName}(이하 &ldquo;회사&rdquo;)가 제공하는 위치정보사업 또는 
                위치기반서비스사업과 관련하여 회사와 개인위치정보주체와의 권리, 의무 및 
                책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제2조 (용어의 정의)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관에서 사용하는 용어의 의미는 다음과 같습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>&ldquo;위치정보&rdquo;란 이동통신 단말장치의 위치를 식별할 수 있는 경·위도 좌표정보를 말합니다.</li>
                <li>&ldquo;개인위치정보&rdquo;란 특정 개인의 위치정보를 말합니다.</li>
                <li>&ldquo;위치기반서비스&rdquo;란 위치정보를 이용하여 제공하는 서비스를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제3조 (서비스 내용 및 요금)</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 위치정보를 이용하여 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>근처 모임 검색 서비스</li>
                <li>지도 기반 모임 생성 서비스</li>
                <li>위치 기반 매칭 서비스</li>
                <li>기타 위치정보를 이용한 부가서비스</li>
              </ul>
              <p className="mt-3 text-text-muted leading-relaxed">
                위치기반서비스는 무료로 제공되며, 부가서비스 이용 시 별도 요금이 발생할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제4조 (개인위치정보의 이용·제공)</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 개인위치정보주체의 동의를 얻은 경우에만 개인위치정보를 이용·제공합니다.
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>이용목적: 위치 기반 모임 서비스 제공</li>
                <li>이용기간: 서비스 제공을 위해 필요한 최소한의 기간</li>
                <li>제3자 제공: 원칙적으로 금지, 법적 요구가 있는 경우에만 제한적 제공</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제5조 (개인위치정보주체의 권리)</h3>
              <p className="text-text-muted leading-relaxed">
                개인위치정보주체는 언제든지 다음의 권리를 행사할 수 있습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>개인위치정보 이용·제공 동의의 철회 요구</li>
                <li>개인위치정보 수집·이용·제공 사실 확인자료 요구</li>
                <li>개인위치정보의 이용·제공 정지 요구</li>
                <li>개인위치정보의 삭제 요구</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-3">제6조 (8세 이하의 아동 등의 보호의무)</h3>
              <p className="text-text-muted leading-relaxed">
                회사는 아래의 경우에 해당하는 자의 개인위치정보에 대해서는 당해 개인위치정보주체가 
                개인위치정보의 이용·제공에 동의하는 경우에도 본 서비스를 제공하지 않습니다:
              </p>
              <ul className="mt-2 space-y-1 text-text-muted list-disc list-inside">
                <li>8세 이하의 아동</li>
                <li>피성년후견인</li>
                <li>위치정보의 이용·제공에 동의할 능력이 없는 자로서 대통령령으로 정하는 자</li>
              </ul>
            </section>
          </div>

          {/* Development Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🚧 <strong>법무 검토 중:</strong> 위치정보보호법 준수를 위한 전문 법무 검토를 거쳐 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}