MeetPin 프로젝트 점검 및 개선안
1. 문제 요약
1.1 코드/버그

src/lib/useAuth.tsx에서 개발 모드 강제 활성화를 위해 const isDevelopmentMode = true로 하드‑코딩되어 있어 프로덕션에서 Supabase 인증 로직이 전혀 실행되지 않습니다. 또한 buildBuster를 임포트하고 빌드 버전을 console.log로 노출하여 내부 정보를 유출하고 있습니다
GitHub
.

src/lib/buildBuster.ts와 FORCE_UPDATE.txt는 빌드 캐시를 강제로 깨기 위해 추가된 임시 파일입니다. 이러한 더미 파일은 깃 내역을 더럽히고, 코드베이스를 혼란스럽게 합니다
GitHub
.
GitHub

Mock 모드와 프로덕션 모드가 코드 레벨에서 뒤섞여 있습니다. useAuth.tsx는 Supabase 클라이언트를 임포트하지만 실제로는 사용하지 않고, 일부 API 라우트(src/app/api/rooms/route.ts)에서는 isDevelopmentMode를 조건 대신 true로 강제하여 Mock 데이터가 프로덕션에서도 반환되도록 한 곳이 있습니다. 이러한 조건은 배포 시 예측 불가능한 동작을 유발합니다.

**개발용 더미 데이터(mock)**가 대량 포함되어 있습니다(src/lib/mockData.ts). 개발 모드에서만 사용된다는 주석이 있으나, 환경 변수가 아닌 코드 레벨에서 분기돼 있어 배포 시 실수로 포함될 위험이 있습니다
GitHub
.

1.2 보안 취약점

인증 로직에서 로컬 스토리지에 사용자 객체를 평문으로 저장하고 있습니다. JWT나 세션 쿠키 대신 localStorage를 사용하면 XSS 공격 시 탈취 위험이 큽니다.

.env.example에는 서비스 역할 키(Supabase Service Role)가 예시 값으로 포함되어 있습니다. 실제 키가 브라우저로 노출될 경우 RLS를 우회할 수 있으므로, 이 값은 절대 클라이언트에서 접근할 수 없는 환경 변수로 분리해야 합니다.

Rate limiting과 입력 검증(Zod)을 사용하고 있지만, API 라우트 단위로 일관된 인증/권한 체크 미흡. 예를 들어, 일부 관리자 API가 req.method만으로 분기하고 사용자 역할 검사 없이 데이터를 반환합니다.

1.3 성능 문제

지도 페이지(src/app/map/page.tsx)에서 모든 방 목록을 한꺼번에 불러와 클라이언트에서 필터링합니다. 많은 방이 등록될 경우 초기 로딩 지연과 메모리 사용량 증가가 예상됩니다.

카카오맵 SDK를 클라이언트 번들에 포함하고 있어 첫 페이지 로드가 느립니다. 필요할 때 동적으로 import하도록 변경할 수 있습니다.

useAuth.tsx에서 Supabase 클라이언트 초기화 및 사용자 프로필 호출을 매 렌더링마다 수행할 수 있으므로, 캐싱과 메모이제이션을 도입해야 합니다.

1.4 중복/불필요 코드

buildBuster.ts와 FORCE_UPDATE.txt는 환경 변수 관리 및 캐시 무효화 목적으로 사용된 임시 파일입니다. 배포 후에는 삭제해야 합니다.

여러 곳에서 동일한 기능 플래그(isDevelopmentMode)가 하드코딩되어 있고, src/lib/flags.ts와 별도로 mockData.ts에 동일한 플래그가 존재하는 등 중복 정의가 있습니다.

.gitignore에 .claude/, .mcp.json, 테스트 결과(test-results/, playwright-report/) 등이 포함되어 있지 않아 도구가 생성하는 메타 파일이 커밋될 수 있습니다.

1.5 누락된 부분

CI/CD 파이프라인(예: GitHub Actions)이 없어 PR 또는 커밋 시 자동으로 타입체크, 린트, 빌드, 테스트를 실행하지 않습니다.

