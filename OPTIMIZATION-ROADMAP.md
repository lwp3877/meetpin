# 밋핀 성능 최적화 로드맵 (Phase 2)
**시작일**: 2025-10-02
**목표**: 193KB → 140KB, Lighthouse 94 → 100

---

## 🎯 전체 목표

### 정량적 목표
| 항목 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| Bundle Size | 193KB | 140KB | **-27%** |
| Performance Score | 94 | 100 | **+6%** |
| Accessibility | 94 | 100 | **+6%** |
| FCP (First Contentful Paint) | 1.2s | <1.0s | **-17%** |
| LCP (Largest Contentful Paint) | 2.8s | <2.5s | **-11%** |
| CLS (Cumulative Layout Shift) | 0.01 | <0.1 | ✅ |

---

## 📅 Phase 1: 이미지 최적화 (예상: 20KB 절감)

### 1.1 Next.js Image 컴포넌트 전면 적용
**우선순위**: 🔥 HIGH
**예상 시간**: 2-3시간
**예상 절감**: 15KB

#### 작업 내용
1. **현재 `<img>` 태그 식별**
   ```bash
   grep -r '<img' src/ --include="*.tsx"
   ```

2. **Next.js Image로 교체**
   ```typescript
   // Before
   <img src="/logo.png" alt="Logo" />

   // After
   import Image from 'next/image'
   <Image src="/logo.png" alt="Logo" width={200} height={50} />
   ```

3. **우선 적용 대상**
   - `/src/components/landing/*.tsx` (랜딩 페이지 이미지)
   - `/src/app/page.tsx` (홈페이지 Hero)
   - `/src/components/ui/ProfileModal.tsx` (프로필 이미지)
   - Avatar 컴포넌트들

#### 검증 기준
- [ ] 모든 `<img>` → `<Image>` 전환
- [ ] Lazy loading 자동 적용
- [ ] WebP 자동 변환 확인
- [ ] LCP 개선 측정 (2.8s → 2.5s)

---

### 1.2 이미지 형식 최적화
**우선순위**: 🔥 HIGH
**예상 시간**: 1-2시간
**예상 절감**: 5KB

#### 작업 내용
1. **public/ 이미지 최적화**
   ```bash
   # WebP 변환
   find public -name "*.png" -o -name "*.jpg"
   npx @squoosh/cli --webp auto public/**/*.{png,jpg}
   ```

2. **next.config.ts 설정 확인**
   ```typescript
   images: {
     formats: ['image/webp', 'image/avif'],
     deviceSizes: [640, 750, 828, 1080, 1200],
     imageSizes: [16, 32, 48, 64, 96],
   }
   ```

3. **Responsive images 적용**
   ```typescript
   <Image
     src="/hero.jpg"
     sizes="(max-width: 768px) 100vw, 50vw"
     priority={true} // Above-the-fold images
   />
   ```

#### 검증 기준
- [ ] 모든 PNG/JPG → WebP 변환
- [ ] Image sizes 최적화
- [ ] Network tab에서 WebP 로딩 확인

---

## 📅 Phase 2: Code Splitting 강화 (예상: 15KB 절감)

### 2.1 /map 페이지 동적 import 확장
**우선순위**: 🔥 HIGH
**예상 시간**: 2-3시간
**예상 절감**: 8KB

#### 작업 내용
1. **현재 상태 분석**
   ```bash
   # 이미 적용된 동적 import
   - MapFilters (동적 로딩 완료)
   - HostMessageNotifications (동적 로딩 완료)
   - NotificationCenter (동적 로딩 완료)
   ```

2. **추가 동적 로딩 대상**
   ```typescript
   // src/app/map/page.tsx

   // 지도 컴포넌트 자체를 동적 로딩
   const DynamicKakaoMap = dynamic(
     () => import('@/components/map/KakaoMapCore'),
     {
       ssr: false,
       loading: () => <MapSkeleton />
     }
   )

   // 검색 기능 동적 로딩
   const SearchPanel = dynamic(
     () => import('@/components/map/SearchPanel'),
     { ssr: false }
   )
   ```

