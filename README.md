# 밋핀 (MeetPin) - 지도 기반 소셜 만남 플랫폼

> 📍 핀 찍고, 지금 모여요!
> 지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요.

## 🌐 **현재 서비스 중!**

**🚀 라이브 서비스**: [https://meetpin-weld.vercel.app](https://meetpin-weld.vercel.app)

**밋핀**은 위치 기반 소셜 모임 플랫폼으로, 사용자가 지도에서 직접 모임을 생성하고 주변 사람들과 연결될 수 있도록 돕습니다. 술, 운동, 취미 활동 등 다양한 카테고리의 모임을 통해 새로운 인연을 만들어보세요.

## 🎯 주요 기능

- **📍 지도 기반 모임 생성**: 원하는 장소에서 바로 모임을 만들 수 있어요
- **🔍 실시간 모임 검색**: 지도에서 주변 모임을 실시간으로 확인할 수 있어요
- **💬 1:1 매칭 채팅**: 수락된 참가자와 안전한 1:1 채팅이 가능해요
- **⭐ 모임 부스트**: 모임을 상단에 노출시켜 더 많은 참가자를 모을 수 있어요
- **🛡️ 안전한 환경**: 신고/차단 시스템으로 안전한 만남을 보장해요
- **📱 모바일 최적화**: 모바일 우선 반응형 디자인

## 🛠️ 기술 스택

### 프론트엔드

- **Next.js 15** (App Router) - React 프레임워크
- **React 19** - React 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS v4** - 스타일링
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
pnpm approve-builds
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

# 개발/Mock 모드 설정 (중요!)
# Mock 모드: Supabase 없이 로컬 데이터만 사용 (개발 시 편리)
# 프로덕션: 실제 Supabase 연동 (배포 시 필수)
NEXT_PUBLIC_FORCE_MOCK=true  # 개발 시: true, 배포 시: false
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
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── api/             # API 라우트 (Supabase 통합)
│   │   ├── map/             # 메인 지도 페이지
│   │   ├── room/            # 방 관련 페이지
│   │   ├── profile/         # 프로필 페이지
│   │   ├── admin/           # 관리자 페이지
│   │   └── legal/           # 법적 문서 페이지
│   ├── components/          # React 컴포넌트
│   │   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   └── [기능별]/        # 기능별 컴포넌트
│   └── lib/                 # 유틸리티 및 설정
│       ├── api.ts           # API 유틸리티 함수
│       ├── auth.ts          # 인증 관련 함수
│       ├── supabaseClient.ts # Supabase 클라이언트
│       ├── zodSchemas.ts    # Zod 검증 스키마
│       └── [기타 유틸]/     # 기타 유틸리티
├── scripts/                 # 데이터베이스 스크립트
│   ├── migrate.sql          # 테이블 생성 스크립트
│   ├── rls.sql             # 보안 정책 스크립트
│   └── seed.sql            # 샘플 데이터 스크립트
├── __tests__/               # Jest 단위 테스트
├── e2e/                     # Playwright E2E 테스트
├── public/                  # 정적 파일 (이미지, 아이콘 등)
├── CLAUDE.md               # 개발자용 기술 문서
├── MAINTENANCE_GUIDE.md    # 유지보수 가이드
└── package.json            # 프로젝트 설정 및 의존성
```

## 🧪 개발 명령어

```bash
# 개발 환경
pnpm dev          # 개발 서버 (localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm preview      # 빌드 후 미리보기

# 코드 품질
pnpm typecheck    # TypeScript 타입 검사
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포매팅
pnpm format:check # 포매팅 검사

# 테스트
pnpm test         # Jest 단위 테스트 (49개 테스트)
pnpm test:watch   # 테스트 감시 모드
pnpm e2e          # Playwright E2E 테스트
pnpm e2e:ui       # E2E 테스트 UI 모드
pnpm playwright:install  # Playwright 브라우저 설치

# 데이터베이스 (알림용)
pnpm db:migrate   # scripts/migrate.sql 실행 알림
pnpm db:rls       # scripts/rls.sql 실행 알림
pnpm db:seed      # scripts/seed.sql 실행 알림

# 종합 검사
pnpm repo:doctor  # 타입검사 + 린트 + 빌드 (종합 품질 검사)
```

## 📦 배포

1. Supabase 프로젝트 생성 및 데이터베이스 설정
2. 카카오 개발자 계정에서 JavaScript 키 발급
3. Stripe 계정에서 API 키 발급
4. Vercel에 배포 후 환경 변수 설정
5. 외부 서비스들에 배포 도메인 등록

## 📚 문서

- **[왕초보 완전 가이드](BEGINNER_GUIDE.md)**: 프로그래밍 경험이 전혀 없어도 이해할 수 있는 완전 초보자용 가이드
- **[기술 문서](CLAUDE.md)**: 개발자를 위한 상세한 기술 문서
- **[API 문서](src/lib/api.ts)**: API 엔드포인트 및 사용법
- **[데이터베이스 스키마](scripts/)**: 데이터베이스 구조 및 설정 방법

## 🤝 기여하기

1. 이 저장소를 Fork하세요
2. 기능 브랜치를 만드세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## ⚠️ 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🔧 문제 해결

### 자주 발생하는 문제

1. **포트 충돌**: 기본 포트 3000 사용 중이면 `npx kill-port 3000` 후 재시작
2. **패키지 오류**: `pnpm store prune && pnpm install && pnpm approve-builds`로 재설치
3. **빌드 오류**: `pnpm repo:doctor`로 종합 검사 실행
4. **환경 변수**: `.env.local` 파일이 올바르게 설정되었는지 확인
5. **인증 오류**: 개발 모드에서는 Mock 데이터 사용 (src/lib/mockData.ts)
6. **지도 로딩**: 카카오맵 JavaScript 키 확인
7. **데이터베이스**: Supabase 연결 및 RLS 정책 확인

### 🔧 개발 모드 vs 프로덕션 모드 전환

#### 개발 모드 (Mock 모드)

- **설정**: `.env.local`에 `NEXT_PUBLIC_FORCE_MOCK=true` 추가
- **특징**: Supabase 없이도 로컬에서 완전한 테스트 가능
- **테스트 계정**: `admin@meetpin.com` / `123456`
- **샘플 데이터**: 서울 중심 가짜 모임 데이터 자동 로딩

#### 프로덕션 모드

- **설정**: `.env.local`에 `NEXT_PUBLIC_FORCE_MOCK=false` (또는 삭제)
- **특징**: 실제 Supabase, Stripe, 카카오맵 연동
- **필수 환경 변수**: 모든 API 키가 실제 값이어야 함
- **데이터베이스 설정**: scripts/ 폴더의 SQL 파일들을 Supabase에서 실행 필요

#### 빠른 전환 방법

**Mock → 프로덕션 전환:**

```bash
# .env.local 파일에서
NEXT_PUBLIC_FORCE_MOCK=false  # true → false로 변경
pnpm dev  # 서버 재시작
```

**프로덕션 → Mock 전환:**

```bash
# .env.local 파일에서
NEXT_PUBLIC_FORCE_MOCK=true   # false → true로 변경
pnpm dev  # 서버 재시작
```

### 개발 모드 특징

- 🔧 **Mock 인증**: 실제 Supabase 없이도 개발 가능
- 📱 **테스트 계정**: `admin@meetpin.com` / `123456`
- 🗺️ **지도 테스트**: 서울 중심으로 샘플 데이터 표시
- ⚡ **빠른 시작**: 최소한의 설정으로 바로 개발 시작
- 🔒 **보안**: localStorage 기반 인증 (개발 전용)

### 도움이 필요하시면

- 📧 이메일: contact@meetpin.com
- 🐛 버그 리포트: [GitHub Issues](https://github.com/your-repo/meetpin/issues)
- 💬 커뮤니티: [Discord](https://discord.gg/meetpin)

---

**⭐ 이 프로젝트가 도움이 되었다면 별점을 눌러주세요!**

Made with ❤️ by MeetPin Team
