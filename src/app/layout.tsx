import type { Metadata } from "next";
import "./globals.css";
import { brandMessages } from "@/lib/brand";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: `${brandMessages.appName} - ${brandMessages.tagline}`,
  description: "지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요. 술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.",
  keywords: "모임, 만남, 지역, 술친구, 운동, 취미, 소셜, 네트워킹",
  authors: [{ name: "MeetPin Team" }],
  openGraph: {
    title: `${brandMessages.appName} - ${brandMessages.tagline}`,
    description: "지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: brandMessages.appName,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#10B981" />
        <link rel="icon" href="/icons/meetpin.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/meetpin.svg" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div id="root" className="relative flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
        </Providers>
      </body>
    </html>
  );
}
