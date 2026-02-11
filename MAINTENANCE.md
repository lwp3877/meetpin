# MeetPin 유지보수 가이드

## 1. 프로젝트 실행

### 필수 환경
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 로컬 개발
```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 실행 (localhost:3001)
```

### 빌드 & 배포
```bash
pnpm build          # 프로덕션 빌드
pnpm start          # 프로덕션 서버 실행
```

### 품질 검증 (배포 전 반드시 실행)
```bash
pnpm repo:doctor    # typecheck + lint + build 한번에 실행
pnpm test           # 단위 테스트 (39/39)
```

---

## 2. 폴더 구조

```
meetpin/
├── src/
│   ├── app/                  # 페이지 & API (Next.js App Router)
│   │   ├── page.tsx          # 랜딩 페이지 (/)
│   │   ├── map/              # 메인 지도 페이지 (/map)
│   │   ├── room/             # 방 상세/생성/편집 (/room/[id], /room/new)
│   │   ├── chat/             # 1:1 채팅 (/chat/[matchId])
│   │   ├── auth/             # 로그인/회원가입 (/auth/login, /auth/signup)
│   │   ├── profile/          # 프로필 (/profile, /profile/[userId])
│   │   ├── requests/         # 내 요청 관리
│   │   ├── rooms/            # 방 목록
│   │   ├── admin/            # 관리자 패널
│   │   ├── settings/         # 알림/안전 설정
│   │   ├── legal/            # 약관/개인정보/위치정보
│   │   ├── help/             # 도움말
│   │   ├── contact/          # 문의
│   │   └── api/              # API 라우트 (아래 별도 설명)
│   │
│   ├── components/           # UI 컴포넌트
│   │   ├── auth/             # 소셜 로그인
│   │   ├── chat/             # 채팅 패널
│   │   ├── common/           # Providers, 봇스케줄러
│   │   ├── error/            # 에러 바운더리
│   │   ├── icons/            # 지도 아이콘
│   │   ├── landing/          # 랜딩 페이지
│   │   ├── map/              # 지도, 클러스터, 위치선택
│   │   ├── pwa/              # PWA 설치 프롬프트
│   │   ├── room/             # 방 폼
│   │   ├── safety/           # 긴급신고 버튼
│   │   └── ui/               # 공통 UI (Toast, Modal, Button 등)
│   │
│   ├── lib/                  # 비즈니스 로직 & 유틸리티
│   │   ├── api.ts            # API 응답 형식, 에러 처리, 미들웨어
│   │   ├── supabaseClient.ts # Supabase 클라이언트 (브라우저/서버/어드민)
│   │   ├── useAuth.tsx       # 인증 훅 (클라이언트)
│   │   ├── rateLimit.ts      # Rate limiting
│   │   ├── services/         # 외부 서비스 (auth, kakao, stripe)
│   │   ├── config/           # 기능 플래그, 환경설정, Mock 데이터
│   │   ├── cache/            # Redis 캐싱
│   │   ├── bot/              # 봇 방 생성/스케줄링
│   │   ├── payments/         # Stripe 결제
│   │   ├── security/         # 보안 강화
│   │   ├── observability/    # 로깅
│   │   ├── accessibility/    # 접근성
│   │   ├── design/           # 디자인 토큰
│   │   └── utils/            # 범용 유틸 (bbox, 검증, 브라우저호환)
│   │
│   ├── hooks/                # 커스텀 훅
│   └── types/                # 타입 정의 (global.d.ts)
│
├── public/                   # 정적 파일 (아이콘, manifest, sw.js)
├── scripts/                  # DB 마이그레이션 SQL
├── __tests__/                # Jest 단위 테스트
└── tests/                    # Playwright E2E 테스트
```

---

## 3. 자주 하는 작업

### 새 페이지 추가
1. `src/app/경로명/page.tsx` 파일 생성
2. `'use client'` 추가 (클라이언트 상호작용 필요 시)
3. 필요하면 `layout.tsx`, `loading.tsx`, `error.tsx`도 함께 생성

### API 라우트 추가
1. `src/app/api/경로명/route.ts` 파일 생성
2. 패턴 참고:
```typescript
import { NextRequest } from 'next/server'
import { createMethodRouter, apiUtils, getAuthenticatedUser } from '@/lib/api'

async function handleGet(request: NextRequest) {
  const user = await getAuthenticatedUser()
  // 로직...
  return apiUtils.success(data)
}

export const { GET } = createMethodRouter({ GET: handleGet })
```

### 새 컴포넌트 추가
1. `src/components/도메인/ComponentName.tsx` 파일 생성
2. 클라이언트 컴포넌트면 파일 최상단에 `'use client'` 추가

### 환경변수 추가
- **브라우저에서 접근 필요**: `NEXT_PUBLIC_` 접두어 필수 (예: `NEXT_PUBLIC_KAKAO_KEY`)
- **서버에서만 사용**: 접두어 없이 (예: `STRIPE_SECRET_KEY`)
- `.env.local` 파일에 추가하고, Vercel 대시보드에도 동일하게 설정

### DB 스키마 변경
1. `scripts/migrate.sql`에 ALTER TABLE 추가
2. 필요하면 `scripts/rls.sql`에 RLS 정책 추가
3. Supabase SQL Editor에서 직접 실행
4. `src/lib/supabaseClient.ts`의 Database 타입 업데이트

---

## 4. 핵심 패턴

### API 응답 형식
모든 API는 동일한 형식으로 응답:
```json
{ "ok": true, "data": {...}, "message": "..." }
{ "ok": false, "code": "ERROR_CODE", "message": "에러 메시지" }
```

### 인증
- **서버**: `getAuthenticatedUser()` 또는 `requireAdmin()`
- **클라이언트**: `useAuth()` 훅

### 토스트 알림
```typescript
import toast from 'react-hot-toast'
toast.success('성공!')
toast.error('실패!')
```

---

## 5. 주요 명령어 정리

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 (port 3001) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm typecheck` | 타입 검사 |
| `pnpm lint` | 코드 린트 |
| `pnpm test` | 단위 테스트 |
| `pnpm repo:doctor` | typecheck + lint + build |
| `pnpm e2e` | E2E 테스트 (Playwright) |
| `pnpm format` | 코드 포맷팅 |

---

## 6. 환경변수 목록

### 필수
| 변수 | 용도 | 위치 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 서버+클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 서버+클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 관리자 키 | 서버만 |
| `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 카카오 지도 API 키 | 클라이언트 |

### 선택
| 변수 | 용도 |
|------|------|
| `STRIPE_SECRET_KEY` | Stripe 결제 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 공개 키 |
| `STRIPE_WEBHOOK_SECRET` | Stripe 웹훅 검증 |
| `REDIS_URL` | Redis 캐시 |
| `SENTRY_DSN` | 에러 모니터링 |
| `NEXT_PUBLIC_USE_MOCK_DATA=true` | 개발 Mock 모드 활성화 |
