# 🗺️ MeetPin 프로젝트 완벽 가이드

**프로젝트**: 밋핀 (MeetPin) - 지도 기반 실시간 만남 플랫폼
**버전**: v1.5.0
**작성일**: 2025-10-13
**URL**: https://meetpin-weld.vercel.app

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [핵심 기능](#핵심-기능)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [API 엔드포인트](#api-엔드포인트)
7. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
8. [보안 시스템](#보안-시스템)
9. [성능 최적화](#성능-최적화)
10. [테스트 전략](#테스트-전략)
11. [배포 환경](#배포-환경)
12. [개발 가이드](#개발-가이드)

---

## 🎯 프로젝트 개요

### 비전
**"지도에 핀을 찍고, 지금 바로 근처 사람들과 만나세요"**

### 핵심 가치
- 🗺️ **위치 기반**: Kakao Maps 통합으로 실시간 지도 표시
- ⚡ **즉시 연결**: 1:1 채팅으로 빠른 만남 성사
- 🎯 **카테고리별**: 술친구(🍻), 운동메이트(💪), 취미모임(✨)
- 📱 **모바일 우선**: PWA로 앱처럼 사용 가능
- 🔒 **안전**: 신고/차단 시스템 + 나이 인증

### 프로젝트 규모
- **총 파일**: 157개 TypeScript/TSX 파일
- **코드 라인**: ~15,000+ 라인
- **컴포넌트**: 41개
- **API 엔드포인트**: 46개
- **페이지**: 26개
- **DB 테이블**: 15개 (핵심 12개 + 확장 3개)

---

## 🛠️ 기술 스택

### Frontend
```typescript
{
  "framework": "Next.js 15.5.2 (App Router)",
  "language": "TypeScript 5.x",
  "ui": "React 19.1.0",
  "styling": "Tailwind CSS v4",
  "components": "shadcn/ui + Radix UI",
  "state": "Zustand + React Context",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React"
}
```

### Backend
```typescript
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth (JWT)",
  "realtime": "Supabase Realtime (WebSocket)",
  "storage": "Supabase Storage",
  "cache": "Redis (Upstash) + ioredis",
  "api": "Next.js API Routes"
}
```

### External Services
```typescript
{
  "maps": "Kakao Maps JavaScript SDK",
  "payments": "Stripe",
  "analytics": "Sentry + Web Vitals",
  "monitoring": "Vercel Analytics",
  "hosting": "Vercel"
}
```

### Development Tools
```typescript
{
  "testing": "Jest (60 tests) + Playwright (E2E)",
  "linting": "ESLint 9 + Prettier",
  "bundler": "Webpack (Next.js)",
  "pwa": "@ducanh2912/next-pwa",
  "a11y": "@axe-core/playwright"
}
```

---

## 📁 프로젝트 구조

```
meetpin/
├── src/
│   ├── app/                          # Next.js App Router (26 pages)
│   │   ├── page.tsx                  # 홈 (랜딩 페이지)
│   │   ├── layout.tsx                # 루트 레이아웃 (메타데이터, SEO)
│   │   ├── globals.css               # 전역 스타일
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # 로그인
│   │   │   ├── signup/page.tsx       # 회원가입
│   │   │   └── callback/page.tsx     # OAuth 콜백
│   │   ├── map/
│   │   │   ├── page.tsx              # 지도 메인 (핵심 페이지)
│   │   │   └── layout.tsx            # 지도 레이아웃
│   │   ├── room/
│   │   │   ├── new/page.tsx          # 모임 생성
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # 모임 상세
│   │   │       ├── edit/page.tsx     # 모임 수정
│   │   │       └── requests/page.tsx # 참가 요청 관리
│   │   ├── chat/
│   │   │   └── [matchId]/page.tsx    # 1:1 채팅
│   │   ├── profile/
│   │   │   ├── page.tsx              # 내 프로필
│   │   │   └── [userId]/page.tsx     # 다른 사용자 프로필
│   │   ├── requests/page.tsx         # 내가 보낸 요청
│   │   ├── admin/page.tsx            # 관리자 대시보드
│   │   ├── settings/
│   │   │   ├── notifications/page.tsx # 알림 설정
│   │   │   └── safety/page.tsx        # 안전 설정
│   │   ├── legal/                    # 법적 문서 (5개)
│   │   │   ├── terms/page.tsx        # 이용약관
│   │   │   ├── privacy/page.tsx      # 개인정보처리방침
│   │   │   ├── location/page.tsx     # 위치정보이용약관
│   │   │   ├── location-terms/page.tsx
│   │   │   └── cookie-policy/page.tsx
│   │   ├── contact/page.tsx          # 문의하기
│   │   ├── help/page.tsx             # 도움말
│   │   ├── status/page.tsx           # 시스템 상태
│   │   ├── system-status/page.tsx    # 시스템 상태 (상세)
│   │   └── api/                      # API Routes (46개)
│   │       ├── rooms/route.ts        # 모임 CRUD
│   │       ├── rooms/[id]/route.ts
│   │       ├── requests/route.ts     # 참가 요청
│   │       ├── matches/route.ts      # 매칭
│   │       ├── messages/route.ts     # 채팅 메시지
│   │       ├── notifications/route.ts # 알림
│   │       ├── profile/route.ts      # 프로필
│   │       ├── block/route.ts        # 차단
│   │       ├── reports/route.ts      # 신고
│   │       ├── payments/stripe/      # Stripe 결제
│   │       ├── health/route.ts       # 헬스체크 (6개)
│   │       ├── safety/               # 안전 시스템 (4개)
│   │       ├── dsar/                 # GDPR 준수 (2개)
│   │       ├── cron/                 # 스케줄 작업 (2개)
│   │       └── ...
│   ├── components/                   # React 컴포넌트 (41개)
│   │   ├── auth/                     # 인증 (1개)
│   │   │   └── SocialLogin.tsx
│   │   ├── chat/                     # 채팅 (1개)
│   │   │   └── ChatPanel.tsx
│   │   ├── common/                   # 공통 (3개)
│   │   │   ├── Providers.tsx         # 전역 Provider
│   │   │   ├── theme-toggle.tsx      # 다크모드
│   │   │   └── BotSchedulerInitializer.tsx
│   │   ├── error/                    # 에러 (1개)
│   │   │   └── GlobalErrorBoundary.tsx
│   │   ├── landing/                  # 랜딩 (1개)
│   │   │   └── ProLanding.tsx        # 프로 랜딩 (동적 임포트)
│   │   ├── layout/                   # 레이아웃 (1개)
│   │   │   └── LegalFooter.tsx
│   │   ├── map/                      # 지도 (4개)
│   │   │   ├── DynamicMap.tsx        # 동적 지도 (코드 스플리팅)
│   │   │   ├── MapWithCluster.tsx    # 클러스터링 지도
│   │   │   ├── LocationPicker.tsx    # 위치 선택기
│   │   │   └── MapFilters.tsx        # 필터
│   │   ├── pwa/                      # PWA (1개)
│   │   │   └── InstallPrompt.tsx     # A2HS 프롬프트
│   │   ├── room/                     # 모임 (1개)
│   │   │   └── RoomForm.tsx          # 모임 폼
│   │   ├── safety/                   # 안전 (1개)
│   │   │   └── EmergencyReportButton.tsx
│   │   └── ui/                       # UI 컴포넌트 (24개)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── slider.tsx
│   │       ├── separator.tsx
│   │       ├── label.tsx
│   │       ├── avatar.tsx
│   │       └── ... (shadcn/ui 컴포넌트)
│   ├── lib/                          # 유틸리티 & 로직
│   │   ├── api.ts                    # API 헬퍼 (핵심)
│   │   ├── supabaseClient.ts         # Supabase 클라이언트
│   │   ├── zodSchemas.ts             # Zod 스키마 (검증)
│   │   ├── bbox.ts                   # 지도 BBox 유틸
│   │   ├── rateLimit.ts              # Rate Limiting
│   │   ├── accessibility/            # 접근성
│   │   ├── bot/                      # 봇 생성 (AI)
│   │   ├── cache/                    # Redis 캐싱
│   │   │   └── redis.ts
│   │   ├── config/                   # 설정
│   │   │   ├── brand.ts              # 브랜드 메시지
│   │   │   └── flags.ts              # 피처 플래그
│   │   ├── design/                   # 디자인 토큰
│   │   ├── observability/            # 로깅
│   │   │   └── logger.ts
│   │   ├── payments/                 # Stripe
│   │   ├── security/                 # 보안
│   │   ├── services/                 # 외부 서비스
│   │   └── utils/                    # 일반 유틸
│   ├── types/
│   │   └── global.d.ts               # 전역 타입 정의 (핵심)
│   └── middleware.ts                 # Next.js 미들웨어 (CORS, 인증)
├── public/
│   ├── icons/                        # PWA 아이콘 (8개 사이즈)
│   ├── screenshots/                  # PWA 스크린샷
│   ├── manifest.json                 # PWA Manifest
│   ├── sw.js                         # Service Worker
│   ├── robots.txt                    # SEO
│   └── sitemap.xml                   # SEO
├── scripts/                          # 데이터베이스 스크립트
│   ├── migrate.sql                   # 마이그레이션 (핵심)
│   ├── rls.sql                       # RLS 정책 (보안)
│   ├── seed.sql                      # 샘플 데이터
│   └── *.sql                         # 추가 스키마 (15개)
├── tests/
│   ├── e2e/                          # Playwright E2E (11개)
│   ├── rls/                          # RLS 보안 테스트
│   └── __tests__/                    # Jest 단위 테스트 (60개)
├── artifacts/                        # 감사 보고서
├── next.config.ts                    # Next.js 설정 (핵심)
├── tailwind.config.ts                # Tailwind 설정
├── tsconfig.json                     # TypeScript 설정
├── package.json                      # 의존성
├── playwright.config.ts              # Playwright 설정
├── jest.config.js                    # Jest 설정
└── CLAUDE.md                         # 프로젝트 가이드
```

---

## 🎯 핵심 기능

### 1. 지도 기반 모임 (Map-based Meetups)

#### 기능 설명
- Kakao Maps SDK 통합
- 실시간 모임 위치 마커 표시
- 클러스터링으로 밀집 지역 그룹화
- BBox 기반 지역 필터링

#### 관련 파일
```
src/app/map/page.tsx
src/components/map/DynamicMap.tsx
src/components/map/MapWithCluster.tsx
src/lib/bbox.ts
src/app/api/rooms/route.ts
```

#### 주요 API
```typescript
GET /api/rooms?bbox=south,west,north,east&category=술
POST /api/rooms
GET /api/rooms/[id]
PUT /api/rooms/[id]
DELETE /api/rooms/[id]
```

#### 데이터 흐름
1. 사용자 지도 이동 → BBox 좌표 계산
2. `/api/rooms?bbox=...` 호출
3. PostgreSQL WHERE 쿼리 (위도/경도 범위)
4. Redis 캐싱 (5분 TTL)
5. 마커로 렌더링

---

### 2. 참가 요청 & 매칭 (Join Requests & Matching)

#### 기능 설명
- 사용자가 모임에 참가 요청
- 호스트가 승인/거절
- 승인 시 자동으로 1:1 매칭 생성

#### 관련 파일
```
src/app/room/[id]/requests/page.tsx
src/app/requests/page.tsx
src/app/api/requests/route.ts
src/app/api/requests/[id]/route.ts
```

#### 주요 API
```typescript
POST /api/requests { room_id, message }
GET /api/requests/my
PATCH /api/requests/[id] { status: 'approved' | 'rejected' }
GET /api/rooms/[id]/requests
```

#### 상태 머신
```
pending → approved → match 생성
       ↘ rejected
```

---

### 3. 1:1 실시간 채팅 (Real-time Chat)

#### 기능 설명
- Supabase Realtime WebSocket
- 읽음/안읽음 상태
- 타이핑 인디케이터
- 온라인 상태 표시

#### 관련 파일
```
src/app/chat/[matchId]/page.tsx
src/components/chat/ChatPanel.tsx
src/app/api/matches/[id]/messages/route.ts
```

#### 주요 API
```typescript
GET /api/matches/my
GET /api/matches/[id]/messages
POST /api/matches/[id]/messages { content }
```

#### Realtime 구독
```typescript
supabase
  .channel(`match:${matchId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, payload => {
    // 새 메시지 추가
  })
  .subscribe()
```

---

### 4. 알림 시스템 (Notification System)

#### 기능 설명
- 브라우저 Push 알림
- Supabase Realtime 알림
- 읽음/안읽음 관리
- 호스트 메시지 알림

#### 관련 파일
```
src/app/api/notifications/route.ts
src/app/api/host-messages/route.ts
src/components/pwa/InstallPrompt.tsx
```

#### 주요 API
```typescript
GET /api/notifications
PATCH /api/notifications/[id]/read
POST /api/notifications/read-all
DELETE /api/notifications/[id]
```

#### 알림 타입
```typescript
type NotificationType =
  | 'join_request'      // 참가 요청
  | 'request_approved'  // 승인됨
  | 'request_rejected'  // 거절됨
  | 'new_message'       // 새 메시지
  | 'room_updated'      // 모임 업데이트
  | 'system'            // 시스템 알림
```

---

### 5. 결제 시스템 (Stripe Payments)

#### 기능 설명
- 프리미엄 부스트 구매
- 모임 상단 노출 (1일/3일/7일)
- Stripe Checkout 통합
- Webhook으로 자동 처리

#### 관련 파일
```
src/app/api/payments/stripe/checkout/route.ts
src/app/api/payments/stripe/webhook/route.ts
src/lib/payments/stripe.ts
```

#### 주요 API
```typescript
POST /api/payments/stripe/checkout {
  roomId: string,
  duration: 1 | 3 | 7
}
POST /api/payments/stripe/webhook (Stripe → Server)
```

#### 가격
```
1일: ₩1,000
3일: ₩2,500
7일: ₩5,000
```

#### 플로우
1. 사용자 부스트 클릭
2. Stripe Checkout 세션 생성
3. 결제 완료
4. Webhook → `rooms.boost_until` 업데이트
5. 정렬 알고리즘에서 상단 노출

---

### 6. 프로필 & 아바타 (Profile & Avatar)

#### 기능 설명
- Supabase Storage 이미지 업로드
- 한국어 아바타 큐레이션
- 이미지 최적화 (WebP/AVIF)
- 프로필 통계

#### 관련 파일
```
src/app/profile/page.tsx
src/app/profile/[userId]/page.tsx
src/app/api/profile/avatar/route.ts
src/app/api/profile/stats/route.ts
```

#### 주요 API
```typescript
GET /api/profile
PATCH /api/profile { nickname, bio, avatar_url }
POST /api/profile/avatar (multipart/form-data)
GET /api/profile/stats
```

---

### 7. 신고 & 차단 (Report & Block)

#### 기능 설명
- 사용자 신고 (스팸, 욕설, 불쾌감 등)
- 사용자 차단 (양방향 가시성 차단)
- RLS로 차단된 사용자 자동 필터링
- 관리자 대시보드에서 신고 관리

#### 관련 파일
```
src/app/api/reports/route.ts
src/app/api/block/route.ts
src/app/admin/page.tsx
scripts/rls.sql
```

#### 주요 API
```typescript
POST /api/reports {
  reported_user_id,
  reason,
  description
}
POST /api/block { blocked_user_id }
DELETE /api/block/[userId]
```

#### RLS 보안
```sql
-- 차단된 사용자는 서로 못 봄
CREATE POLICY "block_visibility" ON rooms
FOR SELECT USING (
  created_by NOT IN (
    SELECT blocked_user_id FROM blocked_users WHERE user_id = auth.uid()
  ) AND
  created_by NOT IN (
    SELECT user_id FROM blocked_users WHERE blocked_user_id = auth.uid()
  )
);
```

---

### 8. 관리자 대시보드 (Admin Dashboard)

#### 기능 설명
- 신고 관리 (승인/거절)
- 사용자 통계
- 모임 통계
- 시스템 상태 모니터링

#### 관련 파일
```
src/app/admin/page.tsx
src/app/api/reports/route.ts
src/app/api/status/route.ts
```

#### 주요 API
```typescript
GET /api/reports (admin only)
PATCH /api/reports/[id] { status }
GET /api/status
GET /api/health
```

---

### 9. PWA (Progressive Web App)

#### 기능 설명
- 오프라인 동작
- 앱 설치 가능 (A2HS)
- Service Worker 캐싱
- 푸시 알림

#### 관련 파일
```
public/manifest.json
public/sw.js
next.config.ts (PWA 설정)
src/components/pwa/InstallPrompt.tsx
```

#### manifest.json
```json
{
  "name": "밋핀",
  "short_name": "밋핀",
  "start_url": "/map",
  "display": "standalone",
  "icons": [...], // 8개 사이즈
  "shortcuts": [...] // 지도/새 모임/프로필
}
```

#### Service Worker 전략
```typescript
{
  "Google Fonts": "CacheFirst",
  "Supabase API": "NetworkFirst (5분 캐시)",
  "Kakao Maps": "NetworkFirst (24시간 캐시)",
  "Images": "CacheFirst (30일)",
  "API": "NetworkFirst (1분)"
}
```

---

### 10. 안전 시스템 (Safety System)

#### 기능 설명
- 긴급 신고 (응급 상황)
- 미팅 후 피드백
- 나이 인증 (GDPR 준수)
- 안전 설정

#### 관련 파일
```
src/app/api/safety/emergency/route.ts
src/app/api/safety/feedback/route.ts
src/app/api/safety/verification/route.ts
src/app/settings/safety/page.tsx
scripts/emergency-report-system.sql
```

#### 주요 API
```typescript
POST /api/safety/emergency {
  location,
  description,
  priority: 'low' | 'medium' | 'high' | 'critical'
}
POST /api/safety/feedback {
  meetup_id,
  rating,
  safety_concerns
}
POST /api/safety/verification {
  verification_type: 'phone' | 'id' | 'email'
}
```

---

### 11. GDPR/DSAR 준수 (GDPR Compliance)

#### 기능 설명
- 데이터 내보내기 (ZIP)
- 데이터 삭제 요청
- 자동 데이터 정리 (Cron)
- 개인정보 보호

#### 관련 파일
```
src/app/api/dsar/export/route.ts
src/app/api/dsar/delete-request/route.ts
src/app/api/cron/cleanup-old-notifications/route.ts
```

#### 주요 API
```typescript
POST /api/dsar/export
POST /api/dsar/delete-request { reason }
GET /api/cron/cleanup-old-notifications
```

---

### 12. 봇 자동 생성 (AI Bot Generation)

#### 기능 설명
- AI로 모임 자동 생성
- 다양한 카테고리/지역
- 스케줄러로 주기적 생성

#### 관련 파일
```
src/lib/bot/generateBotRoom.ts
src/lib/bot/scheduler.ts
src/app/api/bot/generate/route.ts
src/components/common/BotSchedulerInitializer.tsx
```

#### 주요 API
```typescript
POST /api/bot/generate {
  count: number,
  categories: string[]
}
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블 (12개)

#### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nickname VARCHAR(50) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. rooms (모임)
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL, -- '술', '운동', '기타'
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  max_participants INT DEFAULT 10,
  meeting_time TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  boost_until TIMESTAMPTZ, -- 부스트 만료 시간
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_location ON rooms(latitude, longitude);
CREATE INDEX idx_rooms_category ON rooms(category);
CREATE INDEX idx_rooms_boost ON rooms(boost_until);
```

#### 3. requests (참가 요청)
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_requests_room ON requests(room_id);
CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
```

#### 4. matches (매칭)
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user1_id UUID REFERENCES profiles(id),
  user2_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user1_id, user2_id)
);

CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
```

#### 5. messages (채팅)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Realtime 활성화
ALTER TABLE messages REPLICA IDENTITY FULL;
```

#### 6. notifications (알림)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

#### 7. host_messages (호스트 메시지)
```sql
CREATE TABLE host_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. reports (신고)
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. blocked_users (차단)
```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  blocked_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_blocked_users ON blocked_users(user_id, blocked_user_id);
```

#### 10. age_verification (나이 인증)
```sql
CREATE TABLE age_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 11. feedback (피드백)
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  feedback_type VARCHAR(50),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 12. emergency_reports (긴급 신고)
```sql
CREATE TABLE emergency_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  location TEXT,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 관계도

```
profiles (사용자)
  ├─1:N→ rooms (모임 생성)
  ├─1:N→ requests (참가 요청)
  ├─1:N→ messages (메시지 전송)
  ├─1:N→ notifications (알림)
  └─1:N→ reports (신고)

rooms (모임)
  ├─1:N→ requests (참가 요청들)
  └─1:N→ matches (매칭들)

requests (참가 요청)
  └─승인→ matches (1:1 매칭 생성)

matches (매칭)
  └─1:N→ messages (채팅 메시지들)
```

---

## 🔌 API 엔드포인트 (46개)

### 인증 (Auth)
```typescript
POST /api/auth/demo-login          # 개발용 Mock 로그인
```

### 모임 (Rooms)
```typescript
GET    /api/rooms                  # 모임 목록 (BBox 필터)
POST   /api/rooms                  # 모임 생성
GET    /api/rooms/[id]             # 모임 상세
PUT    /api/rooms/[id]             # 모임 수정
DELETE /api/rooms/[id]             # 모임 삭제
GET    /api/rooms/[id]/requests    # 모임의 참가 요청 목록
```

### 참가 요청 (Requests)
```typescript
POST   /api/requests               # 참가 요청 생성
GET    /api/requests/my            # 내가 보낸 요청
PATCH  /api/requests/[id]          # 요청 승인/거절
DELETE /api/requests/[id]          # 요청 취소
```

### 매칭 & 채팅 (Matches & Messages)
```typescript
GET    /api/matches/my                     # 내 매칭 목록
GET    /api/matches/[id]/messages          # 채팅 메시지 목록
POST   /api/matches/[id]/messages          # 메시지 전송
```

### 알림 (Notifications)
```typescript
GET    /api/notifications                  # 알림 목록
PATCH  /api/notifications/[id]/read        # 알림 읽음 처리
POST   /api/notifications/read-all         # 전체 읽음 처리
DELETE /api/notifications/[id]             # 알림 삭제
```

### 호스트 메시지 (Host Messages)
```typescript
GET    /api/host-messages                  # 호스트 메시지 목록
POST   /api/host-messages                  # 호스트에게 메시지
GET    /api/host-messages/[id]             # 메시지 상세
PATCH  /api/host-messages/[id]/read        # 읽음 처리
DELETE /api/host-messages/[id]             # 메시지 삭제
```

### 프로필 (Profile)
```typescript
GET    /api/profile                        # 내 프로필
PATCH  /api/profile                        # 프로필 수정
POST   /api/profile/avatar                 # 아바타 업로드
GET    /api/profile/stats                  # 프로필 통계
```

### 신고 & 차단 (Reports & Block)
```typescript
POST   /api/reports                        # 신고
GET    /api/reports                        # 신고 목록 (admin)
PATCH  /api/reports/[id]                   # 신고 처리 (admin)
POST   /api/block                          # 차단
DELETE /api/block/[userId]                 # 차단 해제
```

### 결제 (Payments)
```typescript
POST   /api/payments/stripe/checkout       # 결제 세션 생성
POST   /api/payments/stripe/webhook        # Stripe Webhook
```

### 안전 (Safety)
```typescript
POST   /api/safety/emergency               # 긴급 신고
POST   /api/safety/feedback                # 피드백
POST   /api/safety/verification            # 인증
GET    /api/safety/settings                # 안전 설정
PATCH  /api/safety/settings                # 설정 업데이트
```

### GDPR (DSAR)
```typescript
POST   /api/dsar/export                    # 데이터 내보내기
POST   /api/dsar/delete-request            # 삭제 요청
POST   /api/privacy-rights/request         # 개인정보 권리 요청
```

### 헬스체크 (Health)
```typescript
GET    /api/health                         # 전체 헬스체크
GET    /api/healthz                        # 간단 헬스체크
GET    /api/livez                          # Liveness
GET    /api/ready                          # Readiness (간단)
GET    /api/readyz                         # Readiness (상세)
GET    /api/status                         # 상태 정보
```

### 모니터링 (Monitoring)
```typescript
GET    /api/monitoring                     # 시스템 모니터링
GET    /api/cache/stats                    # 캐시 통계
POST   /api/security/csp-report            # CSP 위반 리포트
```

### 봇 (Bot)
```typescript
POST   /api/bot/generate                   # 봇 모임 생성
```

### Cron Jobs
```typescript
GET    /api/cron/cleanup-expired-boosts    # 만료 부스트 정리
GET    /api/cron/cleanup-old-notifications # 오래된 알림 정리
```

### 관리자 (Admin)
```typescript
POST   /api/admin/seed                     # 샘플 데이터 생성
```

### 기타
```typescript
GET    /api/age-verification               # 나이 인증
GET    /api/emergency-report               # 긴급 신고 (legacy)
GET    /api/feedback                       # 피드백 (legacy)
```

---

## 🧩 컴포넌트 아키텍처

### 컴포넌트 계층

```
App
├── Providers (전역 상태)
│   ├── ThemeProvider (다크모드)
│   ├── SupabaseProvider (인증)
│   └── ToastProvider (알림)
├── Layout (공통 레이아웃)
│   ├── Header (네비게이션)
│   ├── Main (콘텐츠)
│   └── Footer (법적 문서)
└── Pages (라우트별)
    ├── Map (지도)
    │   ├── DynamicMap (Kakao Maps)
    │   ├── MapFilters (필터)
    │   └── RoomMarkers (마커)
    ├── Room (모임)
    │   ├── RoomForm (생성/수정)
    │   ├── RoomDetail (상세)
    │   └── RequestsList (요청 목록)
    ├── Chat (채팅)
    │   └── ChatPanel (채팅 UI)
    └── Profile (프로필)
        └── ProfileEditor (수정)
```

### 핵심 컴포넌트

#### 1. DynamicMap.tsx
```typescript
// 동적 임포트로 코드 스플리팅
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./MapWithCluster'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

// Kakao Maps SDK 로드 및 지도 렌더링
```

#### 2. ChatPanel.tsx
```typescript
// Realtime 채팅 UI
function ChatPanel({ matchId }) {
  const { messages, sendMessage, isTyping } = useRealtimeChat(matchId);

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <TypingIndicator show={isTyping} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

#### 3. Providers.tsx
```typescript
'use client';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <ToastProvider>
          <BotSchedulerInitializer />
          {children}
        </ToastProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
```

### UI 컴포넌트 (shadcn/ui)

- **button.tsx**: 버튼 (Primary, Secondary, Outline, Ghost)
- **input.tsx**: 입력 필드
- **dialog.tsx**: 모달
- **dropdown-menu.tsx**: 드롭다운
- **select.tsx**: 셀렉트
- **tabs.tsx**: 탭
- **slider.tsx**: 슬라이더
- **separator.tsx**: 구분선
- **label.tsx**: 라벨
- **avatar.tsx**: 아바타

---

## 🔒 보안 시스템

### 1. Row Level Security (RLS)

#### 기본 원칙
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ...
```

#### 핵심 정책

##### Rooms (모임)
```sql
-- 읽기: 차단되지 않은 사용자의 모임만 보임
CREATE POLICY "select_rooms" ON rooms FOR SELECT USING (
  created_by NOT IN (
    SELECT blocked_user_id FROM blocked_users WHERE user_id = auth.uid()
    UNION
    SELECT user_id FROM blocked_users WHERE blocked_user_id = auth.uid()
  )
);

-- 생성: 인증된 사용자만
CREATE POLICY "insert_rooms" ON rooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- 수정/삭제: 본인 모임만
CREATE POLICY "update_rooms" ON rooms FOR UPDATE
USING (auth.uid() = created_by);
```

##### Messages (채팅)
```sql
-- 읽기: 본인이 참여한 매칭의 메시지만
CREATE POLICY "select_messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- 생성: 본인이 참여한 매칭에만
CREATE POLICY "insert_messages" ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);
```

### 2. 인증 & 인가

#### API 인증
```typescript
// src/lib/api.ts
export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError('Unauthorized', 401);
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  // Admin 역할 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new ApiError('Forbidden', 403);
  }

  return user;
}
```

### 3. Rate Limiting

```typescript
// src/lib/rateLimit.ts
const rateLimitStore = new Map<string, RateLimitEntry>();

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (entry.count >= limit) {
    return false; // Rate limit exceeded
  }

  entry.count++;
  return true;
}
```

#### 적용 예시
```typescript
// API Route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!await rateLimit(`api:rooms:${ip}`, 5, 60000)) {
    return NextResponse.json(
      { ok: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... 로직
}
```

### 4. Input Validation (Zod)

```typescript
// src/lib/zodSchemas.ts
import { z } from 'zod';

export const roomSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['술', '운동', '기타']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  max_participants: z.number().int().min(2).max(50),
  meeting_time: z.string().datetime().optional()
});

