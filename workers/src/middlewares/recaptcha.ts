import { error } from 'itty-router-extras'
import { ContentCheckout, Env } from '..'

const recaptcha = async (request: ContentCheckout, env: Env) => {
  if (!request.content.token) {
    return error(403, 'No reCaptcha token provided')
  }

  const params = new URLSearchParams({
    secret: env.RECAPTCHA_PRIVATE_KEY,
    response: request.content.token
  })
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`,
    {
      method: 'GET'
    }
  )
  const result = await res.json<{ success?: boolean }>()

  if (!result.success) {
    return error(403, 'reCaptcha token error')
  }
}

export default recaptcha
