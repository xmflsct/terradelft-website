import { ApolloClient, InMemoryCache, QueryOptions } from '@apollo/client'
import { Document } from '@contentful/rich-text-types'
import { DataFunctionArgs } from '@remix-run/server-runtime'

export type Context = {
  CONTENTFUL_SPACE?: string
  CONTENTFUL_KEY?: string
  STRIPE_KEY_PRIVATE?: string
}

export const apolloClient = ({
  context: { CONTENTFUL_SPACE, CONTENTFUL_KEY }
}: {
  context: Context
}) => {
  if (!CONTENTFUL_SPACE || !CONTENTFUL_KEY) {
    throw new Error('Contentful secrets missing')
  }

  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    uri: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE}/environments/migration`,
    headers: {
      Authorization: `Bearer ${CONTENTFUL_KEY}`
    },
    defaultOptions: { query: { errorPolicy: 'ignore' } }
  })
}

export let cached = false
export const cacheQuery = async <T = unknown>(
  query: QueryOptions,
  duration: number, // In minutes
  props: DataFunctionArgs
): Promise<T> => {
  const queryData = async () =>
    (await apolloClient(props).query<T>(query).catch(logError)).data

  if (!duration) {
    return await queryData()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(props.request.url)
  const cacheKey = new Request(cacheUrl.toString())

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    cached = false
    const queryResponse = await queryData()
    const cacheResponse = new Response(JSON.stringify(queryResponse), {
      headers: { 'Cache-Control': `s-maxage=${duration * 60}` }
    })
    cache.put(cacheKey, cacheResponse)
    return queryResponse
  } else {
    cached = true
    return await cacheMatch.json()
  }
}

const logError = (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    e?.graphqlErrors && console.log('GraphQL', e.graphqlErrors)
    e?.clientErrors && console.log('client', e.clientErrors)
    e?.networkError && console.log('network', e.networkError.result?.errors)
  }
  throw new Error()
}

export type CommonImage = {
  title: string
  description: string
  contentType: string
  // fileName: string
  // size: number
  url: string
  // width: number
  // height: number
}
export type CommonRichText = { json: Document; links: any }

export type ObjectsVariation = { sys: { id: string }; variant: string }
export type ObjectsColour = { sys: { id: string }; colour: string }
export type ObjectsSize = { sys: { id: string }; size: string }

export type ObjectsObjectVariation = {
  sys: { id: string }
  sku?: string
  variant?: { sys: { id: string }; variant: string }
  colour?: { sys: { id: string }; colour: string }
  size?: { sys: { id: string }; size: string }
  priceOriginal: number
  priceSale?: number
  sellOnline: boolean
  stock: number
  image?: CommonImage
}
export type ObjectsObjectVariation_NameLocalized = Omit<
  ObjectsObjectVariation,
  'variant' | 'colour' | 'size'
> & {
  variant?: { [key: string]: string }
  colour?: { [key: string]: string }
  size?: { [key: string]: string }
}

export type ObjectsObject = {
  sys: { id: string }
  name: string
  description?: CommonRichText
  imagesCollection?: { items: CommonImage[] }
  artist: ObjectsArtist
  kunstKoop: boolean
  sellOnline: boolean
  priceOriginal?: number
  priceSale?: number
  sku: string
  stock?: number
  variationsCollection?: { items: ObjectsObjectVariation[] }
  year?: { year: number }
  techniqueCollection?: { items: { technique: string }[] }
  materialCollection?: { items: { material: string }[] }
  dimensionWidth?: number
  dimensionLength?: number
  dimensionHeight?: number
  dimensionDiameter?: number
  dimensionDepth?: number
}
export type ObjectsObject_NameLocalized = Omit<ObjectsObject, 'name'> & {
  name: { [key: string]: string }
}

export type ObjectsArtist = {
  sys: { id: string }
  slug: string
  artist: string
  image: CommonImage
  biography: CommonRichText
  linkedFrom: { objectsObjectCollection: { items: ObjectsObject[] } }
}

export type ShippingRates = {
  countryCode: string[]
  type: string
  rates: {
    price: number
    method: string
    description?: string
    freeForTotal?: number
  }[]
}[]

export type EventsEvent = {
  sys: { id: string }
  name: string
  datetimeStart: string // Date
  datetimeEnd: string // Date
  datetimeAllDay: boolean
  typeCollection?: { items: { name: string }[] }
  terraInChina: boolean
  organizerCollection?: { items: { name: string }[] }
  locationCollection?: {
    items: {
      name: string
      location: { lat: number; lon: number }
      address: string
    }[]
  }
  image?: CommonImage
  description?: CommonRichText
}

export type NewsNews = {
  sys: { id: string }
  title: string
  date: string // Date
  image?: CommonImage
  terraInChina: boolean
  content?: CommonRichText
}

export type AboutTerra = {
  columnLeft: CommonRichText
  columnRight: CommonRichText
  staffCollection?: {
    items: {
      name: string
      avatar: CommonImage
      biography: CommonRichText
    }[]
  }
}

export type ReachTerra = { description: CommonRichText }

export const richTextLinks = `
links {
  assets {
    block {
      sys {
        id
      }
      url
      description
    }
  }
  entries {
    inline {
      sys {
        id
      }
      ... on EventsEvent {
        name
      }
      ... on NewsNews {
        title
      }
      ... on ObjectsArtist {
        slug
        artist
      }
      ... on ObjectsObject {
        name
      }
    }
    hyperlink {
      sys {
        id
      }
      ... on EventsEvent {
        name
      }
      ... on NewsNews {
        title
      }
      ... on ObjectsArtist {
        slug
        artist
      }
      ... on ObjectsObject {
        name
      }
    }
  }
}`
