import { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { createInstance } from 'i18next'
import isbot from 'isbot'
import en from 'public/locales/en'
import nl from 'public/locales/nl'
import { renderToReadableStream } from 'react-dom/server'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from './i18n'
import i18next from './i18next.server'
import { cached } from './utils/cache'
import { kved } from './utils/kv'

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

  const body = await renderToReadableStream(
    <I18nextProvider i18n={instance}>
      <RemixServer context={context} url={request.url} />
    </I18nextProvider>,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error(error)
        status = 500
      }
    }
  )

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady
  }

  headers.set('Content-Type', 'text/html')
  headers.set('X-Cached', `${cached}`)
  headers.set('X-KVed', `${kved}`)

  return new Response(body, { status, headers })
}
