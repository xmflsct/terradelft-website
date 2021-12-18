const currency = (number: number, locale: string) => {
  locale = locale === 'nl' ? 'nl-NL' : 'en-Intl'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(number)
}

const dimension = (number: number, locale: string) => {
  locale = locale === 'nl' ? 'nl-NL' : 'en-Intl'

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    unit: 'centimeter'
  }).format(number)
}

export { currency, dimension }
