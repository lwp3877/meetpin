import type { Metadata } from "next";
import "./globals.css";
import { brandMessages } from "@/lib/config/brand";
import Providers from "@/components/common/Providers";

export const metadata: Metadata = {
  title: `${brandMessages.appName} - ${brandMessages.tagline}`,
  description: "🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 술친구, 운동메이트, 취미친구를 쉽게 찾고 1:1 채팅으로 바로 연결하세요. 신규 가입 시 프리미엄 부스트 3일 무료 증정!",
  keywords: "모임앱, 지역모임, 술친구, 운동메이트, 취미모임, 만남어플, 소셜네트워킹, 지도기반, 실시간채팅, 주변사람, 새로운인연, 동네친구, 밋핀, meetpin",
  authors: [{ name: "MeetPin Team" }],
  category: "Social Networking",
  applicationName: brandMessages.appName,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "MeetPin Team",
  publisher: "MeetPin",
  alternates: {
    canonical: process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
    languages: {
      'ko-KR': process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
    },
  },
  openGraph: {
    title: `${brandMessages.appName} - ${brandMessages.tagline}`,
    description: "🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 술친구, 운동메이트, 취미친구를 쉽게 찾고 1:1 채팅으로 바로 연결하세요.",
    type: "website",
    locale: "ko_KR",
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
    description: "🗺️ 지도에서 방을 만들어 근처 사람들과 실시간 만남! 신규 가입 시 프리미엄 부스트 3일 무료!",
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
  ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.YANDEX_VERIFICATION || process.env.NAVER_SITE_VERIFICATION ? {
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
      ...(process.env.YANDEX_VERIFICATION && { yandex: process.env.YANDEX_VERIFICATION }),
      ...(process.env.NAVER_SITE_VERIFICATION && { 
        other: { 'naver-site-verification': process.env.NAVER_SITE_VERIFICATION }
      }),
    }
  } : {}),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
        <link rel="apple-touch-icon" href="/icons/meetpin.svg" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://xnrqfkecpabucnoxxtwa.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": brandMessages.appName,
              "description": "지도 기반 실시간 모임 플랫폼 - 근처 사람들과 만나고 새로운 인연을 만들어보세요",
              "url": process.env.SITE_URL || 'https://meetpin-weld.vercel.app',
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "name": "프리미엄 부스트",
                "description": "신규 가입 시 3일 무료 증정",
                "price": "0",
                "priceCurrency": "KRW"
              },
              "featureList": [
                "지도 기반 모임 생성",
                "실시간 1:1 채팅",
                "위치 기반 매칭",
                "카테고리별 모임 검색",
                "프리미엄 부스트 기능"
              ],
              "inLanguage": "ko-KR",
              "publisher": {
                "@type": "Organization",
                "name": "MeetPin",
                "url": process.env.SITE_URL || 'https://meetpin-weld.vercel.app'
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased touch-manipulation">
        <Providers>
          <div id="root" className="relative flex min-h-screen flex-col mobile-full-height">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
        </Providers>
        
        {/* 터치 최적화 초기화 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 터치 최적화 즉시 실행
              (function() {
                // 뷰포트 메타 태그 설정
                var viewport = document.querySelector('meta[name=viewport]');
                if (!viewport) {
                  viewport = document.createElement('meta');
                  viewport.name = 'viewport';
                  document.head.appendChild(viewport);
                }
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

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
                
                // 텍스트 선택 방지 (필요한 곳에서만)
                document.body.style.webkitUserSelect = 'none';
                document.body.style.userSelect = 'none';
                
                // 입력 필드에서는 텍스트 선택 허용
                var style = document.createElement('style');
                style.textContent = 'input, textarea, [contenteditable] { -webkit-user-select: text !important; user-select: text !important; }';
                document.head.appendChild(style);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
