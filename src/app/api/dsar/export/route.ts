import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, ApiError } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import JSZip from 'jszip'

import { logger } from '@/lib/observability/logger'
export async function POST(_req: NextRequest): Promise<NextResponse> {
  try {
    // 사용자 인증 확인
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const userId = user.id

    // 1. 사용자 프로필 데이터
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      logger.error('Profile fetch error:', { error: profileError instanceof Error ? profileError.message : String(profileError) })
    }

    // 2. 사용자가 생성한 방들
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('host_id', userId)

    if (roomsError) {
      logger.error('Rooms fetch error:', { error: roomsError instanceof Error ? roomsError.message : String(roomsError) })
    }

    // 3. 사용자의 참가 요청들
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select(
        `
        *,
        rooms!inner(id, title, host_id)
      `
      )
      .eq('user_id', userId)

    if (requestsError) {
      logger.error('Requests fetch error:', { error: requestsError instanceof Error ? requestsError.message : String(requestsError) })
    }

    // 4. 사용자의 매칭된 대화들
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(
        `
        *,
        rooms!inner(id, title, host_id),
        requester:profiles!matches_requester_id_fkey(id, nickname, email),
        host:profiles!matches_host_id_fkey(id, nickname, email)
      `
      )
      .or(`requester_id.eq.${userId},host_id.eq.${userId}`)

    if (matchesError) {
      logger.error('Matches fetch error:', { error: matchesError instanceof Error ? matchesError.message : String(matchesError) })
    }

    // 5. 사용자의 메시지들 (보낸 것만)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        content,
        created_at,
        match_id,
        sender_id,
        is_read
      `
      )
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000) // 최근 1000개 메시지

    if (messagesError) {
      logger.error('Messages fetch error:', { error: messagesError instanceof Error ? messagesError.message : String(messagesError) })
    }

    // 6. 호스트 메시지들 (보낸 것과 받은 것)
    const { data: hostMessages, error: hostMessagesError } = await supabase
      .from('host_messages')
      .select(
        `
        id,
        content,
        created_at,
        room_id,
        sender_id,
        recipient_id,
        is_read
      `
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(500) // 최근 500개 호스트 메시지

    if (hostMessagesError) {
      logger.error('Host messages fetch error:', { error: hostMessagesError instanceof Error ? hostMessagesError.message : String(hostMessagesError) })
    }

    // 7. 사용자 신고 기록 (신고한 것만)
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(
        `
        id,
        reason,
        description,
        created_at,
        status,
        reported_user_id,
        reported_room_id
      `
      )
      .eq('reporter_id', userId)

    if (reportsError) {
      logger.error('Reports fetch error:', { error: reportsError instanceof Error ? reportsError.message : String(reportsError) })
    }

    // 8. 차단된 사용자들
    const { data: blockedUsers, error: blockedError } = await supabase
      .from('blocked_users')
      .select(
        `
        id,
        blocked_user_id,
        created_at,
        blocked_user:profiles!blocked_users_blocked_user_id_fkey(id, nickname)
      `
      )
      .eq('blocker_id', userId)

    if (blockedError) {
      logger.error('Blocked users fetch error:', { error: blockedError instanceof Error ? blockedError.message : String(blockedError) })
    }

    // 개인정보 삭제를 위한 데이터 정리
    const sanitizeData = (data: any): any => {
      if (!data) return data

      if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item))
      }

      if (typeof data === 'object') {
        const sanitized = { ...data }

        // 민감한 필드들 제거 또는 마스킹
        if (sanitized.email) {
          const email = sanitized.email
          const [local, domain] = email.split('@')
          sanitized.email = `${local.slice(0, 2)}***@${domain}`
        }

        if (sanitized.phone) {
          sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        }

        // 다른 사용자 정보 제거
        delete sanitized.auth_id
        delete sanitized.updated_at

        return sanitized
      }

      return data
    }

    // 데이터 구조화
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        user_id: userId,
        export_version: '1.0.0',
        privacy_policy_version: '1.0.0',
        notice:
          '이 파일에는 개인정보보호법에 따른 개인데이터가 포함되어 있습니다. 안전하게 보관하시기 바랍니다.',
      },
      profile: sanitizeData(profile),
      rooms: {
        count: rooms?.length || 0,
        data: sanitizeData(rooms) || [],
      },
      requests: {
        count: requests?.length || 0,
        data: sanitizeData(requests) || [],
      },
      matches: {
        count: matches?.length || 0,
        data: sanitizeData(matches) || [],
      },
      messages: {
        count: messages?.length || 0,
        data: sanitizeData(messages) || [],
      },
      host_messages: {
        count: hostMessages?.length || 0,
        data: sanitizeData(hostMessages) || [],
      },
      reports: {
        count: reports?.length || 0,
        data: sanitizeData(reports) || [],
      },
      blocked_users: {
        count: blockedUsers?.length || 0,
        data: sanitizeData(blockedUsers) || [],
      },
    }

    // ZIP 파일 생성
    const zip = new JSZip()

    // JSON 데이터 추가
    zip.file('meetpin-data.json', JSON.stringify(exportData, null, 2))

    // CSV 형태로도 제공
    const createCSV = (data: any[], filename: string) => {
      if (!data || data.length === 0) return

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers
            .map(header => {
              const value = row[header]
              if (value === null || value === undefined) return ''
              if (typeof value === 'object') return JSON.stringify(value)
              if (typeof value === 'string' && value.includes(',')) return `"${value}"`
              return value
            })
            .join(',')
        ),
      ].join('\n')

      zip.file(`csv/${filename}.csv`, csvContent)
    }

    // CSV 파일들 생성
    if (exportData.rooms.data.length > 0) {
      createCSV(exportData.rooms.data, 'rooms')
    }
    if (exportData.requests.data.length > 0) {
      createCSV(exportData.requests.data, 'requests')
    }
    if (exportData.matches.data.length > 0) {
      createCSV(exportData.matches.data, 'matches')
    }
    if (exportData.messages.data.length > 0) {
      createCSV(exportData.messages.data, 'messages')
    }

    // 법적 고지사항 추가
    const legalNotice = `
MeetPin 개인데이터 내보내기

내보내기 일시: ${new Date().toLocaleString('ko-KR')}
사용자 ID: ${userId}

이 파일은 개인정보보호법 제35조(개인정보의 열람)에 따라 제공되는 개인데이터입니다.

포함된 데이터:
- 프로필 정보
- 생성한 방 정보
- 참가 요청 기록
- 매칭 및 대화 기록
- 신고 기록
- 차단 사용자 목록

주의사항:
1. 이 파일에는 개인정보가 포함되어 있으므로 안전하게 보관하시기 바랍니다.
2. 다른 사용자의 개인정보는 마스킹 처리되었습니다.
3. 추가 문의사항은 privacy@meetpin.com으로 연락하시기 바랍니다.

개인정보보호 담당자: privacy@meetpin.com
`

    zip.file('README.txt', legalNotice)

    // ZIP 파일 생성
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // 응답 헤더 설정
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set(
      'Content-Disposition',
      `attachment; filename="meetpin-data-${userId}-${new Date().toISOString().split('T')[0]}.zip"`
    )
    headers.set('Content-Length', zipBuffer.length.toString())

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers,
    })
  } catch (error) {
    logger.error('DSAR export error:', { error: error instanceof Error ? error.message : String(error) })

    if (error instanceof ApiError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', message: '데이터 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
