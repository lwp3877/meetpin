import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,

    // Minimal config for edge runtime
    tracesSampleRate: 0.01, // 1% for edge functions
    environment: process.env.NODE_ENV,

    // Additional context
    initialScope: {
      tags: {
        component: 'meetpin-edge'
      }
    }
  })
} else {
  console.log('[Sentry] Edge disabled - no SENTRY_DSN environment variable found')
}