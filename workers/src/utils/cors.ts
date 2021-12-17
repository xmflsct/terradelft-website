import { Env } from '..'

export const handleCors = (_: Request, env: Env) => (request: Request) => {
  const origin = '*'
  const methods = 'POST'
  const headers = 'referer, origin, content-type'
  const maxAge = 86400

  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null
  ) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': headers,
        'Access-Control-Max-Age': maxAge.toString()
      }
    })
  } else {
    return new Response(null, {
      headers: {
        Allow: `${methods}, HEAD, OPTIONS`
      }
    })
  }
}

export const wrapCorsHeader = (response: Response) => {
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
