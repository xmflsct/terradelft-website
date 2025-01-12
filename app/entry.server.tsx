import { Request } from '@cloudflare/workers-types'
import { createInstance } from 'i18next'
import { renderToReadableStream } from 'react-dom/server'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { EntryContext, ServerRouter } from 'react-router'
import i18n from '~/i18n'
import i18next from '~/i18next.server'
import en from '~/locales/en'
import nl from '~/locales/nl'
import { cached } from '~/utils/cache'
import { kved } from '~/utils/kv'

export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  const controller = new AbortController()

  const instance = createInstance()

  const lng = await i18next.getLocale(request as any)
  const ns = i18next.getRouteNamespaces(context)

  await instance.use(initReactI18next).init({
    ...i18n,
    lng,
    ns,
    resources: { en, nl }
  })

  const body = await renderToReadableStream(
    <I18nextProvider i18n={instance}>
      <ServerRouter context={context} url={request.url} />
    </I18nextProvider>,
    {
      signal: controller.signal,
      onError(error: unknown) {
        console.error(error)
        status = 500
      }
    }
  )

  if ((request.cf?.botManagement as any)?.verified_bot) {
    await body.allReady
  }

  headers.set('Content-Type', 'text/html')
  headers.set('X-Cached', `${cached}`)
  headers.set('X-KVed', `${kved}`)

  return new Response(body, { status, headers })
}
