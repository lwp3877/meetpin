// MeetPin Architecture Boundaries Configuration
// 아키텍처 경계 설정 - 의존성 규칙 정의

module.exports = {
  // 무시할 패키지들 (필요하지만 직접 import되지 않는 것들)
  ignores: [
    '@next/eslint-plugin-next', // ESLint 플러그인
    '@tailwindcss/*', // Tailwind CSS 플러그인들
    'server-only', // Next.js 서버 전용 패키지
    'prettier-plugin-tailwindcss', // Prettier 플러그인
    'webpack-bundle-analyzer', // Bundle 분석용
    '@testing-library/*', // 테스트 라이브러리들
    '@playwright/test', // E2E 테스트
    'jest-environment-jsdom', // Jest 환경
    '@jest/globals', // Jest 전역
    '@types/*', // TypeScript 타입 정의들
    '@tanstack/react-query', // React Query (usaged in multiple places)
    'eslint', // ESLint 코어
    'eslint-config-next', // Next.js ESLint 설정
    'eslint-plugin-react-hooks', // React hooks ESLint 플러그인
    'cross-env', // 환경 변수 설정
    'dependency-cruiser', // 의존성 분석 도구
    'knip', // 미사용 코드 분석 도구
    'wait-on', // 서버 대기 유틸리티
  ],

  // 특정 디렉토리별 허용된 의존성 패턴
  specials: [
    // API 라우트는 서버 사이드 패키지만 허용
    {
      pattern: 'src/app/api/**',
      allow: ['@supabase/ssr', 'stripe', 'ioredis', '@upstash/*']
    },

    // 클라이언트 컴포넌트는 클라이언트 패키지만 허용
    {
      pattern: 'src/components/**',
      allow: ['@radix-ui/*', 'lucide-react', 'react-*', '@tanstack/react-query']
    },

    // 라이브러리는 순수 유틸리티만 허용
    {
      pattern: 'src/lib/**',
      deny: ['@radix-ui/*', 'lucide-react'] // UI 패키지 금지
    }
  ]
}