현재 README와 MAINTENANCE_GUIDE에는 개발 모드와 프로덕션 모드의 구분 방법이 명확하지 않습니다. 또한 Mock 모드 토글을 위한 환경 변수에 대한 설명이 없습니다.

Sentry, Supabase, Stripe 등 외부 서비스에 대한 실행 전 검증과 오류 추적 설정이 부족합니다.

2. 수정 코드 (주요 diff)

다음 패치는 Mock 모드와 프로덕션 모드를 환경 변수로 분리하고, 불필요한 임시 파일을 제거하며, useAuth.tsx의 인증 로직을 정리합니다. src/lib/buildBuster.ts와 FORCE_UPDATE.txt는 삭제해야 합니다.

2.1 src/lib/useAuth.tsx
*** Begin Patch
*** Update File: src/lib/useAuth.tsx
@@
-import { BUILD_VERSION } from '@/lib/buildBuster'
-
-// Mock 모드 강제 활성화 (임시)
-const isDevelopmentMode = true
-console.log('🔥 useAuth 로딩됨 - 빌드:', BUILD_VERSION)
+// Mock 모드 여부를 결정합니다. 프로덕션 환경에서는 기본적으로 false이며,
+// 개발자가 환경 변수(NEXT_PUBLIC_FORCE_MOCK)를 통해 강제로 켤 수 있습니다.
+const isDevelopmentMode =
+  process.env.NEXT_PUBLIC_FORCE_MOCK === 'true' ||
+  process.env.NODE_ENV !== 'production'
+
+if (isDevelopmentMode) {
+  // 개발 모드에서는 자세한 로그를 출력해도 괜찮습니다.
+  console.debug('[useAuth] running in mock mode')
+}
@@
-  // 이메일 로그인 - Mock 모드만 사용
-  const signIn = async (email: string, password: string) => {
-    // SUPABASE 완전 제거 - Mock만 사용
-    try {
-      const result = await mockLogin(email, password)
-      localStorage.setItem('meetpin_user', JSON.stringify(result.user))
-      setUser(result.user as AppUser)
-      return { success: true }
-    } catch (error: any) {
-      return { success: false, error: error.message }
-    }
-  }
+  // 이메일 로그인
+  const signIn = async (email: string, password: string) => {
+    if (isDevelopmentMode) {
+      // 개발/Mock 모드: 로컬 스토리지를 통해 간단히 로그인 처리
+      try {
+        const result = await mockLogin(email, password)
+        localStorage.setItem('meetpin_user', JSON.stringify(result.user))
+        setUser(result.user as AppUser)
+        return { success: true }
+      } catch (error: any) {
+        return { success: false, error: error.message }
+      }
+    }
+    // 프로덕션 모드: Supabase 이메일 로그인 사용
+    try {
+      const supabase = createBrowserSupabaseClient()
+      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
+      if (error || !data.user) {
+        return { success: false, error: error?.message ?? '로그인 실패' }
+      }
+      await refreshUser()
+      return { success: true }
+    } catch (error: any) {
+      return { success: false, error: error.message }
+    }
+  }
@@
-  // 이메일 회원가입 - Mock 모드만 사용
-  const signUp = async (email: string, password: string, nickname: string, ageRange: string) => {
-    // SUPABASE 완전 제거 - Mock만 사용
-    try {
-      await mockSignUp(email, password, nickname, ageRange)
-      return { success: true }
-    } catch (error: any) {
-      return { success: false, error: error.message }
-    }
-  }
+  // 이메일 회원가입
+  const signUp = async (
+    email: string,
+    password: string,
+    nickname: string,
+    ageRange: string
+  ) => {
+    if (isDevelopmentMode) {
+      try {
+        await mockSignUp(email, password, nickname, ageRange)
+        return { success: true }
+      } catch (error: any) {
+        return { success: false, error: error.message }
+      }
+    }
+    try {
+      const supabase = createBrowserSupabaseClient()
+      const { error } = await supabase.auth.signUp({
+        email,
+        password,
+        options: {
+          data: {
+            nickname,
+            age_range: ageRange,
+          },
+        },
+      })
+      if (error) {
+        return { success: false, error: error.message }
+      }
+      return { success: true }
+    } catch (error: any) {
+      return { success: false, error: error.message }
+    }
+  }
*** End Patch


