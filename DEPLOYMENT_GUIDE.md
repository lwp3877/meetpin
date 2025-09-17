# 🚀 MeetPin 프로덕션 배포 가이드

## 📖 개요

이 가이드는 MeetPin 애플리케이션을 프로덕션 환경에 안전하고 효율적으로 배포하기 위한 완전한 단계별 가이드입니다.

## 🏗️ 배포 아키텍처

### 권장 프로덕션 스택
- **Frontend Hosting**: Vercel (추천) / Netlify / AWS Amplify
- **Database**: Supabase PostgreSQL
- **CDN**: Vercel Edge Network / CloudFlare
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

### 아키텍처 다이어그램
```
사용자 (브라우저/모바일)
    ↓
CDN (Vercel Edge Network)
    ↓
Next.js 애플리케이션 (Vercel)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Supabase      │     Stripe      │   Kakao Maps    │
│   (Database)    │   (Payments)    │     (Maps)      │
└─────────────────┴─────────────────┴─────────────────┘
```

## 🔧 1단계: 사전 준비

### 1.1 코드 준비
```bash
# 프로덕션 모드로 코드 변경
pnpm repo:doctor  # 모든 품질 검사 통과 확인
pnpm build        # 프로덕션 빌드 테스트
```

### 1.2 프로덕션 설정 파일 활성화
기존 `next.config.ts`를 백업하고 프로덕션 설정 적용:
```bash
# 개발용 설정 백업
mv next.config.ts next.config.development.ts

# 프로덕션 설정 활성화
mv next.config.production.ts next.config.ts
```

## 🗄️ 2단계: Supabase 프로덕션 설정

### 2.1 새 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `meetpin-production`
   - Database Password: 강력한 비밀번호 생성
   - Region: `Southeast Asia (Singapore)` 선택

### 2.2 데이터베이스 스키마 설정
SQL Editor에서 순서대로 실행:

1. **테이블 생성**:
```sql
-- scripts/migrate.sql 내용 복사하여 실행
```

2. **보안 정책 설정**:
```sql
-- scripts/rls.sql 내용 복사하여 실행
```

3. **실시간 기능 활성화**:
```sql
-- Realtime 설정
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE host_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
```

### 2.3 Storage 버킷 생성
1. Storage 메뉴 이동
2. 새 버킷 생성: `avatars`, `room-images`
3. 각 버킷 정책 설정:
```sql
-- 아바타 이미지 정책
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 방 이미지 정책  
CREATE POLICY "Users can upload room images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'room-images' AND auth.uid() IS NOT NULL);
```

## 💳 3단계: Stripe 프로덕션 설정

