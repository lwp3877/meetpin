# 개발 환경 설정 가이드 (Development Setup Guide)

밋핀(MeetPin) 프로젝트를 로컬에서 실행하기 위한 개발 환경 설정 방법을 안내합니다.

---

## 📋 목차

1. [필수 사항 (Prerequisites)](#-필수-사항-prerequisites)
2. [프로젝트 설치](#-프로젝트-설치)
3. [환경 변수 설정](#-환경-변수-설정)
4. [Supabase 설정](#-supabase-설정)
5. [데이터베이스 마이그레이션](#-데이터베이스-마이그레이션)
6. [로컬 개발 서버 실행](#-로컬-개발-서버-실행)
7. [Stripe 결제 설정 (선택)](#-stripe-결제-설정-선택)
8. [Redis 캐싱 설정 (선택)](#-redis-캐싱-설정-선택)
9. [트러블슈팅](#-트러블슈팅)

---

## 🔧 필수 사항 (Prerequisites)

개발을 시작하기 전에 다음 도구들을 설치해주세요.

### 1. Node.js 설치

**버전**: Node.js 18.17 이상 (20 LTS 권장)

```bash
# Node.js 버전 확인
node -v  # v20.x.x 이상

# npm 버전 확인
npm -v   # 10.x.x 이상
```

- **다운로드**: [nodejs.org](https://nodejs.org/)
- **추천**: nvm(Node Version Manager) 사용

```bash
# nvm 설치 후
nvm install 20
nvm use 20
```

### 2. pnpm 설치

밋핀은 패키지 매니저로 `pnpm`을 사용합니다.

```bash
# npm을 사용하여 pnpm 설치
npm install -g pnpm

# pnpm 버전 확인
pnpm -v  # 8.x.x 이상
```

### 3. Git 설치

```bash
# Git 버전 확인
git --version  # 2.x.x 이상
```

- **다운로드**: [git-scm.com](https://git-scm.com/)

---

## 📦 프로젝트 설치

### 1. 저장소 클론

```bash
# HTTPS
git clone https://github.com/your-org/meetpin.git

# SSH (권장)
git clone git@github.com:your-org/meetpin.git

# 프로젝트 디렉토리 이동
cd meetpin
```

### 2. 의존성 설치

```bash
# pnpm을 사용하여 패키지 설치
pnpm install

# 설치 확인 (약 1-2분 소요)
# node_modules/ 폴더가 생성됩니다
```

---

## 🔐 환경 변수 설정

### 1. .env.local 파일 생성

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

### 2. 환경 변수 입력

`.env.local` 파일을 열어 다음 값들을 실제 값으로 교체하세요.

#### 필수 환경 변수

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 카카오맵 (필수)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key

# 앱 설정 (필수)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

#### 선택 환경 변수

```env
# Mock 모드 (개발용 - Supabase 없이 개발 가능)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Stripe 결제 (부스트 기능 사용 시)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis 캐싱 (성능 최적화)
REDIS_URL=redis://localhost:6379
# 또는 Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🗄️ Supabase 설정

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com/)에서 계정 생성
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전(Seoul) 선택
4. 프로젝트 생성 완료 대기 (1-2분)

### 2. API 키 복사

프로젝트 대시보드 → Settings → API

```
Project URL:          https://xxxxx.supabase.co
anon public key:      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

이 값들을 `.env.local`에 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 이메일 인증 설정 (선택)

프로젝트 대시보드 → Authentication → Providers

- **Email** 활성화
- **Confirm email** 비활성화 (개발 환경에서 편의성)

---

## 🛢️ 데이터베이스 마이그레이션

Supabase SQL 에디터에서 마이그레이션 스크립트를 순서대로 실행합니다.

### 1. SQL 에디터 접속

프로젝트 대시보드 → SQL Editor → New Query

### 2. 스크립트 실행 순서

#### Step 1: 테이블 생성 (`scripts/migrate.sql`)

```bash
# 로컬 파일 열기
cat scripts/migrate.sql
```

- SQL 에디터에 전체 내용을 복사/붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

**생성되는 테이블:**
- `profiles` - 사용자 프로필
- `rooms` - 모임
- `requests` - 참가 요청
- `matches` - 매칭
- `messages` - 채팅 메시지
- `host_messages` - 호스트 메시지
- `notifications` - 알림
- `reports` - 신고
- `blocked_users` - 차단

#### Step 2: RLS 정책 적용 (`scripts/rls.sql`)

```bash
# 로컬 파일 열기
cat scripts/rls.sql
```

- SQL 에디터에 전체 내용을 복사/붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

**적용되는 정책:**
- 사용자별 데이터 접근 제어
- 차단 사용자 간 데이터 격리
- 관리자 권한 분리

#### Step 3: 샘플 데이터 추가 (선택, `scripts/seed.sql`)

개발 환경에서 테스트용 샘플 데이터를 추가합니다.

```bash
# 로컬 파일 열기
cat scripts/seed.sql
```

- SQL 에디터에 전체 내용을 복사/붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

**추가되는 데이터:**
- 샘플 사용자 3명
- 샘플 모임 10개 (서울 지역)
- 샘플 참가 요청 및 매칭

---

## 🚀 로컬 개발 서버 실행

### 1. 개발 서버 시작

```bash
# 개발 서버 실행 (포트 3000)
pnpm dev

# 또는 다른 포트 사용
pnpm dev -- --port 3001
```

### 2. 브라우저 접속

```
http://localhost:3000
```

**기본 테스트 계정 (Mock 모드):**
- 이메일: `admin@meetpin.com`
- 비밀번호: `123456`

### 3. 개발 중 자동 재시작

- 파일 변경 시 자동으로 Hot Reload 됩니다
- TypeScript 에러는 브라우저 콘솔과 터미널에 표시됩니다

---

## 💳 Stripe 결제 설정 (선택)

부스트 기능을 테스트하려면 Stripe 계정이 필요합니다.

### 1. Stripe 계정 생성

1. [stripe.com](https://stripe.com/)에서 계정 생성
2. 테스트 모드로 시작

### 2. API 키 복사

Stripe Dashboard → Developers → API keys

```
Publishable key:  pk_test_...
Secret key:       sk_test_...
```

`.env.local`에 추가:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
```

### 3. 웹훅 설정 (로컬 테스트)

```bash
# Stripe CLI 설치
brew install stripe/stripe-cli/stripe  # macOS
# 또는 https://stripe.com/docs/stripe-cli

# Stripe CLI 로그인
stripe login

# 웹훅 포워딩 (별도 터미널)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Webhook Secret 복사
whsec_...
```

`.env.local`에 추가:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. 테스트 카드 번호

Stripe 테스트 모드에서 사용 가능한 카드:

```
카드 번호: 4242 4242 4242 4242
만료일:    12/34
CVC:       123
우편번호:   12345
```

---

## 🗂️ Redis 캐싱 설정 (선택)

Redis 캐싱은 선택사항입니다. 설정하지 않아도 앱이 정상 동작합니다.

### 옵션 1: 로컬 Redis 설치

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# https://redis.io/download 에서 설치
```

`.env.local`에 추가:

```env
REDIS_URL=redis://localhost:6379
```

### 옵션 2: Upstash Redis (권장)

무료 플랜으로 시작 가능:

1. [upstash.com](https://upstash.com/) 가입
2. "Create Database" 클릭
3. Region 선택 (Seoul 또는 가까운 지역)
4. REST API 정보 복사

```env
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🛠️ 트러블슈팅

### 문제 1: `pnpm install` 실패

**증상:**
```
ERR_PNPM_FETCH_404
```

**해결:**
```bash
# pnpm 캐시 정리
pnpm store prune

# 다시 설치
pnpm install
```

---

### 문제 2: 타입 에러 발생

**증상:**
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결:**
```bash
# TypeScript 서버 재시작 (VS Code)
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 또는 타입 체크 실행
pnpm typecheck
```

---

### 문제 3: Supabase 연결 실패

**증상:**
```
Error: Invalid JWT
```

**해결:**

1. `.env.local` 환경 변수 확인:
   ```bash
   # NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 확인
   cat .env.local | grep SUPABASE
   ```

2. Supabase 프로젝트가 활성 상태인지 확인 (대시보드)

3. Mock 모드 활성화 (임시):
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

---

### 문제 4: 포트 충돌 (Port already in use)

**증상:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결:**

```bash
# 포트 사용 중인 프로세스 종료
npx kill-port 3000

# 또는 다른 포트 사용
pnpm dev -- --port 3001
```

---

### 문제 5: 카카오맵 로드 실패

**증상:**
- 지도가 표시되지 않음
- Console에 "Kakao is not defined" 에러

**해결:**

1. `.env.local` 확인:
   ```env
   NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_key
   ```

2. 카카오 개발자 사이트에서 도메인 등록:
   - [developers.kakao.com](https://developers.kakao.com)
   - 내 애플리케이션 → 플랫폼 → Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000`

---

### 문제 6: Stripe 결제 페이지 열리지 않음

**증상:**
- "부스트하기" 클릭 시 아무 반응 없음

**해결:**

1. 환경 변수 확인:
   ```env
   NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Stripe API 키가 테스트 모드인지 확인 (sk_test_, pk_test_)

3. 브라우저 콘솔에서 에러 확인

---

### 문제 7: 빌드 실패

**증상:**
```
Error: Build failed
```

**해결:**

```bash
# Lint 및 타입 체크
pnpm lint
pnpm typecheck

# 문제 없으면 캐시 정리 후 다시 빌드
rm -rf .next
pnpm build
```

---

### 문제 8: Git 커밋 시 Husky 에러

**증상:**
```
husky - pre-commit hook exited with code 1
```

**해결:**

```bash
# Lint 에러 자동 수정
pnpm lint:fix

# 또는 커밋 메시지 규칙 확인 (docs/CONTRIBUTING.md)
git commit -m "feat(room): 모임 생성 기능 추가"
```

---

## 🧪 개발 환경 검증

모든 설정이 완료되었는지 확인하는 명령어:

```bash
# TypeScript 타입 체크
pnpm typecheck
# ✅ 예상: No errors

# Lint 체크
pnpm lint
# ✅ 예상: No warnings

# 빌드 테스트
pnpm build
# ✅ 예상: Build completed successfully

# 단위 테스트
pnpm test
# ✅ 예상: 60/60 tests passing
```

모두 통과하면 개발 환경 설정 완료! 🎉

---

## 📚 다음 단계

1. **프로젝트 구조 이해**: [STRUCTURE.md](./STRUCTURE.md) 읽기
2. **기여 가이드 확인**: [CONTRIBUTING.md](./CONTRIBUTING.md) 읽기
3. **첫 번째 이슈 선택**: GitHub Issues에서 `good first issue` 태그 찾기
4. **개발 시작**: 새로운 브랜치 생성 후 작업 시작

---

## 📞 도움이 필요하신가요?

- **이슈 등록**: [GitHub Issues](https://github.com/your-org/meetpin/issues)
- **팀 채팅**: Slack/Discord 채널
- **이메일**: dev@meetpin.com

---

## 🔗 추가 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 가이드](https://supabase.com/docs/guides/getting-started)
- [Stripe 테스트 가이드](https://stripe.com/docs/testing)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**최종 업데이트**: 2025-10-01
**문서 버전**: 1.0.0
**테스트 환경**: Node.js 20.x, pnpm 8.x
