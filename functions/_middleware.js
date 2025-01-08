import * as Sentry from '@sentry/cloudflare'

export const onRequest = [
  Sentry.sentryPagesPlugin(() => ({
    dsn: 'https://4ceea32ca6aa4b839d8a40df1187227b@o389581.ingest.us.sentry.io/6620031'
  }))
]
