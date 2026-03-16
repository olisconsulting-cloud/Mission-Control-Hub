import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Adjust sample rate for production vs development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Performance Monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Set release version
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  // Ignore common errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive environment variables
    if (event.extra?.env) {
      const sensitiveKeys = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'PAYLOAD_SECRET',
        'REDIS_URL',
      ]
      sensitiveKeys.forEach(key => {
        if (event.extra?.env?.[key]) {
          event.extra.env[key] = '[REDACTED]'
        }
      })
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization']
      delete event.request.headers['Cookie']
      delete event.request.headers['X-API-Key']
    }

    // Remove API keys from context
    if (event.contexts?.['API Keys']) {
      delete event.contexts['API Keys']
    }

    return event
  },

  // Custom error grouping
  beforeSendTransaction(event) {
    // Group similar database errors together
    if (event.transaction?.includes('postgres')) {
      event.fingerprint = ['postgres-error', event.transaction]
    }

    return event
  },
})
