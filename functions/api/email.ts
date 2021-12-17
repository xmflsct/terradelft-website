import { Context } from './_middleware'

export type BodyEmail = {
  body: {
    email: string
    name: string
    type: string
    subject: string
    html: string
  }
}

const sendGrid = async ({
  env,
  data
}: Pick<Context<BodyEmail>, 'env' | 'data'>): Promise<Response> => {
  const receiver = env.SENDGRID_EMAIL

  // Filter out yahoo email address, see https://sendgrid.com/blog/yahoo-dmarc-update/
  const email = data.body.email.includes('@yahoo') ? receiver : data.body.email
  let message = {
    personalizations: [{ to: [{ email: receiver }] }],
    from: { email, name: data.body.name },
    reply_to: { email: data.body.email, name: data.body.name },
    subject: `${data.body.type} - ${data.body.subject}`,
    content: [{ type: 'text/html', value: data.body.html }]
  }

  return await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SENDGRID_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })
}

export const onRequestPost = async ({ env, data }: Context<BodyEmail>) => {
  const result = await sendGrid({ env, data })
  if (result.ok) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    return new Response(await result.text(), { status: 500 })
  }
}
