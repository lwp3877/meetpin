import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiError, ApiResponse } from '@/lib/api'
import { createServerSupabaseClient, getSupabaseAdmin } from '@/lib/supabaseClient'
import { isDevelopmentMode } from '@/lib/config/flags'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 사용자 인증 확인
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { reason, additional_info } = await req.json()

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getSupabaseAdmin()
    const userId = user.id

    // Development mode: Mock data support
    if (isDevelopmentMode) {
      // Mock: No existing deletion request
      const _existingRequest = null
      
      // GDPR 규정에 따른 14일 유예기간 설정
      const scheduledDeletionDate = new Date()
      scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 14)

      const mockDeletionRequest = {
        id: `mock-deletion-${userId}-${Date.now()}`,
        user_id: userId,
        reason: reason || 'user_request',
        additional_info: additional_info || null,
        status: 'pending' as const,
        scheduled_deletion_date: scheduledDeletionDate.toISOString(),
        created_at: new Date().toISOString()
      }

      // Mock: User profile soft delete
      console.log(`[MOCK DSAR] Soft deleting user ${userId} - scheduled for ${scheduledDeletionDate.toISOString()}`)

      const response: ApiResponse<{
        request_id: string
        scheduled_deletion_date: string
        grace_period_days: number
        cancellation_deadline: string
      }> = {
        ok: true,
        data: {
          request_id: mockDeletionRequest.id,
          scheduled_deletion_date: scheduledDeletionDate.toISOString(),
          grace_period_days: 14,
          cancellation_deadline: scheduledDeletionDate.toISOString()
        },
        message: '계정 삭제 요청이 접수되었습니다 (Mock). 14일 후에 영구 삭제됩니다. 세션이 종료되었습니다.'
      }

      return NextResponse.json(response, { status: 200 })
    }

    // 이미 삭제 요청이 있는지 확인 (Production mode)
    const { data: existingRequest, error: checkError } = await supabase
      .from('deletion_requests' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Deletion request check error:', checkError)
      return NextResponse.json(
        { ok: false, code: 'DATABASE_ERROR', message: '삭제 요청 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (existingRequest) {
      return NextResponse.json(
        { 
          ok: false, 
          code: 'REQUEST_EXISTS', 
          message: '이미 계정 삭제 요청이 진행 중입니다.',
          data: {
            request_date: (existingRequest as any).created_at,
            execution_date: (existingRequest as any).scheduled_deletion_date
          }
        },
        { status: 409 }
      )
    }

    // GDPR 규정에 따른 14일 유예기간 설정
    const scheduledDeletionDate = new Date()
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 14)

    // 삭제 요청 생성 (트랜잭션 시작)
    const { data: deletionRequest, error: insertError } = await (supabase as any)
      .from('deletion_requests')
      .insert({
        user_id: userId,
        reason: reason || 'user_request',
        additional_info: additional_info || null,
        status: 'pending',
        scheduled_deletion_date: scheduledDeletionDate.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Deletion request creation error:', insertError)
      return NextResponse.json(
        { ok: false, code: 'DATABASE_ERROR', message: '삭제 요청 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Soft delete 실행 (관리자 권한 사용)
    const { error: softDeleteError } = await (supabaseAdmin as any).rpc('soft_delete_user', {
      target_user_id: userId
    })

    if (softDeleteError) {
      console.error('Soft delete error:', softDeleteError)
      // Rollback deletion request
      await supabase
        .from('deletion_requests' as any)
        .delete()
        .eq('id', (deletionRequest as any).id)
        
      return NextResponse.json(
        { ok: false, code: 'SOFT_DELETE_ERROR', message: '계정 삭제 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 세션 무효화 (사용자 로그아웃)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.warn('Session invalidation warning:', signOutError)
    }

    const response: ApiResponse<{
      request_id: string
      scheduled_deletion_date: string
      grace_period_days: number
      cancellation_deadline: string
    }> = {
      ok: true,
      data: {
        request_id: (deletionRequest as any).id,
        scheduled_deletion_date: scheduledDeletionDate.toISOString(),
        grace_period_days: 14,
        cancellation_deadline: scheduledDeletionDate.toISOString()
      },
      message: '계정 삭제 요청이 접수되었습니다. 14일 후에 영구 삭제됩니다. 세션이 종료되었습니다.'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Delete request error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', message: '계정 삭제 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  try {
    // 삭제 요청 취소
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getSupabaseAdmin()
    const userId = user.id

    // Development mode: Mock data support
    if (isDevelopmentMode) {
      // Mock: Cancel deletion request
      console.log(`[MOCK DSAR] Cancelling deletion request for user ${userId}`)
      
      const response: ApiResponse<object> = {
        ok: true,
        message: '계정 삭제 요청이 취소되었습니다 (Mock). 계정이 복구되었습니다.'
      }

      return NextResponse.json(response, { status: 200 })
    }

    // 대기 중인 삭제 요청 확인 (Production mode)
    const { data: deletionRequest, error: checkError } = await supabase
      .from('deletion_requests' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { ok: false, code: 'REQUEST_NOT_FOUND', message: '대기 중인 삭제 요청이 없습니다.' },
          { status: 404 }
        )
      }
      console.error('Deletion request check error:', checkError)
      return NextResponse.json(
        { ok: false, code: 'DATABASE_ERROR', message: '삭제 요청 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 삭제 요청 취소
    const { error: cancelError } = await (supabase as any)
      .from('deletion_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', (deletionRequest as any).id)

    if (cancelError) {
      console.error('Deletion request cancellation error:', cancelError)
      return NextResponse.json(
        { ok: false, code: 'DATABASE_ERROR', message: '삭제 요청 취소 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Soft delete 해제 (모든 관련 데이터 복구)
    const { error: restoreError } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ soft_deleted: false, deleted_at: null })
      .eq('uid', userId)

    if (restoreError) {
      console.error('Profile restore error:', restoreError)
    }

    // 관련 데이터 복구
    await (supabaseAdmin as any).from('rooms').update({ soft_deleted: false, deleted_at: null }).eq('host_uid', userId)
    await (supabaseAdmin as any).from('requests').update({ soft_deleted: false, deleted_at: null }).eq('requester_uid', userId)
    await (supabaseAdmin as any).from('matches').update({ soft_deleted: false, deleted_at: null }).or(`host_uid.eq.${userId},guest_uid.eq.${userId}`)
    await (supabaseAdmin as any).from('messages').update({ soft_deleted: false, deleted_at: null }).eq('sender_uid', userId)
    await (supabaseAdmin as any).from('host_messages').update({ soft_deleted: false, deleted_at: null }).or(`sender_uid.eq.${userId},receiver_uid.eq.${userId}`)
    await (supabaseAdmin as any).from('notifications').update({ soft_deleted: false, deleted_at: null }).eq('user_id', userId)
    await (supabaseAdmin as any).from('reports').update({ soft_deleted: false, deleted_at: null }).or(`reporter_uid.eq.${userId},target_uid.eq.${userId}`)
    await (supabaseAdmin as any).from('blocked_users').update({ soft_deleted: false, deleted_at: null }).or(`blocker_uid.eq.${userId},blocked_uid.eq.${userId}`)

    const response: ApiResponse<object> = {
      ok: true,
      message: '계정 삭제 요청이 취소되었습니다. 계정이 복구되었습니다.'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Delete request cancellation error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', message: '삭제 요청 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    // 삭제 요청 상태 조회
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const userId = user.id

    // Development mode: Mock data support
    if (isDevelopmentMode) {
      // Mock: No pending deletion request
      return NextResponse.json(
        { 
          ok: true, 
          data: { has_pending_request: false },
          message: '대기 중인 삭제 요청이 없습니다 (Mock).'
        },
        { status: 200 }
      )
    }

    // Production mode: Check actual database
    const { data: deletionRequest, error } = await supabase
      .from('deletion_requests' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            ok: true, 
            data: { has_pending_request: false },
            message: '대기 중인 삭제 요청이 없습니다.'
          },
          { status: 200 }
        )
      }
      console.error('Deletion request check error:', error)
      return NextResponse.json(
        { ok: false, code: 'DATABASE_ERROR', message: '삭제 요청 상태 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const now = new Date()
    const scheduledDate = new Date((deletionRequest as any).scheduled_deletion_date)
    const daysRemaining = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const response: ApiResponse<{
      has_pending_request: boolean
      request_id: string
      scheduled_deletion_date: string
      days_remaining: number
      can_cancel: boolean
    }> = {
      ok: true,
      data: {
        has_pending_request: true,
        request_id: (deletionRequest as any).id,
        scheduled_deletion_date: (deletionRequest as any).scheduled_deletion_date,
        days_remaining: Math.max(0, daysRemaining),
        can_cancel: daysRemaining > 0
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Delete request status check error:', error)
    
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', message: '삭제 요청 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}