# 프로덕션 환경변수 체크리스트

MeetPin 프로젝트를 프로덕션에 배포하기 전 필수 환경변수 설정 가이드입니다.

## 📋 목차

1. [필수 환경변수](#필수-환경변수)
2. [선택적 환경변수](#선택적-환경변수)
3. [Vercel 배포 설정](#vercel-배포-설정)
4. [환경변수 검증](#환경변수-검증)
5. [보안 권장사항](#보안-권장사항)

## ✅ 필수 환경변수

### 1. Supabase 설정

```bash
# Supabase 프로젝트 URL (공개)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (공개)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (비공개 - 서버 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**획득 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Settings → API
3. URL, anon key, service_role key 복사

**주의사항:**
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 마세요
- ⚠️ RLS(Row Level Security)가 활성화되어 있는지 확인하세요

### 2. Kakao Maps API

```bash
# Kakao JavaScript API Key (공개)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=1234567890abcdef1234567890abcdef
```

**획득 방법:**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 앱 추가
3. 앱 선택 → JavaScript 키 복사
4. 플랫폼 설정 → Web 플랫폼 추가 → 사이트 도메인 등록

**도메인 설정:**
- 개발: `http://localhost:3001`
- 프로덕션: `https://your-domain.com`

### 3. Stripe 결제 시스템

```bash
# Stripe Secret Key (비공개 - 서버 전용)
STRIPE_SECRET_KEY=sk_live_...

# Stripe Publishable Key (공개)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe Webhook Secret (비공개)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**획득 방법:**
1. [Stripe Dashboard](https://dashboard.stripe.com/) 접속
2. Developers → API keys
3. Secret key, Publishable key 복사
4. Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
5. Webhook Secret 복사

**Price ID 설정 (선택):**
```bash
STRIPE_PRICE_1D_ID=price_...  # 1일 부스트
STRIPE_PRICE_3D_ID=price_...  # 3일 부스트
STRIPE_PRICE_7D_ID=price_...  # 7일 부스트
```

### 4. 애플리케이션 설정

```bash
# 사이트 URL (프로덕션 도메인)
SITE_URL=https://your-domain.com

# 개발 모드 비활성화
NEXT_PUBLIC_USE_MOCK_DATA=false
```

**주의사항:**
- ⚠️ 프로덕션에서는 반드시 `NEXT_PUBLIC_USE_MOCK_DATA=false`로 설정
- ⚠️ `SITE_URL`은 trailing slash 없이 설정 (`/` 제거)

## 🔧 선택적 환경변수

### 1. Redis/Upstash (캐싱 - 성능 최적화)

```bash
# Redis URL
REDIS_URL=redis://default:password@host:port

# 또는 Upstash (권장)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**획득 방법:**
1. [Upstash Console](https://console.upstash.com/) 접속
2. Create Database → Redis
3. REST URL과 Token 복사

**미설정 시:**
- 캐싱 없이 직접 DB 조회 (성능 저하 가능)
- 개발 환경에서는 자동으로 캐싱 비활성화

### 2. Observability (모니터링)

```bash
# Sentry DSN (에러 추적)
SENTRY_DSN=https://...@sentry.io/...

# Telemetry 샘플링 비율 (0.0 ~ 1.0)
TELEMETRY_SAMPLING_RATE=0.1
```

**획득 방법:**
1. [Sentry.io](https://sentry.io/) 접속
2. Create Project → Next.js
3. DSN 복사

### 3. Feature Flags (기능 제어)

```bash
# Stripe Checkout 활성화
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true

# 실시간 알림 활성화
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true

# 파일 업로드 활성화
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

## 🚀 Vercel 배포 설정

### 1. Vercel Dashboard에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 각 환경변수 추가:
   - **Production**: 프로덕션 전용
   - **Preview**: PR 미리보기 전용
   - **Development**: 로컬 개발 전용

### 2. 환경별 설정 전략

#### Production (프로덕션)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
STRIPE_SECRET_KEY=sk_live_...
SITE_URL=https://meetpin.com
NEXT_PUBLIC_USE_MOCK_DATA=false
```

#### Preview (PR 미리보기)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=staging_service_role_key
STRIPE_SECRET_KEY=sk_test_...
SITE_URL=https://preview.meetpin.com
NEXT_PUBLIC_USE_MOCK_DATA=false
```

#### Development (로컬)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dev_service_role_key
STRIPE_SECRET_KEY=sk_test_...
SITE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 3. Vercel CLI로 설정 (선택)

```bash
# Vercel CLI 설치
npm i -g vercel

# 환경변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 값 입력 후 환경 선택 (Production, Preview, Development)

# 환경변수 목록 확인
vercel env ls

# .env 파일에서 일괄 추가
vercel env pull .env.local
```

## ✅ 환경변수 검증

### 1. 빌드 전 검증 스크립트

`scripts/validate-env.js` 생성:

```javascript
// scripts/validate-env.js
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SITE_URL',
]

const missing = requiredEnvVars.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:')
  missing.forEach(key => console.error(`  - ${key}`))
  process.exit(1)
}

console.log('✅ All required environment variables are set')
```

`package.json`에 추가:

```json
{
  "scripts": {
    "validate:env": "node scripts/validate-env.js",
    "build": "npm run validate:env && next build"
  }
}
```

### 2. 런타임 검증

앱 시작 시 자동 검증:

```typescript
// src/lib/config/env.ts
export function validateEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }
}
```

## 🔒 보안 권장사항

### 1. 환경변수 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 (클라이언트 노출 금지)
- [ ] `STRIPE_SECRET_KEY`는 서버 전용
- [ ] `STRIPE_WEBHOOK_SECRET`는 안전하게 보관
- [ ] Git에 `.env` 파일 커밋 금지 (`.gitignore` 확인)
- [ ] 프로덕션 키는 별도 관리 (개발/테스트 키와 분리)

### 2. .gitignore 확인

```gitignore
# Environment Variables
.env
.env.local
.env.production
.env.development
.env*.local

# Vercel
.vercel
```

### 3. Vercel Secrets 사용 (고급)

민감한 정보는 Vercel Secrets로 관리:

```bash
# Secret 생성
vercel secrets add stripe-secret-key sk_live_...

# 환경변수에 연결
vercel env add STRIPE_SECRET_KEY
# 값 입력 시 @stripe-secret-key 입력
```

## 🧪 테스트

### 1. 로컬에서 프로덕션 환경 테스트

```bash
# .env.production 파일 생성
cp .env.example .env.production

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 2. 환경변수 로드 확인

```typescript
// 디버그용 (절대 프로덕션에 남기지 마세요!)
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SITE_URL:', process.env.SITE_URL)
console.log('STRIPE_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing')
```

### 3. API 엔드포인트 테스트

```bash
# Health Check
curl https://your-domain.com/api/health

# Supabase 연결 확인
curl https://your-domain.com/api/status

# Stripe Webhook (테스트)
stripe listen --forward-to localhost:3001/api/payments/stripe/webhook
```

## 📝 체크리스트

배포 전 확인사항:

### 필수 환경변수
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SITE_URL`
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` (프로덕션)

### Vercel 설정
- [ ] Production 환경변수 설정 완료
- [ ] Preview 환경변수 설정 (선택)
- [ ] Kakao Maps 도메인 등록 (프로덕션 도메인)
- [ ] Stripe Webhook URL 등록

### 보안
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 서버 전용 키가 클라이언트에 노출되지 않음
- [ ] 프로덕션/개발 키 분리됨

### 테스트
- [ ] 로컬에서 프로덕션 빌드 성공
- [ ] API 엔드포인트 정상 동작
- [ ] Stripe 결제 테스트 완료
- [ ] Kakao Maps 로드 확인

## 🆘 문제 해결

### "Invalid Supabase URL" 오류
- URL이 `https://`로 시작하는지 확인
- trailing slash가 없는지 확인
- Vercel에서 환경변수가 올바른 환경(Production)에 설정되었는지 확인

### "Stripe key not found" 오류
- `STRIPE_SECRET_KEY`가 서버 환경변수로 설정되었는지 확인
- `sk_live_`로 시작하는지 확인 (프로덕션)
- Vercel 환경변수 재배포 (`vercel --prod`)

### "Kakao Maps not loading" 오류
- Kakao Developers에서 도메인이 등록되었는지 확인
- JavaScript 키가 올바른지 확인
- 브라우저 콘솔에서 에러 메시지 확인

---

**마지막 업데이트:** 2025-10-06
**작성자:** Claude Code
**버전:** 1.0.0
