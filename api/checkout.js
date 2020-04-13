const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const ky = require("ky-universal")
var _ = require("lodash")

async function checkRecaptcha(req) {
  if (!req.body.token)
    return {
      success: false,
      error: "[checkout - checkRecaptcha] No token is provided",
    }

  return await ky
    .get("https://www.google.com/recaptcha/api/siteverify", {
      searchParams: {
        secret: process.env.RECAPTCHA_PRIVATE_KEY,
        response: req.body.token,
        remoteip: req.connection.remoteAddress,
      },
    })
    .json()
}

async function checkContentful(req) {
  if (
    req.body.data.objects.length === 0 ||
    Object.keys(req.body.data.shipping).length === 0 ||
    Object.keys(req.body.data.pay).length === 0
  ) {
    return {
      success: false,
      error: "[checkout - checkContentful] Content empty",
    }
  }

  const objects = req.body.data.objects
  const shipping = req.body.data.shipping
  const pay = req.body.data.pay
  const locale = req.body.data.locale

  let corrections = { objects: [], shipping: null, subtotal: null }
  let url = null
  const space = process.env.CONTENTFUL_SPACE
  const secret = process.env.CONTENTFUL_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_ENVIRONMENT
  const contentType = {
    main: "objectsObject",
    variation: "objectsObjectVariation",
    shipping: "shippingRates",
  }

  // Check objects
  let ids = { main: [], variation: [] }
  for (const object of objects) {
    object.type === "main"
      ? ids.main.push(object.contentful_id)
      : ids.variation.push(object.contentful_id)
  }
  ids.main.length && (ids.main = ids.main.join(","))
  ids.variation.length && (ids.variation = ids.variation.join(","))

  for (const type in ids) {
    if (ids[type].length) {
      url =
        "https://" +
        process.env.CONTENTFUL_HOST +
        "/spaces/" +
        space +
        "/environments/" +
        environment +
        "/entries/"
      console.log(ids[type])
      const response = await ky(url, {
        searchParams: {
          access_token: secret,
          content_type: contentType[type],
          select: "sys.id,fields.stock,fields.priceOriginal,fields.priceSale",
          "sys.id[in]": ids[type],
        },
      }).json()

      if (!response.hasOwnProperty("items")) {
        return {
          success: false,
          error: "[checkout - checkContentful] Content error",
        }
      }

      for (const item of response.items) {
        let objectIndex = objects.findIndex(
          (i) => i.contentful_id === item.sys.id
        )
        let correction = {
          required: false,
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

  // Check shipping
  url =
    "https://" +
    process.env.CONTENTFUL_HOST +
    "/spaces/" +
    space +
    "/environments/" +
    environment +
    "/entries/"

  const response = await ky(url, {
    searchParams: {
      access_token: secret,
      content_type: contentType.shipping,
      select: "fields.rates",
      "fields.year[eq]": "2020",
      locale: locale,
    },
  }).json()

  if (!response.hasOwnProperty("items")) {
    return {
      success: false,
      error: "[checkout - checkContentful] Content error",
    }
  }

  const rates = response.items[0].fields.rates
  let countryCode = _.findIndex(rates, (r) => {
    return _.includes(r.countryCode, shipping.countryCode)
  })
  countryCode = countryCode !== -1 ? countryCode : rates.length - 1
  if (rates[countryCode].rates[shipping.methodIndex].freeForTotal) {
    if (
      pay.subtotal >=
        rates[countryCode].rates[shipping.methodIndex].freeForTotal &&
      !(pay.shipping === 0)
    ) {
      corrections.shipping = 0
    }
  } else {
    if (
      !(pay.shipping === rates[countryCode].rates[shipping.methodIndex].price)
    ) {
      corrections.shipping =
        rates[countryCode].rates[shipping.methodIndex].price
    }
  }

  // Check subtotal
  const subtotal = _.sumBy(objects, (o) => {
    if (o.priceSale) {
      return o.priceSale
    } else {
      return o.priceOriginal
    }
  })
  if (!(subtotal === pay.subtotal)) {
    corrections.subtotal = subtotal
  }

  if (
    corrections.objects.length ||
    corrections.shipping ||
    corrections.subtotal
  ) {
    return { success: false, corrections: corrections }
  } else {
    return { success: true }
  }
}

async function stripeSession(req) {
  var sessionData = {}
  try {
    let line_items = []
    const locale = req.body.data.locale
    for (const object of req.body.data.objects) {
      const name =
        object.type === "main"
          ? object.name[locale]
          : object.name[locale] +
            " | " +
            (object.variant[locale] || "N/A") +
            ", " +
            (object.colour[locale] || "N/A") +
            ", " +
            (object.size[locale] || "N/A")
      const images = ["https:" + object.image.fluid.src]
      line_items.push({
        name: name,
        amount: object.priceSale
          ? object.priceSale * 10 * 10
          : object.priceOriginal * 10 * 10,
        currency: "eur",
        quantity: 1,
        images: images,
      })
    }
    // Skip pick-up in shop
    req.body.data.pay.shipping &&
      line_items.push({
        name: "Shipping to " + req.body.data.shipping.countryA2,
        amount: req.body.data.pay.shipping * 10 * 10,
        currency: "eur",
        quantity: 1,
      })

    req.body.data.pay.shipping
      ? (sessionData = {
          payment_method_types: ["ideal"],
          line_items: line_items,
          shipping_address_collection: {
            allowed_countries: [req.body.data.shipping.countryA2],
          },
          locale: req.body.data.locale,
          success_url:
            "https://terradelft-website.now.sh/" +
            req.body.data.locale +
            "/thank-you?session_id={CHECKOUT_SESSION_ID}",
          cancel_url:
            "https://terradelft-website.now.sh/" +
            req.body.data.locale +
            "/bag",
        })
      : (sessionData = {
          payment_method_types: ["ideal"],
          line_items: line_items,
          locale: req.body.data.locale,
          success_url:
            "https://terradelft-website.now.sh/" +
            req.body.data.locale +
            "/thank-you?session_id={CHECKOUT_SESSION_ID}",
          cancel_url:
            "https://terradelft-website.now.sh/" +
            req.body.data.locale +
            "/bag",
        })
  } catch (err) {
    return { success: false, error: err }
  }
  console.log("[checkout - stripeSession] Initialize stripe session")
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    return { success: true, sessionId: session.id }
  } else {
    return {
      success: false,
      error: "[checkout - stripeSession] Failed creating session",
    }
  }
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "[app] Content error" })
    return
  }

  console.log("[checkout - checkRecaptcha] Start")
  const resRecaptcha = await checkRecaptcha(req)
  console.log("[checkout - checkRecaptcha] End")
  if (!resRecaptcha.success) {
    res.status(400).json({ error: resRecaptcha.error })
    return
  }

  console.log("[checkout - checkContentful] Start")
  const resContentful = await checkContentful(req)
  console.log("[checkout - checkContentful] End")
  if (!resContentful.success) {
    res.status(400).json({ corrections: resContentful.corrections })
    return
  }

  console.log("[checkout - stripeSession] Start")
  const resStripe = await stripeSession(req)
  console.log("[checkout - stripeSession] End")
  if (resStripe.success) {
    res.status(200).json({ sessionId: resStripe.sessionId })
  } else {
    console.log(resStripe.error)
    res.status(400).json({ error: resStripe.error })
    return
  }
  console.log("[app] End")
}
