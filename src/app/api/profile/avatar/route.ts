/**
 * 프로필 아바타 관리 API
 * 사용자의 프로필 사진을 업데이트하고 조회하는 기능을 제공합니다.
 */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, ApiError, ApiResponse, rateLimit } from '@/lib/api'
import { isDevelopmentMode } from '@/lib/config/mockData'

// 프로필 아바타 업데이트
export async function PATCH(req: NextRequest) {
  try {
    // Rate limiting: 프로필 업데이트 20/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('profile:avatar:' + clientIP, 20, 60 * 1000)
    
    const user = await getAuthenticatedUser()
    
    const body = await req.json()
    const { avatar_url } = body

    // avatar_url 검증 (null 허용)
    if (avatar_url !== null && typeof avatar_url !== 'string') {
      throw new ApiError('올바른 이미지 URL이 아닙니다', 400, 'INVALID_AVATAR_URL')
    }

    // URL 형식 검증 (null이 아닌 경우)
    if (avatar_url && !avatar_url.startsWith('http')) {
      throw new ApiError('올바른 이미지 URL 형식이 아닙니다', 400, 'INVALID_URL_FORMAT')
    }

    if (isDevelopmentMode) {
      // 개발 모드에서는 성공 응답만 반환
      return Response.json({
        ok: true,
        message: '프로필 사진이 업데이트되었습니다',
        data: { avatar_url }
      })
    }

    const supabase = await createServerSupabaseClient()
    
    // 프로필 아바타 업데이트
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ 
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('uid', user.id)
      .select('avatar_url, updated_at')
      .single()

    if (error) {
      console.error('Profile avatar update error:', error)
      throw new ApiError('프로필 사진 업데이트에 실패했습니다', 500, 'UPDATE_ERROR')
    }

    // 사용자 메타데이터도 업데이트 (Supabase Auth)
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            avatar_url
          }
        }
      )
      
      if (authError) {
        console.warn('Auth metadata update failed:', authError)
        // 메타데이터 업데이트 실패는 치명적이지 않음
      }
    } catch (authError) {
      console.warn('Auth metadata update error:', authError)
      // 계속 진행
    }

    interface AvatarUpdateResult {
      avatar_url: string | null
      updated_at: string
    }

    const response: ApiResponse<AvatarUpdateResult> = {
      ok: true,
      message: avatar_url ? '프로필 사진이 업데이트되었습니다' : '프로필 사진이 삭제되었습니다',
      data: {
        avatar_url: data?.avatar_url || null,
        updated_at: data?.updated_at || new Date().toISOString()
      }
    }

    return Response.json(response)
    
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ ok: false, code: error.code, message: error.message }, { status: error.status })
    }
    
    console.error('Profile avatar API error:', error)
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// 프로필 아바타 조회
export async function GET(req: NextRequest) {
  try {
    // Rate limiting: API 호출 100/분
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await rateLimit('api:' + clientIP, 100, 60 * 1000)
    
    const user = await getAuthenticatedUser()

    if (isDevelopmentMode) {
      // 개발 모드에서는 모크 데이터 반환
      return Response.json({
        ok: true,
        data: {
          avatar_url: (user as any).avatar_url || null,
          updated_at: new Date().toISOString()
        }
      })
    }

    const supabase = await createServerSupabaseClient()
    
    // 현재 프로필 아바타 조회
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('avatar_url, updated_at')
      .eq('uid', user.id)
      .single()

    if (error) {
      throw new ApiError('프로필 조회에 실패했습니다', 500, 'FETCH_ERROR')
    }

    interface AvatarGetResult {
      avatar_url: string | null
      updated_at: string
    }

    const response: ApiResponse<AvatarGetResult> = {
      ok: true,
      data: {
        avatar_url: data?.avatar_url || null,
        updated_at: data?.updated_at || new Date().toISOString()
      }
    }

    return Response.json(response)
    
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ ok: false, code: error.code, message: error.message }, { status: error.status })
    }
    
    console.error('Profile avatar GET API error:', error)
    return Response.json({ ok: false, message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}