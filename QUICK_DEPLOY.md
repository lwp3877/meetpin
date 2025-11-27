# 베타 해제 Quick Deploy (10단계)

복붙으로 즉시 실행 가능한 배포 가이드입니다.

---

## 1. 패치 적용

```bash
git apply patches/001-remove-beta-banner.patch
git apply patches/002-fix-signup-beta-consent.patch
git apply patches/003-fix-mock-mode-production.patch
git apply patches/004-complete-help-page-sections.patch
```

---

## 2. 로컬 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

**모두 성공 확인** ✅

---

## 3. 자동 검증 실행

```bash
node scripts/verify-beta-release.mjs
```

**모든 체크 통과 확인** ✅

---

## 4. Git Commit

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
```

---

## 5. Git Push

```bash
git push origin main
```

**Vercel 자동 배포 시작** (약 2분 소요)

---

## 6. Vercel 환경변수 설정

### 6-1. 관리자 API 키 생성

```bash
openssl rand -base64 32
```

**생성된 키 복사** → Vercel 환경변수로 추가

### 6-2. Vercel 대시보드 설정

1. https://vercel.com/dashboard
2. Settings > Environment Variables
3. 다음 2개 추가:

```
변수명: NEXT_PUBLIC_USE_MOCK_DATA
값: false
환경: Production
```

```
변수명: ADMIN_API_KEY
값: [6-1에서 생성한 키]
환경: Production
```

4. Save 클릭

---

## 7. 배포 확인 (2분 대기)

### 7-1. Vercel 배포 상태 확인
- https://vercel.com/dashboard > Deployments
- 최신 커밋이 "Ready" 상태인지 확인

### 7-2. API Health 체크

```bash
curl https://meetpin-weld.vercel.app/api/healthz
```

**예상 응답**: `{"status":"ok"}`

---

## 8. 샘플 룸 생성

```bash
ADMIN_API_KEY=[6-1에서 생성한 키] node scripts/seed-production-rooms.mjs
```

**예상 출력**:
```
✅ 성공: 10개 룸 생성 완료!
```

---

## 9. UI 최종 확인

브라우저에서 https://meetpin-weld.vercel.app 접속

**확인 항목**:
- [ ] 베타 배너 제거됨
- [ ] 회원가입 동의: "서비스 이용" 문구
- [ ] 지도에 샘플 룸 10개 표시
- [ ] Help 페이지 "바로가기 →" 표시

---

## 10. 사용자 시나리오 테스트

1. **회원가입**: 새 이메일로 가입 → "서비스 이용 동의" 체크
2. **로그인**: 방금 가입한 계정으로 로그인
3. **지도 접속**: 서울 지역에 샘플 룸 10개 확인
4. **방 생성**: 새 방 생성 테스트

**모두 정상 동작 확인** ✅

---

## 🎉 배포 완료!

모든 단계가 완료되었습니다.

### 롤백 (문제 발생 시)

```bash
# Git 롤백
git revert HEAD
git push origin main

# 또는 Vercel 롤백
# Vercel Dashboard > Deployments > 이전 버전 선택 > Promote to Production
```

---

**최종 업데이트**: 2025-11-26
**예상 소요 시간**: 15분
