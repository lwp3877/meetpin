# 🚨 긴급 보안 조치 필요

## 발견된 심각한 보안 취약점

다음 파일들에 **Supabase Service Role Key**가 하드코딩되어 있습니다:

- ❌ `scripts/apply-rls-fix.mjs`
- ❌ `scripts/fix-room-times.mjs`
- ❌ `scripts/create-sample-data.mjs`
- ❌ `scripts/check-production-db.mjs`

**이 파일들이 Git에 커밋되어 GitHub에 push 되었습니다!**

---

## 즉시 실행해야 할 조치사항

### 1단계: Supabase Service Role Key 재발급 (최우선)

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. Settings → API → Service role 섹션
4. **"Reset key"** 클릭하여 키 재발급
5. 새 키를 안전한 곳에 저장 (환경변수 또는 비밀 관리 도구)

### 2단계: 환경변수 설정

#### `.env.local` 파일 생성 (절대 Git에 커밋하지 말 것)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xnrqfkecpabucnoxxtwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=여기에_새로_발급받은_키를_입력

# 다른 환경변수들...
```

#### `.gitignore` 확인

다음 항목이 포함되어 있는지 확인:

```
.env.local
.env*.local
.env.production.local
```

### 3단계: Git 히스토리에서 키 제거 (선택적, 하지만 권장)

⚠️ **경고: 이 작업은 모든 협업자에게 영향을 줍니다!**

```bash
# git-filter-repo 설치 (한 번만 실행)
pip install git-filter-repo

# 민감한 파일 제거
git filter-repo --path scripts/apply-rls-fix.mjs --invert-paths
git filter-repo --path scripts/fix-room-times.mjs --invert-paths
git filter-repo --path scripts/create-sample-data.mjs --invert-paths
git filter-repo --path scripts/check-production-db.mjs --invert-paths

# Force push (팀원들과 조율 필요)
git push origin --force --all
```

**더 간단한 방법**: GitHub에서 저장소를 Private으로 전환

### 4단계: 안전한 스크립트 사용

기존 파일들을 삭제하고 안전한 버전 사용:

```bash
# 위험한 파일 삭제
rm scripts/apply-rls-fix.mjs
rm scripts/fix-room-times.mjs

# 안전한 버전 사용 (환경변수 기반)
node scripts/apply-rls-fix-SAFE.mjs
node scripts/fix-room-times-SAFE.mjs
```

---

## 앞으로 절대 하지 말아야 할 것

❌ **절대 금지**:
- API 키, 비밀번호, 토큰을 코드에 직접 작성
- `.env` 파일을 Git에 커밋
- Supabase Service Role Key를 클라이언트 코드에서 사용
- 프로덕션 키를 테스트 코드에 하드코딩

✅ **올바른 방법**:
- 모든 민감한 정보는 환경변수로 관리
- `.env.local` 파일 사용 (`.gitignore`에 포함)
- Vercel/Netlify 등 배포 플랫폼의 환경변수 UI 사용
- GitHub Secrets 사용 (CI/CD)

---

## 보안 체크리스트

- [ ] Supabase Service Role Key 재발급 완료
- [ ] 환경변수 파일 (`.env.local`) 생성 및 `.gitignore` 확인
- [ ] 위험한 스크립트 파일 삭제
- [ ] 안전한 스크립트로 교체
- [ ] 팀원들에게 공지
- [ ] (선택) Git 히스토리 정리 또는 저장소 Private 전환

---

## 추가 보안 권장사항

1. **GitHub Secret Scanning 활성화**
   - GitHub Settings → Security → Secret scanning

2. **2FA (Two-Factor Authentication) 활성화**
   - Supabase, GitHub, Vercel 모두

3. **정기적인 키 로테이션**
   - 3개월마다 Service Role Key 재발급

4. **보안 감사 자동화**
   - `pnpm audit:security` 정기 실행
   - Dependabot 활성화

---

**이 문서를 읽은 후 즉시 조치하세요. 시간이 지날수록 위험도가 증가합니다!**
