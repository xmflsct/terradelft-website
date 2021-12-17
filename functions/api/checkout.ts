import { sumBy } from 'lodash'
import { Context } from './_middleware'

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
export type BodyCheckout = {
  body: {
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

let shipping_options: {
  shipping_rate_data: {
    display_name: string
    type: 'fixed_amount'
    fixed_amount: {
      amount: number
      currency: 'eur'
    }
    metadata?: Object
  }
}[] = []

const checkContentful = async ({
  env,
  data: {
    body: { objects, delivery, amounts, locale }
  }
}: Pick<Context<BodyCheckout>, 'env' | 'data'>) => {
  if (
    objects.length === 0 ||
    Object.keys(delivery).length === 0 ||
    Object.keys(amounts).length === 0
  ) {
    console.log('[checkContentful]', 'No object provided')
    return new Response('No object provided', { status: 400 })
  }

  const space = env.CONTENTFUL_OBJECTS_SPACE
  const secret = env.CONTENTFUL_OBJECTS_KEY_CHECKOUT
  const url =
    'https://cdn.contentful.com/spaces/' +
    space +
    '/environments/master/entries/'
  const contentType = {
    main: 'objectsObject',
    variation: 'objectsObjectVariation',
    delivery: 'shippingRates'
  }

  // Check objects
  const tempIds: { main: string[]; variation: string[] } = {
    main: [],
    variation: []
  }
  const ids: { main?: string; variation?: string } = {
    main: undefined,
    variation: undefined
  }
  for (const object of objects) {
    object.type === 'main'
      ? tempIds.main.push(object.contentful_id)
      : tempIds.variation.push(object.contentful_id)
  }
  tempIds.main.length && (ids.main = tempIds.main.join(','))
  tempIds.variation.length && (ids.variation = tempIds.variation.join(','))

  for (const type in ids) {
    // @ts-ignore
    if (ids[type] && ids[type].length) {
      const params = new URLSearchParams({
        access_token: secret,
        // @ts-ignore
        content_type: contentType[type],
        select: 'sys.id,fields.stock,fields.priceOriginal,fields.priceSale',
        // @ts-ignore
        'sys.id[in]': ids[type]
      })
      const res = await fetch(`${url}?${params.toString()}`, { method: 'GET' })
      const result: {
        items: {
          fields: { stock?: number; priceOriginal?: number; priceSale: number }
          sys: { id: string }
        }[]
      } = await res.json()

      if (!result.hasOwnProperty('items')) {
        console.log(
          '[checkContentful]',
          'Cannot find corresponding Contentful objects'
        )
        return new Response('Cannot find corresponding Contentful objects', {
          status: 500
        })
      }

      for (const item of result.items) {
        let objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )

        if (!item.fields.stock || item.fields.stock < 1) {
          console.log('[checkContentful]', 'Object is out of stock')
          return new Response('Object is out of stock', { status: 400 })
        }

        if (
          !(objects[objectIndex].priceOriginal === item.fields.priceOriginal)
        ) {
          console.log('[checkContentful]', 'Object original price has changed')
          return new Response('Object original price has changed', {
            status: 400
          })
        }
        if (!(objects[objectIndex].priceSale == item.fields.priceSale)) {
          console.log('[checkContentful]', 'Object sale price has changed')
          return new Response('Object sale price has changed', { status: 400 })
        }
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(objects, o => {
    return o.priceOriginal * o.amount
  })
  if (!(subtotal === amounts.subtotal)) {
    console.log('[checkContentful]', 'Total amount has changed')
    return new Response('Total amount has changed', { status: 400 })
  }

  // Check delivery
  if (delivery.method !== 'pickup') {
    const params = new URLSearchParams({
      access_token: secret,
      content_type: contentType.delivery,
      select: 'fields.rates',
      'fields.year[eq]': '2020',
      locale: locale
    })
    const res = await fetch(`${url}?${params.toString()}`, { method: 'GET' })
    const result: {
      items: {
        fields: {
          rates: {
            type: string
            rates: {
              price: number
              method: string
              description: string
              freeForTotal: number
            }[]
            countryCode: number[]
          }[]
        }
      }[]
    } = await res.json()

    if (!result.hasOwnProperty('items')) {
      console.log('Cannot find corresponding Contentful shipping')
      return new Response('Cannot find corresponding Contentful shipping', {
        status: 500
      })
    }

    const rates = result.items[0].fields.rates

    let countryCodeIndex = rates.findIndex(rate =>
      rate.countryCode.includes(delivery.countryCode || -1)
    )
    countryCodeIndex =
      countryCodeIndex !== -1 ? countryCodeIndex : rates.length - 1

    shipping_options = rates[countryCodeIndex].rates.map(rate => ({
      shipping_rate_data: {
        display_name: rate.method,
        type: 'fixed_amount',
        fixed_amount: {
          amount: subtotal >= rate.freeForTotal ? 0 : rate.price * 10 * 10,
          currency: 'eur'
        },
        ...(rate.description && {
          metadata: { description: rate.description }
        })
      }
    }))
  } else {
    shipping_options = [
      {
        shipping_rate_data: {
          display_name: delivery.name,
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'eur'
          }
        }
      }
    ]
  }
}

const stripeSession = async ({
  env,
  data: {
    body: { objects, delivery, amounts, locale, urls }
  }
}: Pick<Context<BodyCheckout>, 'env' | 'data'>) => {
  const translations = {
    nl: {
      SKU: 'SKU: ',
      colour: 'Kleur: ',
      size: 'Afmeting: ',
      variant: 'Variant: '
    },
    en: {
      SKU: 'SKU: ',
      colour: 'Colour: ',
      size: 'Size: ',
      variant: 'Variant: '
    }
  }
  let line_items = []
  for (const object of objects) {
    switch (object.type) {
      case 'main':
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount: object.priceSale
              ? object.priceSale * 10 * 10
              : object.priceOriginal * 10 * 10,
            product_data: {
              name:
                object.name[locale].replace('&', ' ') +
                ' - ' +
                object.artist.name.replace('&', ' '),
              ...(object.sku && {
                description: `${translations[locale].SKU}${object.sku}`
              }),
              images: [
                object.image.gatsbyImageData.images.fallback.src.split('?')[0]
              ]
            }
          },
          quantity: object.amount
        })
        break
      case 'variation':
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount: object.priceSale
              ? object.priceSale * 10 * 10
              : object.priceOriginal * 10 * 10,
            product_data: {
              name:
                object.name[locale].replace('&', ' ') +
                ' - ' +
                object.artist.name.replace('&', ' '),
              description: [
                object.sku ? `${translations[locale].SKU}${object.sku}` : null,
                object.colour
                  ? `${translations[locale].colour}${object.colour[locale]}`
                  : null,
                object.size
                  ? `${translations[locale].size}${object.size[locale]}`
                  : null,
                object.variant
                  ? `${translations[locale].variant}${object.variant[locale]}`
                  : null
              ]
                .filter(d => d)
                .join(', '),
              images: [
                object.image.gatsbyImageData.images.fallback.src.split('?')[0]
              ]
            }
          },
          quantity: object.amount
        })
        break
    }
  }

  if (amounts.delivery && amounts.delivery >= 0) {
    line_items.push({
      price_data: {
        currency: 'eur',
        unit_amount: amounts.delivery * 10 * 10,
        product_data: {
          name: delivery.name,
          description: delivery.countryA2
        }
      },
      quantity: 1
    })
  }

  const sessionData = {
    payment_method_types: ['ideal', 'card'],
    mode: 'payment',
    line_items: line_items,
    ...(delivery.method === 'shipment'
      ? {
          shipping_address_collection: {
            allowed_countries: [delivery.countryA2]
          }
        }
      : {
          shipping_address_collection: {
            allowed_countries: ['NL']
          }
        }),
    shipping_options,
    locale,
    success_url: urls.success + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: urls.cancel,
    phone_number_collection: { enabled: true }
  }

  // @ts-ignore
  const getPairs = (sessionData, keys = []) =>
    Object.entries(sessionData).reduce((pairs, [key, value]) => {
      if (typeof value === 'object')
        // @ts-ignore
        pairs.push(...getPairs(value, [...keys, key]))
      // @ts-ignore
      else pairs.push([[...keys, key], value])
      return pairs
    }, [])
  const data = getPairs(sessionData)
    .map(
      // @ts-ignore
      ([[key0, ...keysRest], value]) =>
        `${key0}${keysRest.map(a => `[${a}]`).join('')}=${value}`
    )
    .join('&')

  const body = new URLSearchParams(data)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_PRIVATE_KEY}`
    },
    body
  })
  const result = await res.json()
  return result
}

export const onRequestPost = async ({ env, data }: Context<BodyCheckout>) => {
  await checkContentful({ env, data })
  const result = await stripeSession({ env, data })
  if (result.id) {
    return new Response(
      JSON.stringify({ success: true, sessionId: result.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } else {
    console.log('[stripeSession]', result.error.message)
    return new Response('Failed to create Stripe session', { status: 500 })
  }
}
