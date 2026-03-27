import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withPWA from '@ducanh2912/next-pwa'

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
      // CDN 이미지 (일시적으로 비활성화 - 404 에러 때문에)
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      //   port: '',
      //   pathname: '/**',
      // },
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'react-hook-form',
      'zod',
    ],
  },

  // 서버 외부 패키지
  serverExternalPackages: ['@supabase/supabase-js'],

  // 보안 헤더 강화 - 개발/프로덕션 구분
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'

    // 개발 모드에서는 CSP 완화
    if (isDev) {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
          ],
        },
      ]
    }

    // 프로덕션 모드 - 강화된 보안 헤더
    const fontDomains = [
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com'
    ].join(' ')

    const enforcedCSP = [
      "default-src 'self'",
      "base-uri 'self'",
      // unsafe-eval: Kakao Maps SDK v3가 내부적으로 eval()을 사용하여 제거 불가.
      //   Kakao 측에서 eval()을 제거한 SDK를 배포하면 이 항목을 삭제할 수 있음.
      //   참고: https://developers.kakao.com/docs/latest/ko/kakao-map/js
      // unsafe-inline: Next.js 빌드 시 인라인 스크립트가 생성되어 제거 불가.
      //   nonce 기반 CSP로 대체하려면 src/middleware.ts에서 nonce 생성 필요.
      // googletagmanager.com 제거: flags.ts에서 analyticsEnabled=false이므로 불필요.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `font-src 'self' data: ${fontDomains}`,
      // http: 제거: 모든 이미지 출처(Supabase, dicebear, 소셜 아바타)가 HTTPS를 사용하며,
      // HTTP 이미지는 브라우저 혼합 콘텐츠 정책으로 이미 차단됨.
      // 사용자가 HTTP 이미지 URL을 입력한 프로필/방 이미지는 브라우저에서 자동으로 차단됩니다.
      "img-src 'self' data: blob: https:",
      // google-analytics.com 제거: analyticsEnabled=false이므로 불필요.
      // 분석 기능을 활성화하면 https://www.google-analytics.com을 다시 추가해야 함.
      "connect-src 'self' https://dapi.kakao.com https://t1.daumcdn.net https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ')

    // Report-Only: 최소 정책으로 관측용
    const reportOnlyCSP = [
      "default-src 'self'",
      "report-uri /api/security/csp-report",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // X-Frame-Options (하위 호환)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
          // Cross-Origin Policies
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // Content Security Policy (강제 정책)
          {
            key: 'Content-Security-Policy',
            value: enforcedCSP,
          },
          // Content Security Policy (Report-Only 최소화)
          {
            key: 'Content-Security-Policy-Report-Only',
            value: reportOnlyCSP,
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
    ]
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
    ]
  },

  // 리라이트 (API 프록시만)
  async rewrites() {
    return [
      {
        source: '/api/stripe/:path*',
        destination: '/api/payments/stripe/:path*',
      },
    ]
  },

  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션에서 콘솔 로그 제거
    if (!dev) {
      config.optimization.minimize = true
    }

    // Bundle Budget Plugin (프로덕션 클라이언트 빌드에서만)
    if (!dev && !isServer) {
      config.plugins.push({
        apply: (compiler: any) => {
          compiler.hooks.afterEmit.tap('BundleBudgetPlugin', (compilation: any) => {
            const assets = compilation.assets;
            let mainBundleSize = 0;
            let hasMainExceeded = false;
            let hasChunkExceeded = false;

            console.log('\n🔍 Bundle Budget Check:');

            for (const assetName in assets) {
              if (assetName.endsWith('.js') && !assetName.includes('.map')) {
                const size = assets[assetName].size();
                const sizeKB = Math.round(size / 1024);

                // 메인 번들 체크 (app, main, layout 포함)
                if (assetName.includes('app-') || assetName.includes('main') || assetName.includes('layout-')) {
                  mainBundleSize += size;
                  console.log(`📦 Main: ${assetName} = ${sizeKB}KB`);
                  if (sizeKB > 300) {
                    console.error(`❌ MAIN BUNDLE EXCEEDED: ${assetName} = ${sizeKB}KB (limit: 300KB)`);
                    hasMainExceeded = true;
                  }
                }
                // 청크 번들 체크
                else {
                  console.log(`📦 Chunk: ${assetName} = ${sizeKB}KB`);
                  if (sizeKB > 300) {
                    console.error(`❌ CHUNK EXCEEDED: ${assetName} = ${sizeKB}KB (limit: 300KB)`);
                    hasChunkExceeded = true;
                  }
                }
              }
            }

            const mainSizeKB = Math.round(mainBundleSize / 1024);
            console.log(`\n📊 Total Main Bundle: ${mainSizeKB}KB (limit: 300KB)`);

            if (mainSizeKB > 300) {
              console.error(`❌ TOTAL MAIN BUNDLE EXCEEDED: ${mainSizeKB}KB`);
              hasMainExceeded = true;
            }

            if (hasMainExceeded || hasChunkExceeded) {
              throw new Error(`Bundle budget exceeded! Main: ${mainSizeKB}KB, Build failed.`);
            }

            console.log(`✅ Bundle budget passed - Main: ${mainSizeKB}KB ≤ 300KB\n`);
          });
        }
      });
    }

    // Bundle Analyzer (조건부)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }

    return config
  },

  // 환경별 설정
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // 🔥 정적 내보내기 완전 금지 - API 라우트 보장
  // output: 'export',  // 완전 삭제 - 서버 모드 강제

  // TypeScript 최적화
  typescript: {
    ignoreBuildErrors: false,
  },

}

// Sentry configuration (only if DSN exists)
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || 'meetpin',
  project: process.env.SENTRY_PROJECT || 'meetpin',
  silent: true,
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
}

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  sw: 'sw.js',
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1년
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5분
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Kakao Maps SDK는 SW 캐싱 제외: Referer 헤더 변조로 401 발생하므로
      // 브라우저가 직접 dapi.kakao.com에 요청하도록 함
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60, // 1분
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
})(nextConfig)

// Export with conditional Sentry wrapper
export default process.env.SENTRY_DSN
  ? withSentryConfig(pwaConfig, sentryWebpackPluginOptions)
  : pwaConfig
