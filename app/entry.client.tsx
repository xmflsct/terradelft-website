import { config } from '@fortawesome/fontawesome-svg-core'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { HydratedRouter } from 'react-router/dom'
import { getInitialNamespaces } from 'remix-i18next/client'
import i18n from '~/i18n'
import en from '~/locales/en'
import nl from '~/locales/nl'

config.autoAddCss = false

async function hydrate() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...i18n,
      ns: getInitialNamespaces(),
      resources: { en, nl },
      detection: { order: ['htmlTag'], caches: [] }
    })

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>
    )
  })
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1)
}
