import axios from 'axios'
import { TDObject } from '@state/slices/bag'

const urlDevelopment = 'https://terradelft-api-development.xmflsct.workers.dev'
const urlProduction = 'https://api.terra-delft.nl'

export interface Params {
  token: string
  objects: TDObject[]
  delivery:
    | {
        method: 'pickup'
        name: string
      }
    | {
        method: 'shipment'
        name: string
        countryCode: string
        countryA2: string
      }
  amounts: {
    subtotal: number
    discount: number
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
}: Params): Promise<{ sessionId: string }> => {
  const baseURL =
    process.env.NODE_ENV === 'production' ? urlProduction : urlDevelopment

  const { data } = await axios({
    method: 'post',
    baseURL,
    url: '/checkout',
    data: { token, objects, delivery, amounts, locale, urls }
  })

  return data
}

export default checkout
