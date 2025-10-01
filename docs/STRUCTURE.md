# 프로젝트 구조 (Project Structure)

밋핀(MeetPin) 프로젝트의 폴더 구조와 각 파일의 역할을 설명합니다.

## 📁 전체 구조 개요

```
meetpin/
├── src/                      # 소스 코드 루트
│   ├── app/                  # Next.js 15 App Router 페이지
│   ├── components/           # React 컴포넌트
│   ├── hooks/                # 커스텀 React 훅
│   ├── lib/                  # 유틸리티, 서비스, 비즈니스 로직
│   └── types/                # TypeScript 타입 정의
├── public/                   # 정적 파일 (이미지, 폰트 등)
├── scripts/                  # 데이터베이스 마이그레이션 SQL
├── tests/                    # 테스트 파일
├── analysis/                 # 리팩토링 분석 문서
└── docs/                     # 프로젝트 문서
```

---

## 📂 src/app/ - Next.js 페이지 라우팅

Next.js 15 App Router 아키텍처를 사용합니다. 각 폴더가 URL 경로가 됩니다.

### 주요 페이지

```
app/
├── page.tsx                  # 랜딩 페이지 (/) - 서비스 소개
├── layout.tsx                # 전역 레이아웃 (메타데이터, 폰트, Providers)
├── globals.css               # 전역 CSS 스타일
│
├── map/                      # 메인 앱 화면 (/map)
│   └── page.tsx              # 지도 기반 모임 탐색 화면
│
├── room/                     # 모임 관련 페이지
│   ├── new/                  # 모임 생성 (/room/new)
│   └── [id]/                 # 모임 상세 (/room/:id)
│
├── chat/                     # 채팅 페이지
│   └── [matchId]/            # 1:1 매칭 채팅 (/chat/:matchId)
│
├── profile/                  # 프로필 페이지
│   └── page.tsx              # 내 프로필 보기/수정 (/profile)
│
├── admin/                    # 관리자 페이지
│   ├── page.tsx              # 관리자 대시보드 (/admin)
│   ├── reports/              # 신고 관리
│   └── users/                # 사용자 관리
│
├── legal/                    # 법적 문서
│   ├── terms/                # 이용약관
│   ├── privacy/              # 개인정보처리방침
│   └── location/             # 위치기반서비스 이용약관
│
└── api/                      # API 라우트 (서버리스 함수)
    ├── auth/                 # 인증 API
    ├── rooms/                # 모임 CRUD API
    ├── requests/             # 참가 요청 API
    ├── matches/              # 매칭 API
    ├── messages/             # 채팅 메시지 API
    ├── profile/              # 프로필 API
    ├── reports/              # 신고 API
    ├── stripe/               # Stripe 결제 API
    ├── health/               # 헬스체크 API
    ├── cache/                # 캐시 관리 API
    └── telemetry/            # 텔레메트리 API
```

### API 라우트 패턴

모든 API는 일관된 응답 형식을 사용합니다:

```typescript
interface ApiResponse<T> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}
```

---

## 🧩 src/components/ - React 컴포넌트

재사용 가능한 UI 컴포넌트들을 기능별로 분류했습니다.

