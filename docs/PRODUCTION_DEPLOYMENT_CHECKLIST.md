# 🚀 MeetPin 프로덕션 배포 체크리스트

> **배포 전 필수 확인사항** - 모든 항목을 체크한 후 배포를 진행하세요.

## ✅ 1단계: 배포 전 준비

### 🔐 Supabase 설정 확인
- [x] 기존 Supabase 프로젝트 복원 완료
- [x] 데이터베이스 스키마 업데이트 적용 (`scripts/complete-setup.sql` 실행)
- [x] RLS 정책 올바르게 적용됨
- [x] Realtime 구독 설정 완료
- [ ] 프로덕션 환경에서 Supabase API 키 확인

### 🗂️ 환경변수 준비
- [x] `.env.local` 파일에서 `NEXT_PUBLIC_USE_MOCK_DATA=false` 설정
- [ ] 프로덕션 환경변수 준비:
  ```env
  NODE_ENV=production
  SITE_URL=https://your-domain.com
  NEXT_PUBLIC_USE_MOCK_DATA=false
  NEXT_PUBLIC_SUPABASE_URL=https://xnrqfkecpabucnoxxtwa.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제키]
  SUPABASE_SERVICE_ROLE_KEY=[실제키]
  NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[실제키]
  STRIPE_SECRET_KEY=[실제키]
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[실제키]
  STRIPE_WEBHOOK_SECRET=[실제키]
  ```

### 🧪 품질 검증
- [x] TypeScript 타입 검사 통과 (`pnpm typecheck`)
- [x] ESLint 검사 통과 (`pnpm lint`)
- [x] 단위 테스트 통과 (`pnpm test` - 60/60 통과)
- [x] 프로덕션 빌드 성공 (`pnpm build`)
- [ ] E2E 테스트 실행 (`pnpm e2e`)

## ✅ 2단계: Vercel 배포 설정

### 📦 저장소 준비
- [ ] 모든 변경사항 Git에 커밋
- [ ] 변경사항을 GitHub main 브랜치에 푸시
- [ ] 민감한 정보가 커밋되지 않았는지 확인

### 🌐 Vercel 프로젝트 설정
- [ ] Vercel 프로젝트 연결 확인 (meetpin-weld.vercel.app)
- [ ] 자동 배포 설정 확인 (GitHub main 브랜치)
- [ ] 프로덕션 환경변수 Vercel에 설정:
  ```
  NODE_ENV=production
  SITE_URL=https://meetpin-weld.vercel.app
  NEXT_PUBLIC_USE_MOCK_DATA=false
  NEXT_PUBLIC_SUPABASE_URL=https://xnrqfkecpabucnoxxtwa.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[Vercel에서 설정]
  SUPABASE_SERVICE_ROLE_KEY=[Vercel에서 설정]
  NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[Vercel에서 설정]
  STRIPE_SECRET_KEY=[Vercel에서 설정]
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Vercel에서 설정]
  STRIPE_WEBHOOK_SECRET=[Vercel에서 설정]
  ```

### 🔗 도메인 설정
- [ ] 프로덕션 도메인 설정 (선택사항)
- [ ] HTTPS 인증서 자동 적용 확인
- [ ] DNS 설정 완료 (사용자 정의 도메인 사용 시)

## ✅ 3단계: 외부 서비스 설정

### 🗺️ Kakao Maps API
- [ ] Kakao Developers 콘솔에서 프로덕션 도메인 추가
- [ ] JavaScript 키 도메인 제한 설정 업데이트

### 💳 Stripe 결제 시스템
- [ ] Stripe 대시보드에서 Webhook 엔드포인트 설정:
  - URL: `https://your-domain.com/api/payments/stripe/webhook`
  - Events: `checkout.session.completed`
- [ ] 프로덕션 키로 환경변수 업데이트
- [ ] 테스트 결제 프로세스 확인

### 🔐 Supabase 보안 설정
- [ ] 프로덕션 도메인을 Supabase 승인된 도메인에 추가
- [ ] RLS 정책 프로덕션에서 올바르게 작동하는지 확인
- [ ] 데이터베이스 백업 정책 설정

## ✅ 4단계: 배포 실행

### 🚀 배포 진행
- [ ] Git 변경사항 푸시하여 자동 배포 트리거
- [ ] Vercel 배포 로그 모니터링
- [ ] 빌드 성공 확인

### 🧪 배포 후 검증
- [ ] 프로덕션 URL 접속 확인
- [ ] Health Check API 테스트: `https://your-domain.com/api/health`
- [ ] 사용자 회원가입/로그인 테스트
- [ ] 방 생성 및 조회 기능 테스트
- [ ] 실시간 채팅 기능 테스트
- [ ] 결제 기능 테스트 (테스트 모드)
- [ ] 모바일 반응형 확인

### 📊 성능 및 모니터링
- [ ] Lighthouse 성능 스코어 확인
- [ ] Vercel Analytics 설정 (선택사항)
- [ ] 에러 로깅 시스템 확인
- [ ] 실시간 사용자 행동 모니터링

## ✅ 5단계: 운영 준비

### 📈 사용자 관리
- [ ] 관리자 계정 설정
- [ ] 사용자 신고/차단 시스템 확인
- [ ] 콘텐츠 모더레이션 정책 수립

### 🛡️ 보안 및 백업
- [ ] 정기 데이터베이스 백업 설정
- [ ] 보안 취약점 스캔
- [ ] 사용자 개인정보 보호 정책 확인

### 📋 문서화
- [ ] 사용자 가이드 준비
- [ ] 관리자 매뉴얼 작성
- [ ] 트러블슈팅 가이드 준비

## 🎯 배포 완료 체크리스트

### 최종 확인사항
- [ ] 모든 기능이 프로덕션에서 정상 작동
- [ ] 성능 문제 없음
- [ ] 보안 설정 완료
- [ ] 모니터링 시스템 활성화
- [ ] 팀에 배포 완료 알림

---

## 📞 긴급 상황 대응

### 롤백 절차
1. Vercel 대시보드에서 이전 배포 버전으로 즉시 롤백
2. 데이터베이스 이슈 시 Supabase 백업에서 복원
3. 긴급 패치 필요 시 핫픽스 브랜치 생성 후 배포

### 연락처
- **개발팀**: [개발팀 연락처]
- **인프라**: Vercel, Supabase 지원팀
- **결제**: Stripe 지원팀

---

## 🎉 배포 성공!

모든 체크리스트 항목이 완료되면 MeetPin이 성공적으로 프로덕션에 배포됩니다!

> **중요**: 이 체크리스트는 배포 시마다 사용하여 안전하고 안정적인 배포를 보장하세요.