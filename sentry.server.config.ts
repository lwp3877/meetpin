import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,

    // Performance monitoring
    tracesSampleRate: 0.05, // 5% of server transactions

    // Environment detection
    environment: process.env.NODE_ENV,

    // Server-specific integrations
    integrations: [
      Sentry.prismaIntegration(),
      Sentry.httpIntegration(),
    ],

    // Filter out noisy server errors
    beforeSend(event) {
      // Skip certain error types
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.value?.includes('ECONNRESET') ||
            error?.value?.includes('socket hang up') ||
            error?.value?.includes('timeout')) {
          return null
        }
      }
      return event
    },

    // Additional context
    initialScope: {
      tags: {
        component: 'meetpin-server'
      }
    }
  })
} else {
  console.log('[Sentry] Server disabled - no SENTRY_DSN environment variable found')
}