```
components/
├── auth/                     # 인증 관련 컴포넌트
│   ├── SignupForm.tsx        # 회원가입 폼
│   ├── LoginForm.tsx         # 로그인 폼
│   └── AuthGuard.tsx         # 인증 보호 래퍼
│
├── chat/                     # 채팅 컴포넌트
│   ├── ChatRoom.tsx          # 채팅방 UI
│   ├── MessageList.tsx       # 메시지 목록
│   └── MessageInput.tsx      # 메시지 입력창
│
├── common/                   # 공통 컴포넌트
│   ├── Providers.tsx         # React Query, Toast 등 Provider 모음
│   ├── Header.tsx            # 전역 헤더
│   ├── Footer.tsx            # 전역 푸터
│   └── ImageUploader.tsx     # 이미지 업로드 컴포넌트
│
├── error/                    # 에러 처리 컴포넌트
│   ├── ErrorBoundary.tsx     # React Error Boundary
│   └── ErrorFallback.tsx     # 에러 폴백 UI
│
├── icons/                    # 커스텀 아이콘 컴포넌트
│   ├── MapPinIcon.tsx        # 지도 핀 아이콘
│   └── CategoryIcons.tsx     # 카테고리 아이콘
│
├── landing/                  # 랜딩 페이지 전용 컴포넌트
│   ├── HeroSection.tsx       # 히어로 섹션
│   ├── FeaturesSection.tsx   # 기능 소개 섹션
│   └── CTASection.tsx        # Call-to-Action 섹션
│
├── layout/                   # 레이아웃 컴포넌트
│   ├── MainLayout.tsx        # 메인 레이아웃 래퍼
│   └── Sidebar.tsx           # 사이드바
│
├── map/                      # 지도 관련 컴포넌트
│   ├── MapWithCluster.tsx    # 클러스터링 지도 (메인)
│   ├── LocationPicker.tsx    # 위치 선택 컴포넌트
│   ├── RoomMarker.tsx        # 모임 마커
│   └── ClusterMarker.tsx     # 클러스터 마커
│
├── mobile/                   # 모바일 전용 컴포넌트
│   └── mobile-optimized-layout.tsx  # 모바일 최적화 레이아웃
│
├── premium/                  # 프리미엄 디자인 컴포넌트
│   └── enhanced-landing.tsx  # 프리미엄 랜딩 페이지
│
├── room/                     # 모임 관련 컴포넌트
│   ├── RoomCard.tsx          # 모임 카드 (목록용)
│   ├── RoomDetail.tsx        # 모임 상세 정보
│   ├── RoomForm.tsx          # 모임 생성/수정 폼
│   ├── JoinRequestButton.tsx # 참가 요청 버튼
│   └── ParticipantsList.tsx  # 참가자 목록
│
└── ui/                       # shadcn/ui 기반 기본 UI 컴포넌트
    ├── button.tsx            # 기본 버튼
    ├── input.tsx             # 기본 인풋
    ├── card.tsx              # 기본 카드
    ├── dialog.tsx            # 다이얼로그/모달
    ├── dropdown-menu.tsx     # 드롭다운 메뉴
    ├── select.tsx            # 셀렉트 박스
    ├── textarea.tsx          # 텍스트 영역
    ├── badge.tsx             # 배지
    ├── avatar.tsx            # 아바타
    ├── skeleton.tsx          # 스켈레톤 로더
    ├── toast.tsx             # 토스트 알림
    ├── EnhancedButton.tsx    # 고급 기능 버튼
    ├── premium-button.tsx    # 프리미엄 디자인 버튼
    ├── premium-card.tsx      # 프리미엄 카드
    ├── BoostModal.tsx        # 부스트 결제 모달
    ├── ProfileModal.tsx      # 프로필 상세 모달
    └── RealtimeChatModal.tsx # 실시간 채팅 모달
```

### 컴포넌트 네이밍 규칙

- **PascalCase**: 모든 컴포넌트 파일 (예: `RoomCard.tsx`)
- **기본 UI**: `ui/` 폴더는 shadcn/ui 기반 재사용 컴포넌트
- **기능별 분류**: 도메인별로 폴더 구분 (auth, chat, room 등)

---

## 🪝 src/hooks/ - 커스텀 React 훅

재사용 가능한 비즈니스 로직을 담은 커스텀 훅입니다.

```
hooks/
├── useRealtimeChat.ts              # 실시간 채팅 훅 (Supabase Realtime)
├── useRealtimeNotifications.ts     # 실시간 알림 훅
└── useKeyboardNavigation.ts        # 키보드 네비게이션 훅 (접근성)
```

### 주요 훅 설명

- **useRealtimeChat**: Supabase Realtime을 사용한 1:1 채팅, 타이핑 인디케이터, 온라인 상태
- **useRealtimeNotifications**: 실시간 알림 구독, 읽음 처리, Browser Push 연동
- **useKeyboardNavigation**: 접근성을 위한 키보드 단축키 지원

