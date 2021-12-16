import { Router } from 'itty-router'
import {
  json,
  missing,
  error,
  status,
  withContent,
  withParams,
  ThrowableRouter,
  text
} from 'itty-router-extras'
import checkContentful from './middlewares/checkContentful'
import recaptcha from './middlewares/recaptcha'
import stripeSession from './middlewares/stripeSession'
import { handleCors } from './utils/cors'

const router = Router()

export type Env = {
  RECAPTCHA_PRIVATE_KEY: string
  CONTENTFUL_HOST: string
  CONTENTFUL_OBJECTS_SPACE: string
  CONTENTFUL_OBJECTS_KEY_CHECKOUT: string
  CONTENTFUL_OBJECTS_ENVIRONMENT: string
  STRIPE_PRIVATE_KEY: string
}

type ObjectMain = {
  type: 'main'
  contentful_id: string
  contentful_id_url: string
  artist: { name: string }
  image: any
  priceOriginal: number
  priceSale?: number
  stock: number
  sku: string
  amount: number
  name: { nl: string; en: string }
}

type ObjectVariation = {
  type: 'variation'
  contentful_id: string
  contentful_id_url: string
  artist: { name: string }
  image: any
  priceOriginal: number
  priceSale?: number
  stock: number
  sku: string
  amount: number
  name: { nl: string; en: string }
  colour?: { nl: string; en: string }
  size?: { nl: string; en: string }
  variant?: { nl: string; en: string }
}
export type ContentCheckout = Request & {
  content: {
    token: string
    objects: (ObjectMain | ObjectVariation)[]
    delivery: {
      method: 'pickup' | 'shipment'
      name: string
      countryCode?: number
      countryA2?: string
      index?: number
    }
    amounts: {
      subtotal: number
      discount?: number
      delivery?: number
    }
    locale: 'en' | 'nl'
    urls: { success: string; cancel: string }
  }
}
router.options('/checkout', handleCors({ methods: 'POST', maxAge: 86400 }))
router.post(
  '/checkout',
  withParams,
  withContent,
  recaptcha,
  checkContentful,
  stripeSession
)

router.all('*', () => missing('Missing 😭'))

export default {
  fetch: router.handle
}
