import { LoaderArgs } from "@remix-run/cloudflare"

type Args = {
  context: LoaderArgs['context']
  data: {
    type: string
    name: string
    email: string
    subject: string
    html: string
  }
}

const sendEmail = async (args: Args): Promise<boolean> => {
  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: args.context.EMAIL_RECEIVER }] }],
      from: { email: args.data.email, name: args.data.name },
      subject: `${args.data.type} - ${args.data.subject}`,
      content: [{ type: 'text/html', value: args.data.html }]
    }),
  })

  return res.ok

}

export default sendEmail
