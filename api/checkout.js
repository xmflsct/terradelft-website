const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const fetch = require("node-fetch")

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

  let objectsCorrection = []
  let url = "https://" + process.env.CONTENTFUL_HOST
  const space = process.env.CONTENTFUL_SPACE
  const secret = process.env.CONTENTFUL_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_ENVIRONMENT
  const contentType = {
    main: "objectsObject",
    variation: "objectsObjectVariation",
    shipping: ""
  }

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
      url =
        url +
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

      await fetch(url)
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
              objectsCorrection.push(correction)
            }
          }
        })
    }
  }

  console.log("[checkout - checkContentful] End")
  if (objectsCorrection.length) {
    return { fail: true, error: objectsCorrection }
  }
}

async function stripeSession(req) {
  console.log("[checkout - stripeSession] Start")
  var sessionData = {}
  try {
    sessionData = req.body.shipping
      ? {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: req.body.items,
          shipping_address_collection: {
            allowed_countries: ["NL"]
          },
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata
          }
        }
      : {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: req.body.items,
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata
          }
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
    res.status(400).send({ error: "[app] Body empty or error" })
    return
  }

  const resRecaptcha = await checkRecaptcha(req)
  if (resRecaptcha) {
    res.status(400).send({ error: resRecaptcha.error })
    return
  }

  const resContentful = await checkContentful(req)
  if (resContentful) {
    res.status(400).send({ error: resContentful.error })
    return
  } else {
    res.status(200).send({ ok: true })
  }

  // const resStripe = await stripeSession(req, res)
  // if (resStripe.sessionId) {
  //   res.status(200).send({ sessionId: resStripe.sessionId })
  // } else {
  //   res.status(400).send({ error: resStripe.error })
  //   return
  // }

  console.log("[app] End")
}
