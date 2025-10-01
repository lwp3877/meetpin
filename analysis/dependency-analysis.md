# 의존성 분석 (Step 8)

**생성일**: 2025-10-01
**브랜치**: refactor-cleanup
**도구**: depcheck

---

## 📋 미사용 의존성

### Dependencies (2개)

1. **@sentry/webpack-plugin** ❌
   - 이유: Sentry 설정 파일에서 사용되지만 실제로는 빌드 타임에만 필요
   - 조치: devDependencies로 이동 권장

2. **@tanstack/react-query** ❌
   - 이유: depcheck가 감지 못함 (실제로는 사용됨)
   - 조치: 유지 (false positive)

### DevDependencies (12개)

1. **@next/eslint-plugin-next** ❌
   - 이유: eslint.config.mjs에서 직접 import 안 됨
   - 상태: Next.js 15.5+ 에서 deprecated
   - 조치: 제거 가능

2. **@tailwindcss/postcss** ⚠️
   - 이유: tailwind.config.ts에서 자동 사용
   - 조치: 유지 (postcss 플러그인)

3. **@types/jest** ❌
   - 이유: jest.config.js에서 직접 import 안 됨
   - 조치: 제거 가능 (Jest 자체에 타입 포함)

4. **axe-core** ❌
   - 이유: @axe-core/playwright에 포함됨
   - 조치: 제거 가능 (중복)

5. **cross-env** ❌
   - 이유: package.json scripts에서 사용
   - 조치: 유지 필요

6. **depcheck** ✅
   - 이유: 의존성 분석 도구
   - 조치: 유지 (이번 분석에 사용)

7. **dependency-cruiser** ✅
   - 이유: 아키텍처 검증 도구
   - 조치: 유지 (scripts/check-architecture.js)

8. **eslint-config-next** ⚠️
   - 이유: Next.js 15.5+ deprecated
   - 조치: 검토 필요

9. **eslint-plugin-react-hooks** ⚠️
   - 이유: eslint.config.mjs에서 자동 사용
   - 조치: 유지

10. **jest-environment-jsdom** ❌
    - 이유: jest.config.js에 명시적으로 설정됨
    - 조치: 유지 필요

11. **knip** ✅
    - 이유: 미사용 코드 분석 도구
    - 조치: 유지

12. **prettier-plugin-tailwindcss** ⚠️
    - 이유: prettier config에서 자동 사용
    - 조치: 유지

---

## 🔍 실제 사용 확인이 필요한 패키지

### 검증 필요 (depcheck false negatives)

1. **@tanstack/react-query**
   - 실제 사용처 확인 필요
   - Providers.tsx에서 사용될 가능성 높음

2. **cross-env**
   - package.json scripts에서 사용
   - 플랫폼 독립적 환경변수 설정용

3. **@tailwindcss/postcss**
   - Tailwind CSS v4 PostCSS 플러그인
   - 필수 의존성

---

## ✅ 제거 가능한 패키지 (확실)

### 우선순위 1 (즉시 제거 가능)

1. **axe-core**
   - 이유: @axe-core/playwright에 포함
   - 중복 의존성

2. **@types/jest**
   - 이유: Jest 30+ 자체에 타입 포함
   - 불필요한 타입 패키지

### 우선순위 2 (검토 후 제거)

3. **@next/eslint-plugin-next**
   - 이유: Next.js 15.5+ deprecated
   - 마이그레이션 가이드 확인 필요

4. **eslint-config-next**
   - 이유: Next.js 15.5+ deprecated
   - @next/eslint-plugin-next와 함께 제거

---

## ⚠️ 유지해야 할 패키지 (false positives)

### depcheck가 놓친 실제 사용 패키지

1. **@tanstack/react-query**
   - 실제: Providers.tsx에서 QueryClientProvider 사용
   - 검증: grep으로 확인 필요

2. **cross-env**
   - 실제: package.json scripts에서 사용
   - 예: `"analyze": "cross-env ANALYZE=true pnpm build"`

3. **@tailwindcss/postcss**
   - 실제: Tailwind CSS v4 필수 플러그인
   - next.config.ts에서 자동 로드

4. **prettier-plugin-tailwindcss**
   - 실제: prettier 설정에서 자동 로드
   - .prettierrc 또는 package.json에 설정

5. **eslint-plugin-react-hooks**
   - 실제: eslint.config.mjs에서 사용
   - React hooks 린팅 규칙

6. **jest-environment-jsdom**
   - 실제: jest.config.js에서 testEnvironment로 설정
   - DOM 환경 테스트 필수

---

## 📊 제거 계획

### Batch 1: 안전한 제거 (2개)
```bash
pnpm uninstall axe-core @types/jest
```

### Batch 2: Next.js deprecated (2개)
```bash
# Next.js 16 마이그레이션 가이드 확인 후
pnpm uninstall @next/eslint-plugin-next eslint-config-next
```

### Batch 3: Sentry 재배치 (1개)
```bash
# devDependencies로 이동
pnpm uninstall @sentry/webpack-plugin
pnpm add -D @sentry/webpack-plugin
```

---

## 🔬 추가 검증 필요

### @tanstack/react-query 사용처 확인
```bash
grep -r "@tanstack/react-query" src/ --include="*.tsx" --include="*.ts"
grep -r "QueryClient" src/ --include="*.tsx" --include="*.ts"
grep -r "useQuery" src/ --include="*.tsx" --include="*.ts"
```

### cross-env 사용처 확인
```bash
grep "cross-env" package.json
```

---

**분석 완료 시각**: 2025-10-01 13:15
**제거 가능 패키지**: 2-4개
**재검토 필요**: 1개 (@tanstack/react-query)