---

## 📚 src/lib/ - 핵심 비즈니스 로직

유틸리티, 서비스, API 클라이언트, 설정 등 핵심 로직이 모여있습니다.

```
lib/
├── accessibility/            # 접근성 관련 유틸리티
│   └── a11yEnhancement.ts    # WCAG 2.1 AA 준수 접근성 향상
│
├── bot/                      # 봇 시스템
│   ├── bot-scheduler.ts      # 봇 방 자동 생성 및 관리
│   └── smart-room-generator.ts # 스마트 봇 방 생성 로직
│
├── cache/                    # 캐싱 시스템
│   └── redis.ts              # Redis/Upstash 분산 캐싱
│
├── config/                   # 설정 파일
│   ├── koreanAvatars.ts      # 한국 사용자용 아바타 목록
│   └── siteConfig.ts         # 사이트 전역 설정
│
├── design/                   # 디자인 시스템
│   ├── brand.ts              # 브랜드 컬러, 메시지
│   └── theme.ts              # 테마 설정
│
├── observability/            # 관찰 가능성
│   ├── logger.ts             # 구조화 로깅 (PII 스크러빙)
│   └── telemetry.ts          # 텔레메트리 수집
│
├── payments/                 # 결제 시스템
│   ├── stripe.ts             # Stripe 클라이언트
│   └── boost.ts              # 부스트 결제 로직
│
├── security/                 # 보안 유틸리티
│   ├── csp.ts                # Content Security Policy
│   ├── validation.ts         # 입력 검증
│   └── sanitize.ts           # XSS 방지 새니타이징
│
├── services/                 # 비즈니스 서비스
│   ├── auth.ts               # 인증 서비스 (서버)
│   ├── authService.ts        # 인증 서비스 (클라이언트)
│   ├── roomService.ts        # 모임 서비스
│   ├── chatService.ts        # 채팅 서비스
│   └── notificationService.ts # 알림 서비스
│
├── utils/                    # 유틸리티 함수
│   ├── dataValidation.ts     # 데이터 검증
│   ├── textSafe.ts           # 안전한 텍스트 처리
│   ├── hydration.ts          # SSR/CSR 하이드레이션 유틸
│   └── logger.ts             # 간단한 로거 (개발용)
│
├── api.ts                    # API 유틸리티 (공통 응답 포맷, 에러 처리)
├── rateLimit.ts              # Rate Limiting (Upstash Redis)
├── supabaseClient.ts         # Supabase 클라이언트 (Browser, Server, Admin)
├── useAuth.tsx               # 인증 Context/Hook
├── bot-scheduler.ts          # 레거시 봇 스케줄러 (시간 기반)
└── age-verification.ts       # 나이 인증 로직
```

### 주요 파일 설명

#### **api.ts** - API 공통 유틸리티
- `ApiResponse<T>` 인터페이스: 일관된 API 응답 포맷
- `ApiError` 클래스: 구조화된 에러 처리
- `getAuthenticatedUser()`: 인증된 사용자 가져오기
- `requireAdmin()`: 관리자 권한 검증

#### **rateLimit.ts** - Rate Limiting
- Upstash Redis 기반 분산 Rate Limiting
- IP 기반, 사용자 기반 제한
- 슬라이딩 윈도우 알고리즘

#### **supabaseClient.ts** - Supabase 클라이언트
- `createBrowserSupabaseClient()`: 클라이언트 사이드 클라이언트
- `createServerSupabaseClient()`: 서버 사이드 클라이언트 (쿠키 처리)
- `supabaseAdmin`: RLS 우회 관리자 클라이언트
- TypeScript 타입 정의: `Database`, `RoomInsert`, `ProfileInsert` 등

#### **useAuth.tsx** - 인증 Context
- `AuthContext`: 전역 인증 상태
- `useAuth()`: 현재 사용자, 로그인, 로그아웃 함수
- Mock 모드 지원 (개발 환경)

