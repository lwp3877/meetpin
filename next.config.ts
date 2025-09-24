import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 최적화
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  
  // 이미지 최적화
  images: {
    remotePatterns: [
      // Supabase 이미지
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      // 외부 아바타 서비스
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      // CDN 이미지
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // 소셜 로그인 아바타
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ssl.pstatic.net',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@tanstack/react-query',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'react-hook-form',
      'zod'
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // 서버 외부 패키지
  serverExternalPackages: ['@supabase/supabase-js'],

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
          },
          // Content Security Policy (Report-Only for testing)
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net https://js.stripe.com https://www.googletagmanager.com",
              "connect-src 'self' https://dapi.kakao.com https://t1.daumcdn.net https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "report-uri /api/security/csp-report",
            ].join('; '),
          },
          // Content Security Policy (Enforced - 점진적으로 활성화)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net https://js.stripe.com https://www.googletagmanager.com",
              "connect-src 'self' https://dapi.kakao.com https://t1.daumcdn.net https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // 정적 자산 캐싱
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 리다이렉트
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
    ];
  },

  // 리라이트 (API 프록시)
  async rewrites() {
    return [
      {
        source: '/api/stripe/:path*',
        destination: '/api/payments/stripe/:path*',
      },
    ];
  },

  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션에서 콘솔 로그 제거
    if (!dev) {
      config.optimization.minimize = true;
    }

    // Bundle Analyzer (조건부)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  // 환경별 설정
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // 출력 설정 (Vercel에서는 자동으로 standalone 사용)
  output: process.env.VERCEL ? 'standalone' : undefined,
  
  // TypeScript 최적화
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 최적화  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;