# 👋 MeetPin 개발자 온보딩 가이드

> **환영합니다!** 이 가이드는 MeetPin 프로젝트에 새로 합류한 개발자를 위한 완전한 설정 및 개발 가이드입니다.

## 🎯 프로젝트 개요

**MeetPin**은 위치 기반 소셜 모임 플랫폼입니다. 사용자들이 지도에서 실시간으로 모임을 만들고, 주변 사람들과 연결될 수 있는 서비스입니다.

### **핵심 기능**

- 📍 지도 기반 실시간 모임 생성/참여
- 💬 실시간 채팅 및 알림 시스템
- 💰 Stripe 기반 부스트 결제 시스템
- 🔐 Supabase 인증 및 데이터베이스
- 📱 모바일 우선 반응형 디자인

### **기술 스택**

```
Frontend: Next.js 15 + TypeScript + Tailwind CSS v4 + React 19
Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
Payment: Stripe Checkout & Webhooks
Maps: Kakao Maps API
State: React Query (@tanstack/react-query)
UI: shadcn/ui + Lucide Icons
Testing: Jest + Playwright + React Testing Library
```

## 🛠️ 개발 환경 설정

### **1단계: 필수 도구 설치**

```bash
# Node.js (v18+ 권장)
# https://nodejs.org/에서 LTS 버전 다운로드

# pnpm 패키지 매니저
npm install -g pnpm

# Git
# https://git-scm.com/downloads

# VS Code (권장 에디터)
# https://code.visualstudio.com/
```

### **2단계: 프로젝트 클론 및 설치**

```bash
# 1. 저장소 클론
git clone [repository-url]
cd meetpin

# 2. 의존성 설치
pnpm install

# 3. Playwright 브라우저 설치 (E2E 테스트용)
pnpm playwright install

# 4. 환경변수 파일 생성
cp .env.example .env.local
```

### **3단계: 환경변수 설정**

**개발용 .env.local 파일 설정:**

```bash
# ===========================================
# 🚨 개발 모드 설정 (Mock 데이터 사용)
# ===========================================
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK_DATA=true

# ===========================================
# 📍 Supabase 설정 (선택사항 - Mock 모드에서는 불필요)
# ===========================================
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===========================================
# 🗺️ Kakao Maps API (선택사항)
# ===========================================
# NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-key

# ===========================================
# 💳 Stripe 설정 (선택사항 - Mock 결제 사용)
# ===========================================
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ===========================================
# 🔧 기타 설정
# ===========================================
SITE_URL=http://localhost:3000
```

### **4단계: 개발 서버 실행**

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 접속
# http://localhost:3000
```

## 🧪 테스트 및 품질 관리

### **코드 품질 명령어**

```bash
# TypeScript 타입 검사
pnpm typecheck

# ESLint 린팅
pnpm lint
pnpm lint:fix

# 코드 포맷팅
pnpm format
pnpm format:check

# 전체 품질 검사 (권장)
pnpm repo:doctor
```

### **테스트 실행**

```bash
# 단위 테스트 (Jest)
pnpm test
pnpm test:watch

# E2E 테스트 (Playwright)
pnpm e2e
pnpm e2e:ui

# 테스트 커버리지
pnpm test --coverage
```

### **빌드 및 배포**

```bash
# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm start

