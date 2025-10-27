# MeetPin 프로덕션 이슈 추적표

**생성일**: 2025-10-13
**프로젝트**: MeetPin v1.5.0
**베이스 URL**: https://meetpin-weld.vercel.app

---

## 우선순위 정의

- **P0 (Critical)**: 즉시 수정 필요, 서비스 중단 가능
- **P1 (High)**: 1주 내 수정, 사용자 경험 영향
- **P2 (Medium)**: 1개월 내 수정, 개선 권장
- **P3 (Low)**: 장기 개선 과제

---

## P0: 치명적 이슈 (0개) ✅

*없음 - 모든 치명적 이슈 해결됨*

---

## P1: 높은 우선순위 (2개)

### Issue #1: LCP 최적화 필요 (2.6s → <2.5s)

**라벨**: `performance`, `core-web-vitals`, `p1`

**현재 상태**: ⚠️ NEEDS IMPROVEMENT
- **측정값**: 2.6초 (데스크탑)
- **목표**: ≤2.5초
- **차이**: +0.1초 초과

**영향도**:
- 사용자가 메인 콘텐츠를 보기까지 약간 지연
- Google 검색 순위에 부정적 영향 가능 (Core Web Vitals)
- 첫 인상에 영향

**근본 원인 분석**:
1. **JavaScript 번들 크기**: Next.js 초기 로드 시 여러 청크 다운로드
2. **외부 스크립트**: Kakao Maps SDK, Stripe JS 로딩 시간
3. **이미지 최적화 부족**: PNG/JPG 포맷 (WebP/AVIF 미사용 가능성)
4. **서버 응답 시간**: Vercel 무료 티어 콜드 스타트

**재현 방법**:
```bash
# Lighthouse 성능 측정
npx lighthouse https://meetpin-weld.vercel.app/ --preset=desktop --only-categories=performance

# 특정 메트릭 확인
# Chrome DevTools > Performance > Start Profiling
# LCP 요소 식별: 개발자 도구 > Performance Insights
```

**수정 방안** (우선순위 순):

1. **이미지 최적화** (예상 개선: -0.3s):
   ```typescript
   // src/components/landing/ProLanding.tsx (예시)
   import Image from 'next/image';

   // Before:
   <img src="/screenshots/map-view.png" alt="지도 보기" />

   // After:
   <Image
     src="/screenshots/map-view.png"
     alt="지도 보기"
     width={1170}
     height={2532}
     priority  // LCP 이미지에 추가
     placeholder="blur"
     blurDataURL="data:image/..." // 또는 자동 생성
     quality={85}
     formats={['image/webp', 'image/avif']}
   />
   ```

2. **리소스 힌트 추가** (예상 개선: -0.1s):
   ```typescript
   // src/app/layout.tsx
   export default function RootLayout({ children }) {
     return (
       <html>
         <head>
           {/* 이미 구현됨 ✅ */}
           <link rel="preconnect" href="https://dapi.kakao.com" />
           <link rel="dns-prefetch" href="https://js.stripe.com" />

           {/* 추가 권장 */}
           <link rel="preload" as="script" href="https://dapi.kakao.com/v2/maps/sdk.js" />
         </head>
       </html>
     );
   }
   ```

3. **코드 스플리팅 검증**:
   ```bash
   # 번들 분석
   pnpm analyze:bundle

   # 큰 번들 식별 후 dynamic import 적용
   # 예: src/components/map/DynamicMap.tsx (이미 구현됨 ✅)
   ```

4. **서버 사이드 최적화**:
   - Redis 캐싱 활성화 확인
   - Edge Functions 고려 (Vercel Pro)

**검증 방법**:
```bash
# 수정 후 LCP 재측정 (3회 평균)
for i in {1..3}; do
  npx lighthouse https://meetpin-weld.vercel.app/ --preset=desktop \
    --only-categories=performance --quiet | grep "largest-contentful-paint"
done

# 목표: 모든 측정에서 <2.5s
```

**예상 공수**: 1-2일
**담당**: Frontend Team

---

### Issue #2: CORS 정책 검토 필요

**라벨**: `security`, `cors`, `p1`

**현재 상태**: ⚠️ WARNING
- **헤더**: `Access-Control-Allow-Origin: *`
- **위험도**: 낮음 (정적 리소스에만 적용 추정)

**잠재적 위험**:
- API 엔드포인트가 민감 데이터를 처리할 경우 보안 취약점
- CSRF 공격 벡터 확대 가능성

**확인 필요 사항**:
1. 어떤 리소스에 CORS `*`가 적용되는가?
   - 정적 파일만? (안전)
   - API 엔드포인트도? (위험)

2. Vercel 자동 설정인가, 명시적 설정인가?

