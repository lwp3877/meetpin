/* src/app/settings/safety/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Toast from '@/components/ui/Toast'
import { EmergencyReportButton } from '@/components/safety/EmergencyReportButton'

interface SafetySettings {
  allow_adult_only_meetings: boolean
  safety_reminder_enabled: boolean
  post_meetup_checkin_enabled: boolean
  emergency_contact_phone?: string
  share_location_with_emergency_contact: boolean
}

interface VerificationStatus {
  phone_verified: boolean
  id_verified: boolean
  email_verified: boolean
  age_verified: boolean
}

export default function SafetySettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SafetySettings>({
    allow_adult_only_meetings: true,
    safety_reminder_enabled: true,
    post_meetup_checkin_enabled: true,
    emergency_contact_phone: '',
    share_location_with_emergency_contact: false,
  })
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    phone_verified: false,
    id_verified: false,
    email_verified: false,
    age_verified: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/safety/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.data) {
            setSettings(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch safety settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchVerifications = async () => {
      try {
        const response = await fetch('/api/safety/verification')
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.data) {
            const verifications = data.data
            setVerificationStatus({
              phone_verified: verifications.some((v: any) => v.verification_type === 'phone' && v.status === 'approved'),
              id_verified: verifications.some((v: any) => v.verification_type === 'id_card' && v.status === 'approved'),
              email_verified: verifications.some((v: any) => v.verification_type === 'email' && v.status === 'approved'),
              age_verified: verifications.some((v: any) => v.verification_type === 'age_adult' && v.status === 'approved'),
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch verifications:', error)
      }
    }

    if (user) {
      fetchSettings()
      fetchVerifications()
    }
  }, [user])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/safety/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.ok) {
        Toast.success('안전 설정이 저장되었습니다')
      } else {
        Toast.error(data.message || '설정 저장에 실패했습니다')
      }
    } catch (_error) {
      Toast.error('설정 저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerificationRequest = async (type: string) => {
    try {
      const response = await fetch('/api/safety/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_type: type }),
      })

      const data = await response.json()
      if (data.ok) {
        Toast.success('인증 요청이 제출되었습니다. 관리자 승인을 기다려주세요.')
      } else {
        Toast.error(data.message || '인증 요청에 실패했습니다')
      }
    } catch (_error) {
      Toast.error('인증 요청 중 오류가 발생했습니다')
    }
  }

  if (loading || isLoading) {
    return <PageLoader text="안전 설정을 불러오는 중..." />
  }

  if (!user) {
    return null
  }

  const verifiedCount = Object.values(verificationStatus).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/10 via-blue-500/5 to-emerald-500/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/profile" className="rounded-full p-2 transition-colors hover:bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">🛡️ 안전 설정</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Emergency Report Button */}
        <div className="mb-6">
          <EmergencyReportButton />
        </div>

        {/* Verification Status */}
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">📋 본인 인증 현황</h2>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 p-4">
            <span className="text-white font-bold">인증 완료</span>
            <span className="text-2xl font-bold text-white">{verifiedCount}/4</span>
          </div>

          <div className="space-y-3">
            <VerificationItem
              icon="📱"
              label="휴대폰 인증"
              verified={verificationStatus.phone_verified}
              onRequest={() => handleVerificationRequest('phone')}
            />
            <VerificationItem
              icon="🪪"
              label="신분증 인증"
              verified={verificationStatus.id_verified}
              onRequest={() => handleVerificationRequest('id_card')}
            />
            <VerificationItem
              icon="📧"
              label="이메일 인증"
              verified={verificationStatus.email_verified}
              onRequest={() => handleVerificationRequest('email')}
            />
            <VerificationItem
              icon="🔞"
              label="성인 인증"
              verified={verificationStatus.age_verified}
              onRequest={() => handleVerificationRequest('age_adult')}
            />
          </div>
        </div>

        {/* Safety Settings */}
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-800">⚙️ 안전 옵션</h2>

          <div className="space-y-4">
            <SettingToggle
              label="성인 전용 모임 참여 허용"
              description="19세 이상 모임에 참여할 수 있습니다"
              checked={settings.allow_adult_only_meetings}
              onChange={checked => setSettings({ ...settings, allow_adult_only_meetings: checked })}
            />

            <SettingToggle
              label="안전 알림 수신"
              description="모임 전 안전 체크리스트를 받습니다"
              checked={settings.safety_reminder_enabled}
              onChange={checked => setSettings({ ...settings, safety_reminder_enabled: checked })}
            />

            <SettingToggle
              label="모임 후 안전 체크"
              description="모임 종료 후 안전 피드백을 요청합니다"
              checked={settings.post_meetup_checkin_enabled}
              onChange={checked => setSettings({ ...settings, post_meetup_checkin_enabled: checked })}
            />

            <SettingToggle
              label="긴급 연락처와 위치 공유"
              description="위급 상황 시 지정된 연락처와 위치를 공유합니다"
              checked={settings.share_location_with_emergency_contact}
              onChange={checked =>
                setSettings({ ...settings, share_location_with_emergency_contact: checked })
              }
            />
          </div>

          {/* Emergency Contact */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              🚨 긴급 연락처 (선택)
            </label>
            <input
              type="tel"
              value={settings.emergency_contact_phone || ''}
              onChange={e =>
                setSettings({ ...settings, emergency_contact_phone: e.target.value })
              }
              placeholder="010-1234-5678"
              className="w-full rounded-2xl border-2 border-gray-200 px-5 py-3 font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0"
            />
            <p className="mt-2 text-xs text-gray-500">
              위급 상황 발생 시 자동으로 연락됩니다
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                저장 중...
              </div>
            ) : (
              '💾 설정 저장'
            )}
          </button>
        </div>

        {/* Safety Tips */}
        <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-blue-50 to-emerald-50 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold text-gray-800">💡 안전 이용 가이드</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>첫 만남은 공공장소에서 진행하세요</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>모임 시간과 장소를 지인에게 알려주세요</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>불편한 상황 발생 시 즉시 긴급 신고 버튼을 이용하세요</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>본인 인증을 완료하여 신뢰도를 높이세요</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function VerificationItem({
  icon,
  label,
  verified,
  onRequest,
}: {
  icon: string
  label: string
  verified: boolean
  onRequest: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center">
        <span className="mr-3 text-2xl">{icon}</span>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      {verified ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
          ✓ 인증완료
        </span>
      ) : (
        <button
          onClick={onRequest}
          className="rounded-full bg-emerald-500 px-4 py-1 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
        >
          인증하기
        </button>
      )}
    </div>
  )
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex-1">
        <div className="font-medium text-gray-800">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
