/**
 * 개인정보보호법 강화된 동의 컴포넌트
 * 연령대 수집에 대한 구체적 동의 절차 포함
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Shield, Eye, Lock } from 'lucide-react'

interface PrivacyConsentProps {
  onConsentChange: (consents: ConsentState) => void
  required?: boolean
}

interface ConsentState {
  essential: boolean
  ageRange: boolean
  marketing: boolean
  analytics: boolean
}

export function PrivacyConsentEnhanced({ onConsentChange, required = true }: PrivacyConsentProps) {
  const [consents, setConsents] = useState<ConsentState>({
    essential: false,
    ageRange: false,
    marketing: false,
    analytics: false,
  })

  const [showDetails, setShowDetails] = useState({
    essential: false,
    ageRange: false,
    marketing: false,
    analytics: false,
  })

  const handleConsentChange = (type: keyof ConsentState, value: boolean) => {
    const newConsents = { ...consents, [type]: value }
    setConsents(newConsents)
    onConsentChange(newConsents)
  }

  const toggleDetails = (type: keyof typeof showDetails) => {
    setShowDetails(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Shield className="h-5 w-5 text-orange-600" />
          <span>개인정보 수집 및 이용 동의</span>
        </CardTitle>
        <div className="flex items-start space-x-2 rounded-lg bg-orange-100 p-3 text-sm text-orange-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">개인정보보호법에 따른 고지</p>
            <p className="mt-1 text-xs">각 항목별로 상세한 내용을 확인하고 동의해주세요.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 필수 동의 - 서비스 이용 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="essential"
              checked={consents.essential}
              onCheckedChange={checked => handleConsentChange('essential', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="essential" className="flex cursor-pointer items-center space-x-2">
                <span className="font-medium text-gray-900">
                  서비스 이용을 위한 개인정보 수집·이용
                </span>
                <span className="text-xs font-bold text-red-600">(필수)</span>
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p>• 수집항목: 이메일, 닉네임, 암호화된 비밀번호</p>
                <p>• 이용목적: 회원가입, 로그인, 서비스 제공</p>
                <p>• 보유기간: 회원탈퇴 시까지</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDetails('essential')}
                className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
              >
                <Eye className="mr-1 h-3 w-3" />
                {showDetails.essential ? '접기' : '상세 보기'}
              </Button>

              {showDetails.essential && (
                <div className="mt-3 space-y-2 rounded bg-gray-50 p-3 text-sm">
                  <div>
                    <strong>수집 근거:</strong> 정보통신망법 제22조, 개인정보보호법 제15조
                  </div>
                  <div>
                    <strong>처리방침:</strong> 개인정보는 암호화되어 저장되며, 제3자에게 제공되지
                    않습니다.
                  </div>
                  <div>
                    <strong>거부권:</strong> 필수항목 동의를 거부할 권리가 있으나, 서비스 이용이
                    제한됩니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 민감정보 동의 - 연령대 */}
        <div className="rounded-lg border border-yellow-200 bg-white p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="ageRange"
              checked={consents.ageRange}
              onCheckedChange={checked => handleConsentChange('ageRange', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="ageRange" className="flex cursor-pointer items-center space-x-2">
                <span className="font-medium text-gray-900">연령대 정보 수집·이용</span>
                <span className="text-xs font-bold text-orange-600">(민감정보/필수)</span>
                <Lock className="h-3 w-3 text-orange-600" />
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p>• 수집항목: 연령대 (20대 초반, 20대 후반 등)</p>
                <p>• 이용목적: 연령대 기반 매칭, 안전한 모임 환경 조성</p>
                <p>• 보유기간: 회원탈퇴 시까지</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDetails('ageRange')}
                className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
              >
                <Eye className="mr-1 h-3 w-3" />
                {showDetails.ageRange ? '접기' : '상세 보기'}
              </Button>

              {showDetails.ageRange && (
                <div className="mt-3 space-y-2 rounded bg-yellow-50 p-3 text-sm">
                  <div>
                    <strong>민감정보 처리 근거:</strong> 개인정보보호법 제23조 (별도 동의)
                  </div>
                  <div>
                    <strong>수집 필요성:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      <li>연령대가 비슷한 사용자 간 매칭</li>
                      <li>미성년자 보호 및 안전한 모임 환경</li>
                      <li>법적 요구사항 준수 (청소년보호법)</li>
                    </ul>
                  </div>
                  <div>
                    <strong>보안조치:</strong> 연령대 정보는 암호화 저장되며, 최소한의 담당자만 접근
                    가능합니다.
                  </div>
                  <div className="font-medium text-red-600">
                    <strong>주의:</strong> 연령대 동의 거부 시 서비스 이용이 불가능합니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 선택 동의 - 마케팅 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={consents.marketing}
              onCheckedChange={checked => handleConsentChange('marketing', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="marketing" className="flex cursor-pointer items-center space-x-2">
                <span className="font-medium text-gray-900">마케팅 정보 수신</span>
                <span className="text-xs text-gray-500">(선택)</span>
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p>• 이용목적: 이벤트 정보, 서비스 업데이트 알림</p>
                <p>• 수신방법: 이메일, 푸시 알림</p>
                <p>• 철회방법: 언제든 설정에서 변경 가능</p>
              </div>
            </div>
          </div>
        </div>

        {/* 선택 동의 - 분석 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="analytics"
              checked={consents.analytics}
              onCheckedChange={checked => handleConsentChange('analytics', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="analytics" className="flex cursor-pointer items-center space-x-2">
                <span className="font-medium text-gray-900">서비스 개선을 위한 이용 분석</span>
                <span className="text-xs text-gray-500">(선택)</span>
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p>• 이용목적: 서비스 이용 패턴 분석, 사용자 경험 개선</p>
                <p>• 처리방법: 개인식별이 불가능한 통계 형태로만 활용</p>
                <p>• 철회방법: 언제든 설정에서 변경 가능</p>
              </div>
            </div>
          </div>
        </div>

        {/* 동의 상태 요약 */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-900">동의 현황</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>필수 동의</span>
              <span
                className={
                  consents.essential && consents.ageRange ? 'text-green-600' : 'text-red-600'
                }
              >
                {consents.essential && consents.ageRange ? '완료' : '미완료'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>선택 동의</span>
              <span className="text-blue-600">
                {[consents.marketing, consents.analytics].filter(Boolean).length}/2개 동의
              </span>
            </div>
          </div>

          {required && !(consents.essential && consents.ageRange) && (
            <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
              서비스 이용을 위해 필수 항목에 모두 동의해주세요.
            </div>
          )}
        </div>

        <div className="text-xs leading-relaxed text-gray-500">
          <p>• 개인정보보호 책임자: privacy@meetpin.com</p>
          <p>• 수집된 정보는 목적 달성 후 지체 없이 파기됩니다.</p>
          <p>
            • 자세한 내용은{' '}
            <a href="/legal/privacy" className="text-blue-600 underline">
              개인정보처리방침
            </a>
            을 확인해주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PrivacyConsentEnhanced
