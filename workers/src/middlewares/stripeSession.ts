import { error, json } from 'itty-router-extras'
import { ContentCheckout, Env } from '..'
import { wrapCorsHeader } from '../utils/cors'
import { shipping_options } from './checkContentful'

const stripeSession = async (
  { content: { objects, delivery, amounts, locale, urls } }: ContentCheckout,
  env: Env
) => {
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
  const result = await res.json<any>()
  if (result.id) {
    return wrapCorsHeader(json({ success: true, sessionId: result.id }))
  } else {
    console.log('[stripeSession]', result.error.message)
    return error(500, 'Failed to create Stripe session')
  }
}

export default stripeSession
