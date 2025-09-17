# 🛡️ MeetPin 보안 설정 가이드

## 📋 보안 개요

MeetPin 애플리케이션의 포괄적인 보안 설정 가이드입니다. 프로덕션 환경에서 안전한 서비스 운영을 위한 모든 보안 조치를 다룹니다.

## 🔒 1. 인증 및 권한 관리

### 1.1 Supabase Auth 보안 설정

#### Row Level Security (RLS) 정책
```sql
-- 사용자 프로필 보안
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 방 접근 제어
CREATE POLICY "Public rooms visible" ON rooms
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = auth.uid() AND blocked_id = host_id)
      OR (blocker_id = host_id AND blocked_id = auth.uid())
    )
  );

-- 채팅 메시지 보안
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );
```

#### JWT 토큰 설정
```typescript
// src/lib/auth.ts - 토큰 검증
export async function verifyJWT(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      throw new ApiError('유효하지 않은 토큰', 401, 'INVALID_TOKEN')
    }
    return user
  } catch (error) {
    throw new ApiError('토큰 검증 실패', 401, 'TOKEN_VERIFICATION_FAILED')
  }
}
```

### 1.2 관리자 권한 제어
```typescript
// src/lib/auth.ts - 관리자 권한 확인
export async function requireAdmin(request: Request) {
  const user = await getAuthenticatedUser(request)
  
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (error || profile?.role !== 'admin') {
    throw new ApiError('관리자 권한이 필요합니다', 403, 'ADMIN_REQUIRED')
  }
  
  return user
}
```

## 🚧 2. API 보안

### 2.1 Rate Limiting
```typescript
// src/lib/rateLimit.ts - API 호출 제한
const rateLimits = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const current = rateLimits.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false // Rate limit exceeded
  }
  
  current.count++
  return true
}

// 사용 예시 - API 라우트에서
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  if (!rateLimit(`api-${ip}`, 100, 60000)) { // 100 requests per minute
    return createErrorResponse('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
  }
  
  // 실제 API 로직...
}
```

### 2.2 입력 데이터 검증
```typescript
// src/lib/zodSchemas.ts - 엄격한 데이터 검증
import { z } from 'zod'

export const createRoomSchema = z.object({
  title: z.string()
    .min(2, '제목은 최소 2글자 이상이어야 합니다')
    .max(50, '제목은 50글자를 초과할 수 없습니다')
    .regex(/^[가-힣a-zA-Z0-9\s\-_!?.,]*$/, '허용되지 않은 문자가 포함되어 있습니다'),
  
  description: z.string()
    .max(500, '설명은 500글자를 초과할 수 없습니다')
    .optional(),
    
  latitude: z.number()
    .min(33.0, '한국 영역 내의 위도여야 합니다')
    .max(43.0, '한국 영역 내의 위도여야 합니다'),
    
  longitude: z.number()
    .min(124.0, '한국 영역 내의 경도여야 합니다')
    .max(132.0, '한국 영역 내의 경도여야 합니다'),
})

// API에서 사용
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)
    // 검증된 데이터로 처리...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('입력 데이터가 유효하지 않습니다', 400, 'VALIDATION_ERROR')
    }
  }
}
```

### 2.3 금지어 필터링
```typescript
// src/lib/contentFilter.ts - 부적절한 콘텐츠 필터링
const FORBIDDEN_WORDS = [
  // 금지어 목록 (실제 구현에서는 외부 파일이나 DB에서 관리)
  '욕설1', '욕설2', '부적절한내용'
]

export function containsForbiddenWords(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s/g, '')
  return FORBIDDEN_WORDS.some(word => normalized.includes(word.toLowerCase()))
}

export function filterContent(text: string): string {
  if (containsForbiddenWords(text)) {
    throw new ApiError('부적절한 내용이 포함되어 있습니다', 400, 'INAPPROPRIATE_CONTENT')
  }
  return text
}
```

## 🌐 3. 웹 보안

