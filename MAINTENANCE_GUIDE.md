# 밋핀(MeetPin) 유지보수 가이드

## 🎯 개요

이 문서는 밋핀 프로젝트를 처음 접하는 개발자나 초보자도 쉽게 유지보수하고 기능을 확인할 수 있도록 작성된 완전한 가이드입니다.

## 📋 목차

1. [프로젝트 상태](#-프로젝트-상태)
2. [로컬 개발 환경 설정](#-로컬-개발-환경-설정)
3. [주요 기능 테스트](#-주요-기능-테스트)
4. [코드 구조 이해](#-코드-구조-이해)
5. [일반적인 유지보수 작업](#-일반적인-유지보수-작업)
6. [문제 해결](#-문제-해결)

## ✅ 프로젝트 상태

### 현재 상태
- ✅ 타입스크립트 컴파일: **통과**
- ✅ ESLint 검사: **통과** (경고만 있음, 치명적 오류 없음)
- ✅ 프로덕션 빌드: **성공**
- ✅ 단위 테스트: **49/49 통과**
- ✅ 코드 정리: **완료**
- ✅ 불필요한 파일 제거: **완료**

### 품질 지표
```bash
# 전체 품질 검사
pnpm repo:doctor  # 타입체크 + 린트 + 빌드

# 개별 검사
pnpm typecheck    # 타입스크립트 검사
pnpm lint         # ESLint 검사
pnpm build        # 프로덕션 빌드
pnpm test         # 단위 테스트 (49개)
```

## 🚀 로컬 개발 환경 설정

### 1. 필수 도구 설치
```bash
# Node.js 18+ 설치 (https://nodejs.org)
# pnpm 설치
npm install -g pnpm
```

### 2. 프로젝트 설정
```bash
# 의존성 설치
cd meetpin
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어서 필요한 값들을 입력하세요
```

### 3. 개발 서버 시작
```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

## 🔍 주요 기능 테스트

### 웹페이지 기능 확인

#### 1. 메인 페이지 (`/`)
- [x] 랜딩 페이지 로딩
- [x] 로그인/회원가입 버튼
- [x] 지도로 이동 버튼

#### 2. 지도 페이지 (`/map`)
- [x] 카카오 지도 로딩
- [x] 현재 위치 확인
- [x] 방 목록 표시
- [x] 방 생성 버튼

#### 3. 인증 페이지
- [x] 회원가입 (`/auth/signup`)
- [x] 로그인 (`/auth/login`)
- [x] 프로필 설정 (`/profile`)

#### 4. 방 관리
- [x] 방 생성 (`/room/new`)
- [x] 방 상세 (`/room/[id]`)
- [x] 방 수정 (`/room/[id]/edit`)
- [x] 참가 요청 관리 (`/room/[id]/requests`)

#### 5. 요청 및 채팅
- [x] 내 요청 목록 (`/requests`)
- [x] 1:1 채팅 (`/chat/[matchId]`)

#### 6. 관리자 기능
- [x] 관리자 패널 (`/admin`)
- [x] 신고 관리
- [x] 사용자 관리

### 기능 테스트 체크리스트

```bash
# 자동화된 테스트 실행
pnpm test          # 단위 테스트
pnpm e2e           # E2E 테스트 (Playwright)

# 수동 테스트 순서
1. 회원가입 → 프로필 설정
2. 지도에서 방 생성
3. 다른 계정으로 참가 요청
4. 요청 승인 → 채팅 시작
5. 신고/차단 기능
6. 결제 기능 (테스트 모드)
```

## 📁 코드 구조 이해

### 폴더 구조
```
src/
├── app/                 # Next.js 페이지 (App Router)
│   ├── (pages)/        # 주요 페이지들
│   │   ├── map/        # 지도 페이지
│   │   ├── room/       # 방 관련 페이지
│   │   ├── chat/       # 채팅 페이지
│   │   └── profile/    # 프로필 페이지
│   └── api/            # API 라우트
│       ├── rooms/      # 방 API
│       ├── requests/   # 요청 API
│       ├── matches/    # 매칭 API
│       └── payments/   # 결제 API
├── components/         # 재사용 컴포넌트
│   ├── ui/            # UI 컴포넌트
│   └── ...            # 비즈니스 컴포넌트
└── lib/               # 유틸리티 함수들
    ├── api.ts         # API 유틸리티
    ├── auth.ts        # 인증 관련
    ├── supabaseClient.ts # DB 클라이언트
    └── ...
```

### 핵심 파일들

#### 인증 (`src/lib/auth.ts`)
- Supabase 기반 사용자 인증
- 역할 기반 권한 관리 (user/admin)

#### 데이터베이스 (`src/lib/supabaseClient.ts`)
- Supabase PostgreSQL 연결
- Row Level Security (RLS) 정책 적용

#### API 라우트 (`src/app/api/`)
- RESTful API 엔드포인트
- 입력 검증 및 오류 처리
- 속도 제한 (Rate Limiting)

#### 지도 (`src/lib/kakao.ts`)
- 카카오 맵 SDK 연동
- 위치 기반 검색

## 🔧 일반적인 유지보수 작업

### 코드 품질 관리

#### 매번 코드 변경 후 실행
```bash
# 전체 품질 검사
pnpm repo:doctor

# 코드 포맷팅
pnpm format

# 타입 오류 수정
pnpm typecheck
```

#### ESLint 경고 해결
```bash
# 자동 수정 가능한 것들
pnpm lint:fix

# 수동으로 수정해야 하는 주요 경고들:
# - React Hook 의존성 배열
# - 사용하지 않는 변수
# - 접근성 관련 이슈
```

### 데이터베이스 관리

#### 스키마 변경
```sql
-- scripts/migrate.sql 파일 수정
-- Supabase SQL Editor에서 실행
```

#### 권한 정책 수정
```sql
-- scripts/rls.sql 파일 수정
-- Row Level Security 정책 업데이트
```

#### 샘플 데이터
```sql
-- scripts/seed.sql 파일 수정
-- 개발용 테스트 데이터
```

### 새 기능 추가 과정

#### 1. API 엔드포인트 추가
```typescript
// src/app/api/새기능/route.ts
import { NextRequest } from 'next/server'
import { createSuccessResponse, ApiError } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    // 구현 로직
    return createSuccessResponse(data)
  } catch (error) {
    throw new ApiError('오류 메시지', 500)
  }
}
```

#### 2. 페이지 컴포넌트 추가
```typescript
// src/app/새페이지/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function NewPage() {
  // 컴포넌트 로직
  return <div>새 페이지</div>
}
```

#### 3. 데이터 검증 스키마
```typescript
// src/lib/zodSchemas.ts에 추가
import { z } from 'zod'

export const newFeatureSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().min(0),
})
```

#### 4. 테스트 작성
```typescript
// __tests__/lib/새기능.test.ts
import { newFeatureSchema } from '@/lib/zodSchemas'

describe('새 기능', () => {
  it('should validate input correctly', () => {
    const validData = { field1: 'test', field2: 1 }
    expect(() => newFeatureSchema.parse(validData)).not.toThrow()
  })
})
```

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. 개발 서버가 시작되지 않음
```bash
# 포트 충돌 확인
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 캐시 정리
rm -rf .next
pnpm dev
```

#### 2. 타입스크립트 오류
```bash
# 타입 정의 재설치
rm -rf node_modules
pnpm install

# 타입 캐시 정리
pnpm typecheck --force
```

#### 3. 빌드 실패
```bash
# 환경 변수 확인
cat .env.local

# 의존성 버전 충돌 확인
pnpm list --depth=0
```

#### 4. ESLint 오류
```bash
# 설정 파일 확인
cat eslint.config.mjs

# 특정 규칙 비활성화
// eslint-disable-next-line rule-name
```

### 환경별 설정

#### 개발 환경 (.env.local)
```env
NODE_ENV=development
# Mock 모드 설정 (중요!)
NEXT_PUBLIC_FORCE_MOCK=true  # true = Mock 모드, false = 프로덕션 모드

# Mock 모드일 때는 아래 키들이 없어도 동작
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SITE_URL=http://localhost:3000
```

### 💡 개발/프로덕션 모드 전환

#### Mock 모드 (개발 시 권장)
```bash
# .env.local 파일에서
NEXT_PUBLIC_FORCE_MOCK=true

# 특징:
# - Supabase 없이도 완전 동작
# - 테스트 계정: admin@meetpin.com / 123456
# - 가짜 데이터로 모든 기능 테스트 가능
# - localStorage 기반 인증
```

#### 프로덕션 모드 (실제 서비스 연결)
```bash
# .env.local 파일에서
NEXT_PUBLIC_FORCE_MOCK=false  # 또는 삭제

# 필수 요구사항:
# - 모든 API 키가 실제 값이어야 함
# - Supabase 데이터베이스 설정 완료
# - scripts/ 폴더의 SQL 파일들 실행 완료
```

#### 프로덕션 환경
- Vercel 환경 변수 설정
- 카카오 맵 도메인 등록
- Supabase Auth 리디렉션 URL 설정
- Stripe 웹훅 엔드포인트 등록

### 디버깅 도구

#### 브라우저 개발자 도구
```javascript
// 로컬 스토리지 확인
localStorage.getItem('supabase.auth.token')

// API 요청 확인
// Network 탭에서 요청/응답 확인

// 콘솔 에러 확인
// Console 탭에서 JavaScript 오류 확인
```

#### 서버 로그
```bash
# 개발 서버 로그
pnpm dev

# API 응답 확인
curl -X GET http://localhost:3000/api/rooms
```

## 📚 추가 리소스

### 문서
- [프로젝트 README](./README.md) - 기본 설정 가이드
- [초보자 가이드](./BEGINNER_GUIDE.md) - 단계별 학습 가이드
- [설정 가이드](./SETUP_GUIDE.md) - 환경 설정 상세 가이드
- [보안 가이드](./docs/SECURITY.md) - 보안 관련 사항
- [운영 가이드](./docs/RUNBOOK.md) - 운영 및 장애 대응

### 기술 스택 문서
- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [카카오 맵 API](https://apis.map.kakao.com/)

### 개발 도구
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)

## ✅ 체크리스트

### 새 기능 개발 시
- [ ] 타입 정의 작성
- [ ] API 엔드포인트 구현
- [ ] 입력 검증 스키마 추가
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 업데이트
- [ ] 문서 업데이트
- [ ] 품질 검사 통과

### 배포 전 체크리스트
- [ ] `pnpm repo:doctor` 통과
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 적용
- [ ] 보안 검토 완료

---

**🎉 축하합니다!** 이제 밋핀 프로젝트를 완전히 이해하고 유지보수할 수 있습니다. 추가 질문이나 문제가 있으면 언제든지 이 가이드를 참조하세요.