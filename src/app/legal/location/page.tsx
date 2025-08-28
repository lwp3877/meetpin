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

          {/* 위치정보이용약관 전체 내용 */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제1조 (목적)</h3>
              <p className="text-text-muted leading-relaxed">
                본 약관은 {brandMessages.appName}(이하 &quot;회사&quot;)이 제공하는 위치정보사업 또는 위치기반서비스와 관련하여 
                회사와 개인위치정보주체와의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제2조 (용어의 정의)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>본 약관에서 사용하는 용어의 의미는 다음과 같습니다.</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">가. 위치정보</h4>
                    <p>이동통신 단말장치의 위치를 식별할 수 있는 경·위도 좌표정보, 주소정보 등 위치 식별이 가능한 모든 형태의 정보를 말합니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">나. 개인위치정보</h4>
                    <p>특정 개인의 위치를 식별할 수 있는 위치정보를 말합니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">다. 위치기반서비스</h4>
                    <p>위치정보를 이용하여 제공하는 각종 서비스를 말합니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">라. 개인위치정보주체</h4>
                    <p>위치기반서비스를 이용하는 자로서 개인위치정보의 수집, 이용, 제공의 대상이 되는 자를 말합니다.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제3조 (서비스 내용 및 요금)</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>① 회사가 제공하는 위치기반서비스는 다음과 같습니다.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">주요 위치기반서비스</h4>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>근처 모임 검색:</strong> 사용자 위치 기반 주변 모임방 검색 및 표시</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>지도 기반 모임 생성:</strong> 지도에서 위치 선택하여 모임방 생성</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>위치 기반 매칭:</strong> 거리와 위치 정보를 활용한 사용자 매칭</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>실시간 위치 추천:</strong> 현재 위치 기반 최적 모임 장소 추천</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>지역별 통계:</strong> 지역별 모임 활동 현황 및 인기 장소 분석</span>
                    </li>
                  </ul>
                </div>
                <p>② 위 서비스는 기본적으로 무료로 제공되며, 부가서비스 이용 시 별도 요금이 발생할 수 있습니다.</p>
                <p>③ 위치기반서비스의 이용요금, 결제방법, 환불정책 등은 서비스 내 공지사항을 통해 별도로 안내합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제4조 (개인위치정보의 수집·이용·제공)</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>① 회사는 개인위치정보주체의 동의를 받아 개인위치정보를 수집·이용·제공합니다.</p>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">구분</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold">수집방법</td>
                        <td className="border border-gray-300 px-3 py-2">
                          • GPS, Wi-Fi, 기지국 정보 등을 통한 자동 수집<br/>
                          • 사용자가 직접 입력한 주소 정보<br/>
                          • 지도 API를 통한 위치 좌표 수집
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold">수집항목</td>
                        <td className="border border-gray-300 px-3 py-2">
                          • 경도, 위도 좌표 정보<br/>
                          • 주소 정보 (시·도, 시·구·군, 동·읍·면 등)<br/>
                          • IP 주소 기반 대략적 위치 정보
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold">이용목적</td>
                        <td className="border border-gray-300 px-3 py-2">
                          • 위치 기반 모임 서비스 제공<br/>
                          • 주변 모임 검색 및 추천<br/>
                          • 서비스 품질 향상 및 통계 분석<br/>
                          • 부정 이용 방지 및 안전 관리
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold">보유기간</td>
                        <td className="border border-gray-300 px-3 py-2">
                          • 서비스 이용 중: 최근 30일간 위치 기록<br/>
                          • 회원 탈퇴 시: 즉시 삭제<br/>
                          • 법령에 따른 보관: 관련 법령에서 정한 기간
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>② 회사는 개인위치정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다:</p>
                <ul className="pl-4 space-y-1">
                  <li>• 개인위치정보주체가 사전에 동의한 경우</li>
                  <li>• 법령의 규정에 의하거나, 수사목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                  <li>• 생명, 신체의 위험으로부터 개인을 보호하기 위하여 긴급히 필요한 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제5조 (개인위치정보주체의 권리)</h3>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>① 개인위치정보주체는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">가. 동의철회권</h4>
                    <p>개인위치정보 수집·이용·제공에 대한 동의를 언제든지 철회할 수 있습니다.</p>
                    <p className="text-sm text-green-700 mt-1">철회방법: 앱 설정 &gt; 위치정보 설정 &gt; 위치정보 이용 중단</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">나. 이용·제공 현황통지 요구권</h4>
                    <p>개인위치정보의 수집·이용·제공 사실 확인자료를 요구할 수 있습니다.</p>
                    <p className="text-sm text-green-700 mt-1">통지내용: 수집·이용·제공 일시, 목적, 제공받은 자 등</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">다. 이용·제공 정지 요구권</h4>
                    <p>개인위치정보의 이용·제공에 대한 정지를 요구할 수 있습니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">라. 손해배상청구권</h4>
                    <p>회사의 위반행위로 손해를 입은 경우 손해배상을 청구할 수 있습니다.</p>
                  </div>
                </div>
                <p>② 상기 권리 행사는 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제6조 (법정대리인의 권리)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 아래의 경우에 해당하는 자의 개인위치정보에 대해서는 당해 개인위치정보주체가 개인위치정보의 이용·제공에 동의하는 경우에도 본 서비스를 제공하지 않습니다.</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">서비스 제공 제외 대상</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 8세 이하의 아동</li>
                    <li>• 피성년후견인</li>
                    <li>• 위치정보의 이용·제공에 동의할 능력이 없는 자로서 대통령령으로 정하는 자</li>
                  </ul>
                </div>
                <p>② 개인위치정보주체가 14세 미만의 아동인 경우에는 법정대리인의 동의를 받아야 합니다.</p>
                <p>③ 법정대리인은 개인위치정보주체의 개인위치정보 이용·제공에 동의하기 전에 본 약관의 내용을 충분히 검토하여야 합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제7조 (위치정보의 보호조치)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 개인위치정보를 안전하게 관리하기 위하여 다음과 같은 보호조치를 취합니다.</p>
                <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">기술적 보호조치</h4>
                    <ul className="space-y-1 pl-4">
                      <li>• 개인위치정보의 암호화 저장 및 전송</li>
                      <li>• 접근권한의 제한 및 접근통제시스템 설치</li>
                      <li>• 개인위치정보처리시스템의 접근기록 보관</li>
                      <li>• 해킹이나 악성코드에 의한 침해방지를 위한 보안프로그램 설치</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">관리적 보호조치</h4>
                    <ul className="space-y-1 pl-4">
                      <li>• 개인위치정보처리 담당자의 지정 및 최소한의 인원으로 제한</li>
                      <li>• 개인위치정보처리 담당자에 대한 정기적인 보안교육 실시</li>
                      <li>• 개인위치정보보호 내부관리계획의 수립·시행</li>
                    </ul>
                  </div>
                </div>
                <p>② 개인위치정보의 처리와 관련된 업무를 담당하는 자는 업무상 알게 된 개인위치정보를 누설하거나 목적 외의 용도로 이용하거나 제3자에게 제공하여서는 안됩니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제8조 (위치정보관리책임자 지정)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사는 위치정보의 적절한 취급 및 관리를 위하여 위치정보관리책임자를 지정하여 다음의 업무를 수행하도록 합니다.</p>
                <ul className="pl-4 space-y-1">
                  <li>• 위치정보의 취급에 관한 계획의 수립 및 시행</li>
                  <li>• 위치정보의 취급 현황 및 접근권한 관리</li>
                  <li>• 위치정보 취급과 관련된 불만의 접수 및 처리</li>
                  <li>• 위치정보 유출 및 오용·남용 방지를 위한 내부통제시스템의 구축</li>
                  <li>• 위치정보의 취급과 관련된 직원의 지도·감독</li>
                </ul>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">위치정보관리책임자 연락처</h4>
                  <ul className="space-y-1">
                    <li><strong>소속:</strong> {brandMessages.appName} 개발팀</li>
                    <li><strong>연락처:</strong> privacy@meetpin.com</li>
                    <li><strong>전화:</strong> 02-1234-5678</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제9조 (손해배상 및 면책)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 회사가 위치정보보호 관련 법령을 위반한 행위로 개인위치정보주체에게 손해가 발생한 경우 그 손해를 배상할 책임을 집니다.</p>
                <p>② 개인위치정보주체가 본 약관의 규정을 위반하거나 제3자의 고의·과실로 인해 손해가 발생한 경우 회사는 책임을 지지 않습니다.</p>
                <p>③ 회사는 천재지변이나 기타 불가항력으로 인하여 위치기반서비스를 제공할 수 없는 경우에는 책임을 지지 않습니다.</p>
                <p>④ 무료로 제공되는 위치기반서비스의 이용과 관련해서는 관련 법령에 특별한 규정이 없는 한 손해배상책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제10조 (분쟁의 조정 및 법적용)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 위치정보의 이용·제공으로 인한 분쟁이 발생한 경우 당사자간 협의에 의해 해결하는 것을 원칙으로 합니다.</p>
                <p>② 제1항의 협의에서 분쟁이 해결되지 않는 경우에는 개인정보보호위원회에 조정을 신청할 수 있습니다.</p>
                <p>③ 본 약관과 관련된 분쟁에 대해서는 대한민국 법을 적용하며, 회사의 본사 소재지를 관할하는 법원을 합의관할법원으로 합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-text mb-4">제11조 (약관의 효력 및 변경)</h3>
              <div className="space-y-3 text-text-muted leading-relaxed">
                <p>① 본 약관은 2024년 1월 1일부터 시행됩니다.</p>
                <p>② 회사는 위치정보보호법, 개인정보보호법 등 관련 법령의 개정이나 회사 정책의 변경에 따라 약관을 개정할 수 있습니다.</p>
                <p>③ 약관이 변경되는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 현행 약관과 함께 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</p>
                <p>④ 개인위치정보주체가 변경된 약관에 동의하지 않는 경우 위치기반서비스의 이용을 중단하고 이용계약을 해지할 수 있습니다.</p>
              </div>
            </section>
          </div>

          {/* 연락처 및 시행일 */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📞 위치정보 관련 문의</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>이메일:</strong> privacy@meetpin.com</p>
                <p><strong>전화:</strong> 02-1234-5678 (평일 09:00~18:00)</p>
                <p><strong>주소:</strong> 서울특별시 강남구 테헤란로 123, {brandMessages.appName} 고객센터</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-800">
                <p><strong>시행일:</strong> 2024년 1월 1일</p>
                <p><strong>최종 개정일:</strong> 2024년 1월 1일</p>
                <p className="mt-2 text-xs text-gray-600">
                  본 약관은 위치정보보호법, 개인정보보호법 등 관련 법령에 따라 작성되었으며, 
                  법령 개정 시 이에 맞춰 개정될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}