import { config } from '@fortawesome/fontawesome-svg-core'
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { useEffect } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { getInitialNamespaces } from 'remix-i18next'
import i18n from './i18n'

config.autoAddCss = false

Sentry.init({
  dsn: 'https://4ceea32ca6aa4b839d8a40df1187227b@o389581.ingest.sentry.io/6620031',
  tracesSampleRate: 0.5,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches)
    })
  ]
})

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    ...i18n,
    ns: getInitialNamespaces(),
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: { order: ['htmlTag'], caches: [] }
  })
  .then(() => {
    return hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    )
  })