3. **Skeleton UI 추가**
   ```typescript
   const MapSkeleton = () => (
     <div className="animate-pulse h-full bg-gray-200">
       <div className="h-16 bg-gray-300" />
       <div className="h-full bg-gray-200" />
     </div>
   )
   ```

#### 검증 기준
- [ ] /map 페이지 초기 번들 < 30KB
- [ ] 지도 로딩 skeleton 표시
- [ ] Network waterfall 최적화 확인

---

### 2.2 Modal 컴포넌트 완전 동적화
**우선순위**: MEDIUM
**예상 시간**: 1-2시간
**예상 절감**: 5KB

#### 작업 내용
```typescript
// 모든 Modal을 필요할 때만 로딩
const modals = {
  BoostModal: dynamic(() => import('@/components/ui/BoostModal')),
  ProfileModal: dynamic(() => import('@/components/ui/ProfileModal')),
  RealtimeChatModal: dynamic(() => import('@/components/ui/RealtimeChatModal')),
}

// 사용
{showBoost && <modals.BoostModal />}
```

#### 검증 기준
- [ ] Modal import가 초기 번들에 포함되지 않음
- [ ] Modal 열기 시 동적 로딩 확인

---

### 2.3 Route Prefetching 최적화
**우선순위**: MEDIUM
**예상 시간**: 1시간
**예상 절감**: 2KB

#### 작업 내용
```typescript
// Critical routes만 prefetch
<Link href="/map" prefetch={true}>
<Link href="/auth/login" prefetch={false}>
```

---

## 📅 Phase 3: CSS 최적화 (예상: 10KB 절감)

### 3.1 Tailwind CSS Purge 강화
**우선순위**: 🔥 HIGH
**예상 시간**: 2시간
**예상 절감**: 6KB

#### 작업 내용
1. **사용하지 않는 클래스 식별**
   ```bash
   # Tailwind 사용 분석
   npx tailwindcss-analyzer .next/**/*.css
   ```

2. **tailwind.config.ts 최적화**
   ```typescript
   module.exports = {
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
       '!./src/**/*.test.{js,ts,jsx,tsx}', // 테스트 파일 제외
     ],
     safelist: [
       // 동적으로 생성되는 클래스만 명시
       'bg-emerald-500',
       'text-emerald-600',
     ]
   }
   ```

3. **Unused utilities 제거**
   - Animation 클래스 최소화
   - Grid 시스템 단순화
   - Color palette 정리

#### 검증 기준
- [ ] CSS 파일 크기 < 50KB
- [ ] 미사용 클래스 0개

---

### 3.2 Critical CSS 인라인
**우선순위**: MEDIUM
**예상 시간**: 1-2시간
**예상 절감**: 4KB

#### 작업 내용
```typescript
// app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS - Above the fold */
            .hero { ... }
            .nav { ... }
          `
        }} />
      </head>
    </html>
  )
}
```

---

## 📅 Phase 4: Vendor Bundle 최적화 (예상: 8KB 절감)

### 4.1 Supabase Client 경량화
**우선순위**: MEDIUM
**예상 시간**: 2시간
**예상 절감**: 5KB

#### 작업 내용
```typescript
// 필요한 모듈만 import
import { createClient } from '@supabase/supabase-js/dist/module/index'

// Tree-shakable imports
import { SupabaseClient } from '@supabase/supabase-js'
```

---

### 4.2 Date Libraries 최적화
**우선순위**: LOW
**예상 시간**: 1시간
**예상 절감**: 3KB

#### 작업 내용
```typescript
// date-fns 대신 Intl API 사용
const formatted = new Intl.DateTimeFormat('ko-KR').format(date)

