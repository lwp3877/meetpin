/* src/app/admin/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Toast from '@/components/ui/Toast'

interface EmergencyReport {
  id: string
  reporter_id: string
  reported_user_id: string
  emergency_type: string
  description: string
  priority_level: number
  status: string
  created_at: string
}

interface Verification {
  id: string
  user_id: string
  verification_type: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [activeTab, setActiveTab] = useState<'emergency' | 'verification'>('emergency')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/map')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emergencyRes, verificationRes] = await Promise.all([
          fetch('/api/safety/emergency'),
          fetch('/api/safety/verification'),
        ])

        if (emergencyRes.ok) {
          const data = await emergencyRes.json()
          if (data.ok) setEmergencyReports(data.data)
        }

        if (verificationRes.ok) {
          const data = await verificationRes.json()
          if (data.ok) setVerifications(data.data.filter((v: Verification) => v.status === 'pending'))
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user])

  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      const response = await fetch('/api/safety/emergency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, status }),
      })

      const data = await response.json()
      if (data.ok) {
        Toast.success('신고 상태가 업데이트되었습니다')
        setEmergencyReports(prev =>
          prev.map(r => (r.id === reportId ? { ...r, status } : r))
        )
      } else {
        Toast.error(data.message || '업데이트에 실패했습니다')
      }
    } catch (error) {
      Toast.error('업데이트 중 오류가 발생했습니다')
    }
  }

  const handleUpdateVerification = async (verificationId: string, status: string) => {
    try {
      const response = await fetch('/api/safety/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_id: verificationId, status }),
      })

      const data = await response.json()
      if (data.ok) {
        Toast.success('인증 상태가 업데이트되었습니다')
        setVerifications(prev => prev.filter(v => v.id !== verificationId))
      } else {
        Toast.error(data.message || '업데이트에 실패했습니다')
      }
    } catch (error) {
      Toast.error('업데이트 중 오류가 발생했습니다')
    }
  }

  if (loading || isLoading) {
    return <PageLoader text="관리자 대시보드를 불러오는 중..." />
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const pendingReports = emergencyReports.filter(r => r.status === 'pending')
  const pendingVerifications = verifications.filter(v => v.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-pink-500/5 to-purple-500/10">
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
          <h1 className="text-xl font-bold text-gray-900">👑 관리자 대시보드</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-red-500 to-pink-500 p-6 shadow-xl">
            <div className="text-white/80 text-sm font-medium">긴급 신고</div>
            <div className="mt-2 text-4xl font-bold text-white">{pendingReports.length}</div>
            <div className="mt-1 text-white/80 text-sm">처리 대기 중</div>
          </div>

          <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-blue-500 to-purple-500 p-6 shadow-xl">
            <div className="text-white/80 text-sm font-medium">인증 요청</div>
            <div className="mt-2 text-4xl font-bold text-white">{pendingVerifications.length}</div>
            <div className="mt-1 text-white/80 text-sm">승인 대기 중</div>
          </div>

          <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-green-500 to-emerald-500 p-6 shadow-xl">
            <div className="text-white/80 text-sm font-medium">전체 신고</div>
            <div className="mt-2 text-4xl font-bold text-white">{emergencyReports.length}</div>
            <div className="mt-1 text-white/80 text-sm">누적 건수</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white/80 p-2">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all ${
              activeTab === 'emergency'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🚨 긴급 신고 ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all ${
              activeTab === 'verification'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 인증 요청 ({pendingVerifications.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="rounded-3xl border border-white/50 bg-white/80 p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-xl font-bold text-gray-800">처리할 긴급 신고가 없습니다</div>
                <div className="text-gray-500 mt-2">모든 신고가 처리되었습니다</div>
              </div>
            ) : (
              pendingReports.map(report => (
                <div
                  key={report.id}
                  className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${
                            report.priority_level === 1
                              ? 'bg-red-100 text-red-700'
                              : report.priority_level === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          우선순위 {report.priority_level}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                          {report.emergency_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReport(report.id, 'in_progress')}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600"
                      >
                        처리 중
                      </button>
                      <button
                        onClick={() => handleUpdateReport(report.id, 'resolved')}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
                      >
                        해결됨
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="font-medium text-gray-800">{report.description}</div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    신고자 ID: {report.reporter_id} | 피신고자 ID: {report.reported_user_id}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-4">
            {pendingVerifications.length === 0 ? (
              <div className="rounded-3xl border border-white/50 bg-white/80 p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-xl font-bold text-gray-800">처리할 인증 요청이 없습니다</div>
                <div className="text-gray-500 mt-2">모든 요청이 처리되었습니다</div>
              </div>
            ) : (
              pendingVerifications.map(verification => (
                <div
                  key={verification.id}
                  className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-2xl">
                          {verification.verification_type === 'phone'
                            ? '📱'
                            : verification.verification_type === 'id_card'
                            ? '🪪'
                            : verification.verification_type === 'email'
                            ? '📧'
                            : '🔞'}
                        </span>
                        <span className="font-bold text-gray-800">
                          {verification.verification_type === 'phone'
                            ? '휴대폰 인증'
                            : verification.verification_type === 'id_card'
                            ? '신분증 인증'
                            : verification.verification_type === 'email'
                            ? '이메일 인증'
                            : '성인 인증'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        사용자 ID: {verification.user_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(verification.created_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateVerification(verification.id, 'approved')}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleUpdateVerification(verification.id, 'rejected')}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
                      >
                        거부
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
