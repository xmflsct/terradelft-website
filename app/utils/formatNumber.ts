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
    style: 'unit',
    unit: 'centimeter'
  }).format(number)
}

const relativeTime = (locale: string, date: string) => {
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto'
  })

  const DIVISIONS: {
    amount: number
    name:
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years'
  }[] = [
      { amount: 60, name: 'seconds' },
      { amount: 60, name: 'minutes' },
      { amount: 24, name: 'hours' },
      { amount: 7, name: 'days' },
      { amount: 4.34524, name: 'weeks' },
      { amount: 12, name: 'months' },
      { amount: Number.POSITIVE_INFINITY, name: 'years' }
    ]

  let duration = (new Date(date).getTime() - new Date().getTime()) / 1000

  for (let i = 0; i <= DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }
}

export { currency, dimension, relativeTime }
