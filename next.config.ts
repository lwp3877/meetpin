import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net",
              "connect-src 'self' ws: wss: https://dapi.kakao.com http://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net https://*.supabase.co wss://*.supabase.co http://localhost:* https://localhost:* https://api.stripe.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
