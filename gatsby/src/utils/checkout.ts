import axios from 'axios'
import { BagState, TDObject } from '@state/slices/bag'

const urlDevelopment = 'http://localhost:8787'
const urlProduction = 'https://api.terra-delft.nl'

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
    subtotal: number
    discount: number
    delivery: number | null
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