**재현 방법**:
```bash
# API 엔드포인트 CORS 헤더 확인
curl -I https://meetpin-weld.vercel.app/api/rooms
curl -I https://meetpin-weld.vercel.app/api/profile/stats

# 정적 리소스 CORS 헤더 확인
curl -I https://meetpin-weld.vercel.app/icons/icon-192x192.png
```

**수정 방안** (조건부):

**IF** API 엔드포인트에 `Access-Control-Allow-Origin: *` 적용 중:
```typescript
// next.config.js 또는 middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // API 경로에만 명시적 CORS 설정
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://meetpin-weld.vercel.app',
      'https://meetpin.com',
      process.env.NODE_ENV === 'development' && 'http://localhost:3001'
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  return response;
}
```

**IF** 정적 리소스에만 적용:
- ✅ 현재 상태 유지 (문제 없음)
- 문서화만 추가

**검증 방법**:
```bash
# 수정 후 CORS 헤더 확인
curl -I -H "Origin: https://malicious-site.com" \
  https://meetpin-weld.vercel.app/api/rooms

# 예상 결과: CORS 헤더 없음 또는 차단
```

**예상 공수**: 0.5일
**담당**: Backend/Security Team

---

## P2: 중간 우선순위 (3개)

### Issue #3: CSP 강화 - nonce 기반 전환

**라벨**: `security`, `csp`, `p2`

**현재 상태**: ℹ️ INFORMATIONAL
- **현재 CSP**: `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`
- **목표 CSP**: nonce 또는 hash 기반 (`'unsafe-inline'`, `'unsafe-eval'` 제거)

**보안 영향**:
- 현재: XSS 공격 시 인라인 스크립트 실행 가능
- 개선 후: XSS 공격 방어력 대폭 향상

**장애물**:
1. **Kakao Maps SDK**: `eval()` 사용 가능성
2. **Next.js**: 기본적으로 일부 인라인 스크립트 사용
3. **Third-party 스크립트**: Stripe, Google Tag Manager

**수정 방안**:

1. **Next.js nonce 미들웨어 구현**:
   ```typescript
   // middleware.ts
   import { NextResponse } from 'next/server';
   import crypto from 'crypto';

   export function middleware(request) {
     const nonce = crypto.randomBytes(16).toString('base64');
     const cspHeader = `
       default-src 'self';
       script-src 'self' 'nonce-${nonce}' https://dapi.kakao.com https://js.stripe.com;
       style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
     `.replace(/\s+/g, ' ').trim();

     const response = NextResponse.next();
     response.headers.set('Content-Security-Policy', cspHeader);
     response.headers.set('x-nonce', nonce);

     return response;
   }
   ```

2. **Layout에서 nonce 주입**:
   ```typescript
   // src/app/layout.tsx
   import { headers } from 'next/headers';

   export default function RootLayout({ children }) {
     const nonce = headers().get('x-nonce');

     return (
       <html>
         <head>
           <script nonce={nonce} src="https://dapi.kakao.com/v2/maps/sdk.js" />
         </head>
         <body>{children}</body>
       </html>
     );
   }
   ```

3. **Kakao Maps 호환성 검증**:
   - Kakao Maps SDK가 `eval()` 사용하는지 확인
   - 사용 시: `'unsafe-eval'` 유지, Kakao 도메인만 허용
   - 미사용 시: 완전 제거 가능

**검증 방법**:
```bash
# CSP 위반 리포트 모니터링
# /api/security/csp-report 엔드포인트 로그 확인

# Chrome DevTools > Console
# CSP 위반 시 자동으로 경고 표시
```

**예상 공수**: 3-5일
**담당**: Security Team + Frontend Team

---

### Issue #4: E2E 테스트 커버리지 확대

**라벨**: `testing`, `e2e`, `p2`

**현재 상태**: ℹ️ PARTIAL COVERAGE
- **현재 커버리지**: 홈페이지, 로그인
- **누락 시나리오**: 회원가입, 모임 생성, 매칭, 채팅, 결제

**필요성**:
- 핵심 비즈니스 로직 회귀 방지
- 배포 전 자동 검증
- 사용자 여정 전체 보장

**추가 테스트 시나리오**:

1. **전체 사용자 여정**:
   ```typescript
   // tests/e2e/08-full-user-journey.spec.ts
   test('complete user journey', async ({ page }) => {
     // 1. 회원가입
     await page.goto('/auth/signup');
     await page.fill('[data-testid="signup-email"]', 'test@example.com');
     await page.fill('[data-testid="signup-password"]', 'Test1234!');
     await page.click('[data-testid="signup-submit"]');

     // 2. 모임 생성
     await page.goto('/room/new');
     await page.fill('[data-testid="room-title"]', '강남 술친구 모집');
     await page.click('[data-testid="room-submit"]');

     // 3. 다른 사용자(User2) 참가 요청
     // ... (별도 브라우저 컨텍스트)

     // 4. 요청 승인
     await page.goto('/requests');
     await page.click('[data-testid="request-approve-0"]');

     // 5. 채팅
     await page.goto('/chat/[matchId]');
     await page.fill('[data-testid="chat-input"]', '안녕하세요!');
     await page.click('[data-testid="chat-send"]');

     // 6. 검증
     await expect(page.locator('.chat-message')).toContainText('안녕하세요!');
   });
   ```

