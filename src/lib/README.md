# lib/ 폴더

밋핀(MeetPin) 프로젝트의 핵심 비즈니스 로직, 서비스, 유틸리티를 관리하는 폴더입니다.

---

## 📁 폴더 구조

```
lib/
├── accessibility/        # 접근성 (WCAG 2.1 AA)
├── bot/                  # 봇 자동 생성 시스템
├── cache/                # Redis 캐싱
├── config/               # 앱 설정 파일
├── design/               # 디자인 시스템
├── observability/        # 로깅 및 모니터링
├── payments/             # Stripe 결제
├── security/             # 보안 유틸리티
├── services/             # 비즈니스 서비스
├── utils/                # 공통 유틸리티
├── api.ts                # API 공통 유틸리티
├── rateLimit.ts          # Rate Limiting
├── supabaseClient.ts     # Supabase 클라이언트
├── useAuth.tsx           # 인증 Context/Hook
├── bot-scheduler.ts      # 레거시 봇 스케줄러
└── age-verification.ts   # 나이 인증
```

---

## 🎯 주요 파일 소개

### 1. api.ts - API 공통 유틸리티

모든 API 라우트에서 사용하는 공통 유틸리티입니다.

**주요 내용:**
- `ApiResponse<T>` 인터페이스: 일관된 API 응답 포맷
- `ApiError` 클래스: 구조화된 에러 처리
- `getAuthenticatedUser()`: 인증된 사용자 가져오기
- `requireAdmin()`: 관리자 권한 검증
- `rateLimit()`: 간단한 Rate Limiting

**사용 예시:**
```typescript
// app/api/rooms/route.ts
import { ApiResponse, ApiError, getAuthenticatedUser } from '@/lib/api'

export async function GET(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    // 비즈니스 로직
    const rooms = await getRooms()

    // 일관된 응답 포맷
    const response: ApiResponse<Room[]> = {
      ok: true,
      data: rooms
    }

    return Response.json(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { ok: false, code: error.code, message: error.message },
        { status: error.statusCode }
      )
    }
    return Response.json(
      { ok: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

---

### 2. supabaseClient.ts - Supabase 클라이언트

Supabase 클라이언트를 생성하고 TypeScript 타입을 제공합니다.

**주요 내용:**
- `createBrowserSupabaseClient()`: 클라이언트 사이드 클라이언트
- `createServerSupabaseClient()`: 서버 사이드 클라이언트 (쿠키 처리)
- `supabaseAdmin`: RLS 우회 관리자 클라이언트
- TypeScript 타입: `Database`, `RoomInsert`, `ProfileInsert` 등

**사용 예시:**
```typescript
// 클라이언트 컴포넌트
'use client'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'

const supabase = createBrowserSupabaseClient()
const { data } = await supabase.from('rooms').select('*')

// 서버 컴포넌트
import { createServerSupabaseClient } from '@/lib/supabaseClient'

const supabase = createServerSupabaseClient()
const { data } = await supabase.from('rooms').select('*')

// Admin API (RLS 우회)
import { supabaseAdmin } from '@/lib/supabaseClient'

const { data } = await supabaseAdmin
  .from('profiles')
  .update({ role: 'admin' })
  .eq('uid', userId)
```

---

### 3. useAuth.tsx - 인증 Context/Hook

전역 인증 상태를 관리하는 Context와 Hook입니다.

**주요 내용:**
- `AuthContext`: 전역 인증 상태
- `useAuth()`: 현재 사용자, 로딩 상태, 로그인/로그아웃 함수
- Mock 모드 지원 (개발 환경)

**사용 예시:**
```typescript
'use client'
import { useAuth } from '@/lib/useAuth'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>로딩 중...</div>
  if (!user) return <div>로그인이 필요합니다</div>

  return (
    <div>
      <h1>{user.nickname}님 환영합니다</h1>
      <button onClick={signOut}>로그아웃</button>
    </div>
  )
}
```

---

### 4. rateLimit.ts - Rate Limiting

Upstash Redis 기반 분산 Rate Limiting을 제공합니다.

**주요 내용:**
- IP 기반, 사용자 기반 제한
- 슬라이딩 윈도우 알고리즘
- 개발 환경에서는 Redis 없이도 동작

**사용 예시:**
```typescript
// app/api/rooms/route.ts
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  // IP 기반 Rate Limit (100회/분)
  const { success, remaining } = await rateLimit(
    `api:rooms:${getClientIp(request)}`,
    100,
    60000
  )

  if (!success) {
    return Response.json(
      { ok: false, message: 'Too many requests' },
      { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
    )
  }

  // ...
}
```

---

## 📂 하위 폴더 소개

### services/ - 비즈니스 서비스

각 도메인별 비즈니스 로직을 캡슐화한 서비스입니다.

| 파일 | 설명 |
|------|------|
| `auth.ts` | 인증 서비스 (서버 전용) |
| `authService.ts` | 인증 서비스 (클라이언트 전용) |
| `roomService.ts` | 모임 CRUD 서비스 |
| `chatService.ts` | 채팅 서비스 |
| `notificationService.ts` | 알림 서비스 |

**사용 예시:**
```typescript
import { getRooms, createRoom } from '@/lib/services/roomService'

