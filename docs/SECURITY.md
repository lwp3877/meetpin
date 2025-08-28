# MeetPin 보안 가이드 (SECURITY)

## 🛡️ 보안 개요

MeetPin은 사용자의 개인정보와 안전한 만남을 보장하기 위해 다층 보안 시스템을 구축하고 있습니다. 이 문서는 보안 정책, 취약점 대응, 그리고 보안 베스트 프랙티스를 다룹니다.

## 🔒 핵심 보안 원칙

### 1. 최소 권한 원칙 (Principle of Least Privilege)
- 사용자는 필요한 최소한의 데이터만 접근 가능
- 관리자 권한과 일반 사용자 권한 엄격 분리
- API별 세분화된 접근 권한 적용

### 2. 심층 방어 (Defense in Depth)
- 클라이언트 사이드 검증 + 서버 사이드 검증
- 데이터베이스 레벨 RLS (Row Level Security)
- 네트워크 레벨 보안 (HTTPS, CORS)

### 3. 투명성과 책임 추적
- 모든 민감한 작업에 대한 감사 로그
- 사용자 활동 추적 및 이상 행동 탐지
- 정기적인 보안 감사 및 리포트

## 🔐 인증 및 권한 관리

### 인증 시스템 (Supabase Auth)

#### 지원되는 인증 방법
- **이메일/비밀번호**: 기본 인증 방식
- **소셜 로그인**: Google, Kakao (향후 지원)
- **Magic Link**: 비밀번호 없는 로그인

#### 비밀번호 정책
```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // 사용자 편의성 고려
  maxAttempts: 5, // 5회 실패 시 계정 잠금
  lockoutDuration: 30 * 60 * 1000, // 30분
}
```

#### JWT 토큰 관리
```typescript
// 토큰 만료 시간: 1시간
const jwtConfig = {
  accessTokenExpiry: 3600, // 1시간
  refreshTokenExpiry: 30 * 24 * 3600, // 30일
  issuer: 'meetpin.vercel.app',
  audience: 'authenticated',
}
```

### Row Level Security (RLS) 정책

#### 사용자 프로필 보안
```sql
-- 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 차단된 사용자는 상대방 프로필 조회 불가
CREATE POLICY "Blocked users cannot view profiles"
ON profiles FOR SELECT
USING (
  id != auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = id)
    OR (blocker_uid = id AND blocked_uid = auth.uid())
  )
);
```

#### 모임(Room) 보안
```sql
-- 방 호스트만 수정/삭제 가능
CREATE POLICY "Room owners can manage rooms"
ON rooms FOR ALL
USING (host_uid = auth.uid());

-- 차단된 사용자는 상대방 방 조회 불가
CREATE POLICY "Blocked users cannot see rooms"
ON rooms FOR SELECT
USING (
  visibility = 'public' AND
  NOT EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = host_uid)
    OR (blocker_uid = host_uid AND blocked_uid = auth.uid())
  )
);
```

#### 채팅 보안
```sql
-- 매칭된 사용자들만 메시지 조회 가능
CREATE POLICY "Match participants can view messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE id = match_id 
    AND (host_uid = auth.uid() OR guest_uid = auth.uid())
  )
);
```

## 🛠️ 데이터 보호

### 개인정보 암호화

#### 민감한 데이터 암호화
```sql
-- 전화번호 등 민감 정보는 암호화 저장
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 전화번호 암호화 저장
UPDATE profiles 
SET phone_encrypted = pgp_sym_encrypt(phone, 'encryption-key')
WHERE phone IS NOT NULL;
```

#### 데이터 마스킹
```typescript
// 클라이언트로 전송 시 전화번호 마스킹
const maskPhoneNumber = (phone: string) => {
  if (phone.length < 4) return phone
  return phone.substring(0, 3) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 3)
}
```

### 데이터 백업 및 복구

#### 자동 백업 (Supabase)
- 일간 자동 백업 활성화
- 7일 백업 보관 정책
- 지역별 백업 복제

