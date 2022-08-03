import { Document } from '@contentful/rich-text-types'
import { json, LoaderArgs } from '@remix-run/cloudflare'
import { gql, GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { Context } from '~/root'

type GraphQLRequest = {
  context: LoaderArgs['context'] & Context
  params: LoaderArgs['params']
  query: RequestDocument
  variables?: Variables
}

export let cached: boolean | undefined = undefined

export const graphqlRequest = async <T = unknown>({
  context,
  params,
  query,
  variables
}: GraphQLRequest) => {
  if (!context.CONTENTFUL_SPACE || !context.CONTENTFUL_KEY) {
    throw json('Missing Contentful config', { status: 500 })
  }

  const preview = context.ENVIRONMENT !== 'PRODUCTION'
  const locale = params.locale

  if (!locale) {
    throw json('Missing locale', { status: 500 })
  }

  return new GraphQLClient(
    `https://graphql.contentful.com/content/v1/spaces/${context.CONTENTFUL_SPACE}/environments/migration`,
    {
      fetch,
      headers: { Authorization: `Bearer ${context.CONTENTFUL_KEY}` },
      errorPolicy: preview ? 'ignore' : 'ignore'
    }
  ).request<T>(query, { ...variables, preview, locale })
}

export const cacheQuery = async <T = unknown>({
  ttlMinutes = 60,
  ...rest
}: GraphQLRequest & { request: Request; ttlMinutes?: number }): Promise<T> => {
  const queryData = async () => await graphqlRequest<T>(rest)

  if (!ttlMinutes) {
    return await queryData()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(rest.request.url)
  const cacheKey = new Request(cacheUrl.toString())

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    cached = false
    const queryResponse = await queryData()
    const cacheResponse = new Response(JSON.stringify(queryResponse), {
      headers: { 'Cache-Control': `s-maxage=${ttlMinutes * 60}` }
    })
    cache.put(cacheKey, cacheResponse)
    return queryResponse
  } else {
    cached = true
    return await cacheMatch.json()
  }
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
export type CommonRichText = { json: Document; links?: any }

export type GiftCard = {
  imagesCollection: { items: CommonImage[] }
  defaultAmounts: string[]
  customAmountAllow: boolean
  customAmountMinimum?: number
  description: CommonRichText
}

export type ObjectsVariation = { sys: { id: string }; variant: string }
export type ObjectsColour = { sys: { id: string }; colour: string }
export type ObjectsSize = { sys: { id: string }; size: string }

export type ObjectsObjectVariation = {
  sys: { id: string }
  sku?: string
  variant?: ObjectsVariation
  colour?: ObjectsColour
  size?: ObjectsSize
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

export type Announcement = { title: string; content: CommonRichText }

export const RICH_TEXT_LINKS = gql`
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
  }
`
