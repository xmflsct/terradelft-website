import { LoaderFunctionArgs } from 'react-router'
import isPreview from './isPreview'

export const ttl = 360
export let cached: boolean | undefined = false

const cache = async <T = unknown>({
  ttlMinutes = ttl,
  req,
  request,
  context
}: Pick<LoaderFunctionArgs, 'context'> & {
  ttlMinutes?: number
  req: () => Promise<T>
  request: Request
}): Promise<T> => {
  if (isPreview(context) || !ttlMinutes) {
    return await req()
  }

  const cacheKey = new URL(request.url).pathname

  const cache = await context.cloudflare.env.TERRADELFT_WEBSITE.get(cacheKey, {
    type: 'json'
  })

  if (!cache) {
    console.log('⚠️ Not cached')

    const queryResponse = await req()
    await context.cloudflare.env.TERRADELFT_WEBSITE.put(cacheKey, JSON.stringify(queryResponse), {
      expirationTtl: ttlMinutes * 60
    })

    // context.cloudflare.env.TERRADELFT_GRAPHQL.writeDataPoint({
    //   indexes: ['not-cached'],
    //   blobs: [cacheKey]
    // })

    return queryResponse
  } else {
    console.log('☑️ Cached')
    cached = true

    // context.cloudflare.env.TERRADELFT_GRAPHQL.writeDataPoint({
    //   indexes: ['cached'],
    //   blobs: [cacheKey]
    // })

    return await cache
  }
}

export default cache
