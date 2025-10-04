# 🚀 프로덕션 배포 설정 가이드

## 현재 상태

**⚠️ CRITICAL**: 프로덕션이 현재 Mock 모드로 실행 중입니다.
- 샘플 데이터만 표시
- 실제 사용자 인증 불가
- 데이터베이스 연결 없음

## Mock 모드 해제 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/) 계정 생성
2. 새 프로젝트 생성
3. Database → SQL Editor에서 다음 스크립트 순서대로 실행:
   - `scripts/migrate.sql` - 테이블 생성
   - `scripts/rls.sql` - Row Level Security 정책
   - `scripts/seed.sql` - 초기 샘플 데이터 (선택사항)

### 2. Vercel 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 다음 변수 추가:

```env
# Supabase 필수 환경 변수
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao Maps (필수)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-maps-key

# Stripe 결제 (부스트 기능용, 선택사항)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
SITE_URL=https://your-domain.vercel.app

# Feature Flags (선택사항)
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true

# Mock 모드 제어 (IMPORTANT)
NEXT_PUBLIC_USE_MOCK_DATA=false  # 프로덕션에서는 반드시 false!
```

### 3. Supabase 환경 변수 찾는 방법

#### `NEXT_PUBLIC_SUPABASE_URL`
1. Supabase Dashboard → Settings → API
2. "Project URL" 복사

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
1. Supabase Dashboard → Settings → API
2. "Project API keys" → "anon public" 복사

#### `SUPABASE_SERVICE_ROLE_KEY`
1. Supabase Dashboard → Settings → API
2. "Project API keys" → "service_role" 복사 (⚠️ 절대 클라이언트에 노출 금지!)

### 4. Kakao Maps API 키 설정

#### 기본 설정

1. [Kakao Developers](https://developers.kakao.com/) 계정 생성
2. 애플리케이션 추가
3. JavaScript 키 복사
4. Vercel 환경 변수에 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` 추가

#### ⚠️ 보안 강화 (필수)

**도메인 제한 설정**:

1. Kakao Developers → 내 애플리케이션 → 앱 설정 → 플랫폼
2. Web 플랫폼 추가
3. 허용 도메인 등록:
   ```
   https://your-domain.vercel.app
   https://www.your-domain.com (커스텀 도메인 사용 시)
   http://localhost:3001 (로컬 개발용, 배포 후 제거)
   ```
4. ⚠️ **와일드카드 도메인(`*`) 사용 금지** - 보안 취약점!

#### API 키 사용량 모니터링

1. Kakao Developers → 통계 탭에서 일일 호출량 확인
2. 비정상적인 트래픽 증가 시 API 키 재발급
3. 월 할당량 초과 방지를 위한 알림 설정 권장

#### 보안 체크리스트

- [ ] 도메인 제한 설정 완료
- [ ] localhost 도메인은 배포 후 제거
- [ ] API 키가 GitHub에 노출되지 않음 (환경 변수로만 관리)
- [ ] 사용량 모니터링 설정
- [ ] 프로덕션과 개발 환경에서 다른 API 키 사용 (권장)

### 5. Stripe 결제 설정 (선택사항)

부스트 기능을 활성화하려면:

1. [Stripe](https://stripe.com/) 계정 생성
2. API 키 발급:
   - Dashboard → Developers → API keys
   - Publishable key와 Secret key 복사
3. Webhook 설정:
   - Dashboard → Developers → Webhooks
   - Endpoint URL: `https://your-domain.vercel.app/api/payments/stripe/webhook`
   - 이벤트 선택: `checkout.session.completed`
   - Signing secret 복사

### 6. 배포 후 검증

환경 변수 설정 후 다음 명령으로 검증:

```bash
# Vercel에서 재배포
git push origin main

# 배포 완료 후 엔드포인트 확인
curl https://your-domain.vercel.app/api/health
# 예상 응답: {"ok":true,"status":"healthy","mode":"production"}

# Supabase 연결 확인
curl https://your-domain.vercel.app/api/rooms?bbox=37.4,126.9,37.6,127.1
# Mock 데이터가 아닌 실제 DB 데이터 반환 확인
```

## Mock 모드 vs 프로덕션 모드

| 기능 | Mock 모드 | 프로덕션 모드 |
|------|-----------|--------------|
| 인증 | `admin@meetpin.com` / `123456` | Supabase Auth |
| 데이터 | 샘플 데이터 (서울 지역) | 실시간 DB 데이터 |
| 파일 업로드 | ❌ 불가 | ✅ Supabase Storage |
| 실시간 채팅 | ❌ 불가 | ✅ Supabase Realtime |
| 결제 | ❌ 불가 | ✅ Stripe 연동 |
| 알림 | ❌ 불가 | ✅ Push Notifications |

## 트러블슈팅

### "Mock mode detected" 경고가 계속 나타남
- Vercel 환경 변수에 `NEXT_PUBLIC_USE_MOCK_DATA=false` 설정
- 재배포 후 캐시 초기화

### Supabase 연결 오류
- URL과 API 키 확인
- Supabase 프로젝트가 활성 상태인지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### Kakao Maps가 로드되지 않음
- JavaScript 키가 올바른지 확인
- 도메인이 허용 목록에 추가되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

## 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경 변수로만 사용 (`NEXT_PUBLIC_` 접두사 없음)
- [ ] Stripe Secret Key는 노출되지 않도록 주의
- [ ] Kakao Maps API에 도메인 제한 설정
- [ ] Supabase RLS 정책 활성화 확인
- [ ] HTTPS 강제 적용 (Vercel은 기본 활성화)
- [ ] CSP 헤더 설정 확인

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
- [CLAUDE.md](./CLAUDE.md) - 프로젝트 전체 구조
- [COMPREHENSIVE-TEST-REPORT.md](./COMPREHENSIVE-TEST-REPORT.md) - 최근 테스트 결과
- GitHub Issues - 버그 리포트 및 기능 요청