2. **결제 플로우 (Stripe 샌드박스)**:
   ```typescript
   test('boost purchase flow', async ({ page }) => {
     await page.goto('/room/[roomId]');
     await page.click('[data-testid="boost-button"]');

     // Stripe 테스트 카드
     await page.fill('[name="cardnumber"]', '4242 4242 4242 4242');
     await page.fill('[name="exp-date"]', '12/34');
     await page.fill('[name="cvc"]', '123');
     await page.click('[type="submit"]');

     // 성공 확인
     await expect(page.locator('.boost-success')).toBeVisible();
   });
   ```

3. **네트워크 복원력**:
   ```typescript
   test('offline to online recovery', async ({ page, context }) => {
     await page.goto('/map');

     // 오프라인 시뮬레이션
     await context.setOffline(true);
     await page.reload();

     // 오프라인 페이지 확인
     await expect(page.locator('text=오프라인')).toBeVisible();

     // 온라인 복구
     await context.setOffline(false);
     await page.reload();

     // 정상 동작 확인
     await expect(page.locator('.map-container')).toBeVisible();
   });
   ```

**예상 공수**: 2-3일
**담당**: QA Team + Frontend Team

---

### Issue #5: 모바일 성능 기준선 확립

**라벨**: `performance`, `mobile`, `p2`

**현재 상태**: ℹ️ NOT MEASURED
- **데스크탑**: 측정 완료 ✅
- **모바일**: 측정 진행 중

**필요성**:
- 모바일 사용자가 주요 타깃 (지도 기반 앱)
- 모바일 성능은 데스크탑과 다를 수 있음 (네트워크, CPU)

**측정 방법**:
```bash
# Lighthouse 모바일
npx lighthouse https://meetpin-weld.vercel.app/ \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --output=json --output=html \
  --output-path=artifacts/lighthouse-mobile

# Playwright 모바일 테스트
pnpm qa:mobile
```

**목표 지표** (모바일):
- Performance: ≥70 (모바일은 데스크탑보다 낮음 허용)
- LCP: ≤3.5s (모바일 기준)
- CLS: ≤0.10
- TBT: ≤300ms

**예상 공수**: 0.5일
**담당**: Performance Team

---

## P3: 낮은 우선순위 (1개)

### Issue #6: WebP/AVIF 이미지 포맷 전환

**라벨**: `performance`, `optimization`, `p3`

**현재 상태**: ℹ️ IMPROVEMENT OPPORTUNITY
- **현재 포맷**: PNG, JPG
- **권장 포맷**: WebP (95% 브라우저 지원), AVIF (85% 지원)

**예상 효과**:
- 파일 크기 25-35% 감소
- 대역폭 절약
- LCP 개선 기여

**구현 방법**:
```bash
# 이미지 일괄 변환 스크립트
pnpm add -D sharp

# scripts/convert-images.mjs
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = 'public/screenshots';
const outputDir = 'public/screenshots-optimized';

const files = await fs.readdir(inputDir);
for (const file of files) {
  if (file.match(/\.(png|jpg|jpeg)$/i)) {
    const input = path.join(inputDir, file);
    const outputWebP = path.join(outputDir, file.replace(/\.\w+$/, '.webp'));
    const outputAVIF = path.join(outputDir, file.replace(/\.\w+$/, '.avif'));

    await sharp(input).webp({ quality: 85 }).toFile(outputWebP);
    await sharp(input).avif({ quality: 80 }).toFile(outputAVIF);
  }
}
```

**Next.js 자동 변환** (권장):
```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'], // 자동 변환
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  }
};
```

**예상 공수**: 1일
**담당**: Frontend Team

---

## 추적 & 모니터링

### 주간 체크리스트
- [ ] Lighthouse 성능 측정 (주 1회)
- [ ] E2E 테스트 실행 (배포 전 필수)
- [ ] 보안 취약점 스캔 (`pnpm audit:security`)
- [ ] 번들 크기 확인 (`pnpm analyze:bundle`)

### 월간 체크리스트
- [ ] 전수 감사 (`pnpm qa:full`)
- [ ] A11y 테스트 (`pnpm a11y`)
- [ ] CSP 위반 리포트 분석 (`/api/security/csp-report`)
- [ ] Core Web Vitals 트렌드 분석

### 자동화 권장
```yaml
# .github/workflows/performance.yml
name: Performance Check
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://meetpin-weld.vercel.app
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

---

## 참고 자료

- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing/performance)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

**이슈 리스트 버전**: 1.0
**마지막 업데이트**: 2025-10-13
**다음 리뷰 예정**: 2025-10-20
