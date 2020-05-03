const sgMail = require("@sendgrid/mail")
const ky = require("ky-universal")

const recaptcha = require("./utils/_recaptcha")
const terraEmail = "xmflsct@gmail.com"

async function sendGrid(req) {
  sgMail.setApiKey(process.env.SENDGRID_KEY)
  // Filter out yahoo email address, see https://sendgrid.com/blog/yahoo-dmarc-update/
  const email = req.body.data.email.includes("@yahoo")
    ? terraEmail
    : req.body.data.email
  let message = {
    from: `${req.body.data.name} <${req.body.data.email}>`,
    to: terraEmail,
    // replyTo: req.body.data.email,
    subject: `${req.body.data.type} - ${req.body.data.subject}`,
    html: req.body.data.html,
  }
  let response = {}
  await sgMail.send(message, (error, result) => {
    if (error) {
      console.log(error)
      response = { success: false, error: error }
    } else {
      console.log(result)
      response = { success: true }
    }
  })
  return response
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: "[app] Content error" })
    return
  }

  console.log("[email - checkRecaptcha] Start")
  const resRecaptcha = await recaptcha.check(
    process.env.RECAPTCHA_PRIVATE_KEY,
    req
  )
  console.log("[email - checkRecaptcha] End")
  if (!resRecaptcha.success) {
    res.status(400).send({ error: resRecaptcha.error })
    return
  }

  console.log("[email - mailSession] Start")
  const resNodemailer = await sendGrid(req)
  console.log("[email - mailSession] End")
  if (resNodemailer.success) {
    res.status(200).send({ success: true })
  } else {
    res.status(400).send({ error: resNodemailer.error })
    return
  }

  console.log("[app] End")
}
