/* src/app/admin/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { brandMessages } from '@/lib/brand'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { mockStats, mockUsers, mockReports, isDevelopmentMode } from '@/lib/mockData'

interface AdminStats {
  totalUsers: number
  totalRooms: number
  totalMatches: number
  totalReports: number
  pendingReports: number
  activeRooms: number
}

interface User {
  uid: string
  nickname: string
  age_range: string
  role: string
  created_at: string
  email?: string
}

interface Report {
  id: string
  reason: string
  status: string
  created_at: string
  reporter_profile: { nickname: string }
  target_profile: { nickname: string }
  rooms?: { title: string } | null
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard')
  
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const checkAdminAccess = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 개발 모드에서는 Mock 데이터 사용
      if (isDevelopmentMode) {
        const mockUser = localStorage.getItem('mockUser')
        if (!mockUser) {
          router.push('/auth/login')
          return
        }
        
        const user = JSON.parse(mockUser)
        if (user.role !== 'admin') {
          setError('관리자 권한이 없습니다.')
          return
        }
        
        setCurrentUser(user)
        await loadMockData()
        return
      }
      
      // 실제 Supabase 로그인 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // 프로필 조회로 admin 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', user.id)
        .single()

      if (profileError || !profile || (profile as any).role !== 'admin') {
        setError('관리자 권한이 없습니다.')
        return
      }

      setCurrentUser({ ...user, ...(profile as any) })
      await loadAdminData()
      
    } catch (err: any) {
      setError(err.message || '권한 확인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  const loadMockData = async () => {
    // Mock 데이터 로드
    setStats(mockStats)
    setUsers(mockUsers)
    setReports(mockReports)
  }

  const loadAdminData = async () => {
    try {
      // 통계 데이터 로드
      const [usersRes, roomsRes, matchesRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true })
      ])

      // 활성 방 수
      const { count: activeRoomsCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .gte('start_at', new Date().toISOString())

      // 미처리 신고 수
      const { count: pendingReportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalUsers: usersRes.count || 0,
        totalRooms: roomsRes.count || 0,
        totalMatches: matchesRes.count || 0,
        totalReports: reportsRes.count || 0,
        pendingReports: pendingReportsCount || 0,
        activeRooms: activeRoomsCount || 0,
      })

      // 최신 사용자 목록
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setUsers(usersData || [])

      // 최신 신고 목록  
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          reporter_profile:reporter_uid(nickname),
          target_profile:target_uid(nickname),
          rooms:room_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setReports(reportsData || [])

    } catch (err: any) {
      console.error('Admin data load error:', err)
      setError('데이터 로드 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  const updateUserRole = async (uid: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole })
        .eq('uid', uid)

      if (error) throw error

      setUsers(users.map(user => 
        user.uid === uid ? { ...user, role: newRole } : user
      ))
      
      alert(`사용자 권한이 ${newRole}로 변경되었습니다.`)
    } catch (err: any) {
      alert('권한 변경 중 오류가 발생했습니다: ' + err.message)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: 'reviewed' | 'resolved') => {
    try {
      const { error } = await (supabase as any)
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId)

      if (error) throw error

      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ))
      
      alert(`신고 상태가 ${newStatus}로 변경되었습니다.`)
    } catch (err: any) {
      alert('상태 변경 중 오류가 발생했습니다: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">접근 제한</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                ⚙️ {brandMessages.appName} 관리자
              </h1>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentUser?.nickname} (Admin)
              </div>
            </div>
            <Button onClick={() => router.push('/')} variant="outline">
              메인으로
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: '대시보드', icon: '📊' },
              { key: 'users', label: '사용자 관리', icon: '👥' },
              { key: 'reports', label: '신고 관리', icon: '⚠️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats && [
                { label: '총 사용자', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500' },
                { label: '총 모임', value: stats.totalRooms, icon: '🏠', color: 'bg-green-500' },
                { label: '활성 모임', value: stats.activeRooms, icon: '🔥', color: 'bg-orange-500' },
                { label: '총 매칭', value: stats.totalMatches, icon: '💕', color: 'bg-pink-500' },
                { label: '총 신고', value: stats.totalReports, icon: '⚠️', color: 'bg-yellow-500' },
                { label: '미처리 신고', value: stats.pendingReports, icon: '🚨', color: 'bg-red-500' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-lg p-3 text-white text-xl mr-4`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">최신 가입자</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.uid} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.nickname}</p>
                        <p className="text-sm text-gray-500">{user.age_range}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">최근 신고</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{report.reason}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {report.reporter_profile?.nickname} → {report.target_profile?.nickname}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">사용자 관리</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연령대</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                        <div className="text-sm text-gray-500">{user.uid}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.age_range || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {user.role === 'user' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.uid, 'admin')}
                          >
                            관리자 승격
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.uid, 'user')}
                          >
                            일반 사용자로
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">신고 관리</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{report.reason}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>신고자:</strong> {report.reporter_profile?.nickname} → 
                        <strong> 대상:</strong> {report.target_profile?.nickname}
                      </p>
                      {report.rooms && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>관련 모임:</strong> {report.rooms.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'reviewed')}
                        >
                          검토 완료
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                        >
                          해결 완료
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}