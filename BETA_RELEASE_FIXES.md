# 베타 출시 필수 개선사항 (10개 이하)

## 📌 우선순위 기반 Quick-Fix 제안

베타 해제 후 **즉시 안정적 서비스**를 위한 필수 수정사항만 선정했습니다.

---

## ✅ 필수 수정 10개

### 1. BetaBanner 제거 (Priority: HIGH)
**문제**: 전역 레이아웃에 베타 경고 배너가 노출됨
**원인**: `src/app/layout.tsx` 192번째 줄에서 `<BetaBanner />` 컴포넌트 렌더링
**해결책**: 베타 배너 제거

**적용 위치**: `src/app/layout.tsx:192`

```diff
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -4,7 +4,6 @@ import './globals.css'
 import { brandMessages } from '@/lib/config/brand'
 import Providers from '@/components/common/Providers'
 import { InstallPrompt } from '@/components/pwa/InstallPrompt'
-import { BetaBanner } from '@/components/common/BetaBanner'

 // next/font 자체 호스팅으로 CSP 단순화
 const inter = Inter({
@@ -189,7 +188,6 @@ export default function RootLayout({
       </head>
       <body className={`${inter.variable} bg-background min-h-screen touch-manipulation font-sans antialiased`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
         <Providers>
-          <BetaBanner />
           <div id="root" className="mobile-full-height relative flex min-h-screen flex-col">
             <main className="flex-1">{children}</main>
           </div>
```

---

### 2. 회원가입 베타 동의 문구 수정 (Priority: HIGH)
**문제**: 회원가입 시 "베타 테스트 서비스" 동의 필수
**원인**: `src/app/auth/signup/page.tsx:974-979` 베타 체크박스 필수 항목
**해결책**: "서비스 이용 약관" 문구로 변경

**적용 위치**: `src/app/auth/signup/page.tsx:256-259`, `974-979`

```diff
--- a/src/app/auth/signup/page.tsx
+++ b/src/app/auth/signup/page.tsx
@@ -23,7 +23,7 @@ export default function SignUpPage() {
   const [consents, setConsents] = useState({
     terms: false,
     privacy: false,
-    beta: false,
+    service: false,
     marketing: false,
   })
@@ -253,8 +253,8 @@ export default function SignUpPage() {
       toast.error('개인정보처리방침에 동의해주세요')
       return false
     }
-    if (!consents.beta) {
-      toast.error('베타 테스트 이용 조건에 동의해주세요')
+    if (!consents.service) {
+      toast.error('서비스 이용 약관에 동의해주세요')
       return false
     }

@@ -962,18 +962,18 @@ export default function SignUpPage() {
                 </div>

-                {/* Beta Test Agreement */}
+                {/* Service Agreement */}
                 <div className="flex items-start space-x-3">
                   <input
-                    id="beta"
+                    id="service"
                     type="checkbox"
-                    checked={consents.beta}
-                    onChange={e => setConsents(prev => ({ ...prev, beta: e.target.checked }))}
+                    checked={consents.service}
+                    onChange={e => setConsents(prev => ({ ...prev, service: e.target.checked }))}
                     className="text-primary focus:ring-primary mt-0.5 h-5 w-5 touch-manipulation rounded border-2 border-gray-300 transition-colors focus:ring-2 focus:ring-offset-1 sm:h-5 sm:w-5"
                     disabled={isLoading}
                     aria-required="true"
                   />
-                  <label htmlFor="beta" className="cursor-pointer text-sm leading-relaxed text-gray-700">
-                    베타 테스트 서비스임을 이해하며, 데이터 손실 및 서비스 중단 가능성에 동의합니다{' '}
+                  <label htmlFor="service" className="cursor-pointer text-sm leading-relaxed text-gray-700">
+                    서비스 이용 중 발생할 수 있는 일시적 장애 및 데이터 변경에 동의합니다{' '}
                     <span className="text-red-500" aria-label="필수">
                       (필수)
                     </span>
```

