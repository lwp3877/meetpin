# Components 폴더

밋핀(MeetPin) 프로젝트의 React 컴포넌트를 관리하는 폴더입니다.

---

## 📁 폴더 구조

```
components/
├── auth/             # 인증 관련 컴포넌트 (회원가입, 로그인)
├── chat/             # 채팅 UI 컴포넌트
├── common/           # 공통 컴포넌트 (Header, Footer, Providers)
├── error/            # 에러 처리 컴포넌트
├── icons/            # 커스텀 아이콘 컴포넌트
├── landing/          # 랜딩 페이지 전용 컴포넌트
├── layout/           # 레이아웃 컴포넌트
├── map/              # 지도 관련 컴포넌트 (메인 기능)
├── mobile/           # 모바일 최적화 컴포넌트
├── premium/          # 프리미엄 디자인 컴포넌트
├── room/             # 모임 관련 컴포넌트 (카드, 폼, 상세)
└── ui/               # shadcn/ui 기반 기본 UI 컴포넌트
```

---

## 🎯 주요 컴포넌트 소개

### 1. auth/ - 인증 컴포넌트

회원가입, 로그인, 인증 보호 기능을 제공합니다.

| 파일 | 설명 |
|------|------|
| `SignupForm.tsx` | 회원가입 폼 |
| `LoginForm.tsx` | 로그인 폼 |
| `AuthGuard.tsx` | 인증 보호 래퍼 (로그인 필요 페이지) |

**사용 예시:**
```tsx
import { AuthGuard } from '@/components/auth/AuthGuard'

// 로그인 필요 페이지
export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
```

---

### 2. chat/ - 채팅 컴포넌트

1:1 실시간 채팅 UI를 제공합니다.

| 파일 | 설명 |
|------|------|
| `ChatRoom.tsx` | 채팅방 전체 UI |
| `MessageList.tsx` | 메시지 목록 (무한 스크롤) |
| `MessageInput.tsx` | 메시지 입력창 (Enter 전송) |

**사용 예시:**
```tsx
import { ChatRoom } from '@/components/chat/ChatRoom'

<ChatRoom matchId={matchId} />
```

---

### 3. common/ - 공통 컴포넌트

전역에서 사용하는 공통 컴포넌트입니다.

| 파일 | 설명 |
|------|------|
| `Providers.tsx` | React Query, Toast 등 Provider 모음 |
| `Header.tsx` | 전역 헤더 (로고, 네비게이션) |
| `Footer.tsx` | 전역 푸터 |
| `ImageUploader.tsx` | 이미지 업로드 컴포넌트 (드래그앤드롭) |

**사용 예시:**
```tsx
// app/layout.tsx
import { Providers } from '@/components/common/Providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

### 4. map/ - 지도 컴포넌트 (핵심 기능)

카카오맵 기반 모임 탐색 기능을 제공합니다.

| 파일 | 설명 |
|------|------|
| `MapWithCluster.tsx` | 클러스터링 지도 (메인 화면) |
| `LocationPicker.tsx` | 위치 선택 컴포넌트 (모임 생성 시) |
| `RoomMarker.tsx` | 모임 마커 (지도 위 핀) |
| `ClusterMarker.tsx` | 클러스터 마커 (여러 모임 묶음) |

**사용 예시:**
```tsx
import { MapWithCluster } from '@/components/map/MapWithCluster'

<MapWithCluster
  rooms={rooms}
  onRoomClick={handleRoomClick}
/>
```

---

### 5. room/ - 모임 컴포넌트

모임 생성, 조회, 참가 기능을 제공합니다.

| 파일 | 설명 |
|------|------|
| `RoomCard.tsx` | 모임 카드 (목록용) |
| `RoomDetail.tsx` | 모임 상세 정보 |
| `RoomForm.tsx` | 모임 생성/수정 폼 |
| `JoinRequestButton.tsx` | 참가 요청 버튼 |
| `ParticipantsList.tsx` | 참가자 목록 |

**사용 예시:**
```tsx
import { RoomCard } from '@/components/room/RoomCard'

<RoomCard
  room={room}
  onJoin={(id) => handleJoin(id)}
