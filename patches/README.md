# Beta Release Patches

이 디렉토리는 베타 출시를 위한 필수 패치 파일들을 포함합니다.

## 📦 포함된 패치 파일

### 1. `001-remove-beta-banner.patch`
**우선순위**: HIGH
**파일**: `src/app/layout.tsx`
**내용**: 전역 레이아웃에서 BetaBanner 컴포넌트 제거

### 2. `002-fix-signup-beta-consent.patch`
**우선순위**: HIGH
**파일**: `src/app/auth/signup/page.tsx`
**내용**: 회원가입 페이지의 "베타 테스트" 동의 문구를 일반 서비스 약관으로 변경

### 3. `003-fix-mock-mode-production.patch`
**우선순위**: CRITICAL
**파일**: `src/lib/config/flags.ts`
**내용**: 프로덕션 환경에서 Mock 모드 강제 비활성화

### 4. `004-complete-help-page-sections.patch`
**우선순위**: MEDIUM
**파일**: `src/app/help/page.tsx`
**내용**: "곧 출시 예정" 뱃지를 실제 링크로 변경

## 🚀 적용 방법

### 방법 1: Git apply 사용 (권장)

```bash
# 각 패치를 순서대로 적용
git apply patches/001-remove-beta-banner.patch
git apply patches/002-fix-signup-beta-consent.patch
git apply patches/003-fix-mock-mode-production.patch
git apply patches/004-complete-help-page-sections.patch

# 또는 한 번에 적용
git apply patches/*.patch
```

### 방법 2: 수동 적용

각 `.patch` 파일을 열어서 변경 내용을 확인하고, 해당 파일에 직접 수정합니다.

## ⚠️  주의사항

1. **패치 적용 전 백업**:
   ```bash
   git checkout -b backup/before-beta-release
   git checkout main
   git checkout -b release/remove-beta
   ```

2. **패치 적용 후 테스트**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```

3. **환경변수 확인**:
   - Vercel 대시보드에서 `NEXT_PUBLIC_USE_MOCK_DATA=false` 설정 필수

## 📋 적용 후 체크리스트

- [ ] 모든 패치 파일 적용 완료
- [ ] TypeScript 컴파일 에러 없음 (0 errors)
- [ ] ESLint 경고 없음 (0 warnings)
- [ ] 모든 테스트 통과 (60/60)
- [ ] 프로덕션 빌드 성공
- [ ] Vercel 환경변수 설정 확인
- [ ] 로컬에서 배포 전 최종 테스트

## 🔄 롤백 방법

패치 적용 후 문제가 발생한 경우:

```bash
# 백업 브랜치로 복귀
git checkout backup/before-beta-release

# 또는 패치 역적용
git apply -R patches/001-remove-beta-banner.patch
git apply -R patches/002-fix-signup-beta-consent.patch
git apply -R patches/003-fix-mock-mode-production.patch
git apply -R patches/004-complete-help-page-sections.patch
```

## 📚 추가 작업 필요

패치 004 적용 후 다음 파일들을 생성해야 합니다:

1. `src/app/help/meetup-tips/page.tsx` - 모임 참가 성공 팁
2. `src/app/legal/safety/page.tsx` - 안전 가이드라인

해당 페이지가 준비될 때까지는 404 에러가 발생할 수 있습니다.

## 📖 참고 문서

- [BETA_RELEASE_FIXES.md](../BETA_RELEASE_FIXES.md) - 전체 수정 계획
- [USER_ACCEPTANCE_TEST_REPORT.md](../USER_ACCEPTANCE_TEST_REPORT.md) - UAT 리포트

---

**생성일**: 2025-11-26
**버전**: v1.0
**작성자**: Claude Code
