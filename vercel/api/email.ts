import microCors from 'micro-cors'
const cors = microCors({ origin: '*' })
import sgMail from '@sendgrid/mail'
import recaptcha from './utils/_recaptcha'
import { NowRequest, NowResponse } from '@vercel/node'
const terraEmail = process.env.SENDGRID_EMAIL

async function sendGrid (req: NowRequest) {
  sgMail.setApiKey(process.env.SENDGRID_KEY)
  // Filter out yahoo email address, see https://sendgrid.com/blog/yahoo-dmarc-update/
  const email = req.body.data.email.includes('@yahoo')
    ? terraEmail
    : req.body.data.email
  let message = {
    from: `${req.body.data.name} <${email}>`,
    to: terraEmail,
    // replyTo: req.body.data.email,
    subject: `${req.body.data.type} - ${req.body.data.subject}`,
    html: req.body.data.html
  }
  let response: { success: boolean; error?: any } = { success: undefined }
  await sgMail.send(message).then(
    () => {
      response = { success: true }
    },
    error => {
      response = { success: false, error }
    }
  )
  return response
}

async function email (req: NowRequest, res: NowResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('[app] Start')
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: '[app] Content error' })
    return
  }

  console.log('[email - checkRecaptcha] Start')
  const resRecaptcha = await recaptcha(process.env.RECAPTCHA_PRIVATE_KEY, req)
  console.log('[email - checkRecaptcha] End')
  if (!resRecaptcha.success) {
    res
      .status(400)
      .json({ error: resRecaptcha.error })
      .end()
    return
  }

  console.log('[email - mailSession] Start')
  const resNodemailer = await sendGrid(req)
  console.log('[email - mailSession] End')
  if (resNodemailer.success) {
    res.status(200).send({ success: true })
  } else {
    res.status(400).send({ error: resNodemailer.error })
    return
  }

  console.log('[app] End')
}

export default cors(email)
