# 🔍 Logger 시스템 마이그레이션 가이드

## 개요

MeetPin v1.5.0에서 Logger 시스템이 재설계되었습니다. 순환 의존성 문제를 해결하고 API 에러 로깅을 복구했습니다.

## 변경 사항

### Before (v1.4.x)
```typescript
// src/lib/api.ts
// logger import 제거 - 순환 의존성 방지
console.error('[API] Error:', error)
```

### After (v1.5.0)
```typescript
// src/lib/api.ts
import { createServerLogger, logApiRequest } from '@/lib/observability/logger-server'

const logger = await createServerLogger(request)
logger.error('API Error occurred', error)
```

## 사용 가이드

### 1. 클라이언트 컴포넌트

```typescript
import { logger } from '@/lib/observability/logger'

export default function MyComponent() {
  // 일반 로그
  logger.info('Component mounted')

  // 에러 로그
  try {
    // ...
  } catch (error) {
    logger.error('Operation failed', { error })
  }
}
```

### 2. 서버 컴포넌트 / API Routes

```typescript
import { createServerLogger } from '@/lib/observability/logger-server'

export async function GET(request: NextRequest) {
  const logger = await createServerLogger(request)

  logger.info('Processing request')

  // 성능 측정
  const timer = new ServerPerformanceTimer(logger, 'database_query')
  // ... 작업
  timer.end(true)
}
```

### 3. withErrorHandling 미들웨어

```typescript
import { withErrorHandling, createMethodRouter } from '@/lib/api'

export const { GET, POST } = createMethodRouter({
  GET: withErrorHandling(async (request, context) => {
    // 자동 로깅 포함
    // 에러 발생 시 자동으로 logger.error() 호출
    return NextResponse.json({ ok: true })
  })
})
```

## 로그 레벨

| Level | 용도 | 개발 환경 | 프로덕션 환경 |
|-------|-----|----------|------------|
| debug | 디버깅 정보 | ✅ 출력 | ❌ 생략 |
| info | 일반 정보 | ✅ 출력 | ✅ 출력 |
| warn | 경고 (복구 가능) | ✅ 출력 | ✅ 출력 |
| error | 에러 (복구 불가) | ✅ 출력 | ✅ 출력 |
| fatal | 치명적 에러 | ✅ 출력 | ✅ 출력 |

## 출력 형식

### 개발 환경
```
[INFO] [req_170536...] POST /api/rooms Room created
  └─ { roomId: 'abc123', userId: 'user_456' }
```

### 프로덕션 환경
```json
{
  "level": "info",
  "message": "Room created",
  "requestId": "req_1705364829_x7k9j2p",
  "path": "/api/rooms",
  "method": "POST",
  "userId": "user_456",
  "latency": 145,
  "status": 200,
  "timestamp": "2025-10-17T12:34:56.789Z",
  "environment": "production",
  "service": "meetpin-api"
}
```

## PII 스크러빙

자동으로 민감한 정보를 `[REDACTED]`로 마스킹합니다:

- 전화번호: `010-1234-5678` → `[REDACTED]`
- 주민등록번호: `123456-1234567` → `[REDACTED]`
- 이메일: `user@example.com` → `[REDACTED]`
- 카드번호: `1234-5678-9012-3456` → `[REDACTED]`
- 비밀번호/토큰: `password: secret123` → `[REDACTED]`

## 마이그레이션 체크리스트

- [x] `logger-server.ts` 생성
- [x] `api.ts`에 ServerLogger 통합
- [x] TypeScript 에러 0개 확인
- [x] withErrorHandling 미들웨어 자동 로깅 추가
- [x] 순환 의존성 제거 확인
- [ ] 기존 console.log/error를 logger로 마이그레이션 (선택)

## 성능 영향

- **로그 오버헤드**: < 1ms per log
- **메모리 영향**: 무시 가능
- **프로덕션 로그 샘플링**: 10% (TELEMETRY_SAMPLING_RATE)

## 문제 해결

### Q: "server-only" 에러 발생
A: 클라이언트 컴포넌트에서 `logger-server` import 시도. `logger.ts` 사용

### Q: 로그가 너무 많이 출력됨
A: 환경변수 `LOG_LEVEL=error` 설정으로 에러만 출력

### Q: 프로덕션에서 로그 안보임
A: JSON 형식이므로 `console.log(JSON.parse(log))` 또는 로그 수집 도구 사용
