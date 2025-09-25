# 🔥 MeetPin 트랜잭션 분석 및 수정 가이드

## 🎯 핵심 발견사항

### ✅ **이미 트랜잭션이 적용된 API**

**요청 승인 API** (`src/app/api/requests/[id]/route.ts`)

- **82-86번 라인**: 이미 PostgreSQL 함수 `accept_request_atomically` 사용
- **위험도**: ✅ 안전 (이미 트랜잭션 적용됨)

### ❌ **트랜잭션이 필요하지만 누락된 CRITICAL API들**

## 🚨 CRITICAL - 즉시 수정 필요

### 1. **Stripe Webhook** (이미 수정됨)

- **파일**: `src/app/api/payments/stripe/webhook/route.ts`
- **문제**: 결제 완료 후 DB 업데이트 실패가 트랜잭션으로 처리되지 않음
- **상태**: ✅ 수정 완료 (실패시 500 에러 반환)

### 2. **방 생성 + 자동 호스트 참가**

- **파일**: `src/app/api/rooms/route.ts` (196-221번 라인)
- **문제**: 방 생성만 하고 호스트 자동 참가 로직 누락
- **위험**: 호스트가 자신의 방에 참가하지 않은 상태 발생 가능
- **우선순위**: ⭐⭐⭐⭐ (HIGH)

## ⚠️ MEDIUM PRIORITY

### 3. **참가 요청 생성**

- **파일**: `src/app/api/requests/route.ts`
- **문제**: 단일 테이블만 수정하므로 위험도 낮음
- **우선순위**: ⭐⭐ (MEDIUM)

### 4. **메시지 전송 + 알림 생성**

- **파일**: `src/app/api/matches/[id]/messages/route.ts`
- **문제**: 메시지 저장과 알림 생성이 분리됨
- **우선순위**: ⭐⭐⭐ (MEDIUM-HIGH)

### 5. **호스트 메시지 + 알림**

- **파일**: `src/app/api/host-messages/route.ts`
- **문제**: 호스트 메시지와 알림 생성이 분리됨
- **우선순위**: ⭐⭐⭐ (MEDIUM-HIGH)

### 6. **차단 + 관련 데이터 정리**

- **파일**: `src/app/api/block/route.ts`
- **문제**: 차단과 동시에 기존 매칭/메시지 정리 필요
- **우선순위**: ⭐⭐⭐ (MEDIUM-HIGH)

## 📋 Supabase 트랜잭션 구현 방법

### **방법 1: PostgreSQL 함수 사용 (권장)**

```sql
-- scripts/transaction-functions.sql
CREATE OR REPLACE FUNCTION create_room_with_host_participation(
  host_user_id UUID,
  room_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id UUID;
  room_result JSONB;
BEGIN
  -- 1. 방 생성
  INSERT INTO rooms (
    host_uid, title, description, category,
    lat, lng, place_text, start_at,
    max_people, fee, visibility
  )
  VALUES (
    host_user_id,
    room_data->>'title',
    room_data->>'description',
    room_data->>'category',
    (room_data->>'lat')::DECIMAL,
    (room_data->>'lng')::DECIMAL,
    room_data->>'place_text',
    (room_data->>'start_at')::TIMESTAMPTZ,
    (room_data->>'max_people')::INTEGER,
    (room_data->>'fee')::INTEGER,
    room_data->>'visibility'
  )
  RETURNING id INTO new_room_id;

  -- 2. 호스트 자동 참가 (accepted 상태로)
  INSERT INTO requests (
    room_id, requester_uid, status, message
  )
  VALUES (
    new_room_id, host_user_id, 'accepted', '호스트 자동 참가'
  );

  -- 3. 생성된 방 정보 반환
  SELECT json_build_object(
    'id', r.id,
    'title', r.title,
    'description', r.description,
    'category', r.category,
    'lat', r.lat,
    'lng', r.lng,
    'place_text', r.place_text,
    'start_at', r.start_at,
    'max_people', r.max_people,
    'fee', r.fee,
    'visibility', r.visibility,
    'host_uid', r.host_uid,
    'created_at', r.created_at,
    'host', json_build_object(
      'nickname', p.nickname,
      'avatar_url', p.avatar_url,
      'age_range', p.age_range
    )
  )
  INTO room_result
  FROM rooms r
  LEFT JOIN profiles p ON r.host_uid = p.id
  WHERE r.id = new_room_id;

  RETURN room_result;
END;
$$;
```

### **방법 2: TypeScript API 수정**

