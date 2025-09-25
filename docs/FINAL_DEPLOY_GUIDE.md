# 🚀 MeetPin 최종 배포 가이드

> **배포 준비 완료!** 이 가이드를 따라 MeetPin을 프로덕션 환경에 배포하세요.

## 📋 배포 전 체크리스트

### ✅ 코드 품질 검증 완료

- [x] TypeScript 타입 검사: 0 errors
- [x] ESLint 규칙 준수: 0 warnings
- [x] 단위 테스트: 60/60 passing
- [x] 빌드 성공 확인
- [x] console.log 정리 완료
- [x] TODO 주석 처리 완료
- [x] 중복 코드 제거 완료

### ✅ 보안 검증 완료

- [x] 환경변수 보안 설정 (`.gitignore`에 `.env.local` 포함)
- [x] Supabase 키 보안 가이드 작성
- [x] API Rate Limiting 구현
- [x] Row Level Security (RLS) 정책 적용
- [x] 입력 검증 (Zod 스키마) 구현

## 🔧 배포 단계별 가이드

### 1단계: 환경 설정

#### **Supabase 프로덕션 설정**

```bash
# 1. Supabase 프로젝트 생성
# https://supabase.com/dashboard에서 새 프로젝트 생성

# 2. 데이터베이스 스키마 적용
# Supabase SQL Editor에서 다음 순서로 실행:
# - scripts/migrate.sql
# - scripts/rls.sql
# (scripts/seed.sql은 개발용이므로 프로덕션에서 제외)

# 3. 새로운 API 키 발급 확인
# Project Settings > API > 새로 발급된 키 확인
```

#### **Vercel 배포 설정**

```bash
# 1. Vercel 프로젝트 연결
vercel --prod

# 2. 환경변수 설정 (Vercel Dashboard)
# PROJECT_NAME > Settings > Environment Variables
```

### 2단계: 환경변수 설정

#### **필수 환경변수 (Production)**

```bash
# Supabase (새로 발급받은 키 사용)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[new-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[new-service-role-key]

# 외부 API
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[kakao-production-key]
STRIPE_SECRET_KEY=[stripe-live-secret]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[stripe-live-public]
STRIPE_WEBHOOK_SECRET=[stripe-webhook-secret]

# 프로덕션 설정
NODE_ENV=production
NEXT_PUBLIC_USE_MOCK_DATA=false
SITE_URL=https://[your-domain].vercel.app
```

#### **선택적 환경변수**

```bash
# 기능 플래그
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true

# Stripe 고정 상품 ID (선택)
STRIPE_PRICE_1D_ID=[1day-price-id]
STRIPE_PRICE_3D_ID=[3day-price-id]
STRIPE_PRICE_7D_ID=[7day-price-id]
```

### 3단계: 배포 실행

#### **자동 배포 (권장)**

```bash
# GitHub에 푸시하면 자동 배포
git add .
git commit -m "feat: 프로덕션 배포 준비 완료

🔧 최종 점검 및 정비 완료:
- 보안 이슈 해결
- 코드 최적화
- 테스트 품질 강화
- 문서화 완료

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

#### **수동 배포**

```bash
# Vercel CLI 사용
vercel --prod

# 또는 Vercel Dashboard에서 수동 배포
```

### 4단계: 배포 후 검증

#### **Health Check**

```bash
# API 상태 확인
curl https://[your-domain].vercel.app/api/health

# 예상 응답
{
  "ok": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.3.1-signup-login-fix",
    "env": "production"
  }
}
```

#### **핵심 기능 테스트**

```bash
# 1. 메인 페이지 접속
curl -I https://[your-domain].vercel.app

# 2. API 엔드포인트 테스트
curl "https://[your-domain].vercel.app/api/rooms?bbox=37.4,126.8,37.7,127.2"

# 3. 이미지 로딩 테스트
curl -I https://[your-domain].vercel.app/_next/static/media/hero-bg.jpg
```

#### **브라우저 테스트**

1. 회원가입/로그인 기능
2. 지도에서 방 목록 로드
3. 방 생성 및 수정
4. 실시간 채팅 동작
5. 결제 기능 (Stripe)
6. 파일 업로드 기능

## ⚠️ 알려진 이슈 및 해결책

### **일반적인 문제들**

#### 1. 환경변수 인식 안됨

```bash
# 해결: Vercel에서 환경변수 재설정 후 재배포
vercel env pull .env.local
vercel --prod
```

#### 2. Supabase 연결 실패

```bash
# 해결: API 키 재발급 및 네트워크 접근 확인
# Supabase > Settings > API > Reset keys
```

#### 3. 이미지 로딩 실패

```bash
# 해결: Vercel 이미지 최적화 설정 확인
# next.config.js의 images 설정 검토
```

#### 4. Stripe 결제 실패

```bash
# 해결: Webhook URL 설정 확인
# https://[domain]/api/payments/stripe/webhook
```

### **성능 최적화**

#### **캐시 설정**

- Next.js 정적 파일 캐싱 활성화
- Vercel CDN 자동 최적화 활용
- 이미지 최적화 (next/image) 사용

#### **모니터링 설정**

- Vercel Analytics 활성화
- Supabase Logs 모니터링
- 에러 트래킹 설정

## 🔄 롤백 절차

### **긴급 롤백**

```bash
# 1. 이전 버전으로 롤백
vercel rollback [deployment-url]

# 2. 환경변수 이전 버전 복원
vercel env rm [ENV_NAME]
vercel env add [ENV_NAME] [OLD_VALUE]
```

### **데이터베이스 롤백**

```sql
-- Supabase에서 스키마 변경사항 되돌리기
-- (사전에 백업된 스키마 사용)
```

## 📊 배포 성공 지표

### **성능 목표**

- 페이지 로드 시간: < 3초
- API 응답 시간: < 500ms
- 이미지 로딩: < 2초
- 사용자 경험: PWA 수준

### **안정성 목표**

- 업타임: > 99.9%
- 에러율: < 1%
- 보안 취약점: 0건

## 🎯 배포 후 할 일

### **즉시 (배포 직후)**

- [ ] Health check API 확인
- [ ] 핵심 사용자 플로우 테스트
- [ ] 에러 모니터링 확인
- [ ] 성능 지표 점검

### **24시간 이내**

- [ ] 사용자 피드백 수집
- [ ] 성능 메트릭 분석
- [ ] 에러 로그 분석
- [ ] 보안 이벤트 검토

### **1주일 이내**

- [ ] 사용량 패턴 분석
- [ ] 성능 최적화 적용
- [ ] 사용자 경험 개선
- [ ] 피처 플래그 최적화

---

## ✅ 최종 확인

**이 체크리스트의 모든 항목이 완료되면 배포 준비가 완료됩니다:**

- [ ] 모든 환경변수 설정 완료
- [ ] 데이터베이스 스키마 적용 완료
- [ ] 외부 API 키 프로덕션 버전으로 교체 완료
- [ ] Health check API 정상 응답 확인
- [ ] 핵심 기능 브라우저 테스트 완료
- [ ] 모니터링 시스템 설정 완료

**🎉 축하합니다! MeetPin이 성공적으로 배포되었습니다.**

> 문제 발생 시 `docs/SECURITY_GUIDE.md`를 참고하여 보안 점검을 우선 수행하세요.
