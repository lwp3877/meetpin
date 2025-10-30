/* 파일경로: src/app/legal/privacy/page.tsx */
import { brandMessages } from '@/lib/config/brand'

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-primary text-xl font-bold">🔒 개인정보처리방침 (베타)</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 rounded-lg border border-amber-500 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              ⚠️ 본 서비스는 현재 비공개 베타 테스트 중이며, 초대받은 사용자만 이용 가능합니다.
            </p>
          </div>

          <div className="border-b pb-4 text-center">
            <h2 className="text-text text-2xl font-bold">
              {brandMessages.appName} 개인정보처리방침 (베타 버전)
            </h2>
            <p className="text-text-muted mt-2">시행일: 2025년 1월 1일</p>
          </div>

          {/* Privacy Policy Content */}
          <div className="space-y-8">
            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">운영자 정보</h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-text-muted leading-relaxed">
                  <strong>서비스명:</strong> 밋핀 (MeetPin)<br />
                  <strong>운영 형태:</strong> 개인 운영 (비상업적 베타 테스트)<br />
                  <strong>연락처:</strong> meetpin.beta@gmail.com
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">1. 개인정보의 처리목적</h3>
              <div className="text-text-muted space-y-3 leading-relaxed">
                <p>
                  {brandMessages.appName} 베타 서비스는 다음의 목적을 위하여 개인정보를 처리합니다:
                </p>

                <div className="rounded-lg bg-blue-50 p-4">
                  <ul className="space-y-2 pl-4">
                    <li>• 회원 가입 및 본인 인증</li>
                    <li>• 위치 기반 모임 생성 및 검색 서비스 제공</li>
                    <li>• 모임 참가 신청 및 매칭 서비스</li>
                    <li>• 실시간 채팅 메시지 서비스</li>
                    <li>• 고객 문의 응답 및 불만 처리</li>
                    <li>• 서비스 부정이용 방지</li>
                    <li>• 서비스 개선을 위한 통계 분석</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-900">⚠️ 베타 테스트 특성상:</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-800">
                    <li>• 현재는 결제 기능이 비활성화되어 있습니다 (무료 서비스)</li>
                    <li>• 베타 테스트 종료 시 모든 데이터가 삭제될 수 있습니다</li>
                    <li>• 서비스는 예고 없이 중단될 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">2. 처리하는 개인정보 항목</h3>
              <div className="text-text-muted space-y-4 leading-relaxed">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-3 font-semibold text-blue-900">필수 항목</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 이메일 주소</li>
                    <li>• 비밀번호 (암호화 저장)</li>
                    <li>• 닉네임</li>
                    <li>• 연령대</li>
                    <li>• 위치정보 (GPS 좌표 - 모임 생성/검색 시)</li>
                    <li>• 서비스 이용 기록, 접속 로그</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <h4 className="mb-3 font-semibold text-green-900">선택 항목</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• 프로필 사진</li>
                    <li>• 자기소개</li>
                    <li>• 관심 카테고리</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">
                3. 개인정보의 처리 및 보유기간
              </h3>
              <div className="text-text-muted space-y-4 leading-relaxed">
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="mb-3 font-semibold text-yellow-900">⚠️ 베타 테스트 기간 중:</p>
                  <ul className="space-y-1 pl-4 text-sm text-yellow-800">
                    <li>• 회원 정보: 회원 탈퇴 시까지 (또는 베타 테스트 종료 시)</li>
                    <li>• 위치 정보: 모임 종료 후 즉시 삭제</li>
                    <li>• 채팅 메시지: 대화 종료 후 30일</li>
                    <li>• 서비스 이용 기록: 90일</li>
                    <li>• 신고/분쟁 기록: 처리 완료 후 1년</li>
                  </ul>
                  <p className="mt-3 text-sm text-yellow-800">
                    ※ 베타 테스트 종료 시 모든 데이터가 영구 삭제될 수 있습니다
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">4. 개인정보의 제3자 제공</h3>
              <div className="text-text-muted space-y-3 leading-relaxed">
                <p>
                  본 서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우에는 예외로 합니다.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">5. 개인정보 처리업무의 위탁</h3>
              <div className="text-text-muted space-y-4 leading-relaxed">
                <p>서비스 제공을 위해 다음 업체에 개인정보 처리를 위탁합니다:</p>

                <div className="rounded-lg bg-gray-50 p-4">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Supabase Inc.</strong> - 데이터베이스 및 인증 서비스
                    </li>
                    <li>
                      <strong>카카오</strong> - 지도 서비스
                    </li>
                    <li>
                      <strong>Vercel Inc.</strong> - 웹사이트 호스팅 서비스
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-600">
                    ※ 위탁업체는 개인정보보호법에 따라 개인정보를 안전하게 처리합니다
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">6. 이용자의 권리</h3>
              <div className="text-text-muted space-y-3 leading-relaxed">
                <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
                <div className="rounded-lg bg-blue-50 p-4">
                  <ul className="space-y-1 pl-4">
                    <li>• 개인정보 열람 및 수정 (프로필 설정)</li>
                    <li>• 회원 탈퇴 (모든 데이터 즉시 삭제)</li>
                    <li>• 개인정보 처리 관련 문의 (meetpin.beta@gmail.com)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">7. 개인정보 보호책임자</h3>
              <div className="text-text-muted space-y-3 leading-relaxed">
                <div className="rounded-lg bg-gray-50 p-4">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>운영자:</strong> 이원표
                    </li>
                    <li>
                      <strong>연락처:</strong> meetpin.beta@gmail.com
                    </li>
                  </ul>
                </div>
                <p className="text-sm">
                  개인정보 관련 문의사항은 위 이메일로 연락주시면 빠르게 답변드리겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-text mb-4 text-lg font-semibold">8. 권익침해 구제방법</h3>
              <div className="text-text-muted space-y-3 leading-relaxed">
                <p className="text-sm">
                  개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다:
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <h4 className="mb-1 text-sm font-semibold text-blue-900">개인정보보호위원회</h4>
                    <p className="text-xs text-blue-800">1833-6972 / privacy.go.kr</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <h4 className="mb-1 text-sm font-semibold text-green-900">개인정보 침해신고센터</h4>
                    <p className="text-xs text-green-800">1336 / privacy.kisa.or.kr</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Beta Notice */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>베타 테스트 안내:</strong> 본 개인정보처리방침은 베타 테스트 기간에 적용되며, 정식 출시 시 업데이트될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
