import microCors from 'micro-cors'
const cors = microCors({ origin: '*' })
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const ky = require('ky-universal')
var _ = require('lodash')

const recaptcha = require('./utils/_recaptcha')

async function checkContentful (req) {
  if (
    req.body.data.objects.length === 0 ||
    Object.keys(req.body.data.delivery).length === 0 ||
    Object.keys(req.body.data.amounts).length === 0
  ) {
    return {
      success: false,
      error: '[checkout - checkContentful] Content empty'
    }
  }

  const objects = req.body.data.objects
  const delivery = req.body.data.delivery
  const amounts = req.body.data.amounts
  const locale = req.body.data.locale

  let corrections = { objects: [], delivery: null, amounts: null }
  let url = null
  const space = process.env.CONTENTFUL_OBJECTS_SPACE
  const secret = process.env.CONTENTFUL_OBJECTS_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_OBJECTS_ENVIRONMENT
  const contentType = {
    main: 'objectsObject',
    variation: 'objectsObjectVariation',
    delivery: 'shippingRates'
  }

  // Check objects
  let ids = { main: [], variation: [] }
  for (const object of objects) {
    object.type === 'main'
      ? ids.main.push(object.contentful_id)
      : ids.variation.push(object.contentful_id)
  }
  ids.main.length && (ids.main = ids.main.join(','))
  ids.variation.length && (ids.variation = ids.variation.join(','))

  for (const type in ids) {
    if (ids[type].length) {
      url =
        'https://' +
        process.env.CONTENTFUL_HOST +
        '/spaces/' +
        space +
        '/environments/' +
        environment +
        '/entries/'
      console.log(ids[type])
      const response = await ky(url, {
        searchParams: {
          access_token: secret,
          content_type: contentType[type],
          select: 'sys.id,fields.stock,fields.priceOriginal,fields.priceSale',
          'sys.id[in]': ids[type]
        }
      }).json()

      if (!response.hasOwnProperty('items')) {
        return {
          success: false,
          error: '[checkout - checkContentful] Content error'
        }
      }

      for (const item of response.items) {
        let objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )
        let correction = {
          required: false
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
  if (delivery.type !== 'pickup') {
    url =
      'https://' +
      process.env.CONTENTFUL_HOST +
      '/spaces/' +
      space +
      '/environments/' +
      environment +
      '/entries/'

    const response = await ky(url, {
      searchParams: {
        access_token: secret,
        content_type: contentType.delivery,
        select: 'fields.rates',
        'fields.year[eq]': '2020',
        locale: locale
      }
    }).json()

    if (!response.hasOwnProperty('items')) {
      return {
        success: false,
        error: '[checkout - checkContentful] Content error'
      }
    }

    const rates = response.items[0].fields.rates
    let countryCode = _.findIndex(rates, r => {
      return _.includes(r.countryCode, delivery.countryCode)
    })
    countryCode = countryCode !== -1 ? countryCode : rates.length - 1
    if (
      Number.isFinite(
        rates[countryCode].rates[delivery.methodIndex].freeForTotal
      )
    ) {
      if (
        amounts.subtotal <
          rates[countryCode].rates[delivery.methodIndex].freeForTotal &&
        amounts.delivery === 0
      ) {
        corrections.delivery =
          rates[countryCode].rates[delivery.methodIndex].price
      }
    } else {
      if (
        !(
          amounts.delivery ===
          rates[countryCode].rates[delivery.methodIndex].price
        )
      ) {
        corrections.delivery =
          rates[countryCode].rates[delivery.methodIndex].price
      }
    }
  }

  // Check subtotal
  const subtotal = _.sumBy(objects, o => {
    // if (o.priceSale) {
    //   return o.priceSale
    // } else {
    return o.priceOriginal
    // }
  })
  if (!(subtotal === amounts.subtotal)) {
    corrections.subtotal = subtotal
  }

  if (
    corrections.objects.length ||
    corrections.delivery ||
    corrections.subtotal
  ) {
    return { success: false, corrections: corrections }
  } else {
    return { success: true }
  }
}

async function stripeSession (req) {
  var sessionData = {}
  try {
    let line_items = []
    const locale = req.body.data.locale
    for (const object of req.body.data.objects) {
      const images = [`https:${object.image.fluid.src}`]
      line_items.push({
        price_data: {
          currency: 'eur',
          unit_amount: object.priceSale
            ? object.priceSale * 10 * 10
            : object.priceOriginal * 10 * 10,
          product_data: {
            name:
              object.name[locale] +
              ((object.variant || object.colour || object.size) &&
                `(${_.join(
                  [
                    object.variant && object.variant[locale],
                    object.colour && object.colour[locale],
                    object.size && object.size[locale]
                  ].filter(f => f),
                  ', '
                )})`),
            ...((object.variant || object.colour || object.size) && {
              description: _.join(
                [
                  object.variant && object.variant[locale],
                  object.colour && object.colour[locale],
                  object.size && object.size[locale]
                ].filter(f => f)
              )
            }),
            images: images
          }
        },
        quantity: 1
      })
    }
    req.body.data.amounts.delivery > 0 &&
      line_items.push({
        price_data: {
          currency: 'eur',
          unit_amount: req.body.data.amounts.delivery * 10 * 10,
          product_data: {
            name: req.body.data.delivery.name
          }
        },
        quantity: 1
      })

    sessionData = {
      payment_method_types: ['ideal', 'card'],
      mode: 'payment',
      line_items: line_items,
      ...(req.body.data.delivery.type === 'shipment' && {
        shipping_address_collection: {
          allowed_countries: [req.body.data.delivery.countryA2]
        }
      }),
      locale: req.body.data.locale,
      success_url:
        req.body.data.url.success + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: req.body.data.url.cancel
    }
  } catch (err) {
    return { success: false, error: err }
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

async function checkout (req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('[app] Start')
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ error: '[app] Content error' })
    return
  }

  console.log('[checkout - checkRecaptcha] Start')
  const resRecaptcha = await recaptcha.check(
    process.env.RECAPTCHA_PRIVATE_KEY,
    req
  )
  console.log('[checkout - checkRecaptcha] End')
  if (!resRecaptcha.success) {
    res.status(400).json({ error: resRecaptcha.error })
    return
  }

  console.log('[checkout - checkContentful] Start')
  const resContentful = await checkContentful(req)
  console.log('[checkout - checkContentful] End')
  if (!resContentful.success) {
    res.status(400).json({ corrections: resContentful.corrections })
    return
  }

  console.log('[checkout - stripeSession] Start')
  const resStripe = await stripeSession(req)
  console.log('[checkout - stripeSession] End')
  if (resStripe.success) {
    res.status(200).json({ sessionId: resStripe.sessionId })
  } else {
    console.log(resStripe.error)
    res.status(400).json({ error: resStripe.error })
    return
  }
  console.log('[app] End')
}

export default cors(checkout)
