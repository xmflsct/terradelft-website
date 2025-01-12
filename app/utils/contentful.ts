import { Document } from '@contentful/rich-text-types'
import { gql, GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { data as loaderData, LoaderFunctionArgs } from 'react-router'
import isPreview from './isPreview'

type GraphQLRequest = Pick<LoaderFunctionArgs, 'context' | 'params'> & {
  query: RequestDocument
  variables?: Variables
}

export const graphqlRequest = <T = unknown>({
  context,
  params,
  query,
  variables
}: GraphQLRequest) => {
  if (!context.cloudflare.env.CONTENTFUL_SPACE || !context.cloudflare.env.CONTENTFUL_KEY) {
    throw loaderData('Missing Contentful config', { status: 500 })
  }

  const preview = isPreview(context)
  const locale = params.locale

  if (!locale) {
    throw loaderData('Missing locale', { status: 500 })
  }

  return async () =>
    await new GraphQLClient(
      `https://graphql.contentful.com/content/v1/spaces/${context.cloudflare.env.CONTENTFUL_SPACE}/environments/master`,
      {
        fetch,
        headers: { Authorization: `Bearer ${context.cloudflare.env.CONTENTFUL_KEY}` },
        errorPolicy: preview ? 'ignore' : 'ignore'
      }
    ).request<T>(query, { ...variables, preview, locale })
}

export type CommonImage = {
  title: string
  description: string
  contentType: string
  // fileName: string
  // size: number
  url: string
  width: number
  height: number
}
export type CommonRichText = { json: Document; links?: any }

export type GiftCard = {
  imagesCollection?: { items: (CommonImage | null)[] }
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
  imagesCollection?: { items: (CommonImage | null)[] }
  artist: ObjectsArtist
  sellOnline: boolean
  priceOriginal?: number
  priceSale?: number
  sku: string
  stock?: number
  variationsCollection?: { items: ObjectsObjectVariation[] }
  year?: { year: number }
  techniqueCollection?: { items: { sys: { id: string }; technique: string }[] }
  materialCollection?: { items: { sys: { id: string }; material: string }[] }
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
  image?: CommonImage
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
        title
        description
        width
        height
      }
    }
    entries {
      inline {
        sys {
          id
        }
        ... on EventsEvent {
          __typename
          name
        }
        ... on NewsNews {
          __typename
          title
        }
        ... on ObjectsArtist {
          __typename
          slug
          artist
        }
        ... on ObjectsObject {
          __typename
          name
        }
      }
      hyperlink {
        sys {
          id
        }
        ... on EventsEvent {
          __typename
          name
        }
        ... on NewsNews {
          __typename
          title
        }
        ... on ObjectsArtist {
          __typename
          slug
          artist
        }
        ... on ObjectsObject {
          __typename
          name
        }
      }
    }
  }
`