// 모임 조회
const rooms = await getRooms({ category: 'drink', limit: 10 })

// 모임 생성
const newRoom = await createRoom({
  title: '강남 맥주 모임',
  category: 'drink',
  // ...
})
```

---

### cache/ - Redis 캐싱

Redis/Upstash 분산 캐싱 시스템입니다.

**주요 내용:**
- 구조화된 캐시 키: `CacheKeys.rooms()`, `CacheKeys.roomDetail(id)`
- TTL 기반 자동 만료
- 개발 환경에서는 Redis 없이도 동작

**사용 예시:**
```typescript
import { CacheKeys, getCached, setCached } from '@/lib/cache/redis'

// 캐시에서 조회
const rooms = await getCached<Room[]>(CacheKeys.rooms())

if (!rooms) {
  // 캐시 미스 - DB에서 조회
  const freshRooms = await supabase.from('rooms').select('*')

  // 캐시 저장 (TTL: 5분)
  await setCached(CacheKeys.rooms(), freshRooms, 300)
}
```

---

### observability/ - 로깅 및 모니터링

구조화된 로깅과 관찰 가능성을 제공합니다.

**주요 내용:**
- 요청 ID 추적
- PII 스크러빙 (이메일, 전화번호 자동 마스킹)
- 성능 타이밍 측정
- 환경별 로그 포맷 (개발: 컬러 콘솔, 프로덕션: JSON)

**사용 예시:**
```typescript
import { logger, PerformanceTimer } from '@/lib/observability/logger'

export async function GET(request: Request) {
  const timer = new PerformanceTimer()

  logger.info('Fetching rooms', {
    requestId: crypto.randomUUID(),
    userId: user.id,
  })

  const rooms = await getRooms()

  logger.info('Rooms fetched successfully', {
    count: rooms.length,
    latency: timer.elapsed(),
  })

  return Response.json({ ok: true, data: rooms })
}
```

---

### payments/ - Stripe 결제

Stripe 결제 시스템을 관리합니다.

**주요 내용:**
- Stripe Checkout 생성
- 웹훅 처리
- 부스트 상품 관리

**사용 예시:**
```typescript
import { createBoostCheckout } from '@/lib/payments/stripe'

// 결제 세션 생성
const session = await createBoostCheckout({
  roomId: 'room-123',
  days: 3,
  userId: user.id,
})

// Checkout URL로 리다이렉트
window.location.href = session.url
```

---

### security/ - 보안 유틸리티

입력 검증, XSS 방지, CSP 헤더 등 보안 기능을 제공합니다.

**주요 내용:**
- `sanitize.ts`: XSS 방지 새니타이징
- `validation.ts`: 입력 검증 (금지어, 이메일, URL)
- `csp.ts`: Content Security Policy 설정

**사용 예시:**
```typescript
import { sanitizeHtml } from '@/lib/security/sanitize'
import { validateEmail } from '@/lib/security/validation'

// HTML 새니타이징
const safeHtml = sanitizeHtml(userInput)

// 이메일 검증
if (!validateEmail(email)) {
  throw new Error('Invalid email format')
}
```

---

### bot/ - 봇 자동 생성 시스템

자연스러운 패턴으로 봇 방을 자동 생성합니다.

**주요 내용:**
- 시간대별 자동 생성
- 지역별 분포
- 스케줄링 시스템

**사용 예시:**
```typescript
import { BotManager } from '@/lib/bot/bot-scheduler'

// 봇 시스템 시작 (서버 사이드만)
BotManager.start()

// 수동 봇 방 생성
await BotManager.createManualBots(5)
```

---

### utils/ - 공통 유틸리티

프로젝트 전체에서 사용하는 작은 유틸리티 함수들입니다.

| 파일 | 설명 |
|------|------|
| `dataValidation.ts` | 데이터 검증 함수 |
| `textSafe.ts` | 안전한 텍스트 처리 |
| `hydration.ts` | SSR/CSR 하이드레이션 유틸 |
| `logger.ts` | 간단한 로거 (개발용) |

**사용 예시:**
```typescript
import { validateRoomTitle } from '@/lib/utils/dataValidation'
import { escapeHtml } from '@/lib/utils/textSafe'

