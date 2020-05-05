export function currency(number, locale) {
  locale = locale === "nl" ? "nl-NL" : "en-Intl"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(number)
}

export function dimension(number, locale) {
  locale = locale === "nl" ? "nl-NL" : "en-Intl"

  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "centimeter",
  }).format(number)
}