#### **cache/redis.ts** - 캐싱 시스템
- Redis/Upstash 연동
- 구조화된 캐시 키: `CacheKeys.rooms()`, `CacheKeys.roomDetail(id)`
- TTL 기반 자동 만료
- 개발 환경에서는 Redis 없이도 동작 (폴백)

#### **observability/logger.ts** - 구조화 로깅
- 요청 ID 추적
- PII 스크러빙 (이메일, 전화번호 자동 마스킹)
- 성능 타이밍 측정
- 환경별 로그 포맷 (개발: 컬러 콘솔, 프로덕션: JSON)

---

## 🔤 src/types/ - TypeScript 타입 정의

```
types/
├── global.d.ts               # 전역 타입 정의 (User, Room, Message 등)
└── intersection-observer.d.ts # IntersectionObserver 타입 확장
```

### global.d.ts 주요 타입

- **User**: 사용자 프로필
- **Room**: 모임 정보
- **JoinRequest**: 참가 요청
- **Match**: 매칭 정보
- **Message**: 채팅 메시지
- **ApiResponse**: API 응답 포맷
- **Coordinates**: 위도/경도 좌표
- **BoundingBox**: 지도 영역

---

## 📄 루트 디렉토리 주요 파일

```
meetpin/
├── package.json              # npm 패키지 정의 및 스크립트
├── tsconfig.json             # TypeScript 설정
├── next.config.ts            # Next.js 설정
├── tailwind.config.ts        # Tailwind CSS 설정
├── postcss.config.mjs        # PostCSS 설정
├── jest.config.js            # Jest 테스트 설정
├── playwright.config.ts      # Playwright E2E 테스트 설정
├── .eslintrc.json            # ESLint 설정
├── .prettierrc               # Prettier 설정
├── .env.local                # 환경 변수 (로컬 개발용, git ignore)
├── .gitignore                # Git ignore 규칙
├── README.md                 # 프로젝트 소개
└── CLAUDE.md                 # Claude AI 개발 가이드
```

---

## 🗄️ scripts/ - 데이터베이스 스크립트

```
scripts/
├── migrate.sql               # 테이블 생성, 인덱스, 트리거
├── rls.sql                   # Row Level Security 정책
└── seed.sql                  # 샘플 데이터 (개발용)
```

Supabase SQL 에디터에서 순서대로 실행:
1. `migrate.sql` → 테이블 생성
2. `rls.sql` → RLS 정책 적용
3. `seed.sql` → 샘플 데이터 추가 (개발 환경만)

---

## 🧪 tests/ - 테스트 파일

```
tests/
├── __tests__/                # Jest 단위 테스트
│   └── lib/                  # lib/ 폴더 테스트
│       ├── api.test.ts       # API 유틸리티 테스트
│       ├── zodSchemas.test.ts # Zod 스키마 검증 테스트
│       └── ...
│
├── rls/                      # Row Level Security 테스트
│   └── rls-security.spec.ts  # RLS 정책 검증 테스트
│
└── e2e/                      # Playwright E2E 테스트
    ├── main-page-full-test.spec.ts # 메인 페이지 테스트
    ├── new-landing-test.spec.ts    # 랜딩 페이지 테스트
    └── ...
```

---

## 📊 analysis/ - 리팩토링 분석 문서

```
analysis/
├── refactor-log.md           # 전체 리팩토링 히스토리
├── unused-files.md           # 미사용 파일 목록 (Step 2)
├── duplicate-code.md         # 중복 코드 분석 (Step 3)
└── dependency-analysis.md    # 의존성 분석 (Step 8)
```

---

## 📖 docs/ - 프로젝트 문서

```
docs/
├── STRUCTURE.md              # 폴더 구조 설명 (이 문서)
├── CONTRIBUTING.md           # 기여 가이드
└── SETUP.md                  # 개발 환경 설정 가이드
```

---

## 🌐 public/ - 정적 파일

