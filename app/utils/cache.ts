import { LoaderFunctionArgs } from '@remix-run/cloudflare'

export let cached: boolean | undefined = undefined

const cache = async <T = unknown>({
  ttlMinutes = 15,
  req,
  request,
  context
}: {
  ttlMinutes?: number
  req: () => Promise<T>
  request: Request
  context: LoaderFunctionArgs['context']
}): Promise<T> => {
  const preview = (context.cloudflare.env as any).CF_PAGES !== 'PRODUCTION'
  if (preview || !ttlMinutes) {
    return await req()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(request.url)
  const cacheKey = cacheUrl.href

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    console.log('⚠️ Not cached')
    const queryResponse = await req()
    const cacheResponse = new Response(JSON.stringify(queryResponse), {
      headers: { 'Cache-Control': `s-maxage=${ttlMinutes * 10}` }
    })
    cache.put(cacheKey, cacheResponse)
    return queryResponse
  } else {
    console.log('☑️ Cached')
    return await cacheMatch.json<T>()
  }
}

export default cache
