import { Context } from '~/root'

type Args = {
  context: Context
  data: {
    type: string
    name: string
    email: string
    subject: string
    html: string
  }
}

const sendEmail = async (args: Args): Promise<boolean> => {
  const receiver = args.context.SENDGRID_EMAIL

  // Filter out yahoo email address, see https://sendgrid.com/blog/yahoo-dmarc-update/
  const email = args.data.email.includes('@yahoo') ? receiver : args.data.email
  const message = {
    personalizations: [{ to: [{ email: receiver }] }],
    from: { email, name: args.data.name },
    reply_to: { email: args.data.email, name: args.data.name },
    subject: `${args.data.type} - ${args.data.subject}`,
    content: [{ type: 'text/html', value: args.data.html }]
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.context.SENDGRID_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  return res.ok
}

export default sendEmail
