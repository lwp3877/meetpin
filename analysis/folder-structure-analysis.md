# 폴더 구조 분석 (Step 7)

**생성일**: 2025-10-01
**브랜치**: refactor-cleanup

---

## 📋 현재 구조 분석

### components/ (14개 폴더)

```
src/components/
├── auth/              ✅ 인증 관련
│   └── social-login.tsx
├── chat/              ✅ 채팅 기능
│   └── ChatPanel.tsx
├── common/            ✅ 공통 컴포넌트
│   ├── BotSchedulerInitializer.tsx
│   ├── Providers.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── error/             ✅ 에러 처리
│   └── GlobalErrorBoundary.tsx
├── icons/             ✅ 아이콘
│   └── MapIcons.tsx
├── landing/           ✅ 랜딩 페이지
│   ├── NewLanding.tsx
│   └── ProLanding.tsx
├── layout/            ✅ 레이아웃
│   └── LegalFooter.tsx
├── map/               ✅ 지도 기능
│   ├── DynamicMap.tsx
│   ├── LocationPicker.tsx
│   ├── MapWithCluster.tsx
│   └── lazy/
│       └── MapFilters.tsx
├── mobile/            ✅ 모바일 최적화
│   └── mobile-optimized-layout.tsx
├── premium/           ✅ 프리미엄 기능
│   └── enhanced-landing.tsx
├── room/              ✅ 방 관련
│   └── RoomForm.tsx
└── ui/                ⚠️ UI 컴포넌트 (43개 파일 - 정리 필요)
    ├── shadcn 기본: button, card, input, select, tabs, etc.
    ├── 기능 컴포넌트: BoostModal, ProfileModal, ChatModal
    ├── 알림: NotificationCenter, HostMessageNotifications
    ├── 프로필: EnhancedProfile, ProfileImageUploader
    └── 기타: ImageUploader, ReferralSystem, Toast
```

### lib/ (11개 폴더)

```
src/lib/
├── accessibility/     ✅ 접근성
├── bot/               ✅ 봇 관리
├── cache/             ✅ 캐싱
├── config/            ✅ 설정
├── design/            ✅ 디자인 시스템
├── observability/     ✅ 로깅/모니터링
├── payments/          ✅ 결제
├── security/          ✅ 보안
├── services/          ✅ 서비스 (auth, Supabase)
└── utils/             ✅ 유틸리티
```

### types/ (2개 파일)

```
src/types/
├── global.d.ts                    ✅ 글로벌 타입
└── intersection-observer.d.ts     ✅ 특정 라이브러리 타입
```

---

## 🎯 평가

### 잘 구조화된 부분 ✅
1. **명확한 도메인 분리**: auth, chat, map, room 등 기능별 폴더
2. **Next.js 패턴 준수**: App Router와 잘 맞는 구조
3. **lib/ 세분화**: 각 기능별 폴더 (accessibility, bot, cache 등)
4. **컴포넌트 계층**: common, ui, features 구분

### 개선 여지 ⚠️
1. **ui/ 폴더 비대화**: 43개 파일 (shadcn + 기능 컴포넌트 혼재)
2. **파일명 일관성**: kebab-case vs PascalCase 혼용
   - kebab: social-login, theme-provider, mobile-optimized-layout
   - Pascal: ChatPanel, RoomForm, BoostModal
3. **types/ 구조**: 도메인별 타입 파일 없음 (모두 global.d.ts)

---

## 📊 권장 사항

### 우선순위 1: ui/ 폴더 정리 ❌ **보류**

**이유**:
- shadcn/ui 컴포넌트는 관례적으로 ui/ 폴더에 위치
- 기능 컴포넌트 이동 시 많은 import 수정 필요
- 현재 구조도 충분히 이해 가능

**대안**: 현재 유지

### 우선순위 2: 파일명 PascalCase 통일 ❌ **보류**

**이유**:
- kebab-case도 React 커뮤니티에서 인정되는 표준
- Next.js 공식 예제도 kebab-case 사용
- 대규모 변경 리스크 > 이득

**대안**: 현재 유지

### 우선순위 3: types/ 도메인별 분리 ✅ **실행 가능**

**현재**:
```
types/
├── global.d.ts
└── intersection-observer.d.ts
```

**제안**:
```
types/
├── index.ts           # 공통 타입 re-export
├── user.ts            # User, Profile 타입
├── room.ts            # Room, Request, Match 타입
├── message.ts         # Message, Chat 타입
└── api.ts             # API 응답 타입
```

**효과**: 타입 찾기 쉬움, 유지보수 개선

---

## 🚫 권장하지 않는 변경

### 1. components/ 대규모 재구성
❌ **하지 말 것**:
```
components/
├── common/
├── features/     # ui/에서 이동
│   ├── boost/
│   ├── profile/
│   └── notification/
└── layout/
```

**이유**:
- 100+ import 경로 변경 필요
- 팀 혼란, Git 히스토리 복잡화
- shadcn/ui 업데이트 시 충돌 가능

### 2. lib/ 폴더 통합
❌ **하지 말 것**:
```
lib/
├── api/          # services/ 통합
├── hooks/        # 새 폴더
└── constants/    # config/ 통합
```

**이유**: 현재 구조가 더 명확함

---

## ✅ 실제 실행 계획

### 최소 변경 접근법

**Step 7-1**: types/ 도메인 분리 (선택적)
- 타입 정의를 도메인별 파일로 분리
- index.ts에서 re-export
- 영향도: 낮음 (타입만 변경)

**Step 7-2**: 문서화
- 각 폴더에 README.md 추가 (선택적)
- CLAUDE.md에 폴더 구조 가이드 업데이트

**Step 7-3**: index.ts 배럴 export (선택적)
- components/ui/index.ts
- lib/utils/index.ts
- 영향도: 낮음 (기존 import 유지 가능)

---

## 🎓 결론

**현재 MEETPIN 프로젝트의 폴더 구조는 이미 우수함** ✅

### 점수
- 논리성: 9/10
- 확장성: 8/10
- 유지보수성: 8/10
- Next.js 호환성: 10/10

### 권장 조치
1. ✅ **현재 구조 유지**: 대규모 변경 불필요
2. ✅ **선택적 개선**: types/ 분리, 문서화
3. ❌ **하지 말 것**: components/ 재구성, 파일명 일괄 변경

### 다음 단계
- **옵션 A**: Step 7 스킵 (현재 구조 만족)
- **옵션 B**: types/ 분리만 실행 (최소 변경)
- **옵션 C**: 문서화 추가 (안전)

---

**분석 완료 시각**: 2025-10-01 12:45
**권장**: 현재 구조 유지 + 선택적 types/ 정리
