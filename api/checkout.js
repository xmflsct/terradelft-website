const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const fetch = require("node-fetch")
var _ = require("lodash")

async function checkRecaptcha(req) {
  console.log("[checkout - checkRecaptcha] Start")
  if (!req.query.token)
    return {
      fail: true,
      error: "[checkout - checkRecaptcha] No token is provided"
    }

  const secret = process.env.RECAPTCHA_PRIVATE_SECRET
  const url =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secret +
    "&response=" +
    req.query.token +
    "&remoteip=" +
    req.connection.remoteAddress

  await fetch(url)
    .catch(err => {
      return { fail: true, error: err }
    })
    .then(res => {
      if (!res.ok)
        return {
          fail: true,
          error:
            "[checkout - checkRecaptcha] Google reCAPTCHA server responds error"
        }
      return res
    })
    .then(res => res.json())
    .then(json => {
      if (!json.success)
        return {
          fail: true,
          error:
            "[checkout - checkRecaptcha] Google reCAPTCHA could not verify user action"
        }
    })

  console.log("[checkout - checkRecaptcha] End")
}

async function checkContentful(req) {
  console.log("[checkout - checkContentful] Start")
  if (req.body.objects.length === 0)
    return { fail: true, error: "[checkout - checkContentful] Content error" }

  let corrections = { objects: [], shipping: null, subtotal: null }
  let url = {
    objects: "https://" + process.env.CONTENTFUL_HOST,
    shipping: "https://" + process.env.CONTENTFUL_HOST
  }
  const space = process.env.CONTENTFUL_SPACE
  const secret = process.env.CONTENTFUL_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_ENVIRONMENT
  const contentType = {
    main: "objectsObject",
    variation: "objectsObjectVariation",
    shipping: "shippingRates"
  }

  // Check SKUs
  let ids = { main: [], variation: [] }
  for (const object of req.body.objects) {
    object.type === "main"
      ? ids.main.push(object.contentful_id)
      : ids.variation.push(object.contentful_id)
  }
  ids.main.length && (ids.main = ids.main.join(","))
  ids.variation.length && (ids.variation = ids.variation.join(","))

  for (const type in ids) {
    if (ids[type].length) {
      url.objects =
        url.objects +
        "/spaces/" +
        space +
        "/environments/" +
        environment +
        "/entries/?access_token=" +
        secret +
        "&content_type=" +
        contentType[type] +
        "&sys.id[in]=" +
        ids[type]

      await fetch(url.objects)
        .catch(() => {
          return {
            fail: true,
            error:
              "[checkout - checkContentful] Contentful server did not respond"
          }
        })
        .then(res => {
          if (!res.ok)
            return {
              fail: true,
              error:
                "[checkout - checkContentful] Contentful server responds error"
            }
          return res
        })
        .then(res => res.json())
        .then(json => {
          for (const item of json.items) {
            let reqIndex = req.body.objects.findIndex(
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
              !(
                req.body.objects[reqIndex].priceOriginal ===
                item.fields.priceOriginal
              )
            ) {
              correction.required = true
              correction.priceOriginal = item.fields.priceOriginal
            }
            if (
              !(req.body.objects[reqIndex].priceSale == item.fields.priceSale)
            ) {
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
        })
    }
  }

  // Check shipping
  url.shipping =
    url.shipping +
    "/spaces/" +
    space +
    "/environments/" +
    environment +
    "/entries/?access_token=" +
    secret +
    "&content_type=" +
    contentType.shipping +
    "&fields.year[eq]=2020&locale=" +
    req.body.locale
  await fetch(url.shipping)
    .catch(() => {
      return {
        fail: true,
        error: "[checkout - checkContentful] Contentful server did not respond"
      }
    })
    .then(res => {
      if (!res.ok)
        return {
          fail: true,
          error: "[checkout - checkContentful] Contentful server responds error"
        }
      return res
    })
    .then(res => res.json())
    .then(json => {
      const rates = json.items[0].fields.rates
      const country = _.findIndex(rates, r => {
        return _.includes(r.countryCode, req.body.shipping.countryCode)
      })
      const method = _.findIndex(rates[country].rates, {
        method: req.body.shipping.method
      })
      if (!(req.body.pay.shipping === rates[country].rates[method].price)) {
        corrections.shipping = rates[country].rates[method].price
      }
    })

  // Check total
  const subtotal = _.sumBy(req.body.objects, d => {
    if (d.priceSale) {
      return d.priceSale
    } else {
      return d.priceOriginal
    }
  })
  if (subtotal !== req.body.pay.subtotal) {
    corrections.subtotal = subtotal
  }

  console.log("[checkout - checkContentful] End")
  if (
    corrections.objects.length ||
    corrections.shipping ||
    corrections.subtotal
  ) {
    return { fail: true, error: corrections }
  }
}

async function stripeSession(req) {
  console.log("[checkout - stripeSession] Start")
  var sessionData = {}
  try {
    let line_items = []
    for (const object of req.body.objects) {
      line_items.push({
        name: object.name,
        amount: object.priceSale
          ? object.priceSale * 100
          : object.priceOriginal * 100,
        currency: "eur",
        quantity: 1,
        description: object.sku && object.sku
      })
    }
    line_items.push({
      name: "Shipping to " + req.body.shipping.countryA2,
      amount: req.body.pay.shipping * 100,
      currency: "eur",
      quantity: 1
    })
    sessionData = {
      payment_method_types: ["ideal", "card"],
      line_items: line_items,
      shipping_address_collection: {
        allowed_countries: [req.body.shipping.countryA2]
      },
      success_url:
        "https://terradelft-website.now.sh/" +
        req.body.locale +
        "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://terradelft-website.now.sh/" + req.body.locale + "/bag"
    }
  } catch (err) {
    return { fail: true, error: err }
  }
  console.log("[checkout - stripeSession] Initialize stripe session")
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    console.log("[checkout - stripeSession] End")
    return { fail: false, sessionId: session.id }
  } else {
    console.log("[checkout - stripeSession] End")
    return {
      fail: true,
      error: "[checkout - stripeSession] Failed creating session"
    }
  }
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "[app] Body empty or error" })
    return
  }

  const resRecaptcha = await checkRecaptcha(req)
  if (resRecaptcha) {
    res.status(400).json({ error: resRecaptcha.error })
    return
  }

  const resContentful = await checkContentful(req)
  if (resContentful) {
    res.status(400).json({ error: resContentful.error })
    return
  }

  const resStripe = await stripeSession(req)
  if (resStripe.sessionId) {
    res.status(200).json({ sessionId: resStripe.sessionId })
  } else {
    res.status(400).json({ error: resStripe.error })
  }
  console.log("[app] End")
}
