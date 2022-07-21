import { RemixI18Next } from 'remix-i18next'
import i18n from '~/i18n'
import en from 'public/locales/en'
import nl from 'public/locales/nl'

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    resources: { en, nl }
  }
})

export default i18next