### 3.1 Content Security Policy (CSP)
```typescript
// next.config.production.ts - 강화된 CSP 설정
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net https://js.stripe.com https://www.googletagmanager.com",
              "connect-src 'self' https://dapi.kakao.com https://t1.daumcdn.net https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### 3.2 보안 헤더
```typescript
// next.config.production.ts - 포괄적 보안 헤더
const securityHeaders = [
  // HSTS (HTTP Strict Transport Security)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // X-XSS-Protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Referrer Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  },
]
```

## 💳 4. 결제 보안 (Stripe)

### 4.1 웹훅 서명 검증
```typescript
// src/app/api/payments/stripe/webhook/route.ts
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature found', { status: 400 })
  }
  
  try {
    // 서명 검증으로 요청의 진위성 확인
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    // 검증된 이벤트만 처리
    await handleStripeEvent(event)
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Invalid signature', { status: 400 })
  }
}
```

### 4.2 결제 정보 보안
```typescript
// 민감한 결제 정보는 절대 클라이언트에 노출하지 않음
export async function createCheckoutSession(roomId: string, priceId: string) {
  // 서버에서만 Stripe Secret Key 사용
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.SITE_URL}/room/${roomId}?payment=success`,
    cancel_url: `${process.env.SITE_URL}/room/${roomId}?payment=cancelled`,
    metadata: {
      room_id: roomId,
      user_id: userId, // 인증된 사용자 ID만 사용
    },
  })
  
  // 클라이언트에는 세션 ID만 반환
  return { checkout_url: session.url, session_id: session.id }
}
```

## 🖼️ 5. 파일 업로드 보안

### 5.1 이미지 업로드 검증
```typescript
// src/lib/imageUpload.ts - 안전한 이미지 처리
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): void {
  // 파일 타입 검증
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('지원되지 않는 파일 형식입니다')
  }
  
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기가 너무 큽니다 (최대 5MB)')
  }
  
  // 파일 확장자 검증
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
    throw new Error('허용되지 않은 파일 확장자입니다')
  }
}

export async function uploadImage(file: File, bucket: string, path: string) {
  validateImageFile(file)
  
  // Supabase Storage에 업로드 (RLS 정책 적용)
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) {
    throw new ApiError('이미지 업로드 실패', 500, 'UPLOAD_FAILED')
  }
  
  return data
}
```

### 5.2 Storage RLS 정책
```sql
-- 아바타 업로드 정책
CREATE POLICY "Users can upload own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND octet_length(decode(replace(encode(name::bytea, 'base64'), chr(13) || chr(10), ''), 'base64')) <= 5242880 -- 5MB
);

-- 방 이미지 업로드 정책
CREATE POLICY "Room owners can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'room-images'
  AND auth.uid() IN (
    SELECT host_id FROM rooms 
    WHERE id::text = (storage.foldername(name))[1]
  )
);
```

## 🔍 6. 로깅 및 모니터링

### 6.1 보안 이벤트 로깅
```typescript
// src/lib/securityLogger.ts - 보안 이벤트 추적
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_FAILURE = 'login_failure',
  ADMIN_ACCESS = 'admin_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
}

export function logSecurityEvent(
  eventType: SecurityEventType,
  details: {
    userId?: string
    ip?: string
    userAgent?: string
    resource?: string
    details?: any
  }
) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: details.userId,
    ip_address: details.ip,
    user_agent: details.userAgent,
    resource: details.resource,
    details: details.details,
    severity: getSeverityLevel(eventType),
  }
  
  // 로깅 시스템에 전송 (Supabase, Sentry, CloudWatch 등)
  console.log('[SECURITY]', JSON.stringify(securityLog))
  
  // 심각한 이벤트는 즉시 알림
  if (securityLog.severity === 'critical') {
    sendSecurityAlert(securityLog)
  }
}

function getSeverityLevel(eventType: SecurityEventType): string {
  switch (eventType) {
    case SecurityEventType.DATA_BREACH_ATTEMPT:
      return 'critical'
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      return 'high'
    case SecurityEventType.RATE_LIMIT_EXCEEDED:
      return 'medium'
    default:
      return 'low'
  }
}
```

### 6.2 실시간 모니터링
```typescript
// src/lib/monitoring.ts - 보안 메트릭 추적
export class SecurityMonitor {
  private failedLogins = new Map<string, number>()
  private suspiciousIPs = new Set<string>()
  
  trackFailedLogin(ip: string, userId?: string) {
    const count = this.failedLogins.get(ip) || 0
    this.failedLogins.set(ip, count + 1)
    
    // 5회 이상 실패 시 의심스러운 IP로 마킹
    if (count >= 5) {
      this.suspiciousIPs.add(ip)
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        ip,
        userId,
        details: { failedLoginCount: count + 1 }
      })
    }
  }
  
  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip)
  }
  
  // 1시간마다 카운터 리셋
  resetCounters() {
    this.failedLogins.clear()
    // 의심스러운 IP는 24시간 후 자동 해제
  }
}

export const securityMonitor = new SecurityMonitor()
```

