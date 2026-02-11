/* src/types/global.d.ts - Global type definitions for MeetPin */

declare global {
  interface Window {
    kakao?: any
    gtag?: (command: 'config' | 'event' | 'consent', targetId: string | any, config?: any) => void
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: string
      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      SITE_URL: string
    }
  }
}

export {}
