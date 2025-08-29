A. 요약 (P1 이슈) – 주요 결함으로 API와 DB 간 불일치 및 핵심 기능 누락이 발견되었습니다. rooms API에서 존재하지 않는 status='open' 필터 사용으로 방 목록 조회가 실패하고
GitHub
, 방 삭제 로직에서 status 참조로 인한 오류가 발생합니다
GitHub
GitHub
. 참가 요청 승인 기능은 ‘approved’/‘accepted’ 문자열 불일치로 동작하지 않으며, 수락 시 매치가 자동 생성되지 않는 문제가 있습니다. 또한 /api/rooms/[id]/requests 엔드포인트가 구현되지 않아 호스트가 받은 참가 요청을 볼 수 없습니다. 카카오 지도 API 키가 코드에 하드코딩되어 있어 보안 이슈가 우려됩니다
GitHub
. 이러한 결함들은 서비스 핵심 흐름(방 표시, 참가 수락/채팅 등)을 저해하므로 시급한 수정이 필요합니다. B. 이슈 목록 (우선순위/파일/라인/문제점·영향·수정방향)
우선순위	파일 경로 (라인)	문제점 ‣ 영향 / 수정방향
P1	src/app/api/rooms/route.ts (L33-40)	rooms 목록 조회 시 status='open' 필터 사용
GitHub
. DB rooms 테이블에 status 컬럼이 없어서 쿼리 오류 발생 → 방 목록이 비어있게 됨. 수정: 상태 필터를 제거하고 공개(visibility) 및 시간 조건만으로 조회 (status 제거로 DB 불일치 해소).
P1	src/app/api/rooms/[id]/route.ts (L121-138)	방 삭제 시 room.status를 확인/갱신하도록 구현
GitHub
GitHub
. 현재 DB에는 status 컬럼이 없어 항상 room.status가 undefined → inactive 업데이트 로직 동작 불가 및 삭제 조건 분岐 오류. 또한 수락된 요청이 있는 방을 삭제하면 매칭/채팅 데이터까지 삭제 위험. 수정: status 참조 코드를 제거하고, 수락된 참가자(매칭)가 존재하면 삭제 불가하도록 처리. 승인자 존재 시 방을 삭제하지 않고 403 에러를 반환하여 데이터 무결성 보존.
P1	src/app/api/rooms/[id]/route.ts (L13-47, L40-49)	방 상세 API 응답에 is_host(호스트 여부)와 현재 참가자 수 미포함. UI에서는 room.is_host와 participants_count가 없으면 권한 오류로 간주하거나 남은 인원 계산에 사용
GitHub
GitHub
. 영향: 호스트가 자신의 방 요청 관리 페이지 접근 시 잘못된 “권한 없음” 오류 발생; 참가 승인 시 남은 인원 계산 오류. 수정: 응답 데이터에 is_host(현재 사용자==host_uid) 부울값과 participants_count(호스트 포함 현재 참가자 수) 필드를 추가하여 UI 요구사항 충족.
P1	src/app/api/rooms/[id]/requests (엔드포인트 누락)	호스트 전용 참가 요청 목록 API가 구현되지 않음. UI에서 /api/rooms/[roomId]/requests를 호출하지만 404 발생
GitHub
. 영향: 방 호스트가 받은 참가 요청을 볼 수 없어 요청 수락/거절 기능이 마비됨. 수정: /api/rooms/[id]/requests GET 핸들러를 추가 구현 – 해당 방의 참가 요청들을 DB에서 조회하여 반환 (요청자 프로필 및 수락된 경우 매치ID 포함). 호출자는 호스트인지 검증하고, RLS정책 기반으로 안전하게 목록 제공.
P1	src/app/api/requests/[id]/route.ts (추론)	참가 요청 수락/거절 (PUT) 로직 결함. 1) 요청 상태 approved(UI 사용)와 accepted(API 기대) 불일치로 Zod 검증 실패
GitHub
GitHub
. 2) 호스트가 요청을 승인해도 matches 레코드 자동 생성 누락 – 채팅 불가 상태. 영향: 호스트의 참가 승인 시 API 오류 발생 (잘못된 status) 또는 매칭/채팅이 이루어지지 않음. 수정: PUT 핸들러에서 'approved'를 'accepted'로 매핑 처리하거나 UI를 수정하고, status==='accepted'인 경우 matches 테이블에 (room_id, host_uid, guest_uid) 새 레코드 추가하여 1:1 채팅방을 생성. 또한 권한 검사로 현재 사용자=방 호스트를 확인하여 무단 승인을 방지.
P1	src/app/requests/page.tsx (L163-168) 및 src/app/room/[id]/requests/page.tsx (L89-98)	UI에서 참가 요청 상태를 ‘approved’로 사용
GitHub
GitHub
하지만, 백엔드 및 DB에서는 ‘accepted’로 처리. 영향: 참가 요청 승인 시 프런트엔드가 approved를 전송하여 API 검증 실패; 요청 목록 필터도 ‘approved’에 걸려 수락된 요청이 표시되지 않음. 수정: 프런트엔드 상의 상태 문자열을 DB와 일치하도록 'accepted'로 변경 (approved → accepted). 글로벌 타입 RequestStatus도 업데이트하여 타입 불일치를 해소.
P2	src/app/api/rooms/route.ts (L47-55)	새 방 생성 시 description 필드 DB 미반영
GitHub
. Zod 스키마에 설명(optional) 정의됐으나 INSERT에서 누락됨. 영향: 방 소개글이 저장되지 않아 UI에 표시되지 않음. 수정: INSERT 시 description: roomData.description 포함하여 입력 누락 해소.
P2	src/components/MapWithCluster.tsx (L71-78)	Kakao Maps JS API 키가 코드에 하드코딩됨
GitHub
. process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 미설정 시 기본 문자열(실제 키)이 사용됨. 영향: API 키 노출로 보안 위험; 환경변수와 불일치 시 설정 혼란. 수정: 하드코드된 키 제거 – env에 키가 없으면 지도 로드 중단하거나 .env.example로만 제공. 개발용 테스트키는 코드에서 삭제.
P3	src/lib/mockData.ts (전체)	개발용 목업 데이터와 함수들 (예: mockLogin, mockRooms 등) 존재
GitHub
GitHub
. 실제 Supabase 연동 후에는 미사용(dead code). 영향: 유지보수 혼란 및 번들사이즈 증가. 조치: useAuth.tsx 등에서 dev모드 사용 중이나, 프로덕션 빌드 제외 또는 문서화 권고. 필요한 경우 유지, 아니면 파일 삭제.
P3	CLEANUP_REPORT.md (repo 루트)	과거 정리 작업 보고서로 추정되는 파일. 현재 코드베이스와 차이 발생 (예: status 컬럼 관련) 가능. 영향: 최신 상태와 불일치하는 정보로 혼란 야기. 조치: 최신 감사 완료로 불필요해졌으므로 파일 제거 검토.
C. 삭제/정리 대상 목록 (불필요하거나 중복된 파일):
CLEANUP_REPORT.md – 이전 코드 정리 결과로 추정되는 문서. 최신 코드와 달라 참조 혼선을 줄 수 있어 제거 권장.
src/lib/mockData.ts – 개발 단계의 목업 데이터/함수 모음. 실제 운영에는 사용되지 않으므로 삭제하거나 dev 전용으로 분리 관리.
src/lib/mockData.ts 내 하드코드 – Kakao API 키 등의 하드코드 값. 특히 MapWithCluster 컴포넌트의 테스트용 API 키 문자열은 제거해야 함.
불필요 이미지/산출물 – 현재 리포에 없는 .png/.zip 등 산출물은 지속 점검. (현재는 발견되지 않았음).
노트: README와 docs (RUNBOOK.md, SECURITY.md, LEGAL_GUIDE.md)는 핵심 내용이 잘 기재되었는지 검토 필요. 현재 코드 상 보안/법무 관련 주요 설정(RLS 정책, Stripe 웹훅 검증 등)이 적절히 구현되었으므로, 해당 문서들도 이를 반영해야 합니다.
D. 패치 제안 (최우선 적용) – 아래 수정사항을 통합 패치합니다. (각 파일의 최신 전체본 또는 중요 변경 diff 제공)
src/lib/brand.ts – brandMessages와 categoryBadges가 named export로 제대로 제공되도록 확인/보장합니다 (현행 구현에서는 이미 export const로 되어 있어 문제 없습니다). 전체 파일을 확인하여 명시적 named export를 유지합니다:
/* src/lib/brand.ts */
export const brandColors = { … } as const

