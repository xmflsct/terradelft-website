const recaptcha = async ({ request, env, next }) => {
  if (!request.body.token) {
    return new Response('No reCaptcha token provided', { status: 403 })
  }

  const body = new URLSearchParams({
    secret: env.RECAPTCHA_PRIVATE_KEY,
    response: request.body.token,
    remoteip: request.socket.remoteAddress
  })
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'GET',
    body
  })
  const result = await res.json()

  if (result.success) {
    await next()
  } else {
    return new Response('reCaptcha token error', { status: 403 })
  }
}

export const onRequestPost = [recaptcha]