export const messageSchema = z.object({
  content: z.string().min(1).max(1000)
});

// 사용
const validated = roomSchema.parse(requestBody);
```

### 5. CORS 정책 (신규 적용)

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://meetpin-weld.vercel.app',
      'https://meetpin.com'
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  return response;
}
```

### 6. Content Security Policy

```typescript
// next.config.ts
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ');
```

---

## ⚡ 성능 최적화

### 1. 코드 스플리팅

#### Dynamic Import (14개)
```typescript
// 지도 컴포넌트 (가장 큰 번들)
const DynamicMap = dynamic(() => import('./MapWithCluster'), {
  ssr: false,
  loading: () => <Skeleton />
});

// 랜딩 페이지
const ProLanding = dynamic(() => import('./ProLanding'), {
  loading: () => <LandingSkeleton />
});
```

### 2. 이미지 최적화

```typescript
// next.config.ts
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
}

// 사용
<Image
  src="/og-image.jpg"
  alt="밋핀"
  width={1200}
  height={630}
  priority // LCP 이미지
  quality={85}
/>
```

### 3. Redis 캐싱

```typescript
// src/lib/cache/redis.ts
export async function getCachedRooms(bbox: BBox) {
  const key = `rooms:${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  // Redis에서 조회
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // DB 조회
  const rooms = await supabase.from('rooms').select('*')...;

  // Redis에 저장 (5분 TTL)
  await redis.setex(key, 300, JSON.stringify(rooms));

  return rooms;
}
```

### 4. Resource Hints (신규 추가)

```html
<!-- src/app/layout.tsx -->
<head>
  {/* Preconnect */}
  <link rel="preconnect" href="https://xnrqfkecpabucnoxxtwa.supabase.co" />
  <link rel="preconnect" href="https://dapi.kakao.com" />
  <link rel="preconnect" href="https://js.stripe.com" crossOrigin="anonymous" />

  {/* Preload */}
  <link rel="preload" as="script" href="https://dapi.kakao.com/v2/maps/sdk.js" />
  <link rel="preload" href="/icons/meetpin.svg" as="image" type="image/svg+xml" />

  {/* DNS Prefetch */}
  <link rel="dns-prefetch" href="//t1.daumcdn.net" />
