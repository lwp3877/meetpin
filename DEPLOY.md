# 밋핀(MeetPin) 무료 배포 가이드

이 문서는 밋핀을 Vercel + Supabase 무료 플랜으로 배포하는 방법을 단계별로 설명합니다.
초보자도 따라할 수 있게 작성되었습니다.

---

## 전체 구조 요약

```
사용자 브라우저
    ↕
Vercel (Next.js 앱 호스팅 — 무료)
    ↕              ↕              ↕
Supabase        Stripe         Upstash Redis
(DB/인증/스토리지)  (결제)         (rate limiting)
 — 무료 플랜 —    — 선택사항 —    — 무료 플랜 —

카카오 지도 API (브라우저에서 직접 호출)
```

---

## 배포 순서

### 1단계: Supabase 설정

1. [supabase.com](https://supabase.com) 접속 → 무료 계정 생성 → 새 프로젝트 생성
2. **데이터베이스 초기화** — SQL Editor에서 아래 파일을 순서대로 실행:
   ```
   scripts/migrate.sql       ← 핵심 테이블
   scripts/migrate-extra.sql ← 추가 테이블
   scripts/storage-setup.sql ← 스토리지 버킷
   scripts/rls.sql           ← 보안 정책
   scripts/rls-extra.sql     ← 추가 보안 정책
   scripts/storage-rls.sql   ← 스토리지 보안 정책
   ```
   > 주의: 위 순서를 지켜야 합니다. `seed.sql`은 개발 환경에서만 사용하세요.

3. **인증 설정** — Authentication → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs에 추가:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/auth/callback?type=recovery`

4. **API 키 복사** — Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2단계: 카카오맵 API 키 발급

1. [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 애플리케이션 추가
2. 앱 키 → **JavaScript 키** 복사 → `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`
3. 플랫폼 → 웹 → 사이트 도메인 등록: `https://your-app.vercel.app`

### 3단계: Upstash Redis 설정 (rate limiting용)

1. [console.upstash.com](https://console.upstash.com) → 무료 계정 → Redis 생성
2. **REST API** 탭 → URL과 Token 복사:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

> **참고:** `REDIS_URL`(TCP 캐싱용)은 설정하지 않아도 됩니다. 없으면 캐싱이 꺼지고 DB에서 직접 읽습니다. 기능은 정상 동작합니다.

### 4단계: Stripe 설정 (결제 기능 사용 시)

1. [stripe.com](https://stripe.com) → 계정 생성 → Developers → API keys
2. Secret key → `STRIPE_SECRET_KEY`
3. Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. **Webhook 설정** — Developers → Webhooks → Add endpoint:
   - URL: `https://your-app.vercel.app/api/payments/stripe/webhook`
   - 이벤트: `checkout.session.completed`
   - Signing secret → `STRIPE_WEBHOOK_SECRET`
5. 상품 생성 → Price ID → `STRIPE_PRICE_1D_ID`, `STRIPE_PRICE_3D_ID`, `STRIPE_PRICE_7D_ID`

> **결제 기능 미사용 시:** Stripe 관련 환경변수를 설정하지 않아도 됩니다. 부스트 기능만 동작하지 않습니다.

### 5단계: Vercel 배포

1. [vercel.com](https://vercel.com) → GitHub 계정으로 로그인
2. New Project → 이 저장소 선택 → Import
3. **Environment Variables** 탭에서 아래 변수 입력:

#### 필수 변수 (없으면 앱 시작 안 됨)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
SITE_URL                         ← 배포 후 실제 URL로 변경
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

#### Stripe 사용 시 추가
```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

4. **Deploy** 클릭
5. 배포 완료 후 → 실제 URL 확인 → `SITE_URL` 값을 실제 URL로 업데이트 → Redeploy

---

## 로컬 개발 환경 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 파일 생성
cp .env.example .env.local
# .env.local을 편집기로 열어 실제 값 입력

# 3. 개발 서버 실행 (포트 3001)
pnpm dev

# 4. 브라우저에서 확인
# http://localhost:3001
```

### Stripe Webhook 로컬 테스트 (결제 기능 개발 시)

```bash
# Stripe CLI 설치 후
stripe listen --forward-to localhost:3001/api/payments/stripe/webhook
# 출력된 whsec_... 값을 .env.local의 STRIPE_WEBHOOK_SECRET에 입력
```

---

## Vercel 무료 플랜 주의사항

| 항목 | 무료 플랜 제한 | 영향 |
|------|---------------|------|
| 서버리스 함수 실행 시간 | 10초 | 복잡한 API 요청 타임아웃 가능 |
| 월 대역폭 | 100GB | 이미지 많으면 초과 가능 |
| 동시 빌드 | 1개 | 배포 시 대기 가능 |
| 팀 멤버 | 1명 | 개인 프로젝트에 적합 |

### 서버리스 환경에서 주의할 점

- **TCP Redis (ioredis):** Vercel 서버리스에서 TCP 연결은 요청마다 새로 연결됨. `REDIS_URL` 미설정이 오히려 권장됨
- **Supabase 연결:** Supabase는 HTTP 기반이라 서버리스에서 문제 없음
- **메모리 상태:** 전역 변수가 요청 간 유지되지 않음 — 코드에서 이미 이를 고려해 설계됨

---

## Supabase 무료 플랜 주의사항

| 항목 | 무료 플랜 제한 |
|------|---------------|
| DB 용량 | 500MB |
| 스토리지 | 1GB |
| 월 활성 사용자 | 50,000명 |
| 비활성 시 일시 중지 | 1주일 미접속 시 자동 일시 중지 |

> **비활성 일시 중지 방지:** Supabase 대시보드에서 "Pause project when inactive" 설정 확인.
> 유료 플랜($25/월)으로 업그레이드하면 일시 중지 없음.

---

## 관리자 계정 지정 방법

관리자 계정은 코드로 자동 지정되지 않습니다. DB에서 직접 설정해야 합니다.

1. 먼저 관리자로 쓸 계정으로 **일반 회원가입**을 합니다
2. Supabase 대시보드 → **Table Editor** → `profiles` 테이블
3. 해당 사용자의 행을 찾아 `role` 컬럼 값을 `admin`으로 변경

또는 **SQL Editor**에서:
```sql
UPDATE profiles
SET role = 'admin'
WHERE uid = '여기에-사용자-UUID-입력';
```

> 사용자 UUID는 Supabase → Authentication → Users 탭에서 확인할 수 있습니다.

---

## Supabase 이메일 템플릿 한국어 설정 (권장)

기본 이메일(가입 확인, 비밀번호 재설정)이 영어로 발송됩니다. 한국어로 변경하려면:

1. Supabase 대시보드 → **Authentication** → **Email Templates**
2. **Confirm signup** 템플릿과 **Reset password** 템플릿을 한국어로 수정

비밀번호 재설정 이메일 예시:
```
제목: 밋핀 비밀번호 재설정

안녕하세요,
아래 버튼을 클릭하여 비밀번호를 재설정하세요.
링크는 1시간 동안 유효합니다.

{{ .ConfirmationURL }}

이 이메일을 요청하지 않으셨다면 무시하세요.
```

---

## 배포 후 확인 체크리스트

- [ ] 회원가입 → 이메일 인증 → 로그인 정상 동작
- [ ] 비밀번호 재설정 이메일 수신 및 링크 클릭 → 새 비밀번호 입력 → 로그인
- [ ] 지도 로딩 (카카오맵 표시)
- [ ] 방 생성 → 지도에 표시
- [ ] 방 참여 요청 → 수락
- [ ] 채팅 메시지 전송
- [ ] (결제 설정 시) 부스트 결제 흐름

---

## 문제 해결 (Troubleshooting)

**지도가 표시되지 않음:**
- 카카오 개발자 센터에서 도메인 등록 확인
- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` 값 확인

**로그인 후 /map으로 이동 안 됨:**
- Supabase → Authentication → URL Configuration → Redirect URLs에 `/auth/callback` 등록 확인

**비밀번호 재설정 이메일 링크 클릭 후 오류:**
- Supabase → Authentication → URL Configuration → Site URL이 실제 배포 URL과 일치하는지 확인

**Stripe 결제 후 부스트 미적용:**
- Vercel 로그에서 webhook 수신 확인 (`/api/payments/stripe/webhook`)
- `STRIPE_WEBHOOK_SECRET` 값이 Stripe 대시보드의 값과 일치하는지 확인
