import { gql } from '@apollo/client'
import { sumBy } from 'lodash'
import { TDObject } from '~/states/bag'
import { apolloClient, Context, ShippingRates } from './contentful'

export type CheckoutContent = {
  objects: TDObject[]
  delivery:
    | {
        method: 'pickup'
        name: string
      }
    | {
        method: 'shipment'
        countryCode: string
        countryA2: string
      }
  amounts: {
    subtotal: number
    discount?: number
  }
  locale: string
  urls: { success: string; cancel: string }
}

type ShippingOptions = {
  shipping_rate_data: {
    display_name: string
    type: 'fixed_amount'
    fixed_amount: {
      amount: number
      currency: 'eur'
    }
    metadata?: Object
  }
}[]

const verifyContentful = async ({
  context,
  content: { amounts, delivery, locale, objects }
}: {
  context: Context
  content: CheckoutContent
}): Promise<ShippingOptions> => {
  if (
    objects.length === 0 ||
    Object.keys(delivery).length === 0 ||
    Object.keys(amounts).length === 0
  ) {
    throw new Error('No object provided')
  }

  const client = apolloClient({ context })

  const contentType = {
    main: 'objectsObjectCollection',
    variation: 'objectsObjectVariationCollection'
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
      ? tempIds.main.push(`"${object.contentful_id}"`)
      : tempIds.variation.push(`"${object.contentful_id}"`)
  }
  tempIds.main.length && (ids.main = tempIds.main.join(','))
  tempIds.variation.length && (ids.variation = tempIds.variation.join(','))

  for (const type in ids) {
    const typed = type as keyof typeof contentType
    if (ids[typed] && ids[typed]?.length) {
      const items = (
        await client.query({
          query: gql`
            query {
              ${contentType[typed]} (where: { sys: { id_in: [${ids[typed]}] } }) {
                items {
                  sys {
                    id
                  }
                  stock
                  priceOriginal
                  priceSale
                }
              }
            }
          `
        })
      ).data[contentType[typed]].items as {
        sys: { id: string }
        stock?: number
        priceOriginal?: number
        priceSale: number
      }[]

      for (const item of items) {
        const objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )

        if (!item.stock || item.stock < 1) {
          throw new Error('Object is out of stock')
        }

        if (!(objects[objectIndex].priceOriginal === item.priceOriginal)) {
          throw new Error('Object original price has changed')
        }
        if (!(objects[objectIndex].priceSale == item.priceSale)) {
          throw new Error('Object sale price has changed')
        }
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(objects, o => {
    return o.priceOriginal * o.amount
  })
  if (!(subtotal === amounts.subtotal)) {
    throw new Error('Total amount has changed')
  }

  // Check delivery
  if (delivery.method !== 'pickup') {
    const rates = (
      await client.query<{
        shippingRatesCollection: { items: { rates: ShippingRates }[] }
      }>({
        query: gql`
          query {
            shippingRatesCollection(where: { year: "2022" }) {
              items {
                rates
              }
            }
          }
        `
      })
    ).data.shippingRatesCollection.items[0].rates

    let countryCodeIndex = rates.findIndex(rate =>
      rate.countryCode.includes(delivery.countryCode || '')
    )
    countryCodeIndex =
      countryCodeIndex !== -1 ? countryCodeIndex : rates.length - 1

    return rates[countryCodeIndex].rates.map(rate => ({
      shipping_rate_data: {
        display_name: `${rate.method}${
          rate.description ? ` (${rate.description})` : null
        }`,
        type: 'fixed_amount',
        fixed_amount: {
          amount:
            rate.freeForTotal && subtotal >= rate.freeForTotal
              ? 0
              : objects.filter(object => object.type !== 'giftcard').length ===
                  0 && delivery.countryA2 === 'NL'
              ? 200
              : rate.price * 10 * 10,
          currency: 'eur'
        },
        ...(rate.description && {
          metadata: { description: rate.description }
        })
      }
    }))
  } else {
    return [
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

const checkout = async ({
  context,
  content
}: {
  context: Context
  content: CheckoutContent
}) => {
  if (!context.STRIPE_KEY_PRIVATE) {
    throw new Error('Missing stripe private key')
  }

  const shipping_options = await verifyContentful({ context, content })

  const translations: {
    [key: string]: {
      SKU: string
      colour: string
      size: string
      variant: string
    }
  } = {
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
  for (const object of content.objects) {
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
                object.name[content.locale].replace('&', ' ') +
                ' - ' +
                object.artist.artist.replace('&', ' '),
              ...(object.sku && {
                description: `${translations[content.locale].SKU}${object.sku}`
              }),
              images: [object.image?.url]
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
                object.name[content.locale].replace('&', ' ') +
                ' - ' +
                object.artist.artist.replace('&', ' '),
              description: [
                object.sku
                  ? `${translations[content.locale].SKU}${object.sku}`
                  : null,
                object.colour
                  ? `${translations[content.locale].colour}${
                      object.colour[content.locale]
                    }`
                  : null,
                object.size
                  ? `${translations[content.locale].size}${
                      object.size[content.locale]
                    }`
                  : null,
                object.variant
                  ? `${translations[content.locale].variant}${
                      object.variant[content.locale]
                    }`
                  : null
              ]
                .filter(d => d)
                .join(', '),
              images: [object.image?.url]
            }
          },
          quantity: object.amount
        })
        break
      case 'giftcard':
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount: object.priceOriginal * 10 * 10,
            product_data: {
              name: object.name[content.locale],
              images: [object.image?.url]
            }
          },
          quantity: object.amount
        })
        break
    }
  }

  const sessionData = {
    payment_method_types: ['ideal', 'card'],
    mode: 'payment',
    line_items: line_items,
    ...(content.delivery.method === 'shipment'
      ? {
          shipping_address_collection: {
            allowed_countries: [content.delivery.countryA2]
          }
        }
      : {
          shipping_address_collection: {
            allowed_countries: ['NL']
          }
        }),
    shipping_options,
    locale: content.locale,
    success_url: content.urls.success + '/id/{CHECKOUT_SESSION_ID}',
    cancel_url: content.urls.cancel,
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
      Authorization: `Bearer ${context.STRIPE_KEY_PRIVATE}`
    },
    body
  })
  const result = await res.json()
  return result
}

export default checkout