</head>
```

### 5. Service Worker 캐싱

```javascript
// public/sw.js (Workbox)
workbox.routing.registerRoute(
  /^https:\/\/.*\.supabase\.co\/.*/i,
  new workbox.strategies.NetworkFirst({
    cacheName: 'supabase-api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5분
      })
    ]
  })
);
```

### 6. 번들 최적화

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'date-fns',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    'react-hook-form',
    'zod'
  ]
}
```

### 7. 성능 지표 (현재)

| 지표 | Desktop | Mobile | 목표 | 상태 |
|------|---------|--------|------|------|
| **LCP** | 2.3s (예상) | 3.4s (예상) | ≤2.5s / ≤3.5s | ✅ |
| **CLS** | 0.00 | 0.00 | ≤0.10 | ✅ |
| **TBT** | 0ms | 30ms | ≤200ms | ✅ |
| **Performance** | 72 → 80 (예상) | 76 → 85 (예상) | ≥90 | 🔄 |

---

## 🧪 테스트 전략

### 1. Jest 단위 테스트 (60개)

#### 테스트 커버리지
```
__tests__/
├── lib/
│   ├── zodSchemas.test.ts       # Zod 스키마 검증
│   ├── bbox.test.ts              # BBox 유틸
│   ├── api.test.ts               # API 헬퍼
│   └── rateLimit.test.ts         # Rate Limiting
└── components/
    └── ...
```

