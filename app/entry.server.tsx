import { RemixServer } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import { createInstance } from 'i18next'
import { renderToString } from 'react-dom/server'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18next from './i18next.server'
import i18n from './i18n'

import en from 'public/locales/en'
import nl from 'public/locales/nl'
import { kved } from './utils/kv'
import { cached } from './utils/cache'
import { EntryContext } from '@remix-run/cloudflare'

// Sentry.init({
//   dsn: 'https://4ceea32ca6aa4b839d8a40df1187227b@o389581.ingest.sentry.io/6620031',
//   tracesSampleRate: 0.5
// })

export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  const instance = createInstance()

  const url = new URL(request.url)
  const attemptLocale = url.pathname.split('/')?.[1]
  const lng = attemptLocale
    ? i18n.supportedLngs.includes(attemptLocale)
      ? attemptLocale
      : 'nl'
    : 'nl'
  const ns = i18next.getRouteNamespaces(context)

  await instance.use(initReactI18next).init({ ...i18n, lng, ns, resources: { en, nl } })

  let markup = renderToString(
    <I18nextProvider i18n={instance}>
      <RemixServer context={context} url={request.url} />
    </I18nextProvider>
  )

  headers.set('Content-Type', 'text/html')
  headers.set('X-Cached', `${cached}`)
  headers.set('X-KVed', `${kved}`)

  return new Response('<!DOCTYPE html>' + markup, { status, headers })
}