/>
```

---

### 6. ui/ - 기본 UI 컴포넌트

shadcn/ui 기반 재사용 가능한 기본 UI 컴포넌트입니다.

| 컴포넌트 | 설명 |
|---------|------|
| `button.tsx` | 기본 버튼 (shadcn/ui) |
| `input.tsx` | 인풋 필드 |
| `card.tsx` | 카드 컨테이너 |
| `dialog.tsx` | 다이얼로그/모달 |
| `select.tsx` | 셀렉트 박스 |
| `badge.tsx` | 배지 (카테고리 표시) |
| `avatar.tsx` | 아바타 이미지 |
| `toast.tsx` | 토스트 알림 |

**추가 컴포넌트:**

| 컴포넌트 | 설명 |
|---------|------|
| `EnhancedButton.tsx` | 고급 기능 버튼 (로딩, 아이콘) |
| `premium-button.tsx` | 프리미엄 디자인 버튼 (그라디언트) |
| `premium-card.tsx` | 프리미엄 카드 (글로우 효과) |
| `BoostModal.tsx` | 부스트 결제 모달 |
| `ProfileModal.tsx` | 프로필 상세 모달 |
| `RealtimeChatModal.tsx` | 실시간 채팅 모달 |

**사용 예시:**
```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Card>
  <Button variant="primary">클릭</Button>
</Card>
```

---

## 📐 컴포넌트 작성 가이드

### 1. 파일 네이밍

```
PascalCase.tsx  # 컴포넌트 파일
```

예시:
- ✅ `RoomCard.tsx`
- ✅ `MapWithCluster.tsx`
- ❌ `roomCard.tsx`
- ❌ `room-card.tsx`

---

### 2. 컴포넌트 구조 템플릿

```tsx
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
  // 3. 훅 (컴포넌트 최상단)
  const [isLoading, setIsLoading] = React.useState(false)

  // 4. 이벤트 핸들러
  const handleJoinClick = () => {
    setIsLoading(true)
    onJoin?.(room.id)
  }

  // 5. 렌더링
  return (
    <div className={className}>
      <h3>{room.title}</h3>
      <button onClick={handleJoinClick} disabled={isLoading}>
        {isLoading ? '처리중...' : '참가하기'}
      </button>
    </div>
  )
}

export default RoomCard
```

---

### 3. import 순서

```tsx
// 1. React 및 외부 라이브러리
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 내부 컴포넌트
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. 내부 서비스/훅
import { useAuth } from '@/lib/useAuth'
import { getRoomById } from '@/lib/services/roomService'

// 4. 타입
import type { Room } from '@/types/global'

// 5. 스타일 (있다면)
import './styles.css'
```

---

### 4. Props 타입 정의

```tsx
// ✅ interface 사용 (확장 가능)
interface RoomCardProps {
  room: Room
  onJoin?: (roomId: string) => void
  className?: string
}

// ✅ 옵셔널 props는 ? 사용
interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode  // 필수
}
```

---

### 5. 서버/클라이언트 컴포넌트 구분

```tsx
// 서버 컴포넌트 (기본, 지시어 없음)
// - DB 직접 조회 가능
// - 브라우저 API 사용 불가
export default function RoomListPage() {
  const rooms = await getRoomsFromDB()  // ✅ 서버에서 직접 조회
  return <RoomList rooms={rooms} />
}

// 클라이언트 컴포넌트 ('use client' 필수)
// - useState, useEffect 사용 가능
// - 브라우저 API 사용 가능
'use client'
export default function InteractiveButton() {
  const [count, setCount] = useState(0)  // ✅ 상태 관리
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

---

## 🎨 스타일링 가이드

### Tailwind CSS 사용

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
  클릭
</button>

// ✅ 조건부 스타일: cn() 유틸리티
import { cn } from '@/lib/utils/cn'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isPremium ? 'premium-style' : 'regular-style'
)}>
  컨텐츠
</div>

// ⚠️ 인라인 스타일은 최소화
<div style={{ color: 'red' }}>❌ 피하기</div>
```

---

## 🧪 컴포넌트 테스트

```tsx
// __tests__/components/RoomCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import RoomCard from '@/components/room/RoomCard'

describe('RoomCard', () => {
  const mockRoom = {
    id: '1',
    title: '강남 맥주 모임',
    category: 'drink',
    // ...
  }

  it('모임 제목을 렌더링한다', () => {
    render(<RoomCard room={mockRoom} />)
    expect(screen.getByText('강남 맥주 모임')).toBeInTheDocument()
  })

  it('참가 버튼 클릭 시 onJoin 콜백이 호출된다', () => {
    const handleJoin = jest.fn()
    render(<RoomCard room={mockRoom} onJoin={handleJoin} />)

    fireEvent.click(screen.getByText('참가하기'))
    expect(handleJoin).toHaveBeenCalledWith('1')
  })
})
```

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [Next.js 컴포넌트](https://nextjs.org/docs/app/building-your-application/rendering)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**최종 업데이트**: 2025-10-01