#### 실행
```bash
pnpm test              # 전체 테스트
pnpm test:watch        # Watch 모드
```

### 2. Playwright E2E 테스트 (11개)

#### 테스트 시나리오
```
tests/e2e/
├── 01-home.spec.ts                        # 홈페이지
├── 02-auth.spec.ts                        # 로그인
├── 03-room-create.spec.ts                 # 모임 생성
├── 04-chat.spec.ts                        # 채팅
├── 05-payments.spec.ts                    # 결제
├── 06-notifications.spec.ts               # 알림
├── 07-accessibility.spec.ts               # 접근성 (12개 서브테스트)
├── all-pages-comprehensive-test.spec.ts   # 전체 페이지
├── main-page-full-test.spec.ts            # 메인 페이지
├── new-landing-test.spec.ts               # 랜딩
└── pro-landing-test.spec.ts               # 프로 랜딩
```

#### 실행
```bash
pnpm e2e               # Headless 모드
pnpm e2e:ui            # UI 모드
pnpm qa:mobile         # 모바일 테스트
```

### 3. RLS 보안 테스트

```
tests/rls/
└── rls-security.spec.ts        # RLS 정책 검증
```

### 4. 접근성 테스트 (axe-core)

```typescript
// tests/e2e/07-accessibility.spec.ts
test('homepage accessibility scan', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toHaveLength(0);
});
```

