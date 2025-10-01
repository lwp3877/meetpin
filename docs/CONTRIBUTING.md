# 기여 가이드 (Contributing Guide)

밋핀(MeetPin) 프로젝트에 기여하는 방법을 안내합니다. 초보 개발자도 쉽게 따라할 수 있도록 작성되었습니다.

---

## 📋 목차

1. [코딩 컨벤션](#-코딩-컨벤션)
2. [커밋 메시지 규칙](#-커밋-메시지-규칙)
3. [브랜치 전략](#-브랜치-전략)
4. [Pull Request 가이드](#-pull-request-가이드)
5. [코드 리뷰 프로세스](#-코드-리뷰-프로세스)
6. [테스트 작성 가이드](#-테스트-작성-가이드)

---

## 🎨 코딩 컨벤션

### TypeScript / JavaScript

#### 네이밍 규칙

```typescript
// ✅ 컴포넌트: PascalCase
const RoomCard = () => { ... }
export default RoomCard

// ✅ 함수/변수: camelCase
const getUserProfile = async (uid: string) => { ... }
const isLoggedIn = true

// ✅ 상수: UPPER_SNAKE_CASE
const MAX_ROOM_PARTICIPANTS = 10
const API_BASE_URL = 'https://api.meetpin.com'

// ✅ 타입/인터페이스: PascalCase
interface User { ... }
type ApiResponse<T> = { ... }

// ✅ 파일명: kebab-case 또는 PascalCase
// 컴포넌트: RoomCard.tsx
// 유틸리티: date-utils.ts
// 서비스: authService.ts
```

#### import 순서

```typescript
// 1. React 및 외부 라이브러리
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. 내부 컴포넌트
import { RoomCard } from '@/components/room/RoomCard'
import { Button } from '@/components/ui/button'

// 3. 내부 서비스/유틸리티
import { getRooms } from '@/lib/services/roomService'
import { useAuth } from '@/lib/useAuth'

// 4. 타입
import type { Room, User } from '@/types/global'

// 5. 스타일
import './styles.css'
```

#### 함수 작성 스타일

```typescript
// ✅ Arrow function 사용 (컴포넌트, 유틸리티)
const getUserAge = (birthYear: number): number => {
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

// ✅ 컴포넌트는 const + export default
const RoomCard = ({ room }: { room: Room }) => {
  return <div>...</div>
}
export default RoomCard

// ✅ async/await 사용 (Promise 대신)
const fetchUserProfile = async (uid: string) => {
  const response = await fetch(`/api/profile/${uid}`)
  return response.json()
}
```

#### 주석 작성 규칙

```typescript
/**
 * 사용자 프로필을 가져옵니다.
 *
 * @param uid - 사용자 고유 ID
 * @returns 사용자 프로필 객체
 * @throws {ApiError} API 호출 실패 시
 */
async function getUserProfile(uid: string): Promise<User> {
  // ...
}

// 복잡한 로직에만 주석 추가
// "왜" 이렇게 했는지 설명 ("무엇을" 하는지는 코드로 설명)
```

### React 컴포넌트

#### 컴포넌트 구조

```typescript
'use client' // 클라이언트 컴포넌트만

import React from 'react'
import type { Room } from '@/types/global'

// 1. Props 타입 정의
interface RoomCardProps {
  room: Room
  onJoin?: (roomId: string) => void
  className?: string
}

// 2. 컴포넌트 본체
const RoomCard = ({ room, onJoin, className }: RoomCardProps) => {
  // 3. 훅 (항상 컴포넌트 최상단)
  const [isLoading, setIsLoading] = React.useState(false)

  // 4. 이벤트 핸들러
  const handleJoinClick = () => {
    onJoin?.(room.id)
  }

  // 5. 렌더링
  return (
    <div className={className}>
      <h3>{room.title}</h3>
      <button onClick={handleJoinClick}>참가하기</button>
    </div>
  )
}

export default RoomCard
```

#### Hooks 규칙

```typescript
// ✅ 항상 컴포넌트 최상단에 배치
const MyComponent = () => {
  const user = useAuth()
  const [count, setCount] = useState(0)

  // ❌ 조건문 안에서 Hook 사용 금지
  // if (user) {
  //   const [data, setData] = useState()
  // }

  return <div>...</div>
}

// ✅ Custom Hook 네이밍: use로 시작
const useRoomData = (roomId: string) => {
  const [room, setRoom] = useState<Room | null>(null)
  // ...
  return { room, loading, error }
}
```

### CSS / Tailwind

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
  클릭
</button>

// ✅ 복잡한 조건부 스타일: clsx 또는 cn 유틸리티
import { cn } from '@/lib/utils/cn'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isPremium ? 'premium-style' : 'regular-style'
)}>
  ...
</div>

// ⚠️ 인라인 스타일은 최소화
<div style={{ color: 'red' }}>❌ 피하기</div>
```

---

## 📝 커밋 메시지 규칙

### Conventional Commits 사용

```
<타입>(<범위>): <제목>

<본문> (선택)

<푸터> (선택)
```

#### 커밋 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat(room): 모임 부스트 기능 추가` |
| `fix` | 버그 수정 | `fix(auth): 로그인 실패 에러 처리` |
| `docs` | 문서 수정 | `docs(readme): 설치 가이드 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style(button): 들여쓰기 수정` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(api): API 응답 포맷 통일` |
| `test` | 테스트 추가/수정 | `test(room): 모임 생성 테스트 추가` |
| `chore` | 빌드/설정 변경 | `chore(deps): dependencies 업데이트` |
| `perf` | 성능 개선 | `perf(map): 지도 클러스터링 최적화` |

#### 범위 (Scope)

프로젝트의 어느 부분인지 명시:
- `auth`: 인증
- `room`: 모임
- `chat`: 채팅
- `map`: 지도
- `ui`: UI 컴포넌트
- `api`: API 라우트
- `db`: 데이터베이스
- `deps`: 의존성

#### 제목 작성 규칙

```bash
# ✅ 좋은 예시
feat(room): 모임 검색 필터 기능 추가
fix(chat): 메시지 전송 시 에러 처리
refactor(api): Rate Limit 로직 분리
docs(setup): 환경 변수 설정 가이드 추가

# ❌ 나쁜 예시
update code  # 너무 모호함
fix bug      # 어떤 버그인지 불명확
add feature  # 어떤 기능인지 불명확
```

#### 본문 작성 (선택)

```
feat(room): 모임 부스트 결제 기능 추가

Stripe Checkout을 사용하여 부스트 결제 구현:
- 1일/3일/7일 부스트 상품 추가
- 결제 성공 시 boost_until 업데이트
- 웹훅을 통한 결제 상태 동기화

Closes #123
```

---

## 🌿 브랜치 전략

### Git Flow 기반

```
main                 # 프로덕션 (안정 버전)
  ↓
develop              # 개발 메인 브랜치
  ↓
feature/*            # 기능 개발
hotfix/*             # 긴급 수정
refactor/*           # 리팩토링
```

### 브랜치 네이밍

```bash
# 기능 개발
feature/room-boost-payment
feature/chat-typing-indicator

# 버그 수정
fix/auth-login-error
fix/map-marker-position

# 리팩토링
refactor/api-response-format
refactor/cleanup-unused-files

# 긴급 수정 (프로덕션)
hotfix/security-xss-vulnerability
hotfix/stripe-webhook-error
```

### 워크플로우

```bash
# 1. develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 2. 기능 브랜치 생성
git checkout -b feature/room-boost-payment

# 3. 작업 후 커밋
git add .
git commit -m "feat(room): 부스트 결제 UI 추가"

# 4. 원격 저장소에 푸시
git push origin feature/room-boost-payment

# 5. Pull Request 생성 (GitHub)
# develop ← feature/room-boost-payment

# 6. 코드 리뷰 후 머지
# 7. 브랜치 삭제
git branch -d feature/room-boost-payment
```

---

## 🔍 Pull Request 가이드

### PR 제목

커밋 메시지와 동일한 규칙:

```
feat(room): 모임 부스트 결제 기능 추가
fix(auth): 로그인 시 토큰 만료 처리
refactor(api): Rate Limit 로직 개선
```

### PR 템플릿

```markdown
## 📋 변경 사항

- Stripe Checkout을 사용한 부스트 결제 구현
- 1일/3일/7일 부스트 상품 추가
- 결제 성공 시 boost_until 필드 업데이트

## 🎯 변경 이유

모임 호스트가 모임을 상단에 노출하여 더 많은 참가자를 모을 수 있도록 부스트 기능 제공

## 🧪 테스트 방법

1. 모임 생성 후 "부스트하기" 클릭
2. Stripe Checkout 페이지에서 테스트 카드 입력
3. 결제 완료 후 모임이 상단에 노출되는지 확인

## 📸 스크린샷 (선택)

![부스트 모달](./screenshots/boost-modal.png)

## 🔗 관련 이슈

Closes #123
Related to #124

## ✅ 체크리스트

- [x] 로컬에서 테스트 완료
- [x] 타입 체크 통과 (`pnpm typecheck`)
- [x] Lint 통과 (`pnpm lint`)
- [x] 빌드 성공 (`pnpm build`)
- [ ] E2E 테스트 작성
```

### PR 크기 가이드

- **Small PR (권장)**: 100-300줄 변경
- **Medium PR**: 300-500줄 변경
- **Large PR (피하기)**: 500줄 이상

큰 기능은 여러 개의 작은 PR로 나누세요.

---

## 👀 코드 리뷰 프로세스

### 리뷰어 체크리스트

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 코딩 컨벤션을 따르는가?
- [ ] 테스트가 포함되어 있는가?
- [ ] 보안 취약점은 없는가?
- [ ] 성능 문제는 없는가?
- [ ] 문서화가 필요한가?
- [ ] Breaking Change는 없는가?

### 리뷰 코멘트 작성 예시

```markdown
# ✅ 승인 (Approve)
LGTM! 👍 깔끔한 구현이네요.

# 💬 제안 (Comment)
`useState` 대신 `useReducer`를 사용하면 상태 관리가 더 명확할 것 같아요.

# 🔧 수정 요청 (Request Changes)
이 부분은 XSS 취약점이 있을 수 있어요. `sanitizeHtml`을 사용해주세요.
```

### 리뷰 받는 사람 가이드

- 리뷰 코멘트에 감사 표시
- 수정 사항은 새로운 커밋으로 추가
- 논쟁이 필요하면 슬랙/디스코드로 논의

---

## 🧪 테스트 작성 가이드

### 단위 테스트 (Jest)

```typescript
// __tests__/lib/api.test.ts

import { ApiError, ApiResponse } from '@/lib/api'

describe('ApiError', () => {
  it('should create error with status code', () => {
    const error = new ApiError('Not Found', 404, 'NOT_FOUND')

    expect(error.message).toBe('Not Found')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
  })
})

describe('ApiResponse', () => {
  it('should return success response', () => {
    const response: ApiResponse<{ id: string }> = {
      ok: true,
      data: { id: '123' }
    }

    expect(response.ok).toBe(true)
    expect(response.data?.id).toBe('123')
  })
})
```

### E2E 테스트 (Playwright)

```typescript
// e2e/room-creation.spec.ts

import { test, expect } from '@playwright/test'

test('사용자가 모임을 생성할 수 있다', async ({ page }) => {
  // 1. 로그인
  await page.goto('/map')
  await page.click('[data-testid="login-button"]')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password')
  await page.click('[data-testid="submit-button"]')

  // 2. 모임 생성 페이지 이동
  await page.click('[data-testid="create-room-button"]')

  // 3. 모임 정보 입력
  await page.fill('[data-testid="room-title"]', '강남 맥주 모임')
  await page.selectOption('[data-testid="room-category"]', 'drink')

  // 4. 생성 버튼 클릭
  await page.click('[data-testid="submit-room"]')

  // 5. 성공 확인
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
})
```

### 테스트 명령어

```bash
# 단위 테스트
pnpm test                    # 모든 테스트 실행
pnpm test:watch              # Watch 모드
pnpm test api.test.ts        # 특정 파일 테스트

# E2E 테스트
pnpm e2e                     # 헤드리스 모드
pnpm e2e:ui                  # UI 모드 (디버깅)

# 전체 QA
pnpm repo:doctor             # typecheck + lint + build
```

---

## 🚀 개발 워크플로우 예시

### 1. 이슈 확인

GitHub Issues에서 작업할 이슈 선택 (예: #123)

### 2. 브랜치 생성

```bash
git checkout develop
git pull origin develop
git checkout -b feature/room-boost-payment
```

### 3. 개발

```bash
# 개발 서버 실행
pnpm dev

# 코드 작성...

# 타입 체크
pnpm typecheck

# Lint 체크
pnpm lint

# 자동 수정
pnpm lint:fix
```

### 4. 커밋

```bash
git add .
git commit -m "feat(room): 부스트 결제 UI 추가"

git add .
git commit -m "feat(room): Stripe Checkout 연동"

git add .
git commit -m "test(room): 부스트 결제 E2E 테스트 추가"
```

### 5. 푸시 및 PR

```bash
git push origin feature/room-boost-payment

# GitHub에서 Pull Request 생성
# develop ← feature/room-boost-payment
```

### 6. 코드 리뷰

- 리뷰어 지정
- 리뷰 코멘트 반영
- 수정 커밋 추가

### 7. 머지

- 리뷰 승인 후 "Squash and Merge" 클릭
- 브랜치 자동 삭제

---

## 🛠️ 도구 및 자동화

### Pre-commit Hook (선택)

```bash
# .husky/pre-commit
#!/bin/sh
pnpm lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### VS Code 추천 설정

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 📚 추가 자료

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

## ❓ 질문이 있으신가요?

- GitHub Issues에 질문 등록
- 팀 채팅 채널 (Slack/Discord)
- 이메일: dev@meetpin.com

---

**최종 업데이트**: 2025-10-01
**문서 버전**: 1.0.0
