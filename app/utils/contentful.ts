import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
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
    cache: new InMemoryCache(),
    uri: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE}/environments/migration`,
    headers: {
      Authorization: `Bearer ${CONTENTFUL_KEY}`
    },
    defaultOptions: { query: { errorPolicy: 'ignore' } }
  })
}

export let cached = false
export const cacheQuery = async (
  duration: number, // In minutes
  { request }: DataFunctionArgs,
  func: () => Promise<Object>
): Promise<Object> => {
  if (!duration) {
    return await func()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(request.url)
  const cacheKey = new Request(cacheUrl.toString())

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    cached = false
    const queryResponse = await func()
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
}

export type CommonImage = {
  title: string
  // description: string
  contentType: string
  // fileName: string
  // size: number
  url: string
  // width: number
  // height: number
}
export type CommonRichText = { json: Document }

export type ObjectsObjectVariation = {
  sys: { id: string }
  sku?: string
  variant?: { [key: string]: string }
  colour?: { [key: string]: string }
  size?: { [key: string]: string }
  priceOriginal: number
  priceSale?: number
  sellOnline: boolean
  stock: number
  image?: CommonImage
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
    items: { name: string; location: string; address: string }[]
  }
  image?: CommonImage
  description?: CommonRichText
}

const getObjectsArtist = async ({
  context,
  params: { locale, slug }
}: DataFunctionArgs): Promise<Readonly<ObjectsArtist>> => {
  return (
    await apolloClient({ context }).query<{
      objectsArtistCollection: { items: ObjectsArtist[] }
    }>({
      query: gql`
      query {
        objectsArtistCollection (locale: "${locale}", limit: 1, where: {
          slug: "${slug}"
        }) {
          items {
            artist
            image {
              url
            }
            biography {
              json
            }
            linkedFrom {
              objectsObjectCollection (locale: "nl") {
                items {
                  sys {
                    id
                  }
                  name (locale: "${locale}")
                  imagesCollection (limit: 1) {
                    items {
                      url
                    }
                  }
                  priceSale
                }
              }
            }
          }
        }
      }
    `
    })
  ).data.objectsArtistCollection.items[0]
}

const getObjectsArtists = async ({
  context,
  params: { locale }
}: DataFunctionArgs): Promise<Readonly<ObjectsArtist[]>> => {
  return (
    await apolloClient({ context }).query<{
      objectsArtistCollection: { items: ObjectsArtist[] }
    }>({
      query: gql`
          query {
            objectsArtistCollection (locale: "${locale}") {
              items {
                slug
                artist
                image {
                  url
                }
              }
            }
          }
        `
    })
  ).data.objectsArtistCollection.items
}

const getObjectsObject = async ({
  context,
  params: { locale, id }
}: DataFunctionArgs): Promise<Readonly<ObjectsObject_NameLocalized>> => {
  const object = {
    ...(
      await apolloClient({ context }).query<{
        objectsObject: ObjectsObject
      }>({
        query: gql`
          query {
            objectsObject (locale: "${locale}", id: "${id}") {
              sys {
                id
              }
              name_nl: name (locale: "nl")
              name_en: name (locale: "en")
              description {
                json
              }
              imagesCollection {
                items {
                  url
                }
              }
              artist {
                slug
                artist
                linkedFrom {
                  objectsObjectCollection (locale: "nl") {
                    items {
                      sys {
                        id
                      }
                      name (locale: "${locale}")
                      imagesCollection (limit: 1) {
                        items {
                          url
                        }
                      }
                      priceSale
                    }
                  }
                }
              }
              kunstKoop
              sellOnline
              priceOriginal
              priceSale
              sku
              stock
              variationsCollection {
                items {
                  sys {
                    id
                  }
                  sku
                  variant {
                    variant_nl: variant (locale: "nl")
                    variant_en: variant (locale: "en")
                  }
                  colour {
                    colour_nl: colour (locale: "nl")
                    colour_en: colour (locale: "en")
                  }
                  size {
                    size_nl: size (locale: "nl")
                    size_en: size (locale: "en")
                  }
                  priceOriginal
                  priceSale
                  sellOnline
                  stock
                  image {
                    url
                  }
                }
              }
              year {
                year
              }
              techniqueCollection {
                items {
                  technique
                }
              }
              materialCollection {
                items {
                  material
                }
              }
              dimensionWidth
              dimensionLength
              dimensionHeight
              dimensionDiameter
              dimensionDepth
            }
          }
        `
      })
    ).data.objectsObject
  }

  // @ts-ignore
  object.name = { nl: object.name_nl, en: object.name_en }
  // @ts-ignore
  delete object.name_nl
  // @ts-ignore
  delete object.name_en

  if (object.variationsCollection) {
    object.variationsCollection = {
      ...object.variationsCollection,
      items: object.variationsCollection.items.map(item => ({
        ...item,
        variant: item.variant
          ? { nl: item.variant.variant_nl, en: item.variant.variant_en }
          : undefined,
        colour: item.colour
          ? { nl: item.colour.colour_nl, en: item.colour.colour_en }
          : undefined,
        size: item.size
          ? { nl: item.size.size_nl, en: item.size.size_en }
          : undefined
      }))
    }
  }

  // @ts-ignore
  return object
}

const getObjectsObjects = async ({
  context,
  params: { locale }
}: DataFunctionArgs): Promise<Readonly<ObjectsObject[]>> => {
  return (
    await apolloClient({ context }).query<{
      objectsObjectCollection: { items: ObjectsObject[] }
    }>({
      query: gql`
          query {
            objectsObjectCollection (locale: "${locale}") {
              items {
                sys {
                  id
                }
                name
                imagesCollection (limit: 1) {
                  items {
                    url
                  }
                }
                priceSale
              }
            }
          }
        `
    })
  ).data.objectsObjectCollection.items
}

const getShippingRates = async ({
  context,
  params: { locale }
}: DataFunctionArgs): Promise<Readonly<ShippingRates>> => {
  return (
    await apolloClient({ context }).query<{
      shippingRatesCollection: { items: { rates: ShippingRates }[] }
    }>({
      query: gql`
      query {
        shippingRatesCollection (locale: "${locale}", limit: 1, where: {
          year: "2022"
        }) {
          items {
            rates
          }
        }
      }
    `
    })
  ).data.shippingRatesCollection.items[0].rates
}

const getEventsEvent = async ({
  context,
  params: { locale, id }
}: DataFunctionArgs): Promise<Readonly<EventsEvent>> => {
  return (
    await apolloClient({ context }).query<{ eventsEvent: EventsEvent }>({
      query: gql`
      query {
        eventsEvent (locale: "${locale}", id: "${id}") {
          name
          datetimeStart
          datetimeEnd
          datetimeAllDay
          typeCollection {
            items {
              name
            }
          }
          terraInChina
          organizerCollection {
            items {
              name
            }
          }
          locationCollection {
            items {
              name
              location {
                lat
                lon
              }
              address
            }
          }
          image {
            url
          }
          description {
            json
          }
        }
      }
    `
    })
  ).data.eventsEvent
}

const getEventsEvents = async ({
  context,
  params: { locale }
}: DataFunctionArgs): Promise<Readonly<EventsEvent[]>> => {
  return (
    await apolloClient({ context }).query<{
      eventsEventCollection: { items: EventsEvent[] }
    }>({
      query: gql`
      query {
        eventsEventCollection (locale: "${locale}", where: { datetimeEnd_gte: "${new Date().toISOString()}" }) {
          items {
            sys {
              id
            }
            image {
              url
            }
            name
            datetimeStart
            datetimeEnd
            typeCollection {
              items {
                name
              }
            }
          }
        }
      }
    `
    })
  ).data.eventsEventCollection.items
}

export {
  getObjectsArtist,
  getObjectsArtists,
  getObjectsObject,
  getObjectsObjects,
  getShippingRates,
  getEventsEvent,
  getEventsEvents
}