참고: 위 패치에서는 buildBuster를 사용하지 않으므로 src/lib/buildBuster.ts와 FORCE_UPDATE.txt 파일을 삭제해야 합니다. isDevelopmentMode 값은 환경 변수 NEXT_PUBLIC_FORCE_MOCK과 NODE_ENV를 사용해 결정하도록 변경했습니다. 실제 Supabase 로그인/회원가입 로직도 복구하였습니다.

2.2 .gitignore 개선
*** Begin Patch
*** Update File: .gitignore
@@
 # misc
 .DS_Store
 *.pem
+
+# 개발 도구 및 메타 파일 무시
+.claude/
+.mcp.json
+playwright-report/
+test-results/
+
+# IDE 설정
+.idea/
+*.log
*** End Patch

2.3 .env.example에 Mock 토글 추가
*** Begin Patch
*** Update File: .env.example
@@
 NEXT_PUBLIC_ENABLE_ANALYTICS=false
+
+# 개발용 Mock 데이터/인증 강제 활성화
+# true 로 설정하면 Supabase 대신 mock 데이터 및 localStorage를 사용합니다.
+# 배포 환경에서는 반드시 false 로 유지하세요.
+NEXT_PUBLIC_FORCE_MOCK=false
*** End Patch

2.4 GitHub Actions CI 설정 추가

새로운 파일 .github/workflows/ci.yml를 추가하여 커밋/PR 시 자동으로 타입검사, 린트, 빌드, 테스트를 수행합니다.

# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
      - run: pnpm e2e --reporter=list

3. 정리안

불필요 파일 삭제:

src/lib/buildBuster.ts와 FORCE_UPDATE.txt는 더 이상 필요하지 않으므로 삭제하세요.

개발/디버깅 과정에서 생성한 .claude/, .mcp.json, playwright-report/, test-results/ 등을 .gitignore에 추가하여 커밋에서 제외합니다.

프로젝트 구조 정리:

Mock 데이터는 src/lib/mockData.ts로 한 곳에만 위치시키고, useAuth.tsx와 API 라우트에서 환경 변수(NEXT_PUBLIC_FORCE_MOCK)로 분기합니다.

기능 플래그를 한 곳(src/lib/flags.ts)에서 관리하고, 각 플래그에 대한 설명과 기본값을 .env.example에 명시합니다.

문서 업데이트:

README와 MAINTENANCE_GUIDE에 개발/배포 모드 전환 방법을 추가합니다. 예를 들어 “로컬 개발 시 .env.local의 NEXT_PUBLIC_FORCE_MOCK=true로 설정하면 Mock 데이터로 실행됩니다.”와 같이 안내합니다.

환경 변수에 대한 설명을 .env.example에 추가한 NEXT_PUBLIC_FORCE_MOCK 항목과 함께 업데이트합니다.

보안 설정 강화:

Supabase Service Role Key와 Stripe Secret Key는 서버 런타임에서만 사용하도록 하고, API 라우트에서 process.env를 통해 참조하세요. 클라이언트 번들에는 절대 포함되지 않도록 합니다.

인증 토큰을 localStorage에 저장하는 대신 HttpOnly 쿠키 또는 Supabase의 내장 세션 관리 기능을 사용하도록 리팩터링합니다.

데이터베이스 스크립트 관리:

scripts/migrate.sql와 scripts/rls.sql에 대한 버전 관리(마이그레이션 도구) 도입을 고려하세요. 예: Prisma Migrate
 또는 Supabase CLI migration.

4. 개선안
4.1 성능 개선

지도 페이지 지연 로딩: 카카오맵 SDK와 지도 컴포넌트는 dynamic() import로 클라이언트 측에서만 로딩하고, SSR 단계에서 제외합니다. 초기 번들 크기를 줄여 첫 화면 렌더링 속도를 개선합니다.

데이터 페이징: 방 목록을 /api/rooms 호출 시 기본적으로 페이징(예: limit과 offset)을 적용하고, 프론트엔드에서는 스크롤 위치에 따라 무한 스크롤 형태로 데이터를 추가 로드하도록 변경합니다.

