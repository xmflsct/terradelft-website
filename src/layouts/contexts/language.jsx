import React from "react"
import * as ReactI18next from "react-i18next"
import { Helmet } from "react-helmet"
import i18next from "i18next"

export const ContextLanguage = React.createContext([])

export default function ContextLanguageProvider({ element, props }) {
  const i18n = i18next
    .createInstance({
      lng: props.pageContext.language,
      interpolation: { escapeValue: false },
      initImmediate: false,
      resources: props.pageContext.i18nResources
    })
    .use(ReactI18next.initReactI18next)
  // noinspection JSIgnoredPromiseFromCall
  i18n.init()

  return (
    <ReactI18next.I18nextProvider i18n={i18n}>
      <ContextLanguage.Provider
        value={props.pageContext && props.pageContext.alternateLinks}
      >
        <Helmet htmlAttributes={{ lang: props.pageContext.language }}>
          {props.pageContext &&
            props.pageContext.alternateLinks &&
            props.pageContext.alternateLinks.map(link => (
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