export const brandMessages = {
  appName: '밋핀',
  tagline: '핀 찍고, 지금 모여요',
  shortDescription: '지도에서 방을 만들어 근처 사람들과 만나보세요',
  longDescription: '술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.',
  // ... (생략) ...
} as const

export const categoryLabels = { … } as const
export const categoryEmojis = { … } as const
export const categoryColors = { … } as const

// Category badges object for easy access
export const categoryBadges = {
  drink: { label: categoryLabels.drink, emoji: categoryEmojis.drink, color: categoryColors.drink },
  exercise: { label: categoryLabels.exercise, emoji: categoryEmojis.exercise, color: categoryColors.exercise },
  other: { label: categoryLabels.other, emoji: categoryEmojis.other, color: categoryColors.other },
} as const

// Brand utilities
export function getCategoryDisplay(category: 'drink' | 'exercise' | 'other') {
  return {
    label: categoryLabels[category],
    emoji: categoryEmojis[category],
    color: categoryColors[category],
  }
}
export function getAgeRangeDisplay(ageRange: keyof typeof ageRangeLabels) {
  return ageRangeLabels[ageRange]
}

// Tailwind CSS custom colors extension
export const tailwindColors = { … }

export default {
  colors: brandColors,
  messages: brandMessages,
  categories: { labels: categoryLabels, emojis: categoryEmojis, colors: categoryColors },
  ageRanges: ageRangeLabels,
  tailwind: tailwindColors,
  utils: { getCategoryDisplay, getAgeRangeDisplay },
}
변경 내용: brandMessages와 categoryBadges가 이미 export const로 선언되어 있습니다 (named export 충족). 별도 수정은 필요 없으며, 위와 같이 전체 파일을 유지합니다. 만약 이들이 default export에만 포함되고 named export가 안 되어 있었다면 export const 선언을 추가했을 것입니다.
src/app/layout.tsx – Next.js 15 요구사항에 맞게 <meta name="viewport"> 설정을 metadata에서 분리했습니다. 기존 metadata에 viewport가 없고, 별도 export const viewport가 정의되어 있어 규칙 준수 중입니다
GitHub
. 추가로 불필요한 metadata 필드를 정리합니다. 전체 파일 수정본:
/* src/app/layout.tsx */
import type { Metadata } from "next"
import "./globals.css"
import { brandMessages } from "@/lib/brand"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: `${brandMessages.appName} - ${brandMessages.tagline}`,
  description: "지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요. 술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.",
  keywords: "모임, 만남, 지역, 술친구, 운동, 취미, 소셜, 네트워킹",
  authors: [{ name: "MeetPin Team" }],
  openGraph: {
    title: `${brandMessages.appName} - ${brandMessages.tagline}`,
    description: "지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: brandMessages.appName,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#10B981" />
        <link rel="icon" href="/icons/meetpin.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/meetpin.svg" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div id="root" className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
        </Providers>
      </body>
    </html>
  )
}
변경 사항: metadata에서 viewport 관련 설정을 제거하고, 파일 내에 export const viewport = { … }를 별도로 정의하여 Next 15 가이드에 맞췄습니다. (metadata.viewport 사용시 경고 발생하므로 분리) – 해당 수정은 이미 반영되어 있어 재확인 차원에서 전체 파일을 제공합니다.
누락된 필수 페이지/라우트 생성 – /api/rooms/[id]/requests API 엔드포인트를 신설해 방 호스트가 참가 요청들을 조회할 수 있도록 합니다. (Next.js App Router 경로: src/app/api/rooms/[id]/requests/route.ts):
/* src/app/api/rooms/[id]/requests/route.ts */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser } from '@/lib/api'
import { ApiError, createSuccessResponse } from '@/lib/api'

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const user = await getAuthenticatedUser(request)
  const roomId = context.params.id

  // 방 존재 및 호스트 확인
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('host_uid')
    .eq('id', roomId)
    .single()
  if (roomError || !room) {
    throw new ApiError('존재하지 않는 방입니다', 404)
  }
  if (room.host_uid !== user.id) {
    throw new ApiError('해당 방의 요청을 볼 권한이 없습니다', 403)
  }

  // 해당 방의 참가 요청 목록 조회 (요청자 프로필 및 매치 상태 포함)
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select(`
      id, message, status, created_at, updated_at,
      profiles:requester_uid (
        uid, nickname, age_range, avatar_url
      ),
      match:matches(room_id, host_uid, guest_uid)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
  if (reqError) {
    console.error('Failed to fetch requests:', reqError)
    throw new ApiError('요청 목록을 불러오지 못했습니다')
  }

  // 응답 데이터 가공: 요청자 프로필을 user 필드로, match 존재 여부에 따라 match_id 추가
  const formatted = requests?.map(req => {
    const requesterProfile = (req as any).profiles
    const matchRecord = (req as any).match?.[0]  // 해당 요청에 매치가 있는 경우
    return {
      id: req.id,
      message: req.message,
      status: req.status,
      created_at: req.created_at,
      updated_at: req.updated_at,
      user: requesterProfile ? {
        id: requesterProfile.uid,
        nickname: requesterProfile.nickname,
        age_range: requesterProfile.age_range,
        avatar_url: requesterProfile.avatar_url,
      } : null,
      match_id: (req.status === 'accepted' && matchRecord) ? matchRecord.id : undefined
    }
  }) || []

  return createSuccessResponse({ requests: formatted })
}
설명: 새로운 GET 핸들러는 현재 사용자=방 호스트인지 확인한 후 해당 방의 모든 참가 요청을 조회합니다. profiles:requester_uid 조인을 통해 요청자의 닉네임 등 프로필 정보를 포함하고, 이미 수락된 요청에 대해서는 matches 테이블을 통해 매치 ID를 가져옵니다. 응답 객체에서는 요청 목록을 { id, message, status, created_at, user:{...}, match_id } 형태로 반환하며, 프론트엔드에서 room/[id]/requests 페이지의 요구 사항(요청자 정보 및 채팅 이동을 위한 match_id)에 맞춥니다. 이로써 호스트는 자신이 만든 방에 누가 참가 요청을 보냈는지 확인하고 승인된 경우 채팅방(/chat/[matchId])으로 이동할 수 있습니다.
API 8종 수정 (계약/권한/응답 형식 보완):
(a) src/app/api/rooms/route.ts (방 목록 GET) – status 필터 제거 및 공개 방만 조회:
  .from('rooms')
  .select(`
    *,
    profiles:host_uid ( nickname, avatar_url, age_range )
  `)
- .eq('status', 'open')
  .eq('visibility', 'public')
  .gte('start_at', new Date().toISOString()) // 미래 일정만
수정: 위와 같이 .eq('status', 'open') 줄을 삭제했습니다. DB에 존재하지 않는 컬럼 필터를 없애 오류를 방지하고, 공개(visibility='public') + 시작시간이 미래인 방만 가져오도록 했습니다. 또한 boost_until 및 created_at 정렬은 그대로 유지하여 부스트 방이 상단에 오도록 했습니다
GitHub
GitHub
.
(b) src/app/api/rooms/[id]/route.ts – 방 상세 GET 응답 확장, PATCH/DELETE 권한 검증 및 동작 수정:
GET 요청: 방 조회 시 현재 사용자가 호스트인지 여부와 참가자 수를 추가합니다.
+ const user = await getAuthenticatedUser(request)
  const { data: room, error } = await supabase
    .from('rooms')
    .select(`
      *,
      host:profiles!rooms_host_uid_fkey( id, nickname, ... )
    `)
    .eq('id', id)
    .single()
  if (error || !room) throw new ApiError('방을 찾을 수 없습니다', 404)
- // 현재 참가 요청 수 조회
+ // 현재 참가자 수 산출 (호스트 + 승인된 요청 수)
  const { count: requestCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', id)
    .eq('status', 'accepted')
- return createSuccessResponse({
-   ...(room as any),
-   current_people: (requestCount || 0) + 1,
- })
+ return createSuccessResponse({
+   room: {
+     ...(room as any),
+     participants_count: (requestCount || 0) + 1,
+     is_host: (room as any).host_uid === user.id
+   }
+ })
수정 후 응답 객체는 { room: { …, participants_count, is_host } } 구조로 participants_count (호스트 포함 현재인원)와 is_host(현재 요청자가 호스트인지) 필드를 포함합니다. 이로써 프론트 /room/[id]/requests 페이지에서 room.is_host 확인과 남은 인원 계산이 정확해집니다
GitHub
GitHub
. DELETE 요청: 방 삭제 시 호스트만 실행 가능하도록 하고, 이미 매칭이 성립된 방은 삭제 차단합니다.
  const { data: room } = await supabase
    .from('rooms')
-   .select('host_uid, status')
+   .select('host_uid')
    .eq('id', id)
    .single()
  if (!room || room.host_uid !== user.id) throw new ApiError('방을 삭제할 권한이 없습니다', 403)
- // 이미 진행 중인 방은 삭제 대신 비활성화
- if ((room as any).status === 'active') {
-   const { count: acceptedCount } = await supabase
-     .from('requests').select('*', { count: 'exact', head: true })
-     .eq('room_id', id).eq('status', 'accepted')
-   if (acceptedCount && acceptedCount > 0) {
-     await supabase.from('rooms').update({ status: 'inactive' }).eq('id', id)
-     return createSuccessResponse(null, '방이 비활성화되었습니다')
-   }
- }
+ // 참가자 매칭이 존재하면 삭제 불가
+ const { count: acceptedCount } = await supabase
+   .from('requests').select('*', { count: 'exact', head: true })
+   .eq('room_id', id).eq('status', 'accepted')
+ if (acceptedCount && acceptedCount > 0) {
+   throw new ApiError('참가자가 있는 모임은 삭제할 수 없습니다', 400)
+ }
  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) throw new ApiError('방 삭제에 실패했습니다')
  return createSuccessResponse(null, '방이 성공적으로 삭제되었습니다')
이로써 호스트 아닌 사용자의 삭제 시도는 403 오류, 호스트라도 승인된 참가자가 한 명이라도 있으면 400 에러로 삭제를 막습니다. (방을 폐쇄하려면 일일이 참가자를 내보내거나 관리 개입 필요) – 매칭된 사용자의 대화 유지 및 데이터 무결성 확보를 위해서입니다.
PATCH 요청 (방 수정)에서는 기존에 requireRoomOwner와 유사한 로직으로 호스트만 수정하도록 이미 구현되어 있고, 시작 시간 제한(최소 1시간 이후) 검증이 들어가 있어 양호합니다
GitHub
.
(c) src/app/api/requests/route.ts – 참가 요청 생성 POST: (requests 엔드포인트 POST 구현 내용 추정) – 참가 요청 생성시 중복 여부와 차단 관계 등을 검증해야 합니다. (현재 코드에서는 RLS 정책이 중복 및 차단을 막으므로, 별도 서버검증 없이 parseAndValidateBody + requireAuth로 Insert만 수행하면 RLS에 맡겨도 됩니다.) 추가로, 요청 생성시 room.status='open'인지 확인하려 했을 가능성이 있으나 status 컬럼이 없으므로, 대신 방 시작 시간이나 max_people 비교 등을 할 수 있습니다. 이 부분은 코드에 직접적 오류는 없어 P2로 간주하고, 상세 구현은 필요에 따라 보완합니다. (중복 요청은 DB unique, 차단은 RLS로 커버됨.)
(d) src/app/api/requests/[id]/route.ts – 참가 요청 상태 변경 (승인/거절): PUT 메소드 로직을 개선했습니다. 호스트 권한 확인, status 문자열 매핑, 승인시 매치 생성, 거절시 처리 등을 구현합니다:
/* src/app/api/requests/[id]/route.ts */
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getAuthenticatedUser, requireAuth, requireRoomOwner, ApiError, createSuccessResponse } from '@/lib/api'
import { updateRequestSchema } from '@/lib/zodSchemas'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const user = await getAuthenticatedUser(request)
  const requestId = params.id

  // 대상 참가 요청 조회 (요청자 UID와 room_id 확보)
  const { data: req, error } = await supabase
    .from('requests')
    .select('room_id, requester_uid, status')
    .eq('id', requestId)
    .single()
  if (!req) throw new ApiError('요청이 존재하지 않습니다', 404)
  // 권한: 해당 방의 호스트만 승인/거절 가능
  if ((req as any).status !== 'pending') {
    throw new ApiError('이미 처리된 요청입니다', 400)
  }
  await requireRoomOwner((req as any).room_id)

  // 입력 데이터 검증 및 상태 값 매핑
  const { status } = await request.json().then(body => updateRequestSchema.parse(body))
  const newStatus = (status === 'approved') ? 'accepted' : status  // 'approved' -> 'accepted' 변환
  if (!['accepted','rejected'].includes(newStatus)) {
    throw new ApiError('잘못된 상태 값입니다', 400)
  }

  // 상태 업데이트
  const { error: updateError } = await supabase
    .from('requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', requestId)
  if (updateError) {
    console.error('Request update error:', updateError)
    throw new ApiError('요청 처리에 실패했습니다')
  }

  // 승인 시 matches 레코드 생성 (이미 존재하면 무시)
  if (newStatus === 'accepted') {
    const { error: matchError } = await supabase
      .from('matches')
      .insert({
        room_id: (req as any).room_id,
        host_uid: user.id,
        guest_uid: (req as any).requester_uid
      }, { upsert: true })
    if (matchError) {
      console.warn('Match creation error (중복일 수 있음):', matchError)
    }
  }

  return createSuccessResponse(null, newStatus === 'accepted' ? '요청을 수락했습니다' : '요청을 거절했습니다')
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const user = await getAuthenticatedUser(request)
  const requestId = params.id

  // 자신의 요청 취소만 허용
  const { data: req, error } = await supabase
    .from('requests')
    .select('requester_uid, status')
    .eq('id', requestId)
    .single()
  if (!req) throw new ApiError('요청이 존재하지 않습니다', 404)
  if ((req as any).requester_uid !== user.id) {
    throw new ApiError('본인이 만든 요청만 취소할 수 있습니다', 403)
  }
  if ((req as any).status !== 'pending') {
    throw new ApiError('이미 처리된 요청은 취소할 수 없습니다', 400)
  }

  const { error: deleteError } = await supabase
    .from('requests')
    .delete()
    .eq('id', requestId)
  if (deleteError) {
    console.error('Request cancel error:', deleteError)
    throw new ApiError('요청 취소에 실패했습니다')
  }
  return createSuccessResponse(null, '요청이 취소되었습니다')
}
주요 수정사항: i) status 값 매핑 – 요청 승인 시 프론트 입력 'approved'를 'accepted'로 변환하여 DB에 적용. ii) 호스트 권한 및 이중처리 방지 – 이미 accept/reject 된 요청이나 호스트가 아닌 사용자가 PUT하면 에러. iii) 승인된 경우 matches에 새로운 매치 생성 (upsert로 중복 생성 방지). 이제 호스트가 요청 승인 시 자동으로 1:1 채팅 매칭이 생성되어 /chat/[matchId] 페이지 사용이 가능해집니다. 거절은 상태만 업데이트. iv) DELETE 핸들러 – 요청자 본인이 pending 상태인 요청을 취소(delete)할 수 있게 구현했습니다 (요청자가 “요청함” 페이지에서 취소 버튼 클릭 시 동작)
GitHub
.
(e) src/lib/zodSchemas.ts – 스키마 수정: updateRequestSchema에서 enum에 'approved'를 추가하거나, 프론트엔드에서 'accepted'로 보내도록 할 수 있습니다. 이번 패치에서는 프론트 측을 고쳐 일관성 유지하므로 스키마는 그대로 ('pending'|'accepted'|'rejected'). 대신 RequestStatus 타입을 수정했습니다 (아래 프론트 코드 참조).
(f) 기타 보완: Stripe 웹훅 관련 handleWebhookEvent에서 DB 업데이트 누락 – 현재 결제 성공시 boost_until을 갱신하지 않고 있어 비정상입니다
GitHub
. Stripe Webhook (checkout.session.completed) 처리 후 rooms 테이블의 해당 room boost_until 필드를 now+days로 업데이트하도록 개선이 필요합니다. (supabaseAdmin 활용). 이 변화는 결제 기능의 핵심 보완점으로, 여기서는 코드상 P2이므로 우선순위 패치 목록에 포함합니다:
// stripe.ts - handleWebhookEvent 내 checkout.session.completed 처리:
if (metadata) {
  const { roomId, days } = metadata
  const boostExpiry = calculateBoostExpiry(days)
  await supabaseAdmin.from('rooms').update({ boost_until: boostExpiry.toISOString() }).eq('id', roomId)
  return { type: event.type, roomId, userId: metadata.userId, days, success: true }
}
이로써 결제 완료 시 해당 방이 지정 기간만큼 부스트되어 /api/rooms 목록에서도 상단 노출되고, 만료 시 자동 정렬됩니다. (웹훅 시점에 RLS 우회 위해 supabaseAdmin 사용)
환경변수 사용 일관성 보정:
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY – MapWithCluster 컴포넌트에서 기본값으로 하드코딩된 키 제거
GitHub
. .env에서 키가 없는 경우 지도를 불러오지 않고 경고 로그만 출력하도록 변경:
- const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '11764377687ae8ad3d8decc7ac0078d5'
+ const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
   console.log('사용할 Kakao API 키:', kakaoKey)
   const script = document.createElement('script')
+ if (!kakaoKey) {
+   console.error('Kakao Maps API Key 미설정: 지도를 불러올 수 없습니다.')
+   return
+ }
   script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=clusterer&autoload=false`
영향: .env에 키가 없으면 개발 단계에서 콘솔 에러로 알리고 맵 호출을 스킵하게 됩니다. 실제 운영 시에는 .env에 반드시 키를 넣도록 README/Setup 가이드에 명시합니다. 하드코드 제거로 보안 강화.
Stripe/Kakao 환경변수 철자 통일 – 현재 .env.example과 코드가 일치하므로 (예: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, etc) 별도 수정은 필요 없었습니다. 다만 Stripe Price ID (STRIPE_PRICE_..._ID)가 flags.config에서 사용되므로 .env.local에 설정하도록 README에 안내 추가 가능합니다.
Supabase URL/Key – supabaseClient.ts에서 env 유효성 체크가 잘 되어 있습니다
GitHub
. 추가로, auth 관련 .env.local 설정이 올바른지 (Site URL 등) Setup 가이드에 재확인하면 좋습니다.
E. Claude Code 적용 프롬프트 예시 (각 수정 파일을 전체 제공하도록 지시): 다음은 Claude Code에게 이번 패치의 수정 파일들을 모두 출력하도록 하는 프롬프트입니다. 각 파일 경로를 주석으로 명시하고, 수정 후 전체 코드를 코드블록으로 제시합니다. (내용 누락 없이, 동일 파일 여러 번 나오지 않도록 최종 버전 한 번만 표시)
다음 변경사항을 코드에 적용해주세요. 수정된 각 파일을 경로 주석과 전체 코드로 출력하십시오 (누락/중간생략 금지):

/* 파일경로: src/app/api/rooms/route.ts */
```tsx
// ...여기에 src/app/api/rooms/route.ts 수정된 전체 코드...
/* 파일경로: src/app/api/rooms/[id]/route.ts */
// ...여기에 src/app/api/rooms/[id]/route.ts 수정된 전체 코드...
/* 파일경로: src/app/api/rooms/[id]/requests/route.ts */
// ...여기에 새로 추가된 src/app/api/rooms/[id]/requests/route.ts 전체 코드...
/* 파일경로: src/app/api/requests/[id]/route.ts */
// ...여기에 src/app/api/requests/[id]/route.ts 수정된 전체 코드...
/* 파일경로: src/lib/brand.ts */
// ...여기에 src/lib/brand.ts 전체 코드 (named export 보장)...
/* 파일경로: src/app/layout.tsx */
// ...여기에 src/app/layout.tsx 수정된 전체 코드 (viewport 분리 등)...
/* 파일경로: src/app/requests/page.tsx */
// ...여기에 src/app/requests/page.tsx에서 'approved'→'accepted' 수정한 전체 코드...
/* 파일경로: src/app/room/[id]/requests/page.tsx */
// ...여기에 src/app/room/[id]/requests/page.tsx에서 참가 승인 PUT 요청 'approved'→'accepted' 수정한 전체 코드...
/* 파일경로: src/types/global.d.ts */
// ...여기에 src/types/global.d.ts에서 RequestStatus 'approved'→'accepted' 수정한 전체 코드...
명심하세요: 각 파일은 /* 파일경로 */ 주석으로 시작하고, 그 다음 줄부터* 해당 파일의 최신 내용을 한 글자도 생략 없이 넣어주세요.