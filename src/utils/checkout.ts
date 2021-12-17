import axios from 'axios'
import { TDObject } from '@state/slices/bag'

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
  let data
  try {
    data = await axios({
      method: 'post',
      url: '/api/checkout',
      data: { token, objects, delivery, amounts, locale, urls }
    })
  } catch (error: any) {
    console.log(error.response.data)
  } finally {
    return data?.data
  }
}

export default checkout