#### 백업 데이터 보안
```bash
# 백업 파일 암호화
gpg --symmetric --cipher-algo AES256 backup.sql

# 안전한 스토리지에 업로드
aws s3 cp backup.sql.gpg s3://meetpin-secure-backup/
```

## 🚫 입력 검증 및 새니타이제이션

### 서버 사이드 검증 (Zod)

```typescript
// 사용자 입력 검증
const createRoomSchema = z.object({
  title: z.string()
    .min(5, '제목은 5자 이상이어야 합니다')
    .max(50, '제목은 50자를 초과할 수 없습니다')
    .regex(/^[가-힣a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, '허용되지 않는 문자가 포함되어 있습니다'),
  category: z.enum(['drink', 'exercise', 'other']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})
```

### 콘텐츠 필터링

#### 금지어 필터
```typescript
const FORBIDDEN_WORDS = [
  // 욕설
  '시발', '씨발', '개새끼', '좆', '병신',
  // 성적 콘텐츠
  '섹스', '성관계', '원나잇', '섹파',
  // 불법 활동
  '마약', '대마초', '필로폰', '도박', '사기',
  // 금전 거래
  '돈거래', '계좌이체', '송금', '대출',
]

const containsForbiddenWords = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  return FORBIDDEN_WORDS.some(word => 
    lowerText.includes(word.toLowerCase())
  )
}
```

#### HTML 새니타이제이션
```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // HTML 태그 모두 제거
    ALLOWED_ATTR: [], // 속성 모두 제거
  })
}
```

## ⚡ Rate Limiting

### API Rate Limiting

```typescript
// IP별 요청 제한
const rateLimits = {
  api: { requests: 100, window: 60000 }, // 분당 100회
  auth: { requests: 5, window: 900000 }, // 15분당 5회
  createRoom: { requests: 5, window: 60000 }, // 분당 5회
  sendMessage: { requests: 50, window: 60000 }, // 분당 50회
  createReport: { requests: 3, window: 600000 }, // 10분당 3회
}

// 사용자별 요청 제한
const userRateLimits = {
  createRequest: { requests: 20, window: 60000 }, // 분당 20회
  blockUser: { requests: 5, window: 60000 }, // 분당 5회
}
```

### DDoS 공격 대응
```typescript
// Vercel Edge Functions로 DDoS 방어
export const config = {
  runtime: 'edge',
  regions: ['icn1'], // 한국 서버
}

// Cloudflare 사용 시 추가 DDoS 방어
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
```

## 🔍 보안 모니터링 및 감사

### 보안 이벤트 로깅

```typescript
const logSecurityEvent = async (event: {
  type: 'auth_failure' | 'suspicious_activity' | 'data_access' | 'admin_action',
  userId?: string,
  ip: string,
  userAgent: string,
  details: any,
}) => {
  await supabase.from('security_logs').insert({
    ...event,
    timestamp: new Date().toISOString(),
    severity: getSeverityLevel(event.type),
  })
}
```

### 이상 행동 탐지

```typescript
// 비정상적인 API 호출 패턴 탐지
const detectAnomalousActivity = async (userId: string) => {
  const recentActivity = await getRecentActivity(userId, '1 hour')
  
  const flags = {
    tooManyRequests: recentActivity.length > 1000,
    rapidRoomCreation: recentActivity.filter(a => a.type === 'create_room').length > 50,
    massBlocking: recentActivity.filter(a => a.type === 'block_user').length > 20,
    suspiciousLocations: checkLocationAnomalies(recentActivity),
  }
  
  if (Object.values(flags).some(Boolean)) {
    await flagUser(userId, flags)
  }
}
```

### 자동 보안 대응

```typescript
// 자동 계정 잠금
const autoLockAccount = async (userId: string, reason: string) => {
  await supabase.from('profiles').update({
    status: 'locked',
    locked_reason: reason,
    locked_at: new Date().toISOString(),
  }).eq('id', userId)
  
  // 관리자에게 알림
  await sendAdminAlert(`User ${userId} locked: ${reason}`)
}
```