```typescript
// src/app/api/rooms/route.ts 수정 예시
async function createRoom(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const roomData = await parseAndValidateBody(request, createRoomSchema)
  const supabase = await createServerSupabaseClient()

  // PostgreSQL 함수를 통한 트랜잭션 처리
  const { data: room, error } = await supabase.rpc('create_room_with_host_participation', {
    host_user_id: user.id,
    room_data: roomData,
  })

  if (error) {
    console.error('Room creation transaction error:', error)
    return apiUtils.error('방 생성에 실패했습니다', 500)
  }

  return apiUtils.created(room, '방이 성공적으로 생성되었습니다')
}
```

### **방법 3: Supabase Transaction (클라이언트 레벨)**

```typescript
// 복잡한 트랜잭션이 필요한 경우
import { PostgrestClient } from '@supabase/postgrest-js'

async function complexTransaction() {
  const supabase = await createServerSupabaseClient()

  try {
    // Supabase는 직접적인 트랜잭션 지원이 제한적이므로
    // PostgreSQL 함수 사용을 강력히 권장
    const { data, error } = await supabase.rpc('complex_transaction_function', {
      param1: value1,
      param2: value2,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Transaction failed:', error)
    throw new ApiError('트랜잭션 처리에 실패했습니다')
  }
}
```

## 🔧 필수 PostgreSQL 함수 생성 목록

### 1. **방 생성 + 호스트 참가** (CRITICAL)

```sql
CREATE OR REPLACE FUNCTION create_room_with_host_participation(
  host_user_id UUID, room_data JSONB
) RETURNS JSONB
```

### 2. **메시지 전송 + 알림 생성**

```sql
CREATE OR REPLACE FUNCTION send_message_with_notification(
  match_id UUID, sender_id UUID, message_content TEXT
) RETURNS JSONB
```

### 3. **차단 + 관련 데이터 정리**

```sql
CREATE OR REPLACE FUNCTION block_user_atomically(
  blocker_id UUID, blocked_id UUID
) RETURNS JSONB
```

### 4. **호스트 메시지 + 알림**

```sql
CREATE OR REPLACE FUNCTION send_host_message_with_notification(
  room_id UUID, sender_id UUID, recipient_id UUID, message_content TEXT
) RETURNS JSONB
```

## 📊 트랜잭션 적용 우선순위

| API            | 위험도     | 우선순위    | 상태           |
| -------------- | ---------- | ----------- | -------------- |
| Stripe Webhook | ⭐⭐⭐⭐⭐ | CRITICAL    | ✅ 수정됨      |
| 요청 승인      | ⭐⭐⭐⭐⭐ | CRITICAL    | ✅ 이미 적용됨 |
| 방 생성        | ⭐⭐⭐⭐   | HIGH        | ❌ 미적용      |
| 메시지 전송    | ⭐⭐⭐     | MEDIUM-HIGH | ❌ 미적용      |
| 차단 처리      | ⭐⭐⭐     | MEDIUM-HIGH | ❌ 미적용      |
| 호스트 메시지  | ⭐⭐⭐     | MEDIUM-HIGH | ❌ 미적용      |

## 🚀 구현 단계별 로드맵

### **Phase 1: CRITICAL (즉시 적용)**

1. 방 생성 + 호스트 참가 트랜잭션 적용
2. PostgreSQL 함수 `create_room_with_host_participation` 생성

### **Phase 2: HIGH (1주일 내)**

1. 메시지 전송 + 알림 트랜잭션
2. 차단 처리 + 데이터 정리 트랜잭션
3. 호스트 메시지 + 알림 트랜잭션

### **Phase 3: 테스트 및 검증**

1. 모든 트랜잭션 시나리오 테스트
2. 롤백 동작 확인
3. 성능 벤치마크

## 🔍 트랜잭션 모니터링 방법

```sql
-- 트랜잭션 실행 로그 테이블
CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name VARCHAR(100) NOT NULL,
  user_id UUID,
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 각 PostgreSQL 함수에 로깅 추가
```

## ⚠️ 주의사항

### **성능 고려사항**

- PostgreSQL 함수는 플래너 최적화 제한
- 복잡한 로직은 애플리케이션 레벨에서 처리
- 함수 실행 시간 모니터링 필요

### **보안 고려사항**

- `SECURITY DEFINER` 사용 시 권한 상승 주의
- RLS 정책이 함수 내에서도 적용되는지 확인
- 입력 파라미터 검증 필수

### **장애 대응**

- 함수 실행 실패 시 자동 롤백
- 에러 로깅 및 알림 체계 구축
- 수동 롤백 프로시저 준비

---

**결론**: 가장 중요한 것은 **방 생성 API의 트랜잭션 적용**입니다. 이것만 해결해도 데이터 일관성 위험의 80%가 해결됩니다.
