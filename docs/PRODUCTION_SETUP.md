# MeetPin 프로덕션 배포 가이드

> **Version**: 1.0.0  
> **Last Updated**: 2025-01-15  
> **Target**: Supabase + Vercel 프로덕션 환경

## 📋 배포 체크리스트

### Phase 1: Supabase 프로젝트 설정

- [ ] **1.1 Supabase 프로젝트 생성**
  - [ ] [Supabase Dashboard](https://supabase.com/dashboard) 접속
  - [ ] 새 프로젝트 생성 (Region: Asia Pacific (ap-northeast-1) 권장)
  - [ ] 프로젝트 이름: `meetpin-production`
  - [ ] 강력한 데이터베이스 비밀번호 설정

- [ ] **1.2 데이터베이스 스키마 적용**
  ```sql
  -- Supabase SQL Editor에서 순차 실행
  -- 1. 테이블 생성
  [scripts/001-create-tables.sql 내용 복사 후 실행]
  
  -- 2. 보안 정책 적용
  [scripts/002-row-level-security.sql 내용 복사 후 실행]
  
  -- 3. 트리거 설정
  [scripts/003-triggers.sql 내용 복사 후 실행]
  
  -- 4. (선택사항) 테스트 데이터
  [scripts/004-seed-data.sql 내용 복사 후 실행]
  ```

- [ ] **1.3 Supabase 설정 확인**
  - [ ] RLS 정책이 모든 테이블에 활성화되었는지 확인
  - [ ] Auth 설정에서 이메일 확인 비활성화 (개발 단계)
  - [ ] Storage 버킷 생성: `avatars`, `room-images`
  - [ ] API Keys 복사 (URL, anon key, service_role key)

### Phase 2: 환경변수 설정

- [ ] **2.1 Vercel 환경변수 설정**
  1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 → Settings → Environment Variables
  2. 다음 환경변수들을 추가:

```bash
# 필수 환경변수
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_USE_MOCK_DATA=false
SITE_URL=https://your-domain.vercel.app

# 카카오맵 API
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-key

# Stripe 결제 (선택사항)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- [ ] **2.2 로컬 환경변수 설정**
  ```bash
  # .env.local 파일 생성 (.env.example 참고)
  cp .env.example .env.local
  # 실제 값들로 교체
  ```

### Phase 3: 외부 서비스 연동

- [ ] **3.1 카카오맵 API 설정**
  - [ ] [Kakao Developers](https://developers.kakao.com) 접속
  - [ ] 애플리케이션 생성
  - [ ] JavaScript 키 발급
  - [ ] 플랫폼 설정에서 도메인 등록 (localhost:3000, 배포 도메인)
  - [ ] `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` 환경변수 설정

- [ ] **3.2 Stripe 결제 설정 (선택사항)**
  - [ ] [Stripe Dashboard](https://dashboard.stripe.com) 접속
  - [ ] 상품(Product) 생성: 1일/3일/7일 부스트
  - [ ] 가격(Price) 설정: ₩1,000 / ₩2,500 / ₩5,000
  - [ ] API 키 복사 (Publishable key, Secret key)
  - [ ] Webhook 엔드포인트 추가: `https://your-domain.vercel.app/api/stripe/webhook`
  - [ ] Webhook 이벤트 선택: `payment_intent.succeeded`

- [ ] **3.3 소셜 로그인 설정 (선택사항)**
  - [ ] Supabase Auth → Providers 설정
  - [ ] Google OAuth 2.0 클라이언트 ID 설정
  - [ ] Kakao OAuth 애플리케이션 설정
  - [ ] Naver OAuth 애플리케이션 설정

### Phase 4: 배포 및 테스트

- [ ] **4.1 Vercel 배포**
  ```bash
  # GitHub 연동 배포 (권장)
  git add .
  git commit -m "feat: production deployment setup"
  git push origin main
  
  # 또는 직접 배포
  pnpm build
  vercel --prod
  ```

- [ ] **4.2 배포 후 검증**
  - [ ] 홈페이지 로딩 확인
  - [ ] 회원가입/로그인 테스트
  - [ ] 방 생성/조회 테스트
  - [ ] 참가 신청/매칭 테스트
  - [ ] 1:1 채팅 테스트
  - [ ] 결제 기능 테스트 (테스트 모드)

- [ ] **4.3 성능 최적화**
  - [ ] Vercel Analytics 활성화
  - [ ] Web Vitals 모니터링
  - [ ] 이미지 최적화 확인
  - [ ] 캐싱 정책 확인

### Phase 5: 모니터링 및 보안

- [ ] **5.1 에러 모니터링**
  - [ ] Sentry 프로젝트 생성 (선택사항)
  - [ ] `NEXT_PUBLIC_SENTRY_DSN` 환경변수 설정
  - [ ] 에러 알림 설정

- [ ] **5.2 분석 도구**
  - [ ] Google Analytics 4 설정 (선택사항)
  - [ ] Mixpanel 프로젝트 생성 (선택사항)
  - [ ] 사용자 행동 추적 설정

- [ ] **5.3 보안 검토**
  - [ ] RLS 정책 재검토
  - [ ] API 엔드포인트 보안 테스트
  - [ ] 민감한 정보 노출 여부 확인
  - [ ] CORS 설정 확인

## 🔧 환경변수 상세 설명

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (브라우저 노출 가능) | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 (서버 전용) | `eyJhbGci...` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Mock 데이터 사용 여부 | `false` (프로덕션) |
| `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 카카오맵 JavaScript 키 | `a1b2c3d4...` |

### 선택적 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `STRIPE_SECRET_KEY` | Stripe 비밀 키 | - |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | 분석 기능 활성화 | `false` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry 에러 추적 | - |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |

## 🚨 보안 주의사항

### 1. 환경변수 보안
- ❌ **절대 금지**: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` 등을 Git에 커밋
- ✅ **권장**: Vercel Environment Variables에서만 관리
- ✅ **권장**: 개발/스테이징/프로덕션 환경별 분리

### 2. Supabase RLS 정책
- ✅ 모든 테이블에 RLS 활성화 확인
- ✅ 사용자별 데이터 격리 확인
- ✅ 관리자 권한 분리 확인

### 3. API 보안
- ✅ Rate Limiting 적용 확인
- ✅ 입력 데이터 검증 확인
- ✅ CORS 정책 확인

## 📊 성능 최적화

### 1. 데이터베이스 최적화
```sql
-- 인덱스 사용률 확인
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 느린 쿼리 모니터링
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 2. Next.js 최적화
- ✅ 이미지 최적화 (`next/image` 사용)
- ✅ 번들 크기 최적화 (`bundle-analyzer` 사용)
- ✅ 코드 스플리팅 (`dynamic import` 사용)
- ✅ 캐싱 전략 설정

### 3. Vercel 최적화
- ✅ Edge Functions 활용
- ✅ CDN 캐싱 설정
- ✅ 이미지 최적화 활성화
- ✅ 압축 설정 확인

## 🔍 배포 후 검증 스크립트

### 자동화된 헬스체크
```bash
#!/bin/bash
# health-check.sh

DOMAIN="https://your-domain.vercel.app"

echo "🔍 MeetPin 프로덕션 헬스체크 시작..."

# 1. 홈페이지 응답 확인
echo "📱 홈페이지 확인..."
curl -s -o /dev/null -w "%{http_code}" $DOMAIN
if [ $? -eq 0 ]; then
  echo "✅ 홈페이지 정상"
else
  echo "❌ 홈페이지 오류"
fi

# 2. API 엔드포인트 확인
echo "🔗 API 엔드포인트 확인..."
curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health
if [ $? -eq 0 ]; then
  echo "✅ API 정상"
else
  echo "❌ API 오류"
fi

# 3. 데이터베이스 연결 확인
echo "🗄️ 데이터베이스 확인..."
curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/rooms?bbox=37.4,126.8,37.7,127.2
if [ $? -eq 0 ]; then
  echo "✅ 데이터베이스 정상"
else
  echo "❌ 데이터베이스 오류"
fi

echo "🎉 헬스체크 완료!"
```

## 📞 트러블슈팅

### 자주 발생하는 문제들

#### 1. Supabase 연결 오류
```
Error: Failed to fetch from Supabase
```
**해결방법:**
- `NEXT_PUBLIC_SUPABASE_URL` 확인
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트 상태 확인

#### 2. RLS 정책 오류
```
Error: new row violates row-level security policy
```
**해결방법:**
- RLS 정책 재검토
- 사용자 인증 상태 확인
- `002-row-level-security.sql` 재실행

#### 3. 환경변수 누락
```
Error: Environment variable not found
```
**해결방법:**
- Vercel Environment Variables 확인
- 배포 후 재시작 필요
- `NEXT_PUBLIC_` 접두사 확인

#### 4. 카카오맵 로딩 오류
```
Error: Kakao Maps API failed to load
```
**해결방법:**
- JavaScript 키 확인
- 도메인 등록 확인
- 서비스 활성화 확인

## 📋 Launch Day 체크리스트

### D-Day 준비사항
- [ ] 모든 환경변수 최종 확인
- [ ] 데이터베이스 백업 완료
- [ ] 에러 모니터링 활성화
- [ ] 성능 모니터링 설정
- [ ] 고객 지원 채널 준비

### 론칭 후 모니터링
- [ ] 실시간 에러 로그 모니터링
- [ ] 서버 응답 시간 체크
- [ ] 사용자 가입/로그인 성공률 확인
- [ ] 결제 시스템 정상 작동 확인
- [ ] 푸시 알림 전송 확인

## 📚 추가 리소스

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Stripe Integration Guide](https://stripe.com/docs/development)
- [Kakao Maps API Documentation](https://apis.map.kakao.com/web/guide/)

---

**⚠️ 중요**: 이 가이드는 프로덕션 배포를 위한 기본 설정입니다. 실제 서비스 운영 시에는 추가적인 보안 검토와 성능 최적화가 필요할 수 있습니다.