## 🚨 취약점 대응

### 보안 취약점 신고

#### 연락처
- **이메일**: security@meetpin.com (보안 전용)
- **응답 시간**: 24시간 이내 초기 대응

#### 신고 절차
1. **발견**: 취약점 발견 시 즉시 신고
2. **확인**: 24시간 이내 취약점 검증
3. **분류**: 심각도 분류 (Critical, High, Medium, Low)
4. **대응**: 심각도에 따른 패치 일정 수립
5. **배포**: 보안 패치 적용 및 검증
6. **공지**: 필요시 사용자 공지

#### 심각도별 대응 시간
- **Critical**: 4시간 이내 핫픽스
- **High**: 24시간 이내 패치
- **Medium**: 1주일 이내 정기 업데이트
- **Low**: 다음 정기 업데이트

### 보안 업데이트

#### 의존성 업데이트
```bash
# 매주 보안 업데이트 확인
npm audit
npm audit fix

# 자동화된 의존성 업데이트 (Dependabot 설정)
```

#### 정기 보안 점검
- **일간**: 로그 모니터링, 이상 활동 탐지
- **주간**: 의존성 보안 업데이트
- **월간**: 침투 테스트, 코드 감사
- **분기별**: 외부 보안 감사

## 🌍 국제 보안 표준 준수

### GDPR 준수 (EU 사용자 대상)
- 사용자 동의 기반 데이터 수집
- 데이터 삭제 권리 (Right to be Forgotten)
- 데이터 이동 권리 (Data Portability)

```typescript
// GDPR 데이터 삭제 구현
const deleteUserData = async (userId: string) => {
  // 1. 개인 식별 정보 삭제
  await supabase.from('profiles').delete().eq('id', userId)
  
  // 2. 채팅 메시지 익명화
  await supabase.from('messages')
    .update({ sender_uid: null, text: '[삭제된 메시지]' })
    .eq('sender_uid', userId)
  
  // 3. 기타 관련 데이터 처리
  await anonymizeUserData(userId)
}
```

### 개인정보보호법 준수 (한국)
- 개인정보 처리방침 제공
- 필수/선택 정보 분리
- 개인정보 수집 최소화

## 📋 보안 체크리스트

### 배포 전 보안 점검

#### 코드 보안
- [ ] SQL Injection 방어 확인
- [ ] XSS 방어 확인
- [ ] CSRF 방어 확인
- [ ] 인증/권한 검증 확인
- [ ] 입력 검증 확인

#### 인프라 보안
- [ ] HTTPS 적용 확인
- [ ] 보안 헤더 설정 확인
- [ ] CORS 정책 확인
- [ ] Rate Limiting 설정 확인
- [ ] 환경 변수 보안 확인

#### 데이터 보안
- [ ] RLS 정책 적용 확인
- [ ] 민감 데이터 암호화 확인
- [ ] 백업 암호화 확인
- [ ] 데이터 마스킹 확인

### 운영 중 보안 관리

#### 정기 점검 (월간)
- [ ] 보안 로그 검토
- [ ] 이상 활동 분석
- [ ] 의존성 취약점 검사
- [ ] 접근 권한 검토

#### 분기별 점검
- [ ] 침투 테스트 실시
- [ ] 코드 보안 감사
- [ ] 백업/복구 테스트
- [ ] 재해 복구 계획 검토

## 🎓 보안 교육 및 인식

### 개발팀 보안 교육
- OWASP Top 10 이해
- Secure Coding 실습
- 보안 도구 사용법
- 인시던트 대응 절차

### 사용자 보안 안내
- 안전한 비밀번호 사용법
- 피싱 공격 인식
- 개인정보 보호 수칙
- 의심 활동 신고 방법

---

**보안 문의**: security@meetpin.com
**업데이트**: 이 문서는 분기마다 검토 및 업데이트됩니다.
**최종 수정일**: 2024년 1월