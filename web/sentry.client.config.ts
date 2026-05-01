import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // 10% of transactions in production; 100% locally for easier debugging
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Only active when DSN is provided — no-op in local dev without .env.local config
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Don't show the Sentry report dialog on error (internal tool, not consumer app)
  beforeSend(event) {
    return event
  },
})
