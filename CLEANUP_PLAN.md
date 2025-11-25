# 🧹 코드 정리 계획

## 발견된 문제

### 1. ✅ **보안 취약점** - 완료
- [x] Supabase Service Role Key 하드코딩 파일 4개 삭제
- [x] 안전한 버전 (`-SAFE.mjs`) 생성
- [x] `.gitignore`에 위험 패턴 추가
- [x] `SECURITY_URGENT.md` 작성

### 2. 🔄 **미사용 Export (209개)** - 진행 중

#### 2.1 유지해야 할 Export (API 표면)
다음은 라이브러리처럼 사용되므로 유지:
- `src/lib/api.ts` - API 유틸리티 (외부에서 import)
- `src/lib/supabaseClient.ts` - DB 클라이언트 타입
- `src/components/ui/*` - UI 컴포넌트 라이브러리
- `src/components/icons/index.ts` - 아이콘 export (tree-shaking 지원)

#### 2.2 안전하게 삭제 가능한 Export

**A. 완전히 미사용 컴포넌트**:
```typescript
// src/components/ui/LoadingSpinner.tsx
- CardLoader (0회 사용)
- InlineLoader (0회 사용)

// src/components/ui/PageTransition.tsx
- PageLoadingOverlay (0회 사용)
- StaggeredList (0회 사용)
- NotificationSlide (0회 사용)
- ProgressAnimation (0회 사용)
- SkeletonLoader (0회 사용)
- BounceIn (0회 사용)

// src/components/ui/ReferralSystem.tsx
- ReferralInput (0회 사용)
- ReferralFloatingButton (0회 사용)
- ReferralProgram (0회 사용)

// src/components/ui/AccessibilityProvider.tsx
- AccessibilityProvider (0회 사용)
- useAccessibility (0회 사용)
```

**B. 미사용 유틸리티 함수**:
```typescript
// src/lib/age-verification.ts
- isAdultByAgeRange (대체: verifyAge 사용)
- isAdultByBirthYear (대체: verifyAge 사용)
- requireAdultUser (API에서 미사용)
- checkFeatureAccess (프론트엔드 체크 없음)
- ADULT_ONLY_FEATURES (상수 미사용)

// src/lib/rateLimit.ts
- rateLimitWithPreset (대체: rateLimit 직접 사용)
- rateLimitEndpoint (대체: rateLimit 직접 사용)
- rateLimitGlobal (API에서 미사용)
- rateLimitUser (API에서 미사용)
- getRateLimitStats (관리자 API에서 미사용)
- resetRateLimit (테스트 전용)
- emergencyRateLimit (미구현)

// src/lib/services/auth.ts
- requireAuth (대체: getAuthenticatedUser 사용)
- getUserProfile (대체: 직접 쿼리)
- checkOnboardingStatus (기능 미구현)
- getAdminUserProfile (대체: supabaseAdmin 사용)
- isUserBlocked (대체: RLS 정책 사용)
- isBlockedByUser (대체: RLS 정책 사용)
- checkMutualBlocking (대체: RLS 정책 사용)
- requireRoomOwner (대체: RLS 정책 사용)
- requireMatchParticipant (대체: RLS 정책 사용)
```

**C. 미사용 클래스/모듈**:
```typescript
// src/lib/utils/browserCompat.ts - 전체 미사용
- BrowserDetector
- FeatureSupport
- PerformanceOptimizer
- NetworkOptimizer
- CompatibilityPatches

// src/lib/utils/dataValidation.ts - 전체 미사용
- APIResponseValidator
- MockDataQualityValidator
- DataValidationMonitor

// src/lib/security/securityHardening.ts - 전체 미사용
- InputSanitizer
- SecurityRateLimit
- ContentSecurityPolicy
- SessionSecurity
- FileUploadSecurity

// src/lib/accessibility/a11yEnhancement.ts - 대부분 미사용
- KeyboardNavigation
- VisualAccessibility
- ScreenReaderSupport
- UsabilityEnhancement
- AccessibilityTesting
```

**D. 미사용 봇 시스템 함수**:
```typescript
// src/lib/bot/bot-scheduler.ts
- generateBotsForCurrentTime (수동 호출 없음)
- generatePopularDistrictBots (수동 호출 없음)
- cleanupOldBotRooms (크론잡 미설정)
- resetDailyStats (크론잡 미설정)

// src/lib/bot/smart-room-generator.ts
- generateSingleBotRoom (외부 호출 없음)
```

#### 2.3 주의 필요 (조건부 사용)

**개발 모드 전용**:
- `mockUser`, `mockReports`, `mockStats` - 개발 모드에서만 사용
- Feature flags 관련 함수들

**미래 기능**:
- Stripe 관련 일부 함수 (createPaymentIntent, createRefund 등)
- 알림 시스템 일부 (showServiceWorkerNotification 등)

### 3. 📦 **미사용 Dependencies**

#### 실제 사용 중 (knip false positive):
- `@sentry/webpack-plugin` - next.config.ts에서 사용
- `@next/eslint-plugin-next` - eslint.config.mjs에서 사용
- `eslint-config-next` - eslint.config.mjs에서 사용
- `sharp` - Next.js 이미지 최적화에 필요
- `@testing-library/react` - 테스트 파일에서 사용
- `eslint-plugin-react-hooks` - eslint 설정에서 사용

#### 검토 필요:
- `postcss` - tailwind에서 사용하지만 unlisted (package.json에 추가 필요)

### 4. 🔄 **중복 코드 패턴**

#### A. 유사한 기능 분산
```
- src/lib/observability/logger.ts
- src/lib/observability/logger-server.ts
→ 통합 가능 (환경 분기로)
```

#### B. 여러 rate limit 구현
```
- src/lib/rateLimit.ts (메인)
- src/lib/api.ts (간단한 버전)
- src/lib/security/securityHardening.ts (SecurityRateLimit)
→ rateLimit.ts로 통합
```

## 정리 우선순위

### Phase 1: 안전한 정리 (즉시 실행 가능)
1. [x] 보안 취약점 파일 삭제
2. [ ] 완전 미사용 컴포넌트 파일 삭제
3. [ ] 미사용 유틸리티 클래스 파일 삭제
4. [ ] 미사용 export 주석 처리

### Phase 2: 리팩토링 (테스트 필요)
1. [ ] logger 통합
2. [ ] rate limit 통합
3. [ ] 중복 auth 함수 제거

### Phase 3: 문서화 (초보자 친화)
1. [ ] README.md 작성
2. [ ] CONTRIBUTING.md 작성
3. [ ] API 문서 생성
4. [ ] 컴포넌트 Storybook (선택)

## 예상 효과

- **파일 수**: 158개 → ~120개 (24% 감소)
- **코드 라인**: ~35,000줄 → ~28,000줄 (20% 감소)
- **번들 크기**: ~300KB → ~240KB (20% 감소)
- **유지보수성**: ⭐⭐⭐ → ⭐⭐⭐⭐⭐