// 또는 date-fns ESM import
import { format } from 'date-fns/format'
```

---

## 📅 Phase 5: Accessibility 100점 달성

### 5.1 Color Contrast 개선
**우선순위**: 🔥 HIGH
**예상 시간**: 2시간

#### 작업 내용
1. **Contrast checker 실행**
   ```bash
   npx pa11y-ci https://meetpin-weld.vercel.app
   ```

2. **문제 요소 수정**
   ```css
   /* Before - Contrast ratio 3.5:1 */
   .text-gray-500 { color: #6B7280; }

   /* After - Contrast ratio 4.5:1+ */
   .text-gray-600 { color: #4B5563; }
   ```

#### 수정 대상
- Button hover states
- Link colors
- Badge text colors
- Disabled states

---

### 5.2 ARIA Labels 완비
**우선순위**: MEDIUM
**예상 시간**: 2시간

#### 작업 내용
```typescript
// Icons에 aria-label 추가
<MapPin aria-label="위치 아이콘" />

// Buttons에 명확한 label
<button aria-label="모임 생성하기">
  <Plus />
</button>

// Interactive elements
<div role="button" tabIndex={0} aria-label="프로필 열기">
```

---

## 📅 Phase 6: Performance 100점 달성

### 6.1 Resource Hints 추가
**우선순위**: MEDIUM
**예상 시간**: 1시간

#### 작업 내용
```typescript
// app/layout.tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://ka-f.fontawesome.com" />
  <link rel="preload" href="/hero.webp" as="image" />
</head>
```

---

### 6.2 Third-party Scripts 최적화
**우선순위**: HIGH
**예상 시간**: 1시간

#### 작업 내용
```typescript
import Script from 'next/script'

// Kakao Maps - defer loading
<Script
  src="//dapi.kakao.com/v2/maps/sdk.js"
  strategy="lazyOnload"
  onLoad={() => setMapReady(true)}
/>

// Stripe
<Script
  src="https://js.stripe.com/v3/"
  strategy="afterInteractive"
/>
```

---

## 📊 진행 상황 추적

### Week 1 (Day 1-2)
- [x] 베이스라인 측정 완료
- [ ] Phase 1: 이미지 최적화
- [ ] Phase 2: Code Splitting

### Week 1 (Day 3-4)
- [ ] Phase 3: CSS 최적화
- [ ] Phase 4: Vendor Bundle

### Week 1 (Day 5-7)
- [ ] Phase 5: Accessibility
- [ ] Phase 6: Performance 100점
- [ ] 최종 검증 및 배포

---

## ✅ 각 Phase 완료 체크리스트

### Phase 완료 기준
- [ ] Bundle size 목표 달성
- [ ] Lighthouse 점수 개선 확인
- [ ] E2E 테스트 전체 통과
- [ ] 시각적 회귀 테스트 통과
- [ ] Git commit with measurements

### 전체 완료 기준
```
✅ Bundle: 193KB → 140KB (-27%)
✅ Performance: 94 → 100 (+6)
✅ Accessibility: 94 → 100 (+6)
✅ Best Practices: 96 → 100 (+4)
✅ SEO: 100 (maintain)
✅ All tests: 66/66 passing
```

---

## 🛠️ 작업 시작 명령어

### Phase 1 시작
```bash
# 이미지 최적화 브랜치
git checkout -b perf/image-optimization

# 이미지 분석
find public src -name "*.png" -o -name "*.jpg" | wc -l

# Next.js Image 적용 시작
# ... 작업 진행 ...

# 검증
pnpm build
pnpm test
pnpm playwright test
```

### 각 Phase 후 측정
```bash
# Bundle 크기 측정
du -sh .next/static/chunks/*.js | sort -hr

# Lighthouse 재측정
npx lighthouse https://meetpin-weld.vercel.app

# Git commit
git add -A
git commit -m "perf(phase1): image optimization - XX KB reduction"
```

---

**로드맵 생성일**: 2025-10-02
**예상 완료일**: 2025-10-09
**담당자**: Project Manager (Claude Code)