# 빌드 + 미리보기
pnpm preview
```

## 📁 프로젝트 구조

```
meetpin/
├── 📁 src/
│   ├── 📁 app/                    # Next.js 15 App Router 페이지
│   │   ├── 📁 api/               # API 라우트 (백엔드)
│   │   ├── 📁 map/               # 메인 지도 페이지
│   │   ├── 📁 auth/              # 인증 페이지
│   │   └── 📁 room/              # 방 관련 페이지
│   ├── 📁 components/            # React 컴포넌트
│   │   ├── 📁 ui/                # shadcn/ui 컴포넌트
│   │   ├── 📁 map/               # 지도 관련 컴포넌트
│   │   └── 📁 common/            # 공통 컴포넌트
│   ├── 📁 hooks/                 # Custom React Hooks
│   ├── 📁 lib/                   # 유틸리티 및 설정
│   │   ├── 📁 config/            # 설정 파일들
│   │   ├── 📁 services/          # 외부 서비스 연동
│   │   └── 📁 utils/             # 유틸리티 함수들
│   └── 📁 types/                 # TypeScript 타입 정의
├── 📁 __tests__/                 # Jest 단위 테스트
├── 📁 e2e/                       # Playwright E2E 테스트
├── 📁 scripts/                   # 데이터베이스 스크립트
├── 📁 docs/                      # 프로젝트 문서
└── 📁 public/                    # 정적 파일
```

## 🔑 핵심 개념 이해

### **Mock 개발 모드**

MeetPin은 외부 서비스 없이도 개발할 수 있도록 Mock 데이터 시스템을 제공합니다.

```typescript
// Mock 모드 활성화 시 (NEXT_PUBLIC_USE_MOCK_DATA=true)
- 가상의 사용자 데이터 (admin@meetpin.com / 123456)
- 서울 지역 기준 샘플 모임 데이터 (48개)
- 실시간 기능의 시뮬레이션
- Stripe 결제의 Mock 처리
```

### **인증 시스템**

```typescript
// 개발 모드 로그인
이메일: admin@meetpin.com
비밀번호: 123456

// useAuth 훅 사용
const { user, login, logout, signup } = useAuth()
```

### **API 패턴**

모든 API 라우트는 일관된 응답 형식을 사용합니다:

```typescript
interface ApiResponse<T> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}

// 예시 사용
const response = await fetch('/api/rooms')
const { ok, data, message } = await response.json()
```

### **상태 관리**

React Query를 사용한 서버 상태 관리:

```typescript
// Query 사용 예시
const { data: rooms, isLoading } = useQuery({
  queryKey: ['rooms', bbox],
  queryFn: () => fetchRooms(bbox),
})

// Mutation 사용 예시
const createRoomMutation = useMutation({
  mutationFn: createRoom,
  onSuccess: () => queryClient.invalidateQueries(['rooms']),
})
```

## 🎨 UI 개발 가이드

### **디자인 시스템**

```typescript
// 브랜드 컬러 (src/lib/config/brand.ts)
- Primary: #10B981 (메인 그린)
- Boost: #F59E0B (부스트 오렌지)
- Accent: #F97316 (강조 오렌지)

// 카테고리 배지
- 술🍻: #E11D48
- 운동💪: #3B82F6
- 기타✨: #8B5CF6
```

### **컴포넌트 사용법**

```tsx
// shadcn/ui 컴포넌트
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 브랜드 유틸리티
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/utils'

// 사용 예시
;<Button className={cn('w-full', className)}>클릭하세요</Button>
```

### **반응형 디자인**

```css
/* Tailwind CSS 브레이크포인트 */
sm: 640px   /* 모바일 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크탑 */
xl: 1280px  /* 대형 화면 */

/* 모바일 우선 접근법 */
<div className="w-full md:w-1/2 lg:w-1/3">
```

## 🗄️ 데이터베이스 이해

### **핵심 테이블 구조**

```sql
-- 사용자 프로필
profiles (id, nickname, age_range, avatar_url)

-- 모임 방
rooms (id, title, location, max_people, boost_until)

-- 참가 요청
requests (id, room_id, user_id, status)

-- 매칭 (승인된 요청)
matches (id, room_id, host_id, participant_id)

-- 실시간 메시지
messages (id, match_id, sender_id, text, created_at)
```

### **Row Level Security (RLS)**

모든 테이블에 RLS 정책이 적용되어 있어 데이터 보안이 자동으로 처리됩니다.

```sql
-- 예시: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

## 🔧 개발 워크플로우

### **브랜치 전략**

