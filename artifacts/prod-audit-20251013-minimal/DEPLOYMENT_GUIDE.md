# 배포 가이드

## ✅ 완료된 작업

- [x] LCP 최적화 패치 적용
- [x] CORS 보안 강화 패치 적용
- [x] TypeScript 검증 통과
- [x] ESLint 검증 통과
- [x] 프로덕션 빌드 성공
- [x] Git 커밋 완료 (c4ad908)

---

## 🚀 배포 방법

### 1. Vercel 자동 배포 (권장)

```bash
# main 브랜치에 푸시
git push origin main

# Vercel이 자동으로:
# 1. 빌드 실행
# 2. 테스트 실행
# 3. 프로덕션 배포
```

**예상 배포 시간**: 3-5분

---

## 📊 배포 후 검증 (30분 후)

### 1. LCP 재측정

```bash
# Desktop
npx lighthouse https://meetpin-weld.vercel.app/ \
  --preset=desktop \
  --only-categories=performance \
  --quiet

# Mobile
npx lighthouse https://meetpin-weld.vercel.app/ \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --only-categories=performance \
  --quiet
```

**목표**:
- Desktop LCP ≤ 2.5s
- Mobile LCP ≤ 3.5s

---

### 2. CORS 검증

```bash
# 허용되지 않은 Origin (차단 예상)
curl -I -H "Origin: https://malicious-site.com" \
  https://meetpin-weld.vercel.app/api/rooms

# 예상 결과: Access-Control-Allow-Origin 헤더 없음

# 허용된 Origin (통과 예상)
curl -I -H "Origin: https://meetpin-weld.vercel.app" \
  https://meetpin-weld.vercel.app/api/rooms

# 예상 결과: Access-Control-Allow-Origin: https://meetpin-weld.vercel.app
```

---

### 3. E2E 테스트 (선택)

```bash
# 프로덕션 URL로 E2E 테스트
pnpm exec playwright test tests/e2e/01-home.spec.ts --project=chromium
```

---

## 🔄 롤백 방법

### 방법 1: Git Revert

```bash
git revert c4ad908
git push origin main
```

### 방법 2: Vercel 대시보드

1. https://vercel.com/meetpins-projects/meetpin 접속
2. **Deployments** 탭 클릭
3. 이전 배포 선택
4. **Promote to Production** 클릭

**롤백 시간**: 1-2분

---

## 📈 모니터링

### Vercel Analytics

- **실시간 트래픽**: https://vercel.com/meetpins-projects/meetpin/analytics
- **Core Web Vitals**: 자동 수집 (24시간 후 데이터 확인)

### 수동 모니터링

```bash
# 주간 성능 체크 (금요일 오전)
npx lighthouse https://meetpin-weld.vercel.app/ \
  --preset=desktop --output=html \
  --output-path=./lighthouse-weekly.html

# 월간 전수 감사 (매월 첫째주)
pnpm qa:full
```

---

## 🎯 성공 기준

### 필수 (MUST)
- [x] 빌드 성공
- [x] TypeScript 0 errors
- [x] ESLint 0 warnings
- [ ] 배포 후 프로덕션 접근 가능 (https://meetpin-weld.vercel.app/)

### 권장 (SHOULD)
- [ ] Desktop LCP ≤ 2.5s
- [ ] Mobile LCP ≤ 3.5s
- [ ] CORS 화이트리스트 동작 확인

### 선택 (NICE TO HAVE)
- [ ] E2E 테스트 100% 통과
- [ ] Lighthouse Performance ≥ 90

---

## 📞 문제 발생 시

1. **빌드 실패**: 로컬에서 `pnpm build` 재실행 → 오류 확인
2. **배포 실패**: Vercel 대시보드 로그 확인
3. **성능 저하**: 즉시 롤백 → 원인 분석
4. **CORS 오류**: middleware.ts 허용 Origin 확인

---

**작성일**: 2025-10-13
**커밋**: c4ad908
**다음 리뷰**: 2025-10-20 (1주 후)
