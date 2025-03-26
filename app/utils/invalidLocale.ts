import { data } from 'react-router';
import i18n from "~/i18n";

export const invalidLocale = (locale: string | undefined) => {
  if (!locale || !i18n.supportedLngs.includes(locale)) {
    throw data(null, { status: 404 })
  }
}