# 밋핀(MeetPin) - 핀 찍고, 지금 모여요! 📍

지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요.  
술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.

## 🎯 주요 기능

- **🗺️ 지도 기반 모임**: 카카오맵을 통해 위치 기반으로 방을 생성하고 참여
- **🍻 다양한 카테고리**: 술, 운동, 기타 활동으로 분류된 모임
- **💬 실시간 채팅**: 매칭된 사용자와 1:1 채팅
- **🚀 부스트 시스템**: 결제를 통해 방을 상단에 고정 노출
- **🔐 안전한 환경**: 신고/차단 기능과 엄격한 보안 정책
- **📱 모바일 최적화**: 모바일 우선 반응형 디자인

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14** (App Router) - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **Zod** - 스키마 검증

### 백엔드 & 인프라
- **Supabase** - 백엔드 서비스 (Database, Auth, Realtime, Storage)
- **PostgreSQL** - 관계형 데이터베이스
- **Row Level Security** - 데이터 보안

### 외부 서비스
- **카카오맵 API** - 지도 및 위치 서비스
- **Stripe** - 결제 시스템
- **Vercel** - 배포 플랫폼

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Kakao Maps
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App
SITE_URL=http://localhost:3000
```

### 3. 데이터베이스 설정

Supabase SQL Editor에서 순서대로 실행:
1. `scripts/migrate.sql` - 테이블 생성
2. `scripts/rls.sql` - 보안 정책 적용
3. `scripts/seed.sql` - 샘플 데이터 (선택)

### 4. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000에서 앱을 확인하세요.

## 📁 주요 파일 구조

```
meetpin/
├── src/app/                 # Next.js App Router 페이지
├── src/components/          # React 컴포넌트
├── lib/                     # 유틸리티 및 설정
├── scripts/                 # 데이터베이스 스크립트
└── public/                  # 정적 파일
```

## 🧪 개발 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 빌드
pnpm lint         # 린팅
pnpm typecheck    # 타입 체크
pnpm test         # 테스트
pnpm e2e          # E2E 테스트
```

## 📦 배포

1. Supabase 프로젝트 생성 및 데이터베이스 설정
2. 카카오 개발자 계정에서 JavaScript 키 발급
3. Stripe 계정에서 API 키 발급
4. Vercel에 배포 후 환경 변수 설정
5. 외부 서비스들에 배포 도메인 등록

자세한 배포 가이드는 `docs/` 디렉토리를 참고하세요.

---

Made with ❤️ by MeetPin Team
