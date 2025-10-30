export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 rounded-lg border border-amber-500 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          ⚠️ 본 서비스는 현재 비공개 베타 테스트 중이며, 초대받은 사용자만 이용 가능합니다.
        </p>
      </div>

      <h1 className="mb-8 text-3xl font-bold">베타 서비스 이용약관</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="mb-4 text-xl font-semibold">제1조 (목적)</h2>
          <p className="leading-relaxed">
            이 약관은 밋핀(MeetPin) 베타 서비스(이하 "서비스")의 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제2조 (베타 서비스의 특성)</h2>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="mb-2 font-semibold text-red-900">🚧 베타 테스트 기간 중요 공지</p>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• 본 서비스는 테스트 목적으로 제공되며, 예고 없이 중단되거나 종료될 수 있습니다</li>
              <li>• 서비스 이용 중 발생하는 데이터 손실, 오류, 장애에 대해 운영자는 책임을 지지 않습니다</li>
              <li>• 베타 테스트 종료 후 모든 데이터가 삭제될 수 있습니다</li>
              <li>• 현재는 비상업적 목적의 무료 테스트 서비스입니다</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제3조 (운영자 정보)</h2>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="leading-relaxed">
              <strong>서비스명:</strong> 밋핀 (MeetPin)<br />
              <strong>운영 형태:</strong> 개인 운영 (비상업적 베타 테스트)<br />
              <strong>연락처:</strong> meetpin.beta@gmail.com<br />
              <strong>서비스 URL:</strong> https://meetpin-weld.vercel.app
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제4조 (서비스의 내용)</h2>
          <p className="leading-relaxed">
            1. 본 서비스는 위치 기반 모임 매칭 플랫폼으로, 다음의 기능을 제공합니다:<br />
            &nbsp;&nbsp;&nbsp;• 지도 기반 모임 생성 및 검색<br />
            &nbsp;&nbsp;&nbsp;• 참가 요청 및 승인 시스템<br />
            &nbsp;&nbsp;&nbsp;• 1:1 실시간 채팅<br />
            &nbsp;&nbsp;&nbsp;• 알림 기능<br />
            2. 베타 테스트 기간 동안 모든 기능은 무료로 제공됩니다.<br />
            3. 운영자는 서비스 개선을 위해 기능을 추가, 변경, 삭제할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제5조 (회원가입 및 탈퇴)</h2>
          <p className="leading-relaxed">
            1. 이용자는 이메일 또는 소셜 로그인을 통해 회원가입을 할 수 있습니다.<br />
            2. 만 14세 미만의 아동은 서비스를 이용할 수 없습니다.<br />
            3. 회원은 언제든지 프로필 설정에서 탈퇴할 수 있으며, 탈퇴 즉시 모든 데이터가 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제6조 (이용자의 의무)</h2>
          <p className="leading-relaxed">
            이용자는 다음 행위를 하여서는 안 됩니다:<br />
            1. 타인의 개인정보를 도용하거나 부정하게 사용하는 행위<br />
            2. 허위 정보를 게시하거나 타인을 사칭하는 행위<br />
            3. 욕설, 비방, 성희롱 등 타인에게 불쾌감을 주는 행위<br />
            4. 상업적 목적의 광고, 홍보, 스팸을 발송하는 행위<br />
            5. 서비스의 안정적 운영을 방해하는 행위<br />
            6. 관계 법령을 위반하는 행위
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제7조 (서비스 이용 제한)</h2>
          <p className="leading-relaxed">
            1. 운영자는 이용자가 제6조를 위반한 경우 사전 통보 없이 서비스 이용을 제한하거나 계정을 정지할 수 있습니다.<br />
            2. 운영자는 서비스 점검, 보수, 교체 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.<br />
            3. 베타 테스트 종료 시 모든 서비스가 중단됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제8조 (책임의 제한)</h2>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="leading-relaxed text-yellow-900">
              1. 본 서비스는 테스트 목적으로 "있는 그대로(AS-IS)" 제공되며, 운영자는 다음에 대해 책임을 지지 않습니다:<br />
              &nbsp;&nbsp;&nbsp;• 서비스의 정확성, 완전성, 안정성에 대한 보장<br />
              &nbsp;&nbsp;&nbsp;• 서비스 이용으로 발생한 데이터 손실 또는 장애<br />
              &nbsp;&nbsp;&nbsp;• 이용자 간 오프라인 모임에서 발생한 사고 또는 분쟁<br />
              &nbsp;&nbsp;&nbsp;• 제3자가 제공하는 서비스(카카오맵 등)의 오류<br />
              2. 이용자는 본인의 책임 하에 서비스를 이용하며, 오프라인 모임 시 안전에 유의해야 합니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제9조 (개인정보 보호)</h2>
          <p className="leading-relaxed">
            개인정보의 수집, 이용, 보관, 삭제 등에 관한 사항은 별도의 개인정보 처리방침을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">제10조 (분쟁 해결)</h2>
          <p className="leading-relaxed">
            1. 서비스 이용과 관련한 분쟁은 당사자 간 협의를 통해 해결합니다.<br />
            2. 협의가 이루어지지 않을 경우 대한민국 법률에 따르며, 관할 법원은 민사소송법에 따릅니다.
          </p>
        </section>

        <section className="mt-8 rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            <strong>시행일:</strong> 2025년 1월 1일<br />
            <strong>최종 수정일:</strong> 2025년 1월 30일
          </p>
        </section>
      </div>
    </div>
  )
}