**결과**: Critical/Serious 위반 0개 ✅

### 5. 성능 테스트

```bash
# Lighthouse
npx lighthouse https://meetpin-weld.vercel.app/ --preset=desktop

# Bundle 분석
pnpm analyze:bundle

# 성능 가드
pnpm perf:guard
```

---

## 🚀 배포 환경

### Vercel 설정

#### 프로젝트
- **Organization**: meetpins-projects
- **Repository**: GitHub (meetpin)
- **Branch**: main (자동 배포)
- **Domain**: meetpin-weld.vercel.app

#### 환경변수 (필수)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kakao Maps
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
SITE_URL=https://meetpin-weld.vercel.app
```

#### 빌드 설정
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### Git 워크플로우

```
main (프로덕션)
  ↑
commit → push → Vercel 자동 배포 (3-5분)
```

### 배포 프로세스

1. **로컬 검증**
   ```bash
   pnpm repo:doctor  # typecheck + lint + build
   ```

2. **커밋 & 푸시**
   ```bash
   git add .
   git commit -m "feat: ..."
   git push origin main
   ```

3. **Vercel 자동 배포**
   - 빌드 실행
   - 테스트 실행
   - 프로덕션 배포

4. **배포 후 검증** (30분 후)
   ```bash
   # LCP 재측정
   npx lighthouse https://meetpin-weld.vercel.app/ --preset=desktop

   # CORS 검증
   curl -I -H "Origin: https://malicious-site.com" https://meetpin-weld.vercel.app/api/rooms
   ```

---

## 💻 개발 가이드

### 로컬 환경 설정

#### 1. 클론 & 설치
```bash
git clone https://github.com/meetpin/meetpin.git
cd meetpin
pnpm install
```

#### 2. 환경변수 설정
```bash
cp .env.example .env.local
# .env.local 파일 수정
```

#### 3. 개발 서버 실행
```bash
pnpm dev  # localhost:3001
```

### 개발 모드 특징

#### Mock 인증
```typescript
// src/lib/services/mockAuth.ts
export const MOCK_USERS = [
  {
    email: 'admin@meetpin.com',
    password: '123456',
    role: 'admin'
  },
  {
    email: 'user@meetpin.com',
    password: '123456',
    role: 'user'
  }
];
```

#### 샘플 데이터
- 서울 지역 기준 샘플 모임 데이터
- Mock 프로필
- 테스트용 채팅

### 코딩 컨벤션

#### 파일 명명
```
- Components: PascalCase.tsx
- Utils: camelCase.ts
- Types: global.d.ts (통합)
- API Routes: route.ts (Next.js 규칙)
```

#### Import 순서
```typescript
// 1. External
import React from 'react';
import { NextResponse } from 'next/server';

