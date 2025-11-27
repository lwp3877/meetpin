# Vercel 환경변수 설정 가이드

베타 해제를 위해 Vercel 대시보드에서 다음 환경변수를 설정해야 합니다.

## 1. Mock 모드 비활성화 (필수)

Vercel 대시보드 > Settings > Environment Variables

```
변수명: NEXT_PUBLIC_USE_MOCK_DATA
값: false
환경: Production
```

**중요**: 이 변수를 `false`로 설정하지 않으면 프로덕션에서도 Mock 데이터가 사용됩니다.

## 2. 관리자 API 키 설정 (샘플 룸 생성용)

샘플 룸을 자동 생성하려면 관리자 API 키가 필요합니다.

```bash
# 안전한 랜덤 키 생성 (Git Bash 또는 WSL에서 실행)
openssl rand -base64 32
```

생성된 키를 Vercel 환경변수로 추가:

```
변수명: ADMIN_API_KEY
값: [생성된 랜덤 문자열]
환경: Production
```

## 3. 필수 환경변수 체크리스트

다음 환경변수들이 Vercel에 설정되어 있는지 확인하세요:

### Supabase (필수)
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`

### Kakao Maps (필수)
- [x] `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`

### Stripe (결제 기능 사용 시 필수)
- [x] `STRIPE_SECRET_KEY`
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [x] `STRIPE_WEBHOOK_SECRET`

### 기타
- [x] `SITE_URL` (예: https://meetpin-weld.vercel.app)
- [x] `NEXT_PUBLIC_USE_MOCK_DATA=false` ⚠️ 중요!
- [x] `ADMIN_API_KEY` (샘플 룸 생성용)

## 4. 환경변수 설정 후 재배포

환경변수 변경 후에는 **반드시 재배포**가 필요합니다.

### 방법 1: Git Push (권장)
```bash
git commit --allow-empty -m "chore: trigger redeployment after env vars update"
git push origin main
```

### 방법 2: Vercel 대시보드
Deployments > ... > Redeploy

## 5. 배포 확인

재배포 완료 후 (약 2분 소요):

```bash
# API Health 체크
curl https://meetpin-weld.vercel.app/api/healthz

# 예상 응답: {"status":"ok"}
```

## 6. 샘플 룸 생성

배포 완료 후 샘플 룸을 생성합니다:

```bash
# ADMIN_API_KEY 환경변수를 Vercel에서 가져와서 실행
ADMIN_API_KEY=your_admin_api_key_here node scripts/seed-production-rooms.mjs
```

또는 Vercel에서 직접 설정한 경우:

```bash
# Vercel CLI로 환경변수 확인
npx vercel env pull .env.production

# .env.production 파일에서 ADMIN_API_KEY 복사 후 실행
ADMIN_API_KEY=xxx node scripts/seed-production-rooms.mjs
```

## 7. 최종 검증

모든 설정이 완료되었는지 자동 검증:

```bash
node scripts/verify-beta-release.mjs
```

**예상 출력**:
```
✅ TypeScript 컴파일: 0 errors
✅ ESLint: 0 warnings
✅ Unit Tests: All passing
✅ Production Build: 성공
✅ BetaBanner 제거 완료
✅ 회원가입 service consent로 변경 완료
✅ Mock 모드 프로덕션 안전장치 추가됨
✅ API Health: https://meetpin-weld.vercel.app/api/healthz 응답 정상
✅ 샘플 룸: 10개 이상 존재
✅ 필수 환경변수: 모두 설정됨

✅ 모든 검증 통과! 베타 해제 준비 완료
```

## 문제 해결

### Mock 모드가 프로덕션에서도 활성화되는 경우
1. Vercel 대시보드에서 `NEXT_PUBLIC_USE_MOCK_DATA=false` 확인
2. 재배포 실행
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

### 샘플 룸 생성 실패
```
❌ HTTP 401: Unauthorized
```
→ `ADMIN_API_KEY` 환경변수가 Vercel에 설정되어 있는지 확인

```
❌ Network error
```
→ SITE_URL이 정확한지 확인 (`https://` 포함)

### API Health 체크 실패
```
❌ API Health: Connection timeout
```
→ Vercel 배포가 완료되었는지 확인 (보통 2분 소요)
→ Supabase 환경변수가 정확한지 확인

## 참고 문서

- Vercel 환경변수 가이드: https://vercel.com/docs/environment-variables
- Supabase 환경변수: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Stripe 웹훅 설정: https://stripe.com/docs/webhooks
