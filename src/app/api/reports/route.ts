import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'
import {
  createMethodRouter,
  getAuthenticatedUser,
  parseAndValidateBody,
  createSuccessResponse,
  rateLimit,
  ApiError
} from '@/lib/api'

// 신고 생성 스키마
const createReportSchema = z.object({
  target_uid: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  reason: z.string().min(5, '신고 사유는 5자 이상 입력해주세요').max(500, '신고 사유는 500자를 초과할 수 없습니다')
}).refine(
  (data) => data.target_uid || data.room_id,
  { message: '신고 대상 사용자 또는 방을 선택해야 합니다' }
)

// POST /api/reports - 신고 생성
async function createReport(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  const supabase = await createServerSupabaseClient()
  
  // Rate limiting (사용자별 신고 생성 제한: 10분에 3개)
  if (!rateLimit(`create-report:${user.id}`, 3, 600000)) {
    throw new ApiError('신고 생성 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.', 429)
  }
  
  // 요청 본문 검증
  const reportData = await parseAndValidateBody(request, createReportSchema)
  
  // 자기 자신 신고 방지
  if (reportData.target_uid === user.id) {
    throw new ApiError('본인을 신고할 수 없습니다')
  }
  
  // 대상 사용자 존재 확인 (target_uid가 있는 경우)
  if (reportData.target_uid) {
    const { data: targetUser, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', reportData.target_uid)
      .single()
    
    if (error || !targetUser) {
      throw new ApiError('신고 대상 사용자를 찾을 수 없습니다', 404)
    }
  }
  
  // 대상 방 존재 확인 (room_id가 있는 경우)
  if (reportData.room_id) {
    const { data: targetRoom, error } = await supabase
      .from('rooms')
      .select('id, host_uid')
      .eq('id', reportData.room_id)
      .single()
    
    if (error || !targetRoom) {
      throw new ApiError('신고 대상 방을 찾을 수 없습니다', 404)
    }
    
    // 방 호스트가 target_uid가 아닌 경우 호스트를 target_uid로 설정
    if (!reportData.target_uid) {
      reportData.target_uid = (targetRoom as any).host_uid
    }
  }
  
  // target_uid가 설정되었는지 확인
  if (!reportData.target_uid) {
    throw new ApiError('신고 대상이 지정되지 않았습니다')
  }

  // 중복 신고 확인 (같은 대상에 대해 최근 24시간 내 신고 여부)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const { count: recentReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('reporter_uid', user.id)
    .eq('target_uid', reportData.target_uid)
    .gte('created_at', oneDayAgo.toISOString())
  
  if (recentReports && recentReports > 0) {
    throw new ApiError('같은 사용자에 대한 중복 신고는 24시간 후에 가능합니다')
  }
  
  // 신고 생성
  const { data: newReport, error } = await (supabase as any)
    .from('reports')
    .insert({
      reporter_uid: user.id,
      target_uid: reportData.target_uid,
      room_id: reportData.room_id,
      reason: reportData.reason
    })
    .select(`
      *,
      reporter:profiles!reports_reporter_uid_fkey(
        id,
        nickname
      ),
      target:profiles!reports_target_uid_fkey(
        id,
        nickname
      ),
      room:rooms!reports_room_id_fkey(
        id,
        title
      )
    `)
    .single()
  
  if (error) {
    console.error('Report creation error:', error)
    throw new ApiError('신고 접수에 실패했습니다')
  }
  
  return createSuccessResponse(newReport, '신고가 성공적으로 접수되었습니다. 관리자가 검토 후 적절한 조치를 취하겠습니다.', 201)
}

// GET /api/reports - 신고 목록 조회 (관리자 전용)
async function getReports(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  
  // 관리자 권한 확인
  if (user.role !== 'admin') {
    throw new ApiError('관리자만 접근 가능합니다', 403)
  }
  
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  
  // 필터 파라미터
  const status = searchParams.get('status') || 'pending'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  
  // 신고 목록 조회
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_uid_fkey(
        id,
        nickname,
        avatar_url
      ),
      target:profiles!reports_target_uid_fkey(
        id,
        nickname,
        avatar_url
      ),
      room:rooms!reports_room_id_fkey(
        id,
        title,
        category
      )
    `, { count: 'exact' })
  
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  const { data: reports, error, count } = await query
  
  if (error) {
    console.error('Reports fetch error:', error)
    throw new ApiError('신고 목록을 가져오는데 실패했습니다')
  }
  
  return createSuccessResponse({
    reports: reports || [],
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: count || 0
    }
  })
}

export const { GET, POST } = createMethodRouter({
  GET: getReports,
  POST: createReport,
})