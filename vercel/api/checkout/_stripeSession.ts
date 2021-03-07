import Stripe from 'stripe'
import { CheckoutRequest } from '../checkout'
import checkoutLocale from '../../locale/checkout.json'

const stripeSession = async (
  stripe: Stripe,
  { body: { objects, delivery, amounts, locale, urls } }: CheckoutRequest
) => {
  let line_items = []
  for (const object of objects) {
    const images = [`https:${object.image.file.url}`]
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
                description: `${checkoutLocale[locale].SKU}${object.sku}`
              }),
              images: images
            }
          },
          quantity: object.amount
        })
        break
      case 'variation':
        const description = [
          object.sku ? `${checkoutLocale[locale].SKU}${object.sku}` : undefined,
          object.colour
            ? `${checkoutLocale[locale].colour}${object.colour[locale]}`
            : undefined,
          object.size
            ? `${checkoutLocale[locale].size}${object.size[locale]}`
            : undefined,
          object.variant
            ? `${checkoutLocale[locale].variant}${object.variant[locale]}`
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

  const sessionData: Stripe.Checkout.SessionCreateParams = {
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
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    return { success: true, sessionId: session.id }
  } else {
    return {
      success: false,
      error: '[checkout - stripeSession] Failed creating session'
    }
  }
}

export default stripeSession
