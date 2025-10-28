export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">이용약관</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="mb-4 text-xl font-semibold">제1조 (목적)</h2>
          <p className="leading-relaxed">
            이 약관은 밋핀(이하 "회사")이 제공하는 위치 기반 모임 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제2조 (용어의 정의)</h2>
          <p className="leading-relaxed">
            1. "서비스"란 회사가 제공하는 위치 기반 모임 매칭 플랫폼을 의미합니다.<br />
            2. "회원"이란 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 서비스를 이용하는 고객을 말합니다.<br />
            3. "모임"이란 회원이 생성하거나 참여할 수 있는 오프라인 만남을 의미합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제3조 (약관의 효력 및 변경)</h2>
          <p className="leading-relaxed">
            1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br />
            2. 회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제4조 (서비스의 제공 및 변경)</h2>
          <p className="leading-relaxed">
            1. 회사는 회원에게 위치 기반 모임 매칭, 채팅, 알림 등의 서비스를 제공합니다.<br />
            2. 회사는 상당한 이유가 있는 경우 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용과 제공일자를 명시하여 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제5조 (회원의 의무)</h2>
          <p className="leading-relaxed">
            1. 회원은 관계법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항 등을 준수하여야 합니다.<br />
            2. 회원은 타인의 명예를 손상시키거나 불이익을 주는 행위를 하여서는 안 됩니다.<br />
            3. 회원은 서비스의 이용권한, 기타 이용계약상의 지위를 타인에게 양도, 증여할 수 없습니다.
          </p>
        </section>
      </div>
    </div>
  )
}
