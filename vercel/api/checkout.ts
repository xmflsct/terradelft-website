import { NowResponse } from '@vercel/node'
import { IncomingMessage } from 'http'
import microCors from 'micro-cors'
import Stripe from 'stripe'
import checkContentful from './checkout/_checkContentful'
import stripeSession from './checkout/_stripeSession'
import recaptcha from './utils/_recaptcha'

type ObjectMain = {
  type: 'main'
  contentful_id: string
  contentful_id_url: string
  artist: string
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
  artist: string
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

type Body = {
  token: string
  objects: (ObjectMain | ObjectVariation)[]
  delivery: {
    method: 'pickup' | 'shipment'
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

export type CheckoutRequest = IncomingMessage & { body: Body }

const cors = microCors({ origin: '*' })
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: '2020-08-27'
})

const checkout = async (req: CheckoutRequest, res: NowResponse) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('[app] Start')
  if (!req.body || Object.keys(req.body).length === 0) {
    res
      .status(400)
      .json({ error: '[app] Content error' })
      .end()
    return
  }

  console.log('[checkout - checkRecaptcha] Start')
  const resRecaptcha = await recaptcha(process.env.RECAPTCHA_PRIVATE_KEY, req)
  console.log('[checkout - checkRecaptcha] End')
  if (!resRecaptcha.success) {
    res
      .status(400)
      .json({ error: resRecaptcha.error })
      .end()
    return
  }

  console.log('[checkout - checkContentful] Start')
  const resContentful = await checkContentful(req)
  console.log('[checkout - checkContentful] End')
  if (!resContentful.success) {
    res
      .status(400)
      .json({ corrections: resContentful.corrections })
      .end()
    return
  }

  console.log('[checkout - stripeSession] Start')
  const resStripe = await stripeSession(stripe, req)
  console.log('[checkout - stripeSession] End')
  if (resStripe.success) {
    res
      .status(200)
      .json({ sessionId: resStripe.sessionId })
      .end()
  } else {
    console.log(resStripe.error)
    res
      .status(400)
      .json({ error: resStripe.error })
      .end()
    return
  }
  console.log('[app] End')
}

// @ts-ignore
export default cors(checkout)
