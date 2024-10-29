import { RemixI18Next } from 'remix-i18next/server'
import i18n from '~/i18n'
import en from 'public/locales/en'
import nl from 'public/locales/nl'

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng
  },
  i18next: {
    resources: { en, nl }
  }
})

export default i18next
