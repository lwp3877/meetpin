/* 파일경로: src/app/legal/terms/page.tsx */
import { brandMessages } from '@/lib/config/brand'

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

          {/* Terms Content */}
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제1조 (목적)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관은 {brandMessages.appName}(이하 &ldquo;서비스&rdquo;)의 이용에 관한 조건 및 절차, 
                이용자와 회사 간의 권리와 의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제2조 (정의)</h3>
              <p className="text-text-muted leading-relaxed mb-3">
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
              </p>
              <ul className="space-y-2 text-text-muted">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>&ldquo;서비스&rdquo;란 회사가 제공하는 위치 기반 소셜 모임 플랫폼 &ldquo;{brandMessages.appName}&rdquo;을 의미합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>&ldquo;이용자&rdquo; 또는 &ldquo;회원&rdquo;이란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>&ldquo;모임&rdquo; 또는 &ldquo;방&rdquo;이란 이용자가 생성한 오프라인 만남 공간을 의미합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>&ldquo;매칭&rdquo;이란 모임 참가 요청이 수락되어 채팅이 활성화된 상태를 말합니다.</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제3조 (약관의 효력 및 변경)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
                <p>② 회사는 약관의 규제에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
                <p>③ 약관이 변경되는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 적용일자 7일 이전부터 공지합니다.</p>
                <p>④ 이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제4조 (서비스의 제공 및 변경)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 지도 기반 모임 생성 및 검색 서비스</li>
                  <li>• 모임 참가 신청 및 수락/거절 서비스</li>
                  <li>• 매칭된 사용자 간 1:1 채팅 서비스</li>
                  <li>• 사용자 프로필 관리 서비스</li>
                  <li>• 모임 부스트 결제 서비스</li>
                  <li>• 신고 및 차단 서비스</li>
                </ul>
                <p>② 회사는 서비스의 전부 또는 일부를 회사의 사정에 의하여 수정, 중단, 변경할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제5조 (회원가입)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
                <p>② 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 타인의 명의를 이용하여 신청한 경우</li>
                  <li>• 허위 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>• 만 19세 미만인 경우 (성인 인증이 완료되지 않은 경우)</li>
                  <li>• 이전에 회원자격을 상실한 적이 있는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제6조 (회원의 의무)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회원은 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 신청 또는 변경시 허위내용의 등록</li>
                  <li>• 타인의 정보 도용</li>
                  <li>• 회사가 게시한 정보의 변경</li>
                  <li>• 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>• 회사 또는 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>• 회사 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>• 외설 또는 폭력적인 메시지, 화상, 음성 등을 공개 또는 게시하는 행위</li>
                  <li>• 기타 불법적이거나 부당한 행위</li>
                </ul>
                <p>② 회원은 개인정보관리책임을 지며, 회원의 관리소홀이나 부주의로 인해 발생하는 손해의 책임은 회원에게 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제7조 (모임 이용 수칙)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 모든 만남은 공공장소에서 이루어지기를 권장하며, 안전에 유의하여야 합니다.</p>
                <p>② 회원은 다음과 같은 모임을 생성하거나 참여해서는 안 됩니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 불법적인 목적의 모임</li>
                  <li>• 성매매, 유흥업소 관련 모임</li>
                  <li>• 종교, 정치, 상업적 목적의 모임</li>
                  <li>• 사행행위 관련 모임</li>
                  <li>• 기타 공서양속에 위배되는 모임</li>
                </ul>
                <p>③ 모임 호스트는 참가 신청을 성실히 검토하고 합리적인 사유 없이 차별해서는 안 됩니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제8조 (서비스 이용료 및 결제)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 서비스 이용료는 무료입니다. 다만, 부가 서비스인 모임 부스트는 유료입니다.</p>
                <p>② 모임 부스트 이용료는 다음과 같습니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 1일 부스트: 1,000원</li>
                  <li>• 3일 부스트: 2,500원</li>
                  <li>• 7일 부스트: 5,000원</li>
                </ul>
                <p>③ 결제는 Stripe 결제 시스템을 통해 처리되며, 결제 완료 즉시 부스트가 활성화됩니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제9조 (환불 정책)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 부스트 서비스는 결제 후 즉시 제공되므로 원칙적으로 환불이 불가합니다.</p>
                <p>② 다음의 경우에는 전액 환불이 가능합니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 서비스 장애로 부스트가 정상 작동하지 않은 경우</li>
                  <li>• 결제 오류로 인한 중복 결제의 경우</li>
                  <li>• 기타 회사의 귀책사유로 서비스를 제공받지 못한 경우</li>
                </ul>
                <p>③ 환불 신청은 고객센터(support@meetpin.kr)를 통해 접수하며, 확인 후 3-5 영업일 내에 처리됩니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제10조 (개인정보 보호)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 회원의 개인정보를 중요시하며, 개인정보보호법 등 관련 법령을 준수합니다.</p>
                <p>② 개인정보의 수집, 이용, 제공, 보관, 파기 등에 대한 자세한 사항은 개인정보처리방침을 참조하십시오.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제11조 (서비스 이용 제한)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 회원이 본 약관의 의무를 위반한 경우 경고, 일시정지, 영구이용정지 등의 조치를 취할 수 있습니다.</p>
                <p>② 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 만 19세 미만이 서비스를 이용하는 경우</li>
                  <li>• 타인의 명예를 손상하거나 불이익을 주는 행위를 한 경우</li>
                  <li>• 서비스의 안정적 운영을 방해한 경우</li>
                  <li>• 반복적으로 신고를 받은 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제12조 (손해배상)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사와 회원은 서비스 이용과 관련하여 고의 또는 과실로 상대방에게 손해를 끼친 경우 이를 배상할 책임이 있습니다.</p>
                <p>② 회사는 무료서비스의 장애, 제공 중단, 보관된 자료 멸실 또는 삭제, 변조 등으로 인한 손해에 대해서는 배상책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제13조 (면책조항)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                <p>② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
                <p>③ 회사는 회원이 서비스를 이용하여 얻은 자료로 인한 손해에 대하여 책임을 지지 않습니다.</p>
                <p>④ 회사는 회원간 또는 회원과 제3자간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임을 지지 않습니다.</p>
                <p>⑤ 오프라인 만남에서 발생하는 사고나 분쟁에 대해서는 당사자간의 책임으로 하며, 회사는 이에 대한 책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제14조 (분쟁 해결)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</p>
                <p>② 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 서울중앙지방법원을 관할 법원으로 합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제15조 (회사 정보 및 연락처)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사명: 밋핀(MeetPin)</p>
                <p>② 대표자: [대표자명]</p>
                <p>③ 사업자등록번호: [사업자등록번호]</p>
                <p>④ 주소: [회사주소]</p>
                <p>⑤ 고객센터: support@meetpin.kr</p>
                <p>⑥ 개인정보보호책임자: privacy@meetpin.kr</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">부칙</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
              </div>
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