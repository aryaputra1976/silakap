import 'dotenv/config'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  // 10% of transactions in production; 100% in dev for easier debugging
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Only send events when DSN is configured
  enabled: !!process.env.SENTRY_DSN,
  // Ignore known non-critical errors that don't need alerts
  ignoreErrors: [
    'Not found',
    'Unauthorized',
    'Forbidden',
  ],
})