// 2. Internal (@/)
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { roomSchema } from '@/lib/zodSchemas';

// 3. Types
import type { Room } from '@/types/global';

// 4. Styles
import './styles.css';
```

#### API Response 형식
```typescript
// 성공
return NextResponse.json({
  ok: true,
  data: rooms
});

// 에러
return NextResponse.json({
  ok: false,
  code: 'VALIDATION_ERROR',
  message: '잘못된 요청입니다'
}, { status: 400 });
```

### 디버깅

#### 로깅
```typescript
// src/lib/observability/logger.ts
import { logger } from '@/lib/observability/logger';

logger.info('Room created', { roomId: room.id });
logger.error('Failed to create room', { error });
```

#### 개발자 도구
```typescript
// Chrome DevTools
// - Application > Service Workers (PWA)
// - Network > WS (Realtime)
// - Console (에러)
```

### 주요 명령어

```bash
# 개발
pnpm dev                    # 개발 서버
pnpm build                  # 프로덕션 빌드
pnpm start                  # 프로덕션 서버

# 품질 검사
pnpm typecheck              # TypeScript
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint 자동 수정
pnpm format                 # Prettier
pnpm repo:doctor            # 전체 검사

# 테스트
pnpm test                   # Jest
pnpm test:watch             # Jest Watch
pnpm e2e                    # Playwright
pnpm e2e:ui                 # Playwright UI
pnpm a11y                   # 접근성

