# 🚀 밋핀(MeetPin) 완전 왕초보 가이드

> 이 문서는 프로그래밍 경험이 전혀 없는 완전 초보자도 밋핀 프로젝트를 이해하고 유지보수할 수 있도록 작성되었습니다.

## 📋 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [필수 프로그램 설치](#2-필수-프로그램-설치)
3. [프로젝트 구조 이해](#3-프로젝트-구조-이해)
4. [개발 환경 설정](#4-개발-환경-설정)
5. [명령어 가이드](#5-명령어-가이드)
6. [페이지별 설명](#6-페이지별-설명)
7. [데이터베이스 이해](#7-데이터베이스-이해)
8. [일반적인 문제 해결](#8-일반적인-문제-해결)
9. [새 기능 추가하기](#9-새-기능-추가하기)
10. [배포하기](#10-배포하기)

---

## 1. 프로젝트 소개

### 📍 밋핀(MeetPin)이란?

밋핀은 **위치 기반 모임 플랫폼**입니다. 사용자들이 지도에 핀을 찍어 주변 사람들과 모임을 만들고 참여할 수 있는 서비스입니다.

### 🎯 주요 기능

- **🗺️ 지도 기반 모임**: 카카오 지도에 모임 위치를 표시
- **👥 모임 생성/참가**: 술 모임, 운동 모임 등 다양한 카테고리
- **💬 실시간 채팅**: 모임 참가자들끼리 1:1 채팅
- **📱 모바일 최적화**: 스마트폰에서 사용하기 편리한 디자인
- **🔒 안전한 인증**: Supabase를 통한 안전한 로그인/회원가입

---

## 2. 필수 프로그램 설치

> ⚠️ **중요**: 아래 프로그램들을 순서대로 설치해야 합니다!

### 2.1 Node.js 설치

1. [Node.js 공식 사이트](https://nodejs.org/)에서 **LTS 버전** 다운로드
2. 다운받은 파일을 실행하여 설치 (모든 옵션 기본값으로)
3. 설치 확인:
   ```bash
   node --version    # v18.0.0 이상이어야 함
   npm --version     # 8.0.0 이상이어야 함
   ```

### 2.2 Git 설치

1. [Git 공식 사이트](https://git-scm.com/download/windows)에서 다운로드
2. 설치 시 모든 옵션 기본값으로 선택
3. 설치 확인:
   ```bash
   git --version
   ```

### 2.3 코드 에디터 설치 (VS Code)

1. [Visual Studio Code](https://code.visualstudio.com/) 다운로드 및 설치
2. 유용한 확장 프로그램 설치:
   - Korean Language Pack (한국어 지원)
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter

### 2.4 pnpm 설치

npm보다 빠른 패키지 매니저인 pnpm을 설치합니다:

```bash
npm install -g pnpm
```

---

## 3. 프로젝트 구조 이해

### 📁 폴더 구조 (중요한 것만)

```
meetpin/
├── 📁 src/                    # 소스 코드 폴더
│   ├── 📁 app/                # 페이지들
│   │   ├── 📄 layout.tsx      # 전체 레이아웃
│   │   ├── 📄 page.tsx        # 홈페이지
│   │   ├── 📁 map/            # 지도 페이지
│   │   ├── 📁 room/           # 모임 관련 페이지들
│   │   ├── 📁 auth/           # 로그인/회원가입
│   │   └── 📁 api/            # 백엔드 API
│   ├── 📁 components/         # 재사용 가능한 UI 조각들
│   └── 📁 lib/                # 유틸리티 함수들
├── 📁 public/                 # 이미지, 아이콘 등 정적 파일들
├── 📁 scripts/                # 데이터베이스 설정 스크립트들
├── 📄 package.json            # 프로젝트 정보와 의존성
├── 📄 .env.local              # 환경 변수 (비밀 정보)
└── 📄 tailwind.config.ts      # 스타일링 설정
```

### 🔍 주요 파일 설명

| 파일/폴더 | 역할 | 수정 빈도 |
|-----------|------|-----------|
| `src/app/` | 웹사이트의 각 페이지들 | ⭐⭐⭐ 자주 |
| `src/components/` | 버튼, 카드 등 재사용 UI | ⭐⭐⭐ 자주 |
| `src/lib/` | 공통 기능들 | ⭐⭐ 가끔 |
| `public/` | 이미지, 로고 등 | ⭐ 거의 안함 |
| `.env.local` | API 키 등 비밀 정보 | ⭐ 거의 안함 |

---

## 4. 개발 환경 설정

### 4.1 프로젝트 복사하기

```bash
# 1. 프로젝트 폴더로 이동
cd C:\Users\이원표\Desktop\Meetpin\meetpin

# 2. 필요한 패키지들 설치
pnpm install
```

### 4.2 환경 변수 설정

`.env.local` 파일에 필요한 정보들이 들어있습니다:

```env
# Supabase (데이터베이스)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao Maps (지도)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-key

# Stripe (결제)
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# 앱 URL
SITE_URL=http://localhost:3000
```

> ⚠️ **주의**: 이 파일은 절대 다른 사람에게 공유하면 안 됩니다!

---

## 5. 명령어 가이드

### 🚀 자주 사용하는 명령어

```bash
# 개발 서버 시작 (웹사이트 보기)
pnpm dev

# 빌드 (배포용 파일 생성)
pnpm build

# 코드 검사 (문법 오류 찾기)
pnpm lint

# TypeScript 검사 (타입 오류 찾기)
pnpm typecheck

# 테스트 실행
pnpm test
```

### 🔧 문제 해결 명령어

```bash
# 캐시 삭제 (문제 발생 시)
pnpm store prune
rm -rf node_modules
rm -rf .next
pnpm install

# 린트 오류 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format
```

---

## 6. 페이지별 설명

### 🏠 주요 페이지들

| 페이지 | 파일 경로 | 기능 |
|--------|-----------|------|
| 홈페이지 | `src/app/page.tsx` | 랜딩 페이지 |
| 지도 | `src/app/map/page.tsx` | 모임 지도 보기 |
| 모임 생성 | `src/app/room/new/page.tsx` | 새 모임 만들기 |
| 모임 상세 | `src/app/room/[id]/page.tsx` | 모임 정보 보기 |
| 로그인 | `src/app/auth/login/page.tsx` | 사용자 로그인 |
| 프로필 | `src/app/profile/page.tsx` | 내 정보 관리 |

### 📱 페이지 수정 방법

1. **텍스트 바꾸기**: 
   - 한글 텍스트를 찾아서 원하는 내용으로 변경
   - 예: `"새 모임 만들기"` → `"새로운 파티 만들기"`

2. **색상 바꾸기**:
   - `src/lib/brand.ts` 파일에서 색상 코드 변경
   - 예: `primary: '#10B981'` → `primary: '#3B82F6'`

3. **이미지 바꾸기**:
   - `public/` 폴더에 새 이미지 추가
   - 페이지에서 이미지 경로 변경

---

## 7. 데이터베이스 이해

### 📊 Supabase 데이터베이스

밋핀은 **Supabase**라는 클라우드 데이터베이스를 사용합니다.

#### 주요 테이블들

| 테이블 | 저장하는 정보 |
|--------|---------------|
| `profiles` | 사용자 프로필 (닉네임, 나이 등) |
| `rooms` | 모임 정보 (제목, 위치, 시간 등) |
| `requests` | 참가 신청 정보 |
| `matches` | 승인된 매칭 정보 |
| `messages` | 채팅 메시지들 |
| `reports` | 신고 내역 |

#### 데이터베이스 설정하기

1. **Supabase 프로젝트 생성**:
   - [Supabase](https://supabase.com/)에 가입
   - 새 프로젝트 생성

2. **데이터베이스 스크립트 실행** (순서 중요!):
   ```sql
   -- 1. scripts/migrate.sql 실행 (테이블 생성)
   -- 2. scripts/rls.sql 실행 (보안 설정)
   -- 3. scripts/seed.sql 실행 (샘플 데이터)
   ```

---

## 8. 일반적인 문제 해결

### ❌ 자주 발생하는 문제들

#### 8.1 "Cannot find module" 오류

**문제**: 모듈을 찾을 수 없다는 오류
```bash
Error: Cannot find module 'next'
```

**해결**:
```bash
# 패키지 재설치
pnpm install
```

#### 8.2 포트 3000 사용 중 오류

**문제**: 개발 서버가 시작되지 않음
```bash
Error: Port 3000 is already in use
```

**해결**:
```bash
# 다른 포트로 시작
pnpm dev -- -p 3001
```

#### 8.3 환경 변수 오류

**문제**: API 키 관련 오류
```bash
Error: Missing environment variables
```

**해결**:
1. `.env.local` 파일이 존재하는지 확인
2. 모든 필수 환경 변수가 설정되어 있는지 확인
3. 개발 서버 재시작

#### 8.4 빌드 오류

**문제**: `pnpm build` 실패

**해결**:
```bash
# 1. TypeScript 검사
pnpm typecheck

# 2. 린트 검사
pnpm lint

# 3. 캐시 삭제 후 재시도
rm -rf .next
pnpm build
```

---

## 9. 새 기능 추가하기

### ➕ 간단한 기능 추가 예시

#### 9.1 새 페이지 만들기

1. **페이지 파일 생성**: `src/app/about/page.tsx`
```tsx
export default function AboutPage() {
  return (
    <div>
      <h1>회사 소개</h1>
      <p>밋핀에 대해 알아보세요!</p>
    </div>
  )
}
```

2. **네비게이션에 링크 추가** (필요한 곳에):
```tsx
import Link from 'next/link'

<Link href="/about">회사 소개</Link>
```

#### 9.2 새 컴포넌트 만들기

1. **컴포넌트 파일 생성**: `src/components/MyButton.tsx`
```tsx
interface Props {
  text: string
  onClick: () => void
}

export default function MyButton({ text, onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {text}
    </button>
  )
}
```

2. **컴포넌트 사용**:
```tsx
import MyButton from '@/components/MyButton'

<MyButton 
  text="클릭하세요" 
  onClick={() => alert('버튼 클릭!')} 
/>
```

---

## 10. 배포하기

### 🚀 Vercel을 통한 배포 (추천)

1. **Vercel 가입**: [vercel.com](https://vercel.com)
2. **GitHub 연결**: GitHub 저장소와 연결
3. **자동 배포 설정**: 코드 푸시 시 자동 배포
4. **환경 변수 설정**: Vercel 대시보드에서 `.env.local`의 내용들 설정

### 📋 배포 전 체크리스트

- [ ] `pnpm build` 성공하는지 확인
- [ ] `pnpm typecheck` 통과하는지 확인
- [ ] `pnpm test` 모든 테스트 통과하는지 확인
- [ ] 환경 변수 모두 설정했는지 확인
- [ ] 데이터베이스 스크립트 실행했는지 확인

---

## 🆘 도움이 필요할 때

### 📚 추가 학습 자료

- **Next.js 공식 문서**: https://nextjs.org/docs
- **React 튜토리얼**: https://ko.reactjs.org/tutorial/tutorial.html
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase 가이드**: https://supabase.com/docs

### 🔍 디버깅 팁

1. **브라우저 개발자 도구** 사용하기 (F12)
2. **콘솔 로그** 활용하기: `console.log('확인하고 싶은 값', value)`
3. **네트워크 탭**에서 API 호출 상태 확인하기
4. **에러 메시지**를 구글에서 검색하기

### 💬 커뮤니티

- **Discord**: Next.js 한국 커뮤니티
- **카페**: 네이버 개발자 카페들
- **GitHub**: 이슈 등록하여 도움 요청

---

## 🎉 마무리

축하합니다! 이제 밋핀 프로젝트의 기본적인 구조와 사용법을 이해했습니다. 

### 🏆 다음 단계

1. **실제 코드 수정해보기**: 간단한 텍스트나 색상부터 시작
2. **새로운 기능 추가해보기**: 위의 가이드를 참고하여
3. **커뮤니티 참여하기**: 다른 개발자들과 소통하며 배우기

**기억하세요**: 모든 개발자는 처음에는 초보였습니다. 천천히, 꾸준히 배워나가세요! 🚀

---

*이 가이드가 도움이 되었다면, 다른 초보 개발자들과도 공유해주세요! 💝*