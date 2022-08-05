import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import 'dotenv/config'
import got from 'got'
import { gql, GraphQLClient } from 'graphql-request'

const graphqlClient = new GraphQLClient(
  `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE}/environments/migration`,
  {
    headers: { Authorization: `Bearer ${process.env.CONTENTFUL_KEY}` },
    errorPolicy: 'ignore'
  }
)

const algoliaURL = `https://${process.env.ALGOLIA_APP_ID}.algolia.net/1/indexes`
const algoliaHeaders = {
  'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
  'X-Algolia-API-Key': process.env.ALGOLIA_API_KEY,
  'Content-Type': 'application/json; charset=utf-8'
}

const updateArtists = async locale => {
  console.log('Updating artists')

  const { artists } = await graphqlClient.request(
    gql`
      query ($locale: String!) {
        artists: objectsArtistCollection(locale: $locale, limit: 100) {
          items {
            sys {
              id
            }
            slug
            artist
            image {
              url
            }
            biography {
              json
            }
          }
        }
      }
    `,
    { locale }
  )

  for (const artist of artists.items) {
    console.log('👤', artist.artist)
    await got.put(`${algoliaURL}/${locale}/${artist.sys.id}`, {
      headers: algoliaHeaders,
      body: JSON.stringify({
        __type: 'artist',
        slug: artist.slug,
        name: artist.artist,
        avatar: artist.image.url,
        ...(artist.biography && {
          biography: documentToPlainTextString(artist.biography.json)
        })
      })
    })
  }
}

const updateObjects = async locale => {
  console.log('Updating objects')

  const objects = []
  const perPage = 24
  let total = undefined
  for (
    let page = 0;
    total === undefined || page <= Math.round(total / perPage);
    page++
  ) {
    console.log('🎨', 'page', page)
    const data = await graphqlClient.request(
      gql`
        query ($locale: String, $limit: Int, $skip: Int) {
          objects: objectsObjectCollection(
            locale: $locale
            limit: $limit
            skip: $skip
          ) {
            total
            items {
              sys {
                id
              }
              name
              description {
                json
              }
              imagesCollection(limit: 1) {
                items {
                  url
                }
              }
              artist {
                artist
              }
              sku
              variationsCollection {
                items {
                  sku
                  variant {
                    variant
                  }
                  colour {
                    colour
                  }
                  size {
                    size
                  }
                }
              }
              year {
                year
              }
              techniqueCollection(limit: 20) {
                items {
                  technique
                }
              }
              materialCollection(limit: 20) {
                items {
                  material
                }
              }
            }
          }
        }
      `,
      { locale, limit: perPage, skip: perPage * page }
    )

    if (total === undefined) {
      total = data.objects.total
    }
    objects.push(...data.objects.items)
  }

  for (const object of objects) {
    console.log('🎨', object.sys.id)
    await got.put(`${algoliaURL}/${locale}/${object.sys.id}`, {
      headers: algoliaHeaders,
      body: JSON.stringify({
        __type: 'object',
        id: object.sys.id,
        name: object.name,
        ...(object.description && {
          description: documentToPlainTextString(object.description.json)
        }),
        ...(object.imagesCollection?.items?.length &&
          object.imagesCollection.items[0] && {
            image: object.imagesCollection.items[0].url
          }),
        artist: object.artist?.artist,
        ...(object.sku && { sku: object.sku }),
        ...(object.variationsCollection?.items?.length && {
          variations: object.variationsCollection.items
            .map(variation =>
              variation
                ? {
                    ...(variation.sku && { sku: variation.sku }),
                    ...(variation.variant && {
                      variant: variation.variant.variant
                    }),
                    ...(variation.colour && {
                      colour: variation.colour.colour
                    }),
                    ...(variation.size && { size: variation.size.size })
                  }
                : null
            )
            .filter(v => v)
        }),
        ...(object.year && { year: object.year.year }),
        ...(object.techniqueCollection?.items?.length && {
          techniques: object.techniqueCollection.items
            .map(technique => technique?.technique)
            .filter(t => t)
        }),
        ...(object.materialCollection?.items?.length && {
          materials: object.materialCollection.items
            .map(material => material?.material)
            .filter(m => m)
        })
      })
    })
  }
}

const updateEvents = async locale => {
  console.log('Updating events')

  const events = []
  const perPage = 100
  let total = undefined

  for (
    let page = 0;
    total === undefined || page <= Math.round(total / perPage);
    page++
  ) {
    console.log('📅', 'page', page)
    const data = await graphqlClient.request(
      gql`
        query ($locale: String, $limit: Int, $skip: Int) {
          events: eventsEventCollection(
            locale: $locale
            limit: $limit
            skip: $skip
          ) {
            total
            items {
              sys {
                id
              }
              name
              image {
                url
              }
              description {
                json
              }
            }
          }
        }
      `,
      { locale, limit: perPage, skip: perPage * page }
    )

    if (total === undefined) {
      total = data.events.total
    }
    events.push(...data.events.items)
  }

  for (const event of events) {
    console.log('📅', event.sys.id)
    await got.put(`${algoliaURL}/${locale}/${event.sys.id}`, {
      headers: algoliaHeaders,
      body: JSON.stringify({
        __type: 'event',
        id: event.sys.id,
        name: event.name,
        ...(event.image && { image: event.image.url }),
        ...(event.description && {
          description: documentToPlainTextString(event.description.json)
        })
      })
    })
  }
}

const updateNews = async locale => {
  console.log('Updating news')
  const news = []
  const perPage = 100
  let total = undefined

  for (
    let page = 0;
    total === undefined || page <= Math.round(total / perPage);
    page++
  ) {
    console.log('📰', 'page', page)
    const data = await graphqlClient.request(
      gql`
        query ($locale: String, $limit: Int, $skip: Int) {
          news: newsNewsCollection(
            locale: $locale
            limit: $limit
            skip: $skip
          ) {
            total
            items {
              sys {
                id
              }
              title
              image {
                url
              }
              content {
                json
              }
            }
          }
        }
      `,
      { locale, limit: perPage, skip: perPage * page }
    )

    if (total === undefined) {
      total = data.news.total
    }
    news.push(...data.news.items)
  }

  for (const piece of news) {
    console.log('📰', piece.sys.id)
    await got.put(`${algoliaURL}/${locale}/${piece.sys.id}`, {
      headers: algoliaHeaders,
      body: JSON.stringify({
        __type: 'news',
        id: piece.sys.id,
        title: piece.title,
        ...(piece.image && { image: piece.image.url }),
        ...(piece.content && {
          content: documentToPlainTextString(piece.content.json)
        })
      })
    })
  }
}

const updateSearchIndex = async locale => {
  console.log('=====', locale, '=====')

  await updateArtists(locale)
  await updateObjects(locale)
  await updateEvents(locale)
  await updateNews(locale)
}

await updateSearchIndex('nl')