# QA
pnpm qa:local               # 로컬 QA
pnpm qa:production          # 프로덕션 QA
pnpm qa:full                # 전체 QA

# 성능
pnpm analyze:bundle         # 번들 분석
pnpm perf:guard             # 성능 가드

# 보안
pnpm audit:security         # 보안 감사
```

---

## 📚 추가 자료

### 문서
- **CLAUDE.md**: 프로젝트 가이드 (Claude Code용)
- **CLEANUP_SUMMARY.md**: 코드 정리 요약
- **artifacts/prod-audit-*/**: 프로덕션 감사 보고서

### 외부 링크
- **프로덕션**: https://meetpin-weld.vercel.app
- **GitHub**: (프라이빗 리포지토리)
- **Vercel**: https://vercel.com/meetpins-projects/meetpin
- **Supabase**: (대시보드 링크)

### 기술 문서
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Kakao Maps API](https://apis.map.kakao.com/)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 로드맵

### 완료 (v1.5.0)
- ✅ 지도 기반 모임 시스템
- ✅ 1:1 실시간 채팅
- ✅ 결제 시스템 (Stripe)
- ✅ PWA 완전 구현
- ✅ 접근성 (WCAG 2.1 AA)
- ✅ 보안 강화 (RLS, CORS, CSP)
- ✅ 성능 최적화 (LCP 개선)
- ✅ GDPR 준수
- ✅ 안전 시스템

### 계획 (v1.6.0)
- 🔄 소셜 로그인 (Kakao, Naver, Google)
- 🔄 푸시 알림 (Firebase Cloud Messaging)
- 🔄 이미지 갤러리 (모임 사진)
- 🔄 리뷰 시스템
- 🔄 포인트 시스템

### 장기 (v2.0.0)
- 📅 캘린더 통합
- 🌐 다국어 지원 (영어)
- 🤖 AI 추천 시스템
- 📊 분석 대시보드
- 🎮 게이미피케이션

---

## 📞 문의

- **이메일**: lwp3877@naver.com
- **프로젝트**: MeetPin v1.5.0
- **최종 업데이트**: 2025-10-13

---

**이 문서는 MeetPin 프로젝트의 모든 것을 담고 있습니다.**

**157개 파일, 15,000+ 줄 코드, 46개 API, 26개 페이지, 12개 DB 테이블의 완벽한 정리.**

✨ **지금 바로 개발을 시작하세요!**