---

### 3. Help 페이지 "곧 출시 예정" 섹션 완성 (Priority: MEDIUM)
**문제**: 모임 참가 팁 & 안전 가이드라인 섹션이 "곧 출시 예정" 뱃지 표시
**원인**: `src/app/help/page.tsx:362`, `373` 미완성 콘텐츠
**해결책**: 실제 링크로 교체 또는 섹션 완성

**적용 위치**: `src/app/help/page.tsx:354-376`

```diff
--- a/src/app/help/page.tsx
+++ b/src/app/help/page.tsx
@@ -352,31 +352,47 @@ export default function HelpPage() {

         {/* Additional Resources */}
         <div className="mt-12 grid gap-6 md:grid-cols-2">
-          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
+          <Link href="/help/meetup-tips">
+            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
             <CardContent className="p-8 text-center">
               <div className="mb-4 text-4xl">🎯</div>
               <h3 className="mb-3 text-xl font-bold text-gray-900">모임 참가 성공 팁</h3>
               <p className="mb-4 text-sm text-gray-600">
                 첫 만남을 성공적으로 만들기 위한 실용적인 조언들을 확인해보세요.
               </p>
-              <Badge className="border-blue-200 bg-blue-100 text-blue-800">곧 출시 예정</Badge>
+              <Badge className="border-green-200 bg-green-100 text-green-800">바로가기 →</Badge>
             </CardContent>
           </Card>
+          </Link>

-          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
+          <Link href="/legal/safety">
+            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
             <CardContent className="p-8 text-center">
               <div className="mb-4 text-4xl">🔒</div>
               <h3 className="mb-3 text-xl font-bold text-gray-900">안전 가이드라인</h3>
               <p className="mb-4 text-sm text-gray-600">
                 안전하고 즐거운 모임을 위한 필수 안전 수칙을 알아보세요.
               </p>
-              <Badge className="border-green-200 bg-green-100 text-green-800">곧 출시 예정</Badge>
+              <Badge className="border-blue-200 bg-blue-100 text-blue-800">바로가기 →</Badge>
             </CardContent>
           </Card>
+          </Link>
         </div>
       </div>
     </div>
```

**추가 작업 필요**:
- `src/app/help/meetup-tips/page.tsx` 생성
- `src/app/legal/safety/page.tsx` 생성

---

### 4. 프로덕션 샘플 데이터 자동 생성 스크립트 (Priority: HIGH)
**문제**: 프로덕션 환경에서 방 데이터 0개 (신규 사용자가 빈 지도만 봄)
**원인**: 실제 사용자가 없는 초기 상태
**해결책**: 봇 룸 자동 생성 API 활용

**새 파일 생성**: `scripts/seed-production-rooms.mjs`

```javascript
#!/usr/bin/env node
/**
 * 프로덕션 환경 샘플 룸 자동 생성 스크립트
 *
 * 사용법:
 * SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/seed-production-rooms.mjs
 */

import https from 'https';

const SITE_URL = process.env.SITE_URL || 'https://meetpin-weld.vercel.app';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY; // Vercel 환경변수로 설정 필요

if (!ADMIN_API_KEY) {
  console.error('❌ ADMIN_API_KEY 환경변수가 필요합니다');
  process.exit(1);
}

function createBotRooms(count = 10) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(SITE_URL).hostname,
      port: 443,
      path: `/api/bot/generate?count=${count}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🤖 프로덕션 샘플 룸 생성 시작...\n');

  try {
    const result = await createBotRooms(10);
    console.log('✅ 성공:', result.data.count, '개 룸 생성됨');
    console.log('📍 생성된 룸 ID:', result.data.roomIds.join(', '));
  } catch (error) {
    console.error('❌ 실패:', error.message);
    process.exit(1);
  }
}

