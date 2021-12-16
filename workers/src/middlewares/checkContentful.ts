import { error } from 'itty-router-extras'
import { sumBy } from 'lodash'
import { ContentCheckout, Env } from '..'

export let shipping_options: {
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

const checkContentful = async (
  { content: { objects, delivery, amounts, locale } }: ContentCheckout,
  env: Env
) => {
  if (
    objects.length === 0 ||
    Object.keys(delivery).length === 0 ||
    Object.keys(amounts).length === 0
  ) {
    console.log('[checkContentful]', 'No object provided')
    return error(400, 'No object provided')
  }

  const space = env.CONTENTFUL_OBJECTS_SPACE
  const secret = env.CONTENTFUL_OBJECTS_KEY_CHECKOUT
  const environment = env.CONTENTFUL_OBJECTS_ENVIRONMENT
  const url =
    'https://' +
    env.CONTENTFUL_HOST +
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
      const result = await res.json<{
        items: {
          fields: { stock?: number; priceOriginal?: number; priceSale: number }
          sys: { id: string }
        }[]
      }>()

      if (!result.hasOwnProperty('items')) {
        console.log('Cannot find corresponding Contentful objects')
        return error(500, 'Cannot find corresponding Contentful objects')
      }

      for (const item of result.items) {
        let objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )

        if (!item.fields.stock || item.fields.stock < 1) {
          console.log('[checkContentful]', 'Object is out of stock')
          return error(400, 'Object is out of stock')
        }

        if (
          !(objects[objectIndex].priceOriginal === item.fields.priceOriginal)
        ) {
          console.log('[checkContentful]', 'Object original price has changed')
          return error(400, 'Object original price has changed')
        }
        if (!(objects[objectIndex].priceSale == item.fields.priceSale)) {
          console.log('[checkContentful]', 'Object sale price has changed')
          return error(400, 'Object sale price has changed')
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
    return error(400, 'Total amount has changed')
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
    const result = await res.json<{
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
    }>()

    if (!result.hasOwnProperty('items')) {
      console.log('Cannot find corresponding Contentful shipping')
      return error(500, 'Cannot find corresponding Contentful shipping')
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

export default checkContentful