## 🚨 7. 사고 대응 계획

### 7.1 보안 사고 분류
```typescript
export enum SecurityIncidentLevel {
  LOW = 'low',           // 비정상적 접근 시도
  MEDIUM = 'medium',     // 데이터 무결성 위험
  HIGH = 'high',         // 서비스 가용성 위험
  CRITICAL = 'critical', // 데이터 유출 가능성
}

export interface SecurityIncident {
  id: string
  level: SecurityIncidentLevel
  description: string
  affectedUsers?: string[]
  detectedAt: Date
  resolvedAt?: Date
  actions: string[]
}
```

### 7.2 자동 대응 메커니즘
```typescript
// src/lib/autoResponse.ts - 자동 보안 대응
export async function handleSecurityIncident(incident: SecurityIncident) {
  switch (incident.level) {
    case SecurityIncidentLevel.CRITICAL:
      // 즉시 서비스 일시 중단
      await enableMaintenanceMode()
      await notifySecurityTeam(incident)
      await preserveEvidence(incident)
      break
      
    case SecurityIncidentLevel.HIGH:
      // 해당 기능 비활성화
      await disableAffectedFeatures(incident)
      await notifySecurityTeam(incident)
      break
      
    case SecurityIncidentLevel.MEDIUM:
      // 모니터링 강화
      await increaseMonitoring(incident)
      await logDetailedActivity(incident)
      break
      
    case SecurityIncidentLevel.LOW:
      // 로깅 및 관찰
      await logIncident(incident)
      break
  }
}
```

## 📋 8. 보안 체크리스트

### 8.1 배포 전 보안 점검
- [ ] **환경변수**: 모든 secret이 안전하게 설정됨
- [ ] **HTTPS**: SSL/TLS 인증서 적용 확인
- [ ] **CSP**: Content Security Policy 적절히 설정
- [ ] **RLS**: Row Level Security 정책 활성화
- [ ] **Rate Limiting**: API 호출 제한 설정
- [ ] **입력 검증**: 모든 사용자 입력 Zod로 검증
- [ ] **파일 업로드**: 파일 타입 및 크기 제한 설정
- [ ] **Webhook 보안**: Stripe webhook 서명 검증
- [ ] **에러 처리**: 민감한 정보 노출 방지

### 8.2 운영 중 보안 모니터링
- [ ] **로그 분석**: 일 1회 보안 로그 검토
- [ ] **성능 모니터링**: 비정상적 트래픽 패턴 감지
- [ ] **데이터베이스**: 무단 접근 시도 모니터링
- [ ] **파일 시스템**: 권한 변경 및 파일 변조 확인
- [ ] **의존성 업데이트**: 보안 패치 적용
- [ ] **백업 검증**: 데이터 백업 무결성 확인
- [ ] **침투 테스트**: 분기별 보안 취약점 점검

## 🔧 9. 보안 도구 및 자동화

### 9.1 GitHub Actions 보안 스캔
```yaml
# .github/workflows/security.yml
- name: 🛡️ CodeQL Analysis
  uses: github/codeql-action/init@v2
  with:
    languages: typescript, javascript
    
- name: 🔒 Security Audit
  run: pnpm audit --audit-level moderate
  
- name: 📊 Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'meetpin'
    path: '.'
    format: 'HTML'
```

### 9.2 보안 헬스체크 API
```typescript
// src/app/api/health/security/route.ts
export async function GET() {
  const checks = {
    rls_enabled: await checkRLSPolicies(),
    ssl_valid: await checkSSLCertificate(),
    rate_limits: await checkRateLimits(),
    env_vars: await checkEnvironmentVariables(),
    backup_status: await checkBackupStatus(),
  }
  
  const healthy = Object.values(checks).every(check => check.status === 'ok')
  
  return Response.json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  })
}
```

---

## 🎯 보안 목표

- **기밀성**: 사용자 데이터 및 시스템 정보 보호
- **무결성**: 데이터 변조 및 위조 방지  
- **가용성**: 서비스 중단 공격 차단
- **책임추적성**: 모든 보안 이벤트 로깅 및 추적
- **인증**: 사용자 신원 확인 및 권한 관리
- **인가**: 적절한 접근 권한 제어

이 가이드에 따라 보안 설정을 완료하면 MeetPin 애플리케이션의 보안성을 크게 향상시킬 수 있습니다.