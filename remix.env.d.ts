/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare/globals" />
/// <reference types="@cloudflare/workers-types" />

// declare module '@remix-run/server-runtime' {
//   interface AppLoadContext {
//     ENVIRONMENT?: 'PRODUCTION' | 'PREVIEW'
//     CONTENTFUL_SPACE?: string
//     CONTENTFUL_KEY?: string
//     STRIPE_KEY_PRIVATE?: string
//     STRIPE_KEY_PUBLIC?: string
//     SENDGRID_EMAIL?: string
//     SENDGRID_KEY?: string
//     EMAIL_RECEIVER?: string
//     ALGOLIA_APP_ID?: string
//     ALGOLIA_API_KEY?: string
//     TERRADELFT_WEBSITE?: KVNamespace
//   }
// }