main();
```

**Vercel 환경변수 추가 필요**:
```bash
ADMIN_API_KEY=your-secure-random-string
```

**Vercel Cron Job 설정** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/seed-rooms",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

### 5. BetaBanner 컴포넌트 파일 삭제 (Priority: LOW)
**문제**: 사용하지 않는 컴포넌트 파일 존재
**원인**: 레이아웃에서 제거했지만 파일은 남아있음
**해결책**: 파일 삭제 또는 .gitignore 추가

```bash
git rm src/components/common/BetaBanner.tsx
```

---

### 6. Landing Page 베타 메시지 제거 (Priority: MEDIUM)
**문제**: 랜딩 페이지에 베타 관련 문구가 있을 가능성
**확인 필요**: `src/components/landing/ProLanding.tsx` 검토 필요

```bash
# 검색 명령어
grep -r "베타" src/components/landing/
grep -r "beta" src/components/landing/
```

---

### 7. Demo Account 자동 생성 시스템 (Priority: MEDIUM)
**문제**: 신규 사용자가 기능 테스트하기 어려움
**원인**: 빈 데이터베이스 상태
**해결책**: "/api/auth/demo-login" API 활성화 (이미 존재)

**현재 상태 확인**: `src/app/api/auth/demo-login/route.ts` 파일 존재 확인

**Login 페이지 수정** (`src/app/auth/login/page.tsx`):

```diff
--- a/src/app/auth/login/page.tsx
+++ b/src/app/auth/login/page.tsx
@@ -100,6 +100,23 @@ export default function LoginPage() {
             </form>

+            {/* Demo Account Quick Login */}
+            <div className="mt-6 border-t border-gray-200 pt-6">
+              <p className="mb-3 text-center text-sm text-gray-600">
+                서비스를 먼저 체험하고 싶으신가요?
+              </p>
+              <Button
+                variant="outline"
+                className="w-full"
+                onClick={async () => {
+                  const res = await fetch('/api/auth/demo-login', { method: 'POST' });
+                  const data = await res.json();
+                  if (data.ok) {
+                    toast.success('데모 계정으로 로그인되었습니다');
+                    router.push('/map');
+                  }
+                }}
+              >
+                🎮 데모 계정으로 체험하기
+              </Button>
+            </div>
+
             {/* Sign Up Link */}
             <div className="mt-6 text-center">
```

---

### 8. 404/500 에러 페이지 개선 (Priority: LOW)
**문제**: 에러 페이지가 베타 느낌을 줄 수 있음
**확인 필요**: `src/app/not-found.tsx`, `src/app/error.tsx` 파일 확인

---

### 9. SEO 메타데이터 베타 제거 (Priority: MEDIUM)
**문제**: 메타 description에 "베타" 키워드 포함 가능성
**확인 위치**: `src/app/layout.tsx:22-96`

**현재 상태**: 메타데이터에 베타 언급 없음 ✅

---

### 10. 환경변수 Mock 모드 기본값 변경 (Priority: CRITICAL)
**문제**: `NEXT_PUBLIC_USE_MOCK_DATA` 환경변수 미설정 시 Mock 모드 활성화
**원인**: `src/lib/config/flags.ts:112`
**해결책**: 프로덕션에서는 반드시 `false`로 설정

**Vercel 환경변수 확인**:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

**추가 안전장치** (`src/lib/config/flags.ts`):

```diff
--- a/src/lib/config/flags.ts
+++ b/src/lib/config/flags.ts
@@ -109,7 +109,12 @@ export const config = {

 // NEXT_PUBLIC_USE_MOCK_DATA가 'true'일 때만 Mock 모드 활성화
 // 프로덕션에서는 반드시 false여야 함
-export const isDevelopmentMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
+export const isDevelopmentMode =
+  process.env.NODE_ENV === 'development'
+    ? process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
+    : false; // 프로덕션에서는 강제로 false
+
+// 경고 로그
+if (typeof window !== 'undefined' && isDevelopmentMode) {
+  console.warn('⚠️  Mock 모드가 활성화되어 있습니다. 프로덕션에서는 비활성화하세요.');
+}
```

---

## 📋 적용 체크리스트 (우선순위 순)

### 즉시 적용 (HIGH Priority)
- [ ] **#1** - BetaBanner 제거 (`layout.tsx`)
- [ ] **#2** - 회원가입 베타 동의 문구 수정 (`signup/page.tsx`)
- [ ] **#10** - Mock 모드 프로덕션 강제 비활성화 (`flags.ts`)
- [ ] **#4** - 샘플 데이터 자동 생성 스크립트 작성 및 Cron 설정

### 주요 개선 (MEDIUM Priority)
- [ ] **#3** - Help 페이지 완성 (새 페이지 2개 생성)
- [ ] **#6** - Landing 페이지 베타 문구 검색 및 제거
- [ ] **#7** - Demo 계정 로그인 버튼 추가
- [ ] **#9** - SEO 메타데이터 최종 확인

### 선택 사항 (LOW Priority)
- [ ] **#5** - BetaBanner 컴포넌트 파일 삭제
- [ ] **#8** - 404/500 에러 페이지 점검

---

## 🚀 Quick-Fix 적용 순서

```bash
# 1. 로컬에서 수정
git checkout -b release/remove-beta

# 2. 필수 3개 파일 수정 (위 diff 참고)
#    - src/app/layout.tsx
#    - src/app/auth/signup/page.tsx
#    - src/lib/config/flags.ts

# 3. 새 스크립트 추가
#    - scripts/seed-production-rooms.mjs

# 4. 테스트
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# 5. 커밋 & 푸시
git add .
git commit -m "release: remove beta mode and add production sample data"
git push origin release/remove-beta

# 6. Vercel 환경변수 설정
#    NEXT_PUBLIC_USE_MOCK_DATA=false
#    ADMIN_API_KEY=your-secure-key

# 7. Merge to main
# 8. Vercel 자동 배포 확인
```

---

## 📊 예상 결과

### 배포 전 (현재)
- ⚠️  베타 경고 배너 노출
- ⚠️  회원가입 시 베타 동의 필수
- ⚠️  빈 지도 (샘플 데이터 0개)
- ⚠️  Help 페이지 "곧 출시 예정"

### 배포 후 (예상)
- ✅ 깔끔한 UI (경고 배너 없음)
- ✅ 일반 서비스 약관 동의
- ✅ 지도에 10개 샘플 룸 노출
- ✅ Help 페이지 완전한 콘텐츠
- ✅ 데모 계정 즉시 체험 가능

---

## ⚠️  주의사항

1. **프로덕션 배포 전 반드시 확인**:
   - Vercel 환경변수 `NEXT_PUBLIC_USE_MOCK_DATA=false`
   - Supabase RLS 정책 활성화 상태
   - Stripe Webhook 설정 완료

2. **샘플 데이터 관리**:
   - Cron job으로 매일 10개 유지
   - 오래된 봇 룸 자동 삭제 (14일 이상)

3. **롤백 계획**:
   - BetaBanner 컴포넌트는 삭제하지 말고 주석 처리
   - 환경변수로 베타 모드 재활성화 가능하도록 준비

---

## 💡 추가 제안 (Quick-Fix 범위 외)

### 향후 개선 사항
- [ ] Onboarding Tour 추가 (신규 사용자 가이드)
- [ ] 첫 방 생성 시 튜토리얼
- [ ] Push 알림 권한 요청 최적화
- [ ] 지역별 샘플 데이터 다양화

### 마케팅 준비
- [ ] 앱 스토어 스크린샷 업데이트 (베타 제거)
- [ ] 소셜 미디어 공지 준비
- [ ] 프레스 릴리스 작성

---

**생성일**: 2025-11-26
**버전**: v1.0
**작성자**: Claude Code
**기반**: USER_ACCEPTANCE_TEST_REPORT.md (85/100 점수)