// 모임 제목 검증
const isValid = validateRoomTitle(title)

// HTML 이스케이프
const safeText = escapeHtml(userInput)
```

---

## 📐 서비스 작성 가이드

### 1. 서비스 파일 구조

```typescript
// lib/services/roomService.ts

import { supabaseAdmin } from '@/lib/supabaseClient'
import type { Room, RoomCreateData } from '@/types/global'

/**
 * 모임 목록 조회
 */
export async function getRooms(filters?: {
  category?: string
  limit?: number
}): Promise<Room[]> {
  const query = supabaseAdmin
    .from('rooms')
    .select('*, host:profiles(*)')

  if (filters?.category) {
    query.eq('category', filters.category)
  }

  const { data, error } = await query.limit(filters?.limit || 10)

  if (error) throw new Error(error.message)
  return data as Room[]
}

/**
 * 모임 생성
 */
export async function createRoom(
  roomData: RoomCreateData,
  hostUid: string
): Promise<Room> {
  const { data, error } = await supabaseAdmin
    .from('rooms')
    .insert({ ...roomData, host_uid: hostUid })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Room
}
```

---

### 2. 에러 처리 패턴

```typescript
import { ApiError } from '@/lib/api'

export async function deleteRoom(roomId: string, userId: string) {
  // 권한 확인
  const { data: room } = await supabase
    .from('rooms')
    .select('host_uid')
    .eq('id', roomId)
    .single()

  if (!room) {
    throw new ApiError('Room not found', 404, 'ROOM_NOT_FOUND')
  }

  if (room.host_uid !== userId) {
    throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  }

  // 삭제
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId)

  if (error) {
    throw new ApiError('Failed to delete room', 500, 'DELETE_FAILED')
  }
}
```

---

### 3. 캐싱 패턴

```typescript
import { getCached, setCached, CacheKeys } from '@/lib/cache/redis'

export async function getRoomById(roomId: string): Promise<Room | null> {
  // 1. 캐시 확인
  const cached = await getCached<Room>(CacheKeys.roomDetail(roomId))
  if (cached) return cached

  // 2. DB 조회
  const { data } = await supabase
    .from('rooms')
    .select('*, host:profiles(*)')
    .eq('id', roomId)
    .single()

  if (!data) return null

  // 3. 캐시 저장 (TTL: 5분)
  await setCached(CacheKeys.roomDetail(roomId), data, 300)

  return data as Room
}
```

---

## 🧪 유틸리티 테스트

```typescript
// __tests__/lib/api.test.ts
import { ApiError, ApiResponse } from '@/lib/api'

describe('ApiError', () => {
  it('should create error with status code', () => {
    const error = new ApiError('Not Found', 404, 'NOT_FOUND')

    expect(error.message).toBe('Not Found')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
  })
})

describe('ApiResponse', () => {
  it('should return success response', () => {
    const response: ApiResponse<{ id: string }> = {
      ok: true,
      data: { id: '123' }
    }

    expect(response.ok).toBe(true)
    expect(response.data?.id).toBe('123')
  })
})
```

---

## 🔒 보안 주의사항

### 1. 서버 전용 코드

```typescript
// ⚠️ 서버 전용 - 브라우저 노출 금지
import { supabaseAdmin } from '@/lib/supabaseClient'  // RLS 우회
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ 클라이언트에서 사용 가능
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. 환경 변수 규칙

```typescript
// ✅ 브라우저 노출 가능 (NEXT_PUBLIC_ 접두사)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// ⚠️ 서버 전용 (접두사 없음)
const secretKey = process.env.STRIPE_SECRET_KEY

// ❌ 브라우저에서 접근 불가
if (typeof window !== 'undefined') {
  console.log(process.env.STRIPE_SECRET_KEY)  // undefined
}
```

### 3. 입력 검증

```typescript
// ✅ 항상 입력 검증
import { z } from 'zod'

const RoomSchema = z.object({
  title: z.string().min(2).max(50),
  category: z.enum(['drink', 'exercise', 'other']),
  fee: z.number().min(0).max(100000),
})

const validated = RoomSchema.parse(userInput)
```

---

## 📚 참고 자료

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

---

**최종 업데이트**: 2025-10-01
