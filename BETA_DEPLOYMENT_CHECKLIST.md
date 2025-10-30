# 베타 서비스 배포 체크리스트

> **마지막 업데이트**: 2025-10-30
> **배포 대상**: Vercel (https://meetpin-weld.vercel.app)
> **서비스 상태**: 비공개 베타 테스트

---

## ✅ 완료된 작업

### 1. 코드 변경사항
- [x] 베타 배너 추가 (모든 페이지 상단)
- [x] 결제 기능 비활성화 (무료 부스트로 전환)
- [x] 이용약관 베타 버전 작성
- [x] 개인정보처리방침 간소화
- [x] 회원가입 동의 체크박스 추가 (3개 필수 + 1개 선택)
- [x] 미사용 코드 제거 및 ESLint 경고 해결

### 2. 품질 검증
- [x] TypeScript 컴파일: **0 errors**
- [x] ESLint 검사: **0 warnings, 0 errors**
- [x] Jest 단위 테스트: **60/60 passing**
- [x] Production 빌드: **성공**
- [x] Main Bundle 크기: **208KB** (< 300KB limit)

### 3. 환경 변수 (로컬)
- [x] `NEXT_PUBLIC_SUPABASE_URL` - https://xnrqfkecpabucnoxxtwa.supabase.co
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Present
- [x] `SUPABASE_SERVICE_ROLE_KEY` - ✅ Present
- [x] `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` - 11764377687ae8ad3d8decc7ac0078d5
- [x] `NEXT_PUBLIC_USE_MOCK_DATA` - true (개발 환경)
- [x] `NEXT_PUBLIC_SITE_URL` - http://localhost:3001 (개발 환경)

---

## 🚀 배포 전 필수 작업

### Step 1: Vercel 환경 변수 설정

**중요**: Vercel Dashboard에서 다음 환경 변수를 설정해야 합니다.

#### 필수 변수 (7개)

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   ```
   https://xnrqfkecpabucnoxxtwa.supabase.co
   ```

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   ```
   [.env.local에서 복사]
   ```

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   ```
   [.env.local에서 복사]
   ```

4. **`NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`**
   ```
   11764377687ae8ad3d8decc7ac0078d5
   ```

5. **`NEXT_PUBLIC_SITE_URL`**
   ```
   https://meetpin-weld.vercel.app
   ```

6. **`SITE_URL`**
   ```
   https://meetpin-weld.vercel.app
   ```

7. **`NEXT_PUBLIC_USE_MOCK_DATA`** ⚠️ **매우 중요!**
   ```
   false
   ```
   > **경고**: 이 값이 `true`이면 프로덕션에서도 Mock 데이터가 사용됩니다!

#### 선택 변수 (베타 기간 중 불필요)

Stripe 결제는 현재 비활성화되어 있으므로 설정 불필요:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

### Step 2: Vercel 환경 변수 설정 방법

1. Vercel Dashboard 접속: https://vercel.com/dashboard
2. MeetPin 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 위의 7개 필수 변수를 각각 추가:
   - **Key**: 변수명 입력
   - **Value**: 값 입력
   - **Environment**: `Production`, `Preview`, `Development` 모두 체크
5. **Save** 클릭

**검증 방법**:
```bash
# Vercel CLI로 확인 (선택사항)
vercel env ls
```

---

### Step 3: Kakao Maps 도메인 등록

Kakao Maps API가 프로덕션 도메인에서 작동하려면 도메인 등록이 필요합니다.

1. **Kakao Developers** 접속: https://developers.kakao.com/
2. **내 애플리케이션** → MeetPin 앱 선택
3. **플랫폼** → **Web 플랫폼 추가/수정**
4. 다음 도메인 추가:
   ```
   https://meetpin-weld.vercel.app
   ```
5. **저장** 클릭

**검증 방법**:
- 배포 후 `/map` 페이지에서 지도가 정상적으로 로드되는지 확인

---

### Step 4: Git 커밋 및 푸시

현재까지의 모든 변경사항을 커밋하고 GitHub에 푸시:

```bash
# 변경된 파일 확인
git status

# 모든 변경사항 스테이징
git add .

# 커밋 생성
git commit -m "feat: beta service launch - complete legal docs, consents, and payment disable

- Add beta warning banner to all pages
- Convert payment system to free boost for beta
- Update terms of service for beta testing
- Simplify privacy policy for individual operation
- Add signup consent checkboxes (3 required + 1 optional)
- Remove unused code and fix all ESLint warnings

Quality metrics:
✅ TypeScript: 0 errors
✅ ESLint: 0 warnings
✅ Tests: 60/60 passing
✅ Build: Successful (208KB bundle)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHub에 푸시 (Vercel 자동 배포 트리거)
git push origin main
```

---

### Step 5: 배포 모니터링

1. **Vercel Dashboard**에서 배포 진행 상황 확인
2. 빌드 로그에서 에러 확인
3. 배포 완료 후 다음 URL 테스트:
   - https://meetpin-weld.vercel.app/
   - https://meetpin-weld.vercel.app/map
   - https://meetpin-weld.vercel.app/auth/signup
   - https://meetpin-weld.vercel.app/legal/terms
   - https://meetpin-weld.vercel.app/legal/privacy

---

## 🧪 배포 후 테스트 체크리스트

### 필수 기능 테스트

- [ ] **홈페이지 로딩**
  - [ ] 베타 배너가 표시됨
  - [ ] 페이지가 정상적으로 렌더링됨

- [ ] **회원가입 (/auth/signup)**
  - [ ] 4개의 동의 체크박스가 표시됨
  - [ ] 모든 필수 항목 체크 없이 제출 시 에러 메시지
  - [ ] 정상적으로 회원가입 가능

- [ ] **지도 페이지 (/map)**
  - [ ] Kakao Maps가 정상적으로 로드됨
  - [ ] 지도 위에 모임 마커가 표시됨
  - [ ] 지도 확대/축소 동작

- [ ] **법적 문서**
  - [ ] /legal/terms - 베타 이용약관 표시
  - [ ] /legal/privacy - 간소화된 개인정보처리방침 표시

- [ ] **부스트 기능**
  - [ ] 부스트 모달 열기
  - [ ] "무료로 부스트하기" 버튼 확인
  - [ ] 베타 테스트 무료 안내 문구 확인

### 성능 테스트

```bash
# Lighthouse 성능 측정
npx lighthouse https://meetpin-weld.vercel.app/ --view

# 목표:
# - Performance: > 80
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### 오류 모니터링

- [ ] Vercel Dashboard → **Functions** 탭에서 서버 에러 확인
- [ ] Browser Console에서 JavaScript 에러 확인
- [ ] Network 탭에서 API 호출 실패 확인

---

## ⚠️ 알려진 제한사항 (베타)

1. **결제 기능 비활성화**: 부스트는 무료로 제공됨
2. **Mock 데이터**: 일부 기능이 Mock 데이터로 동작할 수 있음
3. **데이터 보존**: 베타 테스트 종료 시 모든 데이터 삭제 가능
4. **서비스 안정성**: 예고 없이 중단될 수 있음

---

## 🔄 롤백 계획

문제 발생 시:

### Option 1: 이전 버전으로 롤백 (Vercel)
1. Vercel Dashboard → **Deployments** 탭
2. 정상 동작하는 이전 배포 선택
3. **Promote to Production** 클릭

### Option 2: Git Revert
```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main
```

---

## 📞 긴급 연락처

- **운영자**: 이원표
- **이메일**: meetpin.beta@gmail.com
- **GitHub Repository**: [프로젝트 저장소 URL]
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📝 배포 완료 후 작업

- [ ] 베타 테스터 초대 이메일 발송
- [ ] 피드백 수집 채널 개설 (예: Google Form)
- [ ] 일일 모니터링 체크리스트 작성
- [ ] 버그 리포트 프로세스 정리

---

**마지막 업데이트**: 2025-10-30
**다음 배포 예정일**: TBD
