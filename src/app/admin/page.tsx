'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
import { brandMessages } from '@/lib/config/brand'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BotSchedulerControl } from '@/components/admin/bot-scheduler-control'
import { toast } from 'sonner'

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

// 개발 모드 확인
const isDevelopmentMode = process.env.NODE_ENV === 'development'

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const loadAdminData = useCallback(async () => {
    try {
      // 통계 데이터 로드
      const [usersRes, roomsRes, matchesRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
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
        .select(
          `
          *,
          reporter_profile:reporter_uid(nickname),
          target_profile:target_uid(nickname),
          rooms:room_id(title)
        `
        )
        .order('created_at', { ascending: false })
        .limit(10)

      setReports(reportsData || [])
    } catch (err: any) {
      console.error('Admin data load error:', err)
      setError('데이터 로드 중 오류가 발생했습니다.')
    }
  }, [supabase])

  const checkAdminAccess = useCallback(async () => {
    try {
      setIsLoading(true)

      // 개발 모드에서는 관리자 권한 우회 (데모 목적)
      if (isDevelopmentMode) {
        const mockUser = {
          id: 'admin-dev',
          nickname: '개발자 관리자',
          role: 'admin',
          email: 'admin@meetpin.dev',
        }
        setCurrentUser(mockUser)
        await loadMockData()
        return
      }

      // 실제 Supabase 로그인 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/')
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
  }, [router, supabase, loadAdminData])

  const loadMockData = async () => {
    // Mock 데이터 생성
    const mockStats: AdminStats = {
      totalUsers: 127,
      totalRooms: 43,
      totalMatches: 89,
      totalReports: 5,
      pendingReports: 2,
      activeRooms: 18,
    }

    const mockUsers: User[] = [
      {
        uid: '1',
        nickname: '김철수',
        age_range: '20s_late',
        role: 'user',
        created_at: new Date().toISOString(),
        email: 'user1@test.com',
      },
      {
        uid: '2',
        nickname: '이영희',
        age_range: '30s_early',
        role: 'admin',
        created_at: new Date().toISOString(),
        email: 'admin@test.com',
      },
    ]

    const mockReports: Report[] = [
      {
        id: '1',
        reason: '부적절한 언어 사용',
        status: 'pending',
        created_at: new Date().toISOString(),
        reporter_profile: { nickname: '김철수' },
        target_profile: { nickname: '박민수' },
        rooms: { title: '강남 맛집 투어' },
      },
    ]

    setStats(mockStats)
    setUsers(mockUsers)
    setReports(mockReports)
  }

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  const updateUserRole = async (uid: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({ role: newRole })
        .eq('uid', uid)

      if (error) throw error

      setUsers(users.map(user => (user.uid === uid ? { ...user, role: newRole } : user)))

      toast.success(`사용자 권한이 ${newRole}로 변경되었습니다.`)
    } catch (err: any) {
      toast.error('권한 변경 중 오류가 발생했습니다: ' + err.message)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: 'reviewed' | 'resolved') => {
    try {
      const { error } = await (supabase.from('reports') as any)
        .update({ status: newStatus })
        .eq('id', reportId)

      if (error) throw error

      setReports(
        reports.map(report => (report.id === reportId ? { ...report, status: newStatus } : report))
      )

      toast.success(`신고 상태가 ${newStatus}로 변경되었습니다.`)
    } catch (err: any) {
      toast.error('상태 변경 중 오류가 발생했습니다: ' + err.message)
    }
  }

  const generateSeedData = async () => {
    try {
      setIsSeeding(true)
      toast.info('봇 사용자와 샘플 데이터를 생성하는 중...')

      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.ok) {
        toast.success(result.message || '시드 데이터가 성공적으로 생성되었습니다!')
        // 데이터 새로고침
        await loadAdminData()
      } else {
        throw new Error(result.message || '시드 데이터 생성에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('Seed data generation error:', err)
      toast.error(err.message || '시드 데이터 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Card className="mx-4 w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">관리자 권한 확인 중</h2>
            <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50">
        <Card className="mx-4 w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">🚫</span>
            </div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">접근 제한</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg">
                  ⚙️
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">
                    {brandMessages.appName} 관리자
                  </h1>
                  <p className="text-xs text-gray-500">시스템 관리 대시보드</p>
                </div>
              </div>
              <Badge variant="secondary" className="border-0 bg-emerald-100 text-emerald-800">
                {currentUser?.nickname} (Admin)
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={generateSeedData}
                disabled={isSeeding}
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {isSeeding ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    생성 중...
                  </>
                ) : (
                  <>🌱 시드 데이터 생성</>
                )}
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
                className="border-gray-200"
              >
                메인으로
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="border border-emerald-100 bg-white/60 p-1 backdrop-blur-sm">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
            >
              📊 대시보드
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
            >
              👥 사용자 관리
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
            >
              ⚠️ 신고 관리
            </TabsTrigger>
            <TabsTrigger
              value="bot-scheduler"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
            >
              🤖 봇 스케줄러
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stats &&
                [
                  {
                    label: '총 사용자',
                    value: stats.totalUsers,
                    icon: '👥',
                    gradient: 'from-blue-500 to-indigo-600',
                  },
                  {
                    label: '총 모임',
                    value: stats.totalRooms,
                    icon: '🏠',
                    gradient: 'from-green-500 to-emerald-600',
                  },
                  {
                    label: '활성 모임',
                    value: stats.activeRooms,
                    icon: '🔥',
                    gradient: 'from-orange-500 to-red-500',
                  },
                  {
                    label: '총 매칭',
                    value: stats.totalMatches,
                    icon: '💕',
                    gradient: 'from-pink-500 to-rose-600',
                  },
                  {
                    label: '총 신고',
                    value: stats.totalReports,
                    icon: '⚠️',
                    gradient: 'from-yellow-500 to-amber-600',
                  },
                  {
                    label: '미처리 신고',
                    value: stats.pendingReports,
                    icon: '🚨',
                    gradient: 'from-red-500 to-pink-600',
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="border-0 bg-white/60 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div
                          className={`bg-gradient-to-r ${stat.gradient} mr-4 rounded-xl p-3 text-xl text-white shadow-lg`}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 bg-white/60 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-blue-500">👥</span>
                    <span>최신 가입자</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users.slice(0, 5).map(user => (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between rounded-lg bg-white/50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white">
                          {user.nickname?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nickname}</p>
                          <p className="text-xs text-gray-500">{user.age_range || '미설정'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <Badge
                          variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {user.role === 'admin' ? '관리자' : '일반'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-yellow-500">⚠️</span>
                    <span>최근 신고</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reports.slice(0, 5).map(report => (
                    <div key={report.id} className="space-y-2 rounded-lg bg-white/50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                        <Badge
                          variant={
                            report.status === 'pending'
                              ? 'destructive'
                              : report.status === 'reviewed'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {report.status === 'pending'
                            ? '미처리'
                            : report.status === 'reviewed'
                              ? '검토완료'
                              : '해결완료'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {report.reporter_profile?.nickname} → {report.target_profile?.nickname}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 bg-white/60 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-blue-500">👥</span>
                  <span>사용자 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/70 p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-lg font-bold text-white">
                          {user.nickname?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.nickname}</p>
                          <p className="text-sm text-gray-600">{user.age_range || '미설정'}</p>
                          <p className="font-mono text-xs text-gray-400">
                            {user.uid.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge
                            variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                            className="mb-1"
                          >
                            {user.role === 'admin' ? '관리자' : '일반'}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user.role === 'user' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.uid, 'admin')}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            ⬆️ 관리자 승격
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.uid, 'user')}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            ⬇️ 일반 사용자
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-0 bg-white/60 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-yellow-500">⚠️</span>
                  <span>신고 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map(report => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-gray-100 bg-white/70 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{report.reason}</h4>
                            <Badge
                              variant={
                                report.status === 'pending'
                                  ? 'destructive'
                                  : report.status === 'reviewed'
                                    ? 'default'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {report.status === 'pending'
                                ? '미처리'
                                : report.status === 'reviewed'
                                  ? '검토완료'
                                  : '해결완료'}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                                {report.reporter_profile?.nickname?.[0]}
                              </div>
                              <span className="text-gray-600">
                                {report.reporter_profile?.nickname}
                              </span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600">
                                {report.target_profile?.nickname?.[0]}
                              </div>
                              <span className="text-gray-600">
                                {report.target_profile?.nickname}
                              </span>
                            </div>
                          </div>

                          {report.rooms && (
                            <p className="flex items-center space-x-2 text-sm text-gray-600">
                              <span className="text-blue-500">🏠</span>
                              <span>{report.rooms.title}</span>
                            </p>
                          )}

                          <p className="text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'reviewed')}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              🔍 검토 완료
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              className="bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                              ✓ 해결 완료
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {reports.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <p className="text-gray-600">신고가 없습니다!</p>
                      <p className="mt-1 text-sm text-gray-400">
                        사용자들이 좋은 환경에서 소통하고 있어요.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot-scheduler">
            <BotSchedulerControl />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
