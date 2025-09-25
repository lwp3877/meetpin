import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Session replay for debugging
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 0.5, // 50% of sessions with errors

    // Environment detection
    environment: process.env.NODE_ENV,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out noisy errors
    beforeSend(event) {
      // Skip certain error types
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.type === 'ChunkLoadError' ||
            error?.value?.includes('Loading chunk') ||
            error?.value?.includes('Non-Error promise rejection')) {
          return null
        }
      }
      return event
    },

    // Additional context
    initialScope: {
      tags: {
        component: 'meetpin-client'
      }
    }
  })
} else {
  console.log('[Sentry] Disabled - no SENTRY_DSN environment variable found')
}