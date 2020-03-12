import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import LanguageDetector from "i18next-browser-languagedetector"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "nl",
    resources: {
      nl: {
        translations: require("./translations/nl.json"),
      },
      en: {
        translations: require("./translations/en.json"),
      },
    },
    ns: ["translations"],
    defaultNS: "translations",
    load: 'languageOnly',
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    react: {
      wait: true,
    },
  })

export default i18n
