import React from "react"
import * as ReactI18next from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { Helmet } from "react-helmet"
import i18next from "i18next"

export const ContextLanguage = React.createContext([])

export default function ContextLanguageProvider({ element, props }) {
  const i18n = i18next
    .createInstance({
      lng: props.pageContext.language,
      interpolation: { escapeValue: false },
      initImmediate: false,
      resources: props.pageContext.i18nResources,
    })
    .use(ReactI18next.initReactI18next)
    .use(LanguageDetector)
  // noinspection JSIgnoredPromiseFromCall
  i18n.init({
    load: "languageOnly",
    whitelist: ["nl", "en"],
    nonExplicitWhitelist: true,
    fallbackLng: ["en"],
    detection: {
      order: ["localStorage", "cookie", "navigator", "path"],

      lookupLocalStorage: "terradelft_i18n",
      lookupCookie: "terradelft_i18n",
      lookupFromPathIndex: 0,

      caches: ["localStorage", "cookie"],
      excludeCacheFor: ["cimode"],

      cookieDomain: "terra-delft.nl",

      checkWhitelist: true,
    },
  })

  return (
    <ReactI18next.I18nextProvider i18n={i18n}>
      <ContextLanguage.Provider
        value={props.pageContext && props.pageContext.alternateLinks}
      >
        <Helmet htmlAttributes={{ lang: props.pageContext.language }}>
          {props.pageContext &&
            props.pageContext.alternateLinks &&
            props.pageContext.alternateLinks.map((link) => (
              <link
                rel='alternate'
                hrefLang={link.language}
                href={link.path}
                key={link.path}
              />
            ))}
        </Helmet>
        {element}
      </ContextLanguage.Provider>
    </ReactI18next.I18nextProvider>
  )
}