```
public/
├── images/                   # 이미지 파일
│   ├── logo.png              # 로고
│   ├── hero-bg.jpg           # 히어로 배경
│   └── ...
├── fonts/                    # 폰트 파일 (Pretendard)
├── favicon.ico               # 파비콘
├── robots.txt                # 검색 엔진 크롤러 규칙
└── sitemap.xml               # 사이트맵
```

---

## 🎯 주요 아키텍처 패턴

### 1. Next.js 15 App Router
- **서버 컴포넌트 우선**: 기본적으로 서버에서 렌더링
- **클라이언트 컴포넌트**: `'use client'` 지시어로 명시
- **API 라우트**: `app/api/` 폴더에서 서버리스 함수로 동작

### 2. 서버/클라이언트 분리
- **서버 전용**: `services/auth.ts` (RLS 우회, 관리자 기능)
- **클라이언트 전용**: `services/authService.ts` (UI 상태, localStorage)
- **공통**: `lib/api.ts` (양쪽에서 사용 가능한 유틸리티)

### 3. 타입 안전성
- **중앙 집중식 타입**: `types/global.d.ts`
- **Zod 스키마**: 런타임 검증 + TypeScript 타입 추론
- **Supabase 타입 생성**: `supabaseClient.ts`에서 DB 스키마 기반 타입

### 4. 관심사 분리
- **컴포넌트**: 오직 UI 렌더링에만 집중
- **훅**: 상태 관리 + 비즈니스 로직
- **서비스**: 데이터 CRUD + 외부 API 호출
- **유틸리티**: 순수 함수, 헬퍼

### 5. 보안 계층
- **RLS (Row Level Security)**: 데이터베이스 레벨 권한 제어
- **API 인증**: `getAuthenticatedUser()` 미들웨어
- **Rate Limiting**: API 요청 제한
- **입력 검증**: Zod 스키마로 모든 입력 검증
- **CSP 헤더**: XSS 방지

---

## 📦 import 경로 규칙

TypeScript `baseUrl` 설정으로 `@/` prefix를 사용합니다:

```typescript
// ✅ 올바른 import
import { ApiResponse } from '@/lib/api'
import { RoomCard } from '@/components/room/RoomCard'
import { useAuth } from '@/lib/useAuth'

// ❌ 잘못된 import
import { ApiResponse } from '../../../lib/api'
import { RoomCard } from '../../components/room/RoomCard'
```

**규칙:**
- 모든 절대 경로는 `@/`로 시작
- `@/`는 `src/` 폴더를 가리킴
- 상대 경로(`../`, `./`)는 사용하지 않음

---

## 🔍 코드 찾기 팁

### 기능별 파일 위치

| 찾고 싶은 것 | 위치 |
|------------|------|
| API 엔드포인트 | `src/app/api/` |
| 페이지 라우트 | `src/app/` |
| React 컴포넌트 | `src/components/` |
| 비즈니스 로직 | `src/lib/services/` |
| 공통 유틸리티 | `src/lib/utils/` |
| TypeScript 타입 | `src/types/global.d.ts` |
| 전역 상태 | `src/lib/useAuth.tsx` |
| 데이터베이스 스키마 | `scripts/migrate.sql` |
| 환경 변수 | `.env.local` |

---

## 🚀 개발 시작하기

1. **루트 파일부터**: `README.md` → `CLAUDE.md` → `docs/SETUP.md`
2. **타입 이해**: `src/types/global.d.ts` 읽기
3. **API 구조 파악**: `src/lib/api.ts` → `src/app/api/` 훑어보기
4. **주요 페이지 확인**: `src/app/map/page.tsx` (메인 앱)
5. **컴포넌트 둘러보기**: `src/components/ui/` → 도메인별 폴더

---

## 📞 문의 및 기여

- 버그 리포트: GitHub Issues
- 기여 방법: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 개발 환경 설정: [SETUP.md](./SETUP.md)

---

**최종 업데이트**: 2025-10-01
**문서 버전**: 1.0.0
**프로젝트 버전**: 1.4.24
