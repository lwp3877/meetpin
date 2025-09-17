# 🚀 MeetPin 프로덕션 배포 체크리스트

## 📋 배포 전 필수 체크리스트

### 1️⃣ 코드 품질 검증
- [ ] **TypeScript 타입 체크**: `pnpm typecheck` 실행하여 0개 오류 확인
- [ ] **ESLint 검사**: `pnpm lint` 실행하여 모든 린팅 규칙 통과
- [ ] **단위 테스트**: `pnpm test` 실행하여 모든 테스트 통과
- [ ] **프로덕션 빌드**: `pnpm build` 실행하여 빌드 성공 확인
- [ ] **전체 품질 검사**: `pnpm repo:doctor` 실행하여 모든 검사 통과

### 2️⃣ 환경변수 설정
- [ ] **Vercel 환경변수** 모든 필수 환경변수 설정:
  - `NEXT_PUBLIC_SUPABASE_URL` (실제 Supabase URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (실제 Supabase Anon Key)
  - `SUPABASE_SERVICE_ROLE_KEY` (실제 Service Role Key)
  - `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` (실제 Kakao Maps API 키)
  - `STRIPE_SECRET_KEY` (실제 Stripe Live 키)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (실제 Stripe Publishable 키)
  - `STRIPE_WEBHOOK_SECRET` (실제 Webhook Secret)
  - `SITE_URL` (실제 프로덕션 도메인)
- [ ] **Mock 데이터 비활성화**: `NEXT_PUBLIC_USE_MOCK_DATA=false` 설정
- [ ] **Feature Flags**: 프로덕션에 필요한 기능만 활성화

### 3️⃣ Supabase 데이터베이스 설정
- [ ] **프로덕션 프로젝트** 생성 및 설정
- [ ] **테이블 스키마** 적용: `scripts/migrate.sql` 실행
- [ ] **RLS 정책** 적용: `scripts/rls.sql` 실행
- [ ] **API 키** 확인: 프로덕션 환경에서 실제 키 사용
- [ ] **데이터베이스 백업** 설정 및 자동화 구성

### 4️⃣ 외부 서비스 설정
- [ ] **Kakao Maps API**: 프로덕션 도메인 등록 및 키 발급
- [ ] **Stripe 계정**: Live 모드 활성화 및 실제 API 키 설정
- [ ] **OAuth 제공자**:
  - Kakao 개발자 콘솔에서 프로덕션 도메인 등록
  - Google Cloud Console에서 OAuth 클라이언트 설정
  - Naver 개발자센터에서 애플리케이션 등록
- [ ] **웹훅 엔드포인트**: Stripe 웹훅 URL 설정 (`/api/payments/stripe/webhook`)

### 5️⃣ 보안 설정
- [ ] **HTTPS 인증서**: SSL/TLS 인증서 설정 확인
- [ ] **도메인 설정**: 실제 도메인 및 DNS 설정 완료
- [ ] **보안 헤더**: CSP, HSTS, XSS Protection 등 설정 확인
- [ ] **환경변수 보안**: 민감한 정보가 클라이언트에 노출되지 않도록 확인
- [ ] **Rate Limiting**: API 엔드포인트 호출 제한 설정 확인

### 6️⃣ 성능 최적화
- [ ] **이미지 최적화**: WebP 형식 및 적절한 크기 설정 확인
- [ ] **코드 분할**: Dynamic imports 및 lazy loading 구현
- [ ] **CDN 설정**: Vercel Edge Network 또는 외부 CDN 설정
- [ ] **캐싱 전략**: 정적 자산 및 API 응답 캐싱 설정
- [ ] **번들 크기**: 불필요한 의존성 제거 및 최적화

### 7️⃣ 모니터링 및 로깅
- [ ] **에러 추적**: Sentry 또는 유사한 서비스 설정
- [ ] **성능 모니터링**: Vercel Analytics 또는 Google Analytics 설정
- [ ] **로그 수집**: 중요한 이벤트 및 오류 로깅 설정
- [ ] **알림 설정**: 서비스 장애 시 알림 시스템 구성

## 🔧 배포 후 검증 체크리스트

### 1️⃣ 기본 기능 검증
- [ ] **홈페이지** 로딩 확인 (`/`)
- [ ] **지도 페이지** 정상 동작 확인 (`/map`)
- [ ] **회원가입/로그인** 기능 테스트
- [ ] **방 생성** 기능 테스트
- [ ] **방 조회** 및 검색 기능 테스트

### 2️⃣ 고급 기능 검증
- [ ] **실시간 채팅** 기능 테스트
- [ ] **알림 시스템** 동작 확인
- [ ] **결제 시스템** (부스트) 테스트
- [ ] **이미지 업로드** 기능 테스트
- [ ] **소셜 로그인** 기능 테스트

### 3️⃣ 관리자 기능 검증
- [ ] **관리자 대시보드** 접근 확인
- [ ] **신고 시스템** 동작 확인
- [ ] **사용자 차단** 기능 테스트
- [ ] **방 관리** 기능 테스트

### 4️⃣ 성능 및 SEO 검증
- [ ] **페이지 로딩 속도** 측정 (Core Web Vitals)
- [ ] **모바일 반응형** 디자인 확인
- [ ] **SEO 메타태그** 설정 확인
- [ ] **사이트맵** 및 robots.txt 확인

### 5️⃣ 보안 검증
- [ ] **SSL 인증서** 정상 동작 확인
- [ ] **CORS 정책** 올바른 설정 확인
- [ ] **XSS 및 CSRF** 보호 테스트
- [ ] **데이터 유효성** 검사 확인

## 🚨 긴급 롤백 계획

### 즉시 롤백이 필요한 상황
- 서비스 접속 불가 (5분 이상)
- 결제 시스템 오류
- 데이터 손실 또는 노출
- 보안 취약점 발견

### 롤백 절차
1. **Vercel 대시보드**에서 이전 배포 버전으로 즉시 롤백
2. **데이터베이스** 백업에서 복원 (필요시)
3. **외부 서비스** 설정 확인 및 복원
4. **모니터링 알림** 확인 및 대응
5. **팀 내 커뮤니케이션** 및 사용자 공지

## 📞 배포 후 지원 연락처

### 기술 지원
- **개발팀**: developer@meetpin.com
- **인프라팀**: infra@meetpin.com
- **보안팀**: security@meetpin.com

### 외부 서비스 지원
- **Vercel 지원**: https://vercel.com/support
- **Supabase 지원**: https://supabase.com/support
- **Stripe 지원**: https://support.stripe.com

## 📊 성공 지표 (KPI)

### 기술적 지표
- 서비스 가용성: 99.9% 이상
- 평균 응답 시간: 500ms 이하
- 오류율: 0.1% 이하
- 페이지 로딩 속도: 2초 이하

### 비즈니스 지표
- 일일 활성 사용자 (DAU)
- 방 생성 수
- 결제 전환율
- 사용자 만족도

---

## ✅ 최종 배포 승인

- [ ] **모든 체크리스트 항목** 완료 확인
- [ ] **개발팀 승인** 받음
- [ ] **QA 팀 승인** 받음  
- [ ] **제품팀 승인** 받음
- [ ] **최종 배포 결정** 확정

**배포 담당자**: ________________  
**배포 일시**: ________________  
**승인자**: ________________