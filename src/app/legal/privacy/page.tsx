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

          {/* Privacy Policy Content */}
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-text mb-4">1. 개인정보의 처리목적</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>{brandMessages.appName}(이하 &ldquo;회사&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">가. 회원 가입 및 관리</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 회원 가입 의사 확인 및 본인 식별·인증</li>
                    <li>• 회원제 서비스 제공 및 회원 자격 유지·관리</li>
                    <li>• 서비스 부정이용 방지 및 각종 고지·통지</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">나. 서비스 제공</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 위치 기반 모임 생성 및 검색 서비스 제공</li>
                    <li>• 모임 참가 신청 및 매칭 서비스</li>
                    <li>• 실시간 채팅 메시지 서비스</li>
                    <li>• 콘텐츠 제공 및 맞춤 서비스 제공</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">다. 고객 지원</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 고객 문의사항 응답 및 불만처리</li>
                    <li>• 공지사항 전달</li>
                    <li>• 분쟁 조정을 위한 기록 보존</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">라. 결제 서비스 (부스트 기능)</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 모임 부스트 서비스 제공</li>
                    <li>• 결제 및 환불 처리</li>
                    <li>• 부정 결제 방지</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">2. 처리하는 개인정보 항목</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">가. 필수 항목</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">회원가입 시</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• 이메일 주소</li>
                        <li>• 비밀번호 (암호화 저장)</li>
                        <li>• 닉네임</li>
                        <li>• 연령대</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">서비스 이용 시</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• 위치정보 (GPS 좌표)</li>
                        <li>• 서비스 이용 기록</li>
                        <li>• 접속 로그, 쿠키</li>
                        <li>• 기기정보, 브라우저 정보</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">나. 선택 항목</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">프로필 설정</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• 프로필 사진</li>
                        <li>• 자기소개</li>
                        <li>• 관심 카테고리</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">결제 정보</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• 결제 수단 정보 (Stripe 처리)</li>
                        <li>• 결제 이력</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">3. 개인정보의 처리 및 보유기간</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">정보 유형</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">보유 기간</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">근거</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm">회원 정보 (이메일, 닉네임 등)</td>
                        <td className="px-4 py-3 text-sm">회원 탈퇴 시까지</td>
                        <td className="px-4 py-3 text-sm">서비스 제공</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">위치 정보</td>
                        <td className="px-4 py-3 text-sm">모임 종료 후 1년</td>
                        <td className="px-4 py-3 text-sm">위치정보법</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">채팅 메시지</td>
                        <td className="px-4 py-3 text-sm">대화 종료 후 1년</td>
                        <td className="px-4 py-3 text-sm">분쟁 해결</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">결제 정보</td>
                        <td className="px-4 py-3 text-sm">5년</td>
                        <td className="px-4 py-3 text-sm">전자상거래법</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">서비스 이용 기록</td>
                        <td className="px-4 py-3 text-sm">1년</td>
                        <td className="px-4 py-3 text-sm">통신비밀보호법</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">신고/분쟁 기록</td>
                        <td className="px-4 py-3 text-sm">처리 완료 후 3년</td>
                        <td className="px-4 py-3 text-sm">분쟁 재발 방지</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">4. 개인정보의 제3자 제공</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 정보주체의 사전 동의 없이는 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.</p>
                <p>② 다만, 다음의 경우에는 예외로 합니다:</p>
                <ul className="pl-6 space-y-1">
                  <li>• 정보주체로부터 별도의 동의를 받은 경우</li>
                  <li>• 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                  <li>• 공공기관이 법령 등에서 정하는 소관 업무의 수행을 위하여 불가피한 경우</li>
                  <li>• 정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">5. 개인정보 처리업무의 위탁</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">수탁업체</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">위탁업무 내용</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">개인정보 보유기간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">Supabase Inc.</td>
                        <td className="px-4 py-3 text-sm">데이터베이스 서비스, 인증 서비스</td>
                        <td className="px-4 py-3 text-sm">위탁계약 종료 시까지</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">Stripe Inc.</td>
                        <td className="px-4 py-3 text-sm">결제 처리 서비스</td>
                        <td className="px-4 py-3 text-sm">결제 완료 후 5년</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">카카오</td>
                        <td className="px-4 py-3 text-sm">지도 서비스, 간편 로그인</td>
                        <td className="px-4 py-3 text-sm">서비스 이용 완료 시까지</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">Vercel Inc.</td>
                        <td className="px-4 py-3 text-sm">웹사이트 호스팅 서비스</td>
                        <td className="px-4 py-3 text-sm">위탁계약 종료 시까지</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>② 회사는 위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">6. 개인정보의 파기</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <p>② 개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">파기절차</h4>
                  <ul className="space-y-1 text-sm text-red-800">
                    <li>• 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">파기방법</h4>
                  <ul className="space-y-1 text-sm text-red-800">
                    <li>• 전자적 파일 형태: 기록을 재생할 수 없도록 로우레벨 포맷 등의 방법을 이용하여 파기</li>
                    <li>• 종이 문서: 분쇄기로 분쇄하거나 소각하여 파기</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">7. 정보주체의 권리·의무 및 행사방법</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">정보주체의 권리</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 개인정보 처리현황 통지요구</li>
                      <li>• 개인정보 열람요구</li>
                      <li>• 개인정보 정정·삭제요구</li>
                      <li>• 개인정보 처리정지요구</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">권리 행사 방법</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 서비스 내 설정 메뉴</li>
                      <li>• 이메일: privacy@meetpin.com</li>
                      <li>• 서면, 전화, 전자우편</li>
                      <li>• 대리인을 통한 신청 가능</li>
                    </ul>
                  </div>
                </div>

                <p>② 권리 행사는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">8. 개인정보의 안전성 확보조치</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적·물리적 조치를 하고 있습니다:</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">관리적 조치</h4>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li>• 개인정보 담당자의 최소화 및 교육</li>
                      <li>• 개인정보 취급방침의 수립 및 시행</li>
                      <li>• 정기적 자체 감사 실시</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">기술적 조치</h4>
                    <ul className="space-y-1 text-sm text-orange-800">
                      <li>• 개인정보 암호화 (AES-256)</li>
                      <li>• 해킹 등 대비 보안시스템 구축</li>
                      <li>• 접근제한 시스템 운영</li>
                    </ul>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h4 className="font-semibold text-teal-900 mb-2">물리적 조치</h4>
                    <ul className="space-y-1 text-sm text-teal-800">
                      <li>• 전산실, 자료보관실 등의 접근통제</li>
                      <li>• 클라우드 서비스 보안 인증</li>
                      <li>• 개인정보 보관시설의 잠금장치</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">9. 개인정보 보호책임자</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
                
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">개인정보 보호책임자</h4>
                      <ul className="space-y-2 text-sm">
                        <li><strong>성명:</strong> 이원표</li>
                        <li><strong>직책:</strong> 개발팀장</li>
                        <li><strong>연락처:</strong> privacy@meetpin.com</li>
                        <li><strong>전화:</strong> 02-1234-5678</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">개인정보 보호담당부서</h4>
                      <ul className="space-y-2 text-sm">
                        <li><strong>부서명:</strong> 개발팀</li>
                        <li><strong>담당자:</strong> 개인정보보호팀</li>
                        <li><strong>연락처:</strong> privacy@meetpin.com</li>
                        <li><strong>전화:</strong> 02-1234-5678</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p>② 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">10. 권익침해 구제방법</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>정보주체는 아래의 기관에 대해 개인정보 침해에 대한 신고나 상담을 하실 수 있습니다:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">개인정보보호위원회</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• (국번없이) 1833-6972</li>
                      <li>• privacy.go.kr</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">개인정보 침해신고센터</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• (국번없이) 1336</li>
                      <li>• privacy.kisa.or.kr</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">대검찰청 사이버범죄수사단</h4>
                    <ul className="space-y-1 text-sm text-orange-800">
                      <li>• (국번없이) 1301</li>
                      <li>• cid.spo.go.kr</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">경찰청 사이버테러대응센터</h4>
                    <ul className="space-y-1 text-sm text-red-800">
                      <li>• (국번없이) 1566-0112</li>
                      <li>• ctrc.go.kr</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">11. 개인정보 처리방침 변경</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
                <p>② 본 방침은 2024년 1월 1일부터 시행됩니다.</p>
              </div>
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