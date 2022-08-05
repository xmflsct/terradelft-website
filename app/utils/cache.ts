type Args = {
  ttlMinutes?: number
  req: () => Promise<Response>
  request: Request
}

const cache = async <T = unknown>({
  ttlMinutes = 60,
  req,
  request
}: Args): Promise<T> => {
  const makeRequest = async () => (await req()).json<T>()

  if (!ttlMinutes) {
    return await makeRequest()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(request.url)
  const cacheKey = cacheUrl.href

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    console.log('⚠️ Not cached')
    const queryResponse = await makeRequest()
    const cacheResponse = new Response(JSON.stringify(queryResponse), {
      headers: { 'Cache-Control': `s-maxage=${ttlMinutes * 60}` }
    })
    cache.put(cacheKey, cacheResponse)
    return queryResponse
  } else {
    console.log('☑️ Cached')
    return await cacheMatch.json<T>()
  }
}

export default cache
