# 🔒 MeetPin 보안 가이드

> **중요**: 배포 전 반드시 이 가이드를 따라 보안 설정을 완료하세요.

## 🚨 긴급 보안 조치 (필수)

### 1. Supabase 키 재발급

현재 개발용 키가 노출되었으므로 새로운 키를 발급받아야 합니다.

#### **Supabase 키 재발급 절차**

```bash
# 1. Supabase Dashboard 접속
# https://supabase.com/dashboard

# 2. 프로젝트 > Settings > API 이동

# 3. "Reset database password" 클릭
# 4. 새로운 강력한 비밀번호 설정

# 5. API Keys 확인
# - anon key: eyJhbGci... (새로 발급됨)
# - service_role key: eyJhbGci... (새로 발급됨)

# 6. .env.local 파일 업데이트
```

#### **새로운 .env.local 파일 생성**

```bash
# .env.local 파일을 다음 내용으로 생성하세요
cp .env.example .env.local

# 그리고 실제 키 값들로 업데이트하세요
```

### 2. 환경변수 보안 검증

```bash
# 새로운 키로 환경변수 검증
node scripts/validate-env.js development

# 예상 결과: ✅ 모든 검사 통과
```

## 🔐 환경변수 보안 정책

### **절대 Git에 커밋하면 안 되는 파일들**

```
.env.local          # 개발용 실제 키
.env.production     # 프로덕션용 실제 키 (템플릿만 유지)
.env.*.local        # 모든 로컬 환경변수
```

### **Git에 포함되어도 되는 파일들**

```
.env.example        # 예시 템플릿 (실제 키 없음)
.env.production     # 프로덕션 템플릿 (your-key 형태)
```

## 🛡️ 프로덕션 보안 체크리스트

### **Vercel 환경변수 설정**

Vercel Dashboard > Project > Settings > Environment Variables

```bash
# 필수 환경변수 (Production)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://[새로운-프로젝트-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[새로-발급된-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[새로-발급된-service-role-key]
NEXT_PUBLIC_USE_MOCK_DATA=false
SITE_URL=https://[your-domain].vercel.app

# 외부 API 키 (실제 서비스용)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[카카오-프로덕션-키]
STRIPE_SECRET_KEY=[Stripe-Live-키]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Stripe-Live-공개키]
STRIPE_WEBHOOK_SECRET=[Stripe-웹훅-시크릿]
```

### **외부 서비스 보안 설정**

#### **1. 카카오맵 API 보안**

```bash
# 1. Kakao Developers Console 접속
# 2. 애플리케이션 > 플랫폼 설정
# 3. 도메인 등록: localhost:3000, [your-domain].vercel.app
# 4. 키 제한: JavaScript 키만 클라이언트에서 사용
```

#### **2. Stripe 보안 설정**

```bash
# 1. Stripe Dashboard > Developers > API keys
# 2. Live keys 사용 (Test keys 금지)
# 3. Webhook 엔드포인트: https://[your-domain].vercel.app/api/stripe/webhook
# 4. Webhook 시크릿 확인 및 설정
```

#### **3. Supabase RLS 정책 검증**

```sql
-- 모든 테이블에 RLS 활성화 확인
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- 결과가 비어있어야 함 (모든 테이블에 RLS 활성화됨)
```

## 🔍 보안 검증 절차

### **1. 로컬 환경 검증**

```bash
# 환경변수 검증
node scripts/validate-env.js development

# 데이터베이스 연결 테스트
node scripts/test-db-integration.js

# 전체 품질 검사
pnpm repo:doctor
```

### **2. 프로덕션 배포 전 검증**

```bash
# 프로덕션 환경변수 검증
node scripts/validate-env.js production

# 빌드 테스트
pnpm build

# 테스트 스위트 실행
pnpm test
```

### **3. 배포 후 검증**

```bash
# Health Check API 확인
curl https://[your-domain].vercel.app/api/health

# 예상 응답: {"ok": true, "data": {"status": "healthy", ...}}

# 핵심 기능 테스트
curl "https://[your-domain].vercel.app/api/rooms?bbox=37.4,126.8,37.7,127.2"
```

## 🚨 보안 사고 대응 절차

### **키 노출 발견 시**

1. **즉시 조치**: 노출된 키 비활성화
2. **새 키 발급**: 새로운 키로 전면 교체
3. **Git 기록 정리**: 민감한 정보 제거
4. **모니터링 강화**: 이상 활동 감시

### **의심스러운 활동 감지 시**

1. **Supabase Dashboard**: 활동 로그 확인
2. **Vercel Analytics**: 트래픽 패턴 분석
3. **Stripe Dashboard**: 결제 활동 모니터링
4. **필요시**: 즉시 키 교체 및 서비스 일시 중단

## 📋 정기 보안 점검 (월 1회)

### **체크리스트**

- [ ] Supabase 활동 로그 검토
- [ ] 미사용 API 키 제거
- [ ] 환경변수 누출 여부 확인
- [ ] 외부 서비스 보안 업데이트 확인
- [ ] RLS 정책 유효성 검증
- [ ] 취약점 스캔 실행

## 🔧 보안 도구 및 스크립트

### **자동 검증 스크립트**

```bash
# 전체 보안 검증 실행
npm run security:check

# 환경변수 보안 검증
npm run security:env

# 의존성 취약점 검사
npm audit

# 코드 보안 스캔
npm run security:scan
```

### **모니터링 설정**

- **Sentry**: 런타임 에러 모니터링
- **Vercel Analytics**: 트래픽 패턴 분석
- **Supabase Logs**: 데이터베이스 활동 추적

---

## ⚠️ 중요 알림

**이 가이드의 모든 보안 조치를 완료한 후에만 프로덕션 배포를 진행하세요.**

보안 관련 질문이나 문제 발생 시:

1. 즉시 서비스 중단
2. 보안팀 연락
3. 이 가이드 재검토

**보안은 한 번의 설정이 아니라 지속적인 관리가 필요합니다.**
