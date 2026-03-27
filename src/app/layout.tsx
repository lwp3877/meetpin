import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { brandMessages } from '@/lib/config/brand'
import Providers from '@/components/common/Providers'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

// next/font 자체 호스팅으로 CSP 단순화
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3001' // 개발 기본
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${brandMessages.appName} - ${brandMessages.tagline}`,
  description:
    '🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 술친구, 운동메이트, 취미친구를 쉽게 찾고 1:1 채팅으로 바로 연결하세요. 모든 기능 완전 무료!',
  keywords:
    '모임앱, 지역모임, 술친구, 운동메이트, 취미모임, 만남어플, 소셜네트워킹, 지도기반, 실시간채팅, 주변사람, 새로운인연, 동네친구, 밋핀, meetpin',
  authors: [{ name: 'MeetPin Team' }],
  category: 'Social Networking',
  applicationName: brandMessages.appName,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'MeetPin Team',
  publisher: 'MeetPin',
  alternates: {
    canonical: process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
    languages: {
      'ko-KR': process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
    },
  },
  openGraph: {
    title: `${brandMessages.appName} - ${brandMessages.tagline}`,
    description:
      '🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 술친구, 운동메이트, 취미친구를 쉽게 찾고 1:1 채팅으로 바로 연결하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: brandMessages.appName,
    url: process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${brandMessages.appName} - 지도 기반 모임 플랫폼`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandMessages.appName} - ${brandMessages.tagline}`,
    description:
      '🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 모든 기능 완전 무료!',
    images: ['/og-image.jpg'],
    creator: '@meetpin_official',
    site: '@meetpin_official',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ||
  process.env.YANDEX_VERIFICATION ||
  process.env.NAVER_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.GOOGLE_SITE_VERIFICATION && {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          }),
          ...(process.env.YANDEX_VERIFICATION && { yandex: process.env.YANDEX_VERIFICATION }),
          ...(process.env.NAVER_SITE_VERIFICATION && {
            other: { 'naver-site-verification': process.env.NAVER_SITE_VERIFICATION },
          }),
        },
      }
    : {}),
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // 접근성을 위해 확대 허용
  userScalable: true, // 접근성을 위해 사용자 스케일링 허용
  // WCAG 2.1 AA 준수: 확대/축소 기능 보장
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#10B981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={brandMessages.appName} />

        {/* Favicons */}
        <link rel="icon" href="/icons/meetpin.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="밋핀" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="밋핀" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />
        <meta name="format-detection" content="telephone=no" />

        {/* Resource Hints for Performance */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
        <link rel="preconnect" href="https://js.stripe.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />

        {/* LCP 최적화: Kakao Maps preconnect (preload는 appkey 포함 URL과 달라서 제거) */}
        <link rel="preconnect" href="https://dapi.kakao.com" />
        <link rel="dns-prefetch" href="//dapi.kakao.com" />
        <link rel="dns-prefetch" href="//t1.daumcdn.net" />
        {/* Preload critical assets */}
        <link rel="preload" href="/icons/meetpin.svg" as="image" type="image/svg+xml" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: brandMessages.appName,
              description:
                '지도 기반 실시간 모임 플랫폼 - 근처 사람들과 만나고 새로운 인연을 만들어보세요',
              url: process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
              applicationCategory: 'SocialNetworkingApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                name: '무료 서비스',
                description: '모든 기능 무료 제공',
                price: '0',
                priceCurrency: 'KRW',
              },
              featureList: [
                '지도 기반 모임 생성',
                '실시간 1:1 채팅',
                '위치 기반 매칭',
                '카테고리별 모임 검색',
              ],
              inLanguage: 'ko-KR',
              publisher: {
                '@type': 'Organization',
                name: 'MeetPin',
                url: process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} bg-background min-h-screen touch-manipulation font-sans antialiased`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
        <Providers>
          <div id="root" className="mobile-full-height relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
          <InstallPrompt />
        </Providers>

        {/* 터치 최적화 초기화 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 터치 최적화 즉시 실행
              (function() {
                // iOS Safari 100vh 문제 해결
                function setVhUnit() {
                  var vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--vh', vh + 'px');
                }
                setVhUnit();
                window.addEventListener('resize', setVhUnit);
                window.addEventListener('orientationchange', setVhUnit);

                // 터치 지연 제거
                document.documentElement.style.touchAction = 'manipulation';

                // 입력 필드에서는 텍스트 선택 허용 (전역 스타일로 추가)
                var style = document.createElement('style');
                style.textContent = 'input, textarea, [contenteditable] { -webkit-user-select: text !important; user-select: text !important; }';
                document.head.appendChild(style);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
