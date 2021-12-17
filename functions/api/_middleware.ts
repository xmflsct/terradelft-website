export type Env = {
  RECAPTCHA_PRIVATE_KEY: string
  CONTENTFUL_HOST: string
  CONTENTFUL_OBJECTS_SPACE: string
  CONTENTFUL_OBJECTS_KEY_CHECKOUT: string
  CONTENTFUL_OBJECTS_ENVIRONMENT: string
  STRIPE_PRIVATE_KEY: string
}

export type Context<T = unknown> = {
  request: Request
  env: Env
  next: () => Promise<void>
  data: T
}

const errorHandler = async ({ next }) => {
  try {
    return await next()
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 })
  }
}

const parseBodyToJson = async ({
  request,
  data,
  next
}: Context<{ body: Object }>) => {
  data.body = await request.json()
  return await next()
}

const recaptcha = async ({
  env,
  data,
  next
}: Context<{ body: { token: string } }>) => {
  if (!data.body.token) {
    console.log('[recaptcha]', 'No reCaptcha token provided')
    return new Response('No reCaptcha token provided', { status: 403 })
  }

  const params = new URLSearchParams({
    secret: env.RECAPTCHA_PRIVATE_KEY,
    response: data.body.token
  })
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`,
    {
      method: 'GET'
    }
  )
  const result = await res.json()

  if (!result.success) {
    console.log('[recaptcha]', 'reCaptcha token error')
    return new Response('reCaptcha token error', { status: 403 })
  }

  return await next()
}

export const onRequestPost = [errorHandler, parseBodyToJson, recaptcha]
