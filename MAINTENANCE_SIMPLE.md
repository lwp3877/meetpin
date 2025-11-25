# 🛠️ 밋핀 초보자 유지보수 가이드

> 프로그래밍 경험이 적어도 쉽게 따라할 수 있는 완전 초보자용 가이드

---

## 📖 목차

1. [일상적인 유지보수](#일상적인-유지보수)
2. [문제 발생 시 대처법](#문제-발생-시-대처법)
3. [코드 수정 가이드](#코드-수정-가이드)
4. [절대 하지 말아야 할 것](#절대-하지-말아야-할-것)
5. [도움 요청 방법](#도움-요청-방법)

---

## 1. 일상적인 유지보수

### ✅ 매일 해야 할 것

#### 1.1 서버 상태 확인

```bash
# 브라우저에서 접속
https://meetpin-weld.vercel.app/api/health
```

**정상 응답 예시**:
```json
{
  "status": "ok",
  "database": "connected",
  "auth": "working"
}
```

#### 1.2 로그 확인

```bash
# Vercel 대시보드에서 로그 확인
1. https://vercel.com 접속
2. meetpin 프로젝트 선택
3. "Logs" 탭 클릭
4. 최근 1시간 에러 확인
```

### ✅ 매주 해야 할 것

#### 1.3 의존성 업데이트 확인

```bash
# 프로젝트 폴더에서 실행
pnpm outdated

# 보안 취약점 확인
pnpm audit

# 문제 발견 시
pnpm audit fix
```

### ✅ 매월 해야 할 것

#### 1.4 백업 확인

```bash
# Supabase 대시보드에서
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. "Database" → "Backups" 확인
4. 최근 백업이 있는지 확인
```

---

## 2. 문제 발생 시 대처법

### 🚨 사이트가 안 열릴 때

**1단계: 서버 상태 확인**
```bash
# Vercel 대시보드에서
1. Deployments 탭 확인
2. 최신 배포 상태 확인
3. 에러 로그 확인
```

**2단계: 롤백**
```bash
# Vercel에서 이전 버전으로 복구
1. "Deployments" 탭
2. 정상 작동하던 배포 찾기
3. 우측 "⋯" 클릭
4. "Promote to Production" 선택
```

### 🐛 버그 발견 시

**1단계: 버그 재현**
```bash
1. 어떤 페이지에서 발생했나?
2. 어떤 동작을 했을 때?
3. 에러 메시지는?
4. 스크린샷 캡처
```

**2단계: 이슈 생성**
```bash
# GitHub에서
1. Issues 탭 클릭
2. "New Issue" 클릭
3. 템플릿 작성:
   - 제목: [버그] 간단한 설명
   - 내용: 재현 방법, 스크린샷, 에러 메시지
```

### ⚠️ 성능 저하 시

**1단계: 성능 측정**
```bash
# Lighthouse로 측정
1. Chrome에서 F12 누르기
2. "Lighthouse" 탭 선택
3. "Generate report" 클릭
4. Performance 점수 확인 (70점 이상이 정상)
```

**2단계: 병목 지점 확인**
```bash
# Vercel Analytics에서
1. Vercel 대시보드 → Analytics
2. "Speed Insights" 확인
3. 느린 페이지 확인
```

---

## 3. 코드 수정 가이드

### 📝 간단한 텍스트 수정

#### 예시: 버튼 텍스트 변경

**파일 위치**: `src/components/ui/button.tsx`

```typescript
// ❌ 잘못된 방법
<button>클릭</button>  // 직접 수정하지 마세요

// ✅ 올바른 방법
1. 해당 파일 찾기
2. VSCode에서 열기
3. Ctrl+F로 "클릭" 검색
4. 원하는 텍스트로 변경
5. Ctrl+S로 저장
6. pnpm dev로 확인
```

#### 예시: 색상 변경

**파일 위치**: `src/lib/config/brand.ts`

```typescript
// 변경 전
export const brandColors = {
  primary: '#10B981',  // 녹색
}

// 변경 후
export const brandColors = {
  primary: '#3B82F6',  // 파란색으로 변경
}
```

**저장 후**:
```bash
pnpm dev  # 개발 서버 재시작
```

### 🖼️ 이미지 변경

```bash
# 1. 이미지 준비
- 형식: JPG, PNG, WebP
- 크기: 1MB 이하 권장
- 이름: 영문, 숫자, 하이픈만 사용

# 2. 이미지 배치
public/images/new-image.png

# 3. 코드에서 사용
<Image src="/images/new-image.png" alt="설명" width={500} height={300} />
```

---

## 4. 절대 하지 말아야 할 것

### ❌ 금지 사항

| 행동 | 이유 | 대안 |
|------|------|------|
| `.env` 파일을 Git에 커밋 | 보안 키 노출 | `.env.local` 사용, `.gitignore` 확인 |
| `node_modules/` 폴더 수정 | 업데이트 시 사라짐 | `package.json`에서 버전 관리 |
| 프로덕션 DB 직접 수정 | 데이터 손실 위험 | 마이그레이션 스크립트 사용 |
| Service Role Key 노출 | 전체 DB 접근 가능 | 환경변수로만 관리 |
| main 브랜치에 직접 push | 배포 중단 위험 | feature 브랜치 → PR → merge |

### ⚠️ 주의 사항

```bash
# 위험한 명령어 (실행 전 확인!)
rm -rf node_modules    # 패키지 삭제 (재설치 필요)
git push --force       # 기존 커밋 덮어쓰기 (팀원 영향)
pnpm build             # 5분+ 소요 (로컬에서만)

# 안전한 명령어
pnpm dev               # 개발 서버 (언제든 중단 가능)
pnpm typecheck         # 타입 검사 (코드 변경 없음)
pnpm lint              # 린트 검사 (코드 변경 없음)
```

---

## 5. 도움 요청 방법

### 📧 연락처

```bash
# 긴급 문제 (사이트 다운, 보안 이슈)
- Slack: #meetpin-emergency
- 전화: 010-XXXX-XXXX (관리자)

# 일반 질문 (버그, 기능 요청)
- GitHub Issues: https://github.com/YOUR_REPO/issues
- 이메일: dev@meetpin.com

# 기술 지원 (코드 리뷰, 배포 도움)
- Slack: #meetpin-dev
- 회의 요청: Google Calendar
```

### 📝 이슈 작성 템플릿

```markdown
## 문제 설명
간단하게 무엇이 문제인지 작성

## 재현 방법
1. xxx 페이지에 접속
2. xxx 버튼 클릭
3. xxx 에러 발생

## 예상 동작
원래 이렇게 동작해야 함

## 실제 동작
실제로는 이렇게 동작함

## 스크린샷
(있으면 첨부)

## 환경
- 브라우저: Chrome 120
- OS: Windows 11
- 날짜: 2025-01-26 14:30
```

---

## 6. 빠른 참조 (Cheat Sheet)

### 🚀 자주 쓰는 명령어

```bash
# 개발 시작
pnpm dev

# 코드 검사
pnpm typecheck  # TypeScript 검사
pnpm lint       # ESLint 검사

# 테스트
pnpm test       # 단위 테스트
pnpm e2e        # E2E 테스트

# 문제 해결
pnpm install                     # 패키지 재설치
npx kill-port 3001               # 포트 충돌 해결
rm -rf .next && pnpm dev         # 캐시 초기화
```

### 📁 주요 파일 위치

| 수정 목적 | 파일 위치 |
|----------|----------|
| 메인 페이지 | `src/app/page.tsx` |
| 지도 페이지 | `src/app/map/page.tsx` |
| 색상/브랜드 | `src/lib/config/brand.ts` |
| Mock 데이터 | `src/lib/config/mockData.ts` |
| API 설정 | `src/lib/api.ts` |
| 환경변수 | `.env.local` (절대 커밋 금지!) |

### 🔗 유용한 링크

- **Vercel 대시보드**: https://vercel.com/dashboard
- **Supabase 대시보드**: https://supabase.com/dashboard
- **Kakao Developers**: https://developers.kakao.com
- **Stripe 대시보드**: https://dashboard.stripe.com
- **GitHub 저장소**: https://github.com/YOUR_REPO/meetpin

---

## 7. 체크리스트

### ✅ 배포 전 체크리스트

```bash
- [ ] pnpm typecheck 통과
- [ ] pnpm lint 통과
- [ ] pnpm test 통과
- [ ] 로컬에서 pnpm build 성공
- [ ] .env 파일 확인 (커밋되지 않았는지)
- [ ] 변경사항 테스트 완료
- [ ] PR 리뷰 승인 받음
```

### ✅ 월간 유지보수 체크리스트

```bash
- [ ] 의존성 업데이트 (pnpm outdated)
- [ ] 보안 취약점 확인 (pnpm audit)
- [ ] Supabase 백업 확인
- [ ] Vercel 로그 검토
- [ ] 성능 측정 (Lighthouse)
- [ ] 에러율 확인 (< 5%)
- [ ] 사용자 피드백 검토
```

---

## 🆘 긴급 상황 대응

### 🚨 사이트가 완전히 다운된 경우

```bash
1. 즉시 관리자에게 연락
2. Vercel에서 이전 버전으로 롤백
3. GitHub에서 마지막 정상 커밋 확인
4. 문제 원인 파악 후 이슈 생성
```

### 🔐 보안 문제 발견 시

```bash
1. 즉시 해당 기능 비활성화
2. 보안팀에 비공개로 연락
3. 사용자에게 공지 (필요시)
4. 문제 해결 후 업데이트
```

---

**💡 팁**: 이 가이드를 북마크하고, 문제 발생 시 가장 먼저 참고하세요!

**📞 긴급 연락처**: dev@meetpin.com | Slack: #meetpin-emergency