```bash
main        # 프로덕션 브랜치
develop     # 개발 브랜치
feature/*   # 기능 브랜치
fix/*       # 버그 수정 브랜치
```

### **커밋 메시지 규칙**

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 과정 또는 보조 도구 변경

# 예시
git commit -m "feat: 실시간 채팅 기능 구현

- useRealtimeChat 훅 추가
- Supabase Realtime 연동
- 타이핑 인디케이터 구현"
```

### **코드 리뷰 체크리스트**

- [ ] TypeScript 타입 안전성
- [ ] ESLint 규칙 준수
- [ ] 테스트 커버리지 유지
- [ ] 성능 최적화 고려
- [ ] 접근성(a11y) 고려
- [ ] 모바일 반응형 확인

## 🚨 문제 해결 가이드

### **자주 발생하는 문제들**

#### 1. 개발 서버가 시작되지 않음

```bash
# 해결책
rm -rf .next node_modules
pnpm install
pnpm dev
```

#### 2. 환경변수 인식 안됨

```bash
# 해결책: .env.local 파일 재확인
cat .env.local
pnpm dev
```

#### 3. 타입스크립트 에러

```bash
# 해결책: 타입 검사 실행
pnpm typecheck
# 에러 위치 확인 후 수정
```

#### 4. Mock 데이터가 보이지 않음

```bash
# 해결책: Mock 모드 확인
echo $NEXT_PUBLIC_USE_MOCK_DATA
# true가 아니면 .env.local에서 설정
```

#### 5. 포트 충돌

```bash
# 해결책: 다른 포트 사용
pnpm dev --port 3001
# 또는 기존 프로세스 종료
npx kill-port 3000
```

## 📚 학습 리소스

### **필수 기술 문서**

- [Next.js 15 문서](https://nextjs.org/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase 가이드](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)

### **내부 문서**

- `CLAUDE.md` - 전체 프로젝트 아키텍처
- `docs/SECURITY_GUIDE.md` - 보안 가이드
- `docs/FINAL_DEPLOY_GUIDE.md` - 배포 가이드

### **유용한 VS Code 확장**

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "orta.vscode-jest"
  ]
}
```

## 🎯 첫 번째 작업 추천

새로운 개발자가 프로젝트에 익숙해지기 위한 단계별 작업:

### **1주차: 환경 설정 및 이해**

- [ ] 개발 환경 설정 완료
- [ ] Mock 모드로 전체 기능 탐색
- [ ] 코드베이스 구조 파악
- [ ] 테스트 실행해보기

### **2주차: 작은 기능 구현**

- [ ] 새로운 UI 컴포넌트 추가
- [ ] 기존 컴포넌트 개선
- [ ] 단위 테스트 작성
- [ ] 문서 개선

### **3주차: 핵심 기능 작업**

- [ ] API 라우트 추가/수정
- [ ] 데이터베이스 스키마 이해
- [ ] 실시간 기능 구현
- [ ] E2E 테스트 작성

## 💬 소통 및 지원

### **도움이 필요할 때**

1. **코드 관련**: 팀 리드 또는 시니어 개발자에게 문의
2. **환경 설정**: DevOps 팀에 문의
3. **디자인**: 디자인 팀과 협업
4. **기획**: 기획팀과 요구사항 확인

### **개발 팁**

- 작은 단위로 자주 커밋하세요
- 테스트를 먼저 작성하는 TDD 접근을 권장합니다
- 코드 리뷰를 적극적으로 활용하세요
- 문서화를 습관화하세요

---

## 🎉 환영합니다!

**MeetPin 팀에 합류해 주셔서 감사합니다!**

이 가이드를 따라 설정을 완료하고, 궁금한 점이 있으면 언제든 팀에 문의해 주세요. 함께 멋진 제품을 만들어 갑시다! 🚀

> 이 문서는 지속적으로 업데이트됩니다. 개선 제안이나 질문이 있으면 언제든 공유해 주세요.