### 3.1 Stripe 계정 활성화
1. [Stripe Dashboard](https://dashboard.stripe.com) 접속
2. "Activate account" 완료 (사업자 정보 입력)
3. Live 모드로 전환

### 3.2 상품 및 가격 생성
```bash
# Stripe CLI를 사용한 상품 생성
stripe products create --name "방 부스트 1일" --type service
stripe prices create --product prod_xxx --unit-amount 1000 --currency krw

stripe products create --name "방 부스트 3일" --type service  
stripe prices create --product prod_xxx --unit-amount 2500 --currency krw

stripe products create --name "방 부스트 7일" --type service
stripe prices create --product prod_xxx --unit-amount 5000 --currency krw
```

### 3.3 웹훅 엔드포인트 설정
1. Stripe Dashboard → Webhooks
2. "Add endpoint" 클릭
3. Endpoint URL: `https://your-domain.com/api/payments/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## 🗺️ 4단계: Kakao Maps API 설정

### 4.1 애플리케이션 등록
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름: "MeetPin"
4. 사업자명: 실제 사업자명 입력

### 4.2 플랫폼 등록
1. 앱 설정 → 플랫폼
2. Web 플랫폼 추가
3. 도메인: `https://your-domain.com`
4. JavaScript 키 발급 확인

## 🔑 5단계: OAuth 제공자 설정

### 5.1 Kakao Login
1. Kakao Developers → 제품 설정 → 카카오 로그인
2. 활성화 설정: ON
3. Redirect URI: `https://your-domain.com/auth/callback/kakao`
4. 동의항목: 닉네임, 프로필 사진, 카카오계정(이메일)

### 5.2 Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. APIs & Services → Credentials
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI: `https://your-domain.com/auth/callback/google`

### 5.3 Naver Login
1. [Naver Developers](https://developers.naver.com) 접속
2. 애플리케이션 등록
3. 서비스 URL: `https://your-domain.com`
4. Callback URL: `https://your-domain.com/auth/callback/naver`

## ☁️ 6단계: Vercel 배포

### 6.1 GitHub 연결
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 리포지토리 선택: `meetpin`
4. Framework Preset: `Next.js` 자동 선택

### 6.2 환경변수 설정
Project Settings → Environment Variables에서 설정:

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 앱 설정 (필수)
SITE_URL=https://your-domain.vercel.app
NODE_ENV=production

# Kakao Maps (필수)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_actual_javascript_key

# Stripe (필수)
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Feature Flags (필수)
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true

# OAuth (선택적)
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 6.3 배포 설정
1. Build & Development Settings:
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next` (기본값)
2. Deploy 버튼 클릭

## 🔒 7단계: 도메인 및 SSL 설정

### 7.1 커스텀 도메인 (선택사항)
1. Vercel Project → Settings → Domains
2. 커스텀 도메인 추가: `meetpin.com`
3. DNS 설정:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 7.2 SSL 인증서
- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- HTTPS 자동 리디렉션 활성화

## 📊 8단계: 모니터링 설정

### 8.1 Vercel Analytics
1. Project Settings → Analytics
2. 활성화하여 성능 모니터링 시작

### 8.2 Sentry 에러 추적 (선택사항)
```bash
# Sentry 설치
pnpm add @sentry/nextjs

# 환경변수 추가
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🧪 9단계: 배포 후 검증

### 9.1 자동 검증 (GitHub Actions)
GitHub Actions가 자동으로 실행하는 검증:
- 품질 검증 (TypeScript, ESLint, Build)
- 보안 스캔 (CodeQL, npm audit)
- E2E 테스트 (Playwright)

### 9.2 수동 검증
[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 참조하여 수동 검증 수행

## 🚨 10단계: 백업 및 모니터링

### 10.1 데이터베이스 백업
```sql
-- Supabase에서 자동 백업 설정
-- 매일 백업 활성화 (Dashboard → Settings → Database → Backups)
```

### 10.2 실시간 모니터링
- **Uptime**: Vercel Dashboard에서 서비스 상태 확인
- **Error Rate**: Sentry에서 오류 발생률 모니터링  
- **Performance**: Vercel Analytics에서 성능 지표 확인

## 🔄 지속적 배포 (CD)

### 자동 배포 프로세스
1. `main` 브랜치에 코드 푸시
2. GitHub Actions 실행:
   - 코드 품질 검증
   - 보안 스캔
   - 자동 배포 (Vercel)
   - E2E 테스트
   - 알림 발송

### 롤백 전략
- Vercel Dashboard에서 원클릭 롤백
- 데이터베이스 백업에서 복원
- 모니터링 알림으로 장애 감지

## 📞 지원 및 문의

### 기술 지원
- **이슈 리포팅**: GitHub Issues
- **긴급 지원**: developer@meetpin.com
- **문서**: 이 리포지토리의 README.md

### 외부 서비스 지원
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/support  
- **Stripe**: https://support.stripe.com

---

## ✅ 배포 성공 확인

모든 단계를 완료했다면:
1. ✅ 프로덕션 URL에서 애플리케이션 정상 동작
2. ✅ 모든 주요 기능 테스트 통과
3. ✅ 성능 지표 기준 만족
4. ✅ 보안 검증 완료
5. ✅ 모니터링 시스템 활성화

**축하합니다! 🎉 MeetPin이 성공적으로 프로덕션에 배포되었습니다.**