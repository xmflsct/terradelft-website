import { sumBy } from 'lodash'

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

type CheckoutRequest = Request & { body: Body }

const checkContentful = async ({
  body: { objects, delivery, amounts, locale }
}: CheckoutRequest) => {
  if (
    objects.length === 0 ||
    Object.keys(delivery).length === 0 ||
    Object.keys(amounts).length === 0
  ) {
    return {
      success: false,
      error: '[checkout - checkContentful] Content empty'
    }
  }

  const corrections = {
    objects: [],
    amounts: { subtotal: undefined, delivery: undefined }
  }

  const space = process.env.CONTENTFUL_OBJECTS_SPACE
  const secret = process.env.CONTENTFUL_OBJECTS_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_OBJECTS_ENVIRONMENT
  const url =
    'https://' +
    process.env.CONTENTFUL_HOST +
    '/spaces/' +
    space +
    '/environments/' +
    environment +
    '/entries/'
  const contentType = {
    main: 'objectsObject',
    variation: 'objectsObjectVariation',
    delivery: 'shippingRates'
  }

  // Check objects
  const tempIds = { main: [], variation: [] }
  const ids = { main: undefined, variation: undefined }
  for (const object of objects) {
    object.type === 'main'
      ? tempIds.main.push(object.contentful_id)
      : tempIds.variation.push(object.contentful_id)
  }
  tempIds.main.length && (ids.main = tempIds.main.join(','))
  tempIds.variation.length && (ids.variation = tempIds.variation.join(','))

  for (const type in ids) {
    if (ids[type] && ids[type].length) {
      const body = new URLSearchParams({
        access_token: secret,
        content_type: contentType[type],
        select: 'sys.id,fields.stock,fields.priceOriginal,fields.priceSale',
        'sys.id[in]': ids[type]
      })
      const res = await fetch(url, { method: 'GET', body })
      const result = await res.json()

      if (!result.hasOwnProperty('items')) {
        return {
          success: false,
          error: '[checkout - checkContentful] Content error'
        }
      }

      for (const item of result.items) {
        let objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )
        const correction = {
          required: false,
          contentful_id: undefined,
          priceOriginal: undefined,
          priceSale: undefined,
          stock: undefined
        }

        if (item.fields.stock < 1) {
          correction.required = true
          correction.stock = 0
        }
        if (
          !(objects[objectIndex].priceOriginal === item.fields.priceOriginal)
        ) {
          correction.required = true
          correction.priceOriginal = item.fields.priceOriginal
        }
        if (!(objects[objectIndex].priceSale == item.fields.priceSale)) {
          correction.required = true
          correction.priceSale = item.fields.priceSale
            ? item.fields.priceSale
            : null
        }

        if (correction.required) {
          delete correction.required
          correction.contentful_id = item.sys.id
          corrections.objects.push(correction)
        }
      }
    }
  }

  // Check delivery
  if (delivery.method !== 'pickup') {
    const body = new URLSearchParams({
      access_token: secret,
      content_type: contentType.delivery,
      select: 'fields.rates',
      'fields.year[eq]': '2020',
      locale: locale
    })
    const res = await fetch(url, { method: 'GET', body })
    const result = await res.json()

    if (!result.hasOwnProperty('items')) {
      return {
        success: false,
        error: '[checkout - checkContentful] Content error'
      }
    }

    const rates = result.items[0].fields.rates

    let countryCodeIndex = rates.findIndex(rate =>
      rate.countryCode.includes(delivery.countryCode)
    )
    countryCodeIndex =
      countryCodeIndex !== -1 ? countryCodeIndex : rates.length - 1

    if (rates[countryCodeIndex].rates[delivery.index].freeForTotal) {
      if (
        amounts.subtotal <
          rates[countryCodeIndex].rates[delivery.index].freeForTotal &&
        amounts.delivery === 0
      ) {
        corrections.amounts.delivery =
          rates[countryCodeIndex].rates[delivery.index].price
      }
    } else {
      if (
        !(
          amounts.delivery ===
          rates[countryCodeIndex].rates[delivery.index].price
        )
      ) {
        corrections.amounts.delivery =
          rates[countryCodeIndex].rates[delivery.index].price
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(objects, o => {
    return o.priceOriginal * o.amount
  })
  if (!(subtotal === amounts.subtotal)) {
    corrections.amounts.subtotal = subtotal
  }

  if (
    corrections.objects.length ||
    corrections.amounts.subtotal ||
    corrections.amounts.delivery
  ) {
    console.log('no', corrections)
    return { success: false, corrections }
  } else {
    console.log('yes')
    return { success: true }
  }
}

const stripeSession = async ({
  env,
  request: {
    body: { objects, delivery, amounts, locale, urls }
  }
}: {
  env: any
  request: CheckoutRequest
}) => {
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
    const images = [`https:${object.image.gatsbyImageData.images.fallback.src}`]
    switch (object.type) {
      case 'main':
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount:
              object.priceSale * 10 * 10 || object.priceOriginal * 10 * 10,
            product_data: {
              name: object.name[locale] + ' - ' + object.artist,
              ...(object.sku && {
                description: `${translations[locale].SKU}${object.sku}`
              }),
              images: images
            }
          },
          quantity: object.amount
        })
        break
      case 'variation':
        const description = [
          object.sku ? `${translations[locale].SKU}${object.sku}` : undefined,
          object.colour
            ? `${translations[locale].colour}${object.colour[locale]}`
            : undefined,
          object.size
            ? `${translations[locale].size}${object.size[locale]}`
            : undefined,
          object.variant
            ? `${translations[locale].variant}${object.variant[locale]}`
            : undefined
        ]
          .filter(d => d !== undefined)
          .join(', ')
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount:
              object.priceSale * 10 * 10 || object.priceOriginal * 10 * 10,
            product_data: {
              name: object.name[locale] + ' - ' + object.artist,
              description,
              images: images
            }
          },
          quantity: object.amount
        })
        break
    }
  }

  if (amounts.delivery >= 0) {
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
    payment_intent_data: {
      metadata: {
        Phone: delivery.phone
      }
    },
    // @ts-ignore
    locale: locale,
    success_url: urls.success + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: urls.cancel
  }

  console.log('[checkout - stripeSession] Initialize stripe session')
  const getPairs = (sessionData, keys = []) =>
    Object.entries(sessionData).reduce((pairs, [key, value]) => {
      if (typeof value === 'object')
        pairs.push(...getPairs(value, [...keys, key]))
      else pairs.push([[...keys, key], value])
      return pairs
    }, [])

  const data = getPairs(sessionData)
    .map(
      ([[key0, ...keysRest], value]) =>
        `${key0}${keysRest.map(a => `[${a}]`).join('')}=${value}`
    )
    .join('&')
  const body = new URLSearchParams(data)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: Buffer.from(`${env.STRIPE_PRIVATE_KEY}:`).toString(
        'base64'
      )
    },
    body
  })
  const result = await res.json()
  if (result.id) {
    return { success: true, sessionId: result.id }
  } else {
    return {
      success: false,
      error: '[checkout - stripeSession] Failed creating session'
    }
  }
}

export const onRequestPost = async ({
  request, // same as existing Worker API
  env, // same as existing Worker API
  params, // if filename includes [id] or [[path]]
  waitUntil, // same as ctx.waitUntil in existing Worker API
  next, // used for middleware or to fetch assets
  data // arbitrary space for passing data between middlewares
}) => {
  console.log('hello world')
  const resContentful = await checkContentful(request)
  if (!resContentful.success) {
    return new Response('Check Contentful error', { status: 500 })
  }

  const resStripe = await stripeSession({ env, request })
  if (!resStripe.success) {
    return new Response('Create Stripe session error', { status: 500 })
  }

  return new Response('Thank you!')
}
