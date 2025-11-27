# 베타 해제 체크리스트 (10단계)

프로덕션 배포 전 필수 체크리스트입니다. 모든 항목을 순서대로 완료하세요.

---

## ✅ 배포 전 필수 작업

### 1. 코드 수정 적용
- [ ] **패치 001**: BetaBanner 제거 (`layout.tsx`)
  ```bash
  git apply patches/001-remove-beta-banner.patch
  ```
- [ ] **패치 002**: 회원가입 베타 문구 수정 (`signup/page.tsx`)
  ```bash
  git apply patches/002-fix-signup-beta-consent.patch
  ```
- [ ] **패치 003**: Mock 모드 프로덕션 강제 비활성화 (`flags.ts`)
  ```bash
  git apply patches/003-fix-mock-mode-production.patch
  ```
- [ ] **패치 004**: Help 페이지 "곧 출시" 제거 (`help/page.tsx`)
  ```bash
  git apply patches/004-complete-help-page-sections.patch
  ```

### 2. 로컬 테스트
- [ ] TypeScript 컴파일 에러 없음
  ```bash
  pnpm typecheck
  # 예상: Found 0 errors
  ```
- [ ] ESLint 경고 없음
  ```bash
  pnpm lint
  # 예상: ✓ No ESLint warnings or errors
  ```
- [ ] 단위 테스트 통과
  ```bash
  pnpm test
  # 예상: Tests: 60 passed, 60 total
  ```
- [ ] 프로덕션 빌드 성공
  ```bash
  pnpm build
  # 예상: Build successful
  ```

### 3. Vercel 환경변수 설정
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` 설정
  - Vercel Dashboard > Settings > Environment Variables
  - Production 환경에 추가
- [ ] `ADMIN_API_KEY` 생성 및 설정
  ```bash
  # 키 생성 (로컬)
  openssl rand -base64 32
  # Vercel에 추가
  ```
- [ ] 기존 Supabase 환경변수 확인
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Stripe 환경변수 확인 (결제 기능용)
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### 4. Git 커밋 & 푸시
```bash
git add .
git commit -m "release: remove beta status and prepare for production

Major changes:
- Remove BetaBanner component from all pages
- Change signup beta consent to service consent
- Add production safety guard for mock mode
- Complete help page sections (remove '곧 출시 예정')
- Fix seed-production-rooms.mjs API response handling

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 5. 자동 검증 실행

```bash
node scripts/verify-beta-release.mjs
```

**예상 출력**: 모든 항목 ✅ 표시

---

## ✅ 배포 작업

### 6. Vercel 환경변수 설정

Vercel 대시보드 > Settings > Environment Variables

**필수**:
- `NEXT_PUBLIC_USE_MOCK_DATA = false` (Production)
- `ADMIN_API_KEY = [openssl rand -base64 32]` (Production)

**상세**: [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) 참고

### 7. Vercel 자동 배포 확인

Git Push 후 자동 배포 (약 2분 소요)

**API Health 체크**:
```bash
curl https://meetpin-weld.vercel.app/api/healthz
```

---

## ✅ 배포 후 검증

### 8. UI 확인
- [ ] 베타 배너 제거됨
- [ ] 회원가입 동의 문구: "서비스 이용"
- [ ] Help 페이지 "곧 출시 예정" → "바로가기 →"

### 9. 샘플 룸 생성

```bash
ADMIN_API_KEY=xxx node scripts/seed-production-rooms.mjs
```

**확인**: 지도에 10개 이상 룸 표시

### 10. 최종 사용자 시나리오

- [ ] 회원가입 → 로그인 → 지도 접속 → 샘플 룸 확인


---

## 🎉 배포 완료!

### 성공 기준
- ✅ 베타 배너/문구 완전 제거
- ✅ 샘플 룸 10개 이상 표시
- ✅ Mock 모드 비활성화
- ✅ 모든 테스트 통과 (60/60)

### 롤백 방법 (문제 발생 시)

**Vercel 롤백**:
1. Vercel Dashboard > Deployments
2. 이전 버전 선택 > "Promote to Production"

**Git 롤백**:
```bash
git revert HEAD
git push origin main
```

### 문제 해결

**Mock 모드가 여전히 활성화됨**:
- Vercel에서 `NEXT_PUBLIC_USE_MOCK_DATA=false` 확인
- 재배포 후 브라우저 캐시 삭제 (Ctrl+Shift+R)

**샘플 룸 없음**:
- `ADMIN_API_KEY` Vercel 설정 확인
- `node scripts/seed-production-rooms.mjs` 재실행

---

**최종 업데이트**: 2025-11-26
**버전**: 1.5.0 (베타 해제)
