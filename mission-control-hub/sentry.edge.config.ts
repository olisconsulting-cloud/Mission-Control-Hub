import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Adjust sample rate for production vs development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Set release version
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  // Edge Runtime has limited integrations
  integrations: [],

  // Ignore common errors
  ignoreErrors: [
    'Network request failed',
    'Failed to fetch',
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization']
      delete event.request.headers['Cookie']
      delete event.request.headers['X-API-Key']
    }

    // Remove API keys from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data?.apiKey) {
          breadcrumb.data.apiKey = '[REDACTED]'
        }
        return breadcrumb
      })
    }

    return event
  },
})
