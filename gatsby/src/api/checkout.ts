import * as Sentry from '@sentry/browser'
import axios from 'axios'
import { BagState, TDObject } from '../state/slices/bag'

const urlDevelopment = 'http://localhost:3000'
const urlProduction = `https://${process.env.GATSBY_API_ENDPOINT}`

export interface Params {
  token: string
  objects: TDObject[]
  delivery: {
    method: BagState['delivery']['method']
    name: string
    phone: string
    countryCode?: string
    countryA2?: string
    index?: number
  }
  amounts: {
    subtotal?: number
    discount?: number
    delivery?: number
  }
  locale: string
  urls: { success: string; cancel: string }
}

const checkout = async ({
  token,
  objects,
  delivery,
  amounts,
  locale,
  urls
}: Params) => {
  Sentry.configureScope(function (scope) {
    scope.setExtra('URL', urlProduction)
    scope.setExtra('Data', objects)
  })

  const baseUrl =
    // @ts-ignore
    process.env.NODE_ENV === 'production' ? urlProduction : urlDevelopment

  return await axios({
    method: 'post',
    url: `${baseUrl}/api/checkout`,
    data: { token, objects, delivery, amounts, locale, urls }
  })
    .then(res => {
      Sentry.configureScope(function (scope) {
        scope.setExtra('Response', res.data)
      })
      return res.data
    })
    .catch(error => Sentry.captureException(error))
}

export default checkout
