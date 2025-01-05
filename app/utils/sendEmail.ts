import { LoaderFunctionArgs } from '@remix-run/cloudflare'

type Args = {
  context: LoaderFunctionArgs['context']
  data: {
    type: string
    name: string
    email: string
    subject: string
    html: string
  }
}

const sendEmail = async (args: Args): Promise<boolean> => {
  const receiver = args.context.cloudflare.env.EMAIL_RECEIVER
  const message = {
    sender: {
      email: 'noreply@terra-delft.nl',
      name: args.data.name
    },
    replyTo: { email: args.data.email, name: args.data.name },
    to: [{ email: receiver, name: 'Terra Delft' }],
    bcc: [{ email: args.context.cloudflare.env.EMAIL_BCC }],
    subject: `${args.data.type} - ${args.data.subject}`,
    htmlContent: args.data.html
  }

  const res = await fetch('https://api.sendinblue.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': args.context.cloudflare.env.SENDINBLUE_KEY as string,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(message)
  })

  return res.ok
}

export default sendEmail