캐싱: @tanstack/react-query를 활용해 API 응답을 캐싱하고, 로딩/오류 상태를 관리합니다. 캐시 TTL과 재검증 전략을 적절히 설정하여 네트워크 요청을 줄입니다.

4.2 보안 강화

입력 검증: 모든 API 라우트에서 Zod 스키마를 사용하여 request body와 query 파라미터를 검증하고, 실패 시 명확한 400 응답을 반환합니다.

역할 기반 접근 제어(RBAC): 관리자 API(src/app/api/admin/)는 JWT 내에 포함된 사용자 역할을 검증하여 접근을 제한합니다. Supabase Row Level Security와 함께 서버‑사이드에서 한 번 더 체크합니다.

속도 제한: API 라우트에 express-rate-limit
과 유사한 미들웨어를 도입하여 공격을 완화합니다.

에러/성능 모니터링: Sentry(에러 추적)와 Umami/GA(분석)를 설정하고, .env.example에 DSN 및 사이트 ID를 명시합니다.

4.3 코드 품질 향상

모듈 분리: useAuth.tsx에서 인증 로직을 훅과 별도 모듈(예: authService.ts)로 분리하여 테스트 가능성을 높입니다.

타입 강화: Supabase에서 반환되는 데이터 타입을 명시적으로 지정(AuthUser, Profile)하고, any 사용을 제거합니다.

테스트 보강: 현재 49개의 단위 테스트가 있지만, API 라우트와 컴포넌트의 경계 조건과 에러 케이스를 추가 테스트합니다. E2E 테스트에서 다양한 카테고리/필터링 시나리오를 추가하세요.

5. 로드맵 (앞으로 해야 할 일)
5.1 기술적 로드맵

Mock 제거 및 프로덕션 전환: NEXT_PUBLIC_FORCE_MOCK를 기본적으로 false로 설정하고, Supabase 백엔드와 완전하게 연동합니다. 이 과정에서 RLS 정책을 세부적으로 조정합니다.

PWA 및 오프라인 기능: 서비스워커를 도입하여 캐시된 데이터로 오프라인 환경에서도 지도를 표시하고, 채팅/알림을 웹 푸시로 제공합니다.

검색/필터링 향상: 방 목록에 카테고리, 거리, 인원, 시작 시간 등 다양한 필터 옵션을 추가하고, 서버 측에서 효율적으로 쿼리합니다.

알림 시스템: 실시간 알림(채팅, 요청 수락 등)을 WebSocket이나 Supabase Realtime으로 구현하고, 모바일 Push 알림(Firebase Cloud Messaging)을 통합합니다.

에러 추적 및 로깅: Sentry와 연동하여 프론트엔드/백엔드 오류를 수집하고, Logflare나 Supabase Functions로 서버 로그를 집중화합니다.

데이터 마이그레이션 도구 도입: Supabase CLI 또는 Prisma Migrate를 이용해 DB 스키마 변경을 버전 관리하고, CI 파이프라인에 DB 마이그레이션 검증을 추가합니다.

5.2 운영 및 제품 로드맵

사용자 온보딩 개선: 첫 방문 시 추천 방/인근 활동을 보여주는 맞춤형 온보딩 플로우를 도입합니다.

신뢰와 안전: 신고/차단 기능의 UX를 개선하고, 부적절한 콘텐츠 자동 필터링을 위해 AI 기반 모니터링 도입을 검토합니다.

수익 모델 확장: 현재 부스트 기능 외에 프리미엄 구독(광고 제거, 우선 매칭), 브랜드 제휴 모임 등의 수익 모델을 실험합니다.

커뮤니티 기능: 방 댓글, 공지, 후기 작성 등 모임 후기를 공유할 수 있는 기능을 추가하여 사용자 재방문을 유도합니다.

국제화/I18N: 일본어/영어 등 다국어 지원을 추가하고, 카카오맵 외에 구글 지도 등의 대체 서비스를 옵션으로 제공합니다.

위 수정 및 개선안을 적용하면, MeetPin 프로젝트는 개발/배포 환경을 명확히 구분하고, 보안과 성능을 강화하며, 향후 기능 확장에 유연하게 대응할 수 있게 됩니다.