import { gql } from "graphql-request"
import { ActionFunctionArgs, data as actionData } from "react-router"
import i18n from "~/i18n"
import { graphqlRequest, ObjectsArtist } from "~/utils/contentful"
import { newsPerPage } from "./$locale.news.page.$page"
import { exhibitionsPerPage } from "./$locale.exhibitions.page.$page"
import { getSellableObjects } from "~/utils/kv"
import { shopPerPage } from "./$locale.shop.page.$page"

export const action = async ({ params, context, request }: ActionFunctionArgs) => {
  if (params.id !== context.cloudflare.env.CONTENTFUL_WEBHOOK_ID) throw actionData(null, { status: 404 })
  if (request.method !== 'POST') throw actionData(null, { status: 405 })

  const payload = await request.json()

  const contentId = payload.sys.id
  const contentType = payload.sys.contentType.sys.id

  const deletePerLocale = async (paths: string) => {
    for (const locale of i18n.supportedLngs) {
      console.log('✂️', `/${locale}${paths}`)
      await context.cloudflare.env.TERRADELFT_WEBSITE.delete(`/${locale}${paths}`)
    }
  }

  console.log('Deleting content type', contentType, 'of ID', contentId)
  switch (contentType) {
    case 'announcement':
      await deletePerLocale('')
      break
    case 'eventsEvent':
      await deletePerLocale('/exhibitions')

      await deletePerLocale(`/exhibition/${contentId}`)

      const exhibitionsTotal = await graphqlRequest<{
        exhibitions: {
          total: number
        }
      }>({
        context,
        params: { locale: 'nl' },
        query: gql`
        query Query($locale: String) {
          exhibitions: eventsEventCollection(
            locale: $locale
          ) {
            total
          }
        }
      `
      })()
      const exhibitionsPages = Math.round(exhibitionsTotal.exhibitions.total / exhibitionsPerPage)
      for (let i = 1; i <= exhibitionsPages; i++) {
        await deletePerLocale(`/exhibitions/page/${i}`)
      }

      if (!!payload.sys.fields?.terraInChina.nl) {
        await deletePerLocale('/terra-in-china')
        for (let i = 1; i <= exhibitionsPages; i++) {
          await deletePerLocale(`/terra-in-china/exhibitions/page/${i}`)
        }
      }

      break
    case 'newsNews':
      await deletePerLocale(`/news/${contentId}`)

      const newsTotal = await graphqlRequest<{ news: { total: number } }>({
        context,
        params: { locale: 'nl' },
        query: gql`
        query Query($locale: String) {
          news: newsNewsCollection(locale: $locale) {
            total
          }
        }
      `
      })()
      const newsPages = Math.round(newsTotal.news.total / newsPerPage)
      for (let i = 1; i <= newsPages; i++) {
        await deletePerLocale(`/news/page/${i}`)
      }

      if (!!payload.sys.fields?.terraInChina.nl) {
        await deletePerLocale('/terra-in-china')
        for (let i = 1; i <= newsPages; i++) {
          await deletePerLocale(`/terra-in-china/news/page/${i}`)
        }
      }

      break
    case 'objectsObject':
      // not complete
      // await deletePerLocale(`/object/${contentId}`)

      if (payload.fields?.artist?.nl?.sys.id) {
        const artist = await graphqlRequest<{ artist: Pick<ObjectsArtist, 'slug'> }>({
          context,
          params: { locale: 'nl' },
          variables: { id: payload.fields.artist.nl.sys.id },
          query: gql`
            query Query($locale: String, $id: String!) {
              artist: objectsArtist(locale: $locale, id: $id) {
                slug
              }
            }
          `
        })()
        await deletePerLocale(`/artist/${artist.artist.slug}`)
      }

      break
    case 'objectsArtist':
      if (payload.sys.fields?.slug) {
        await deletePerLocale(`/artist/${payload.sys.fields.slug}`)

        // const artists = await graphqlRequest<{ artists: { items: ObjectsArtist[] } }>({
        //   context,
        //   params: { locale: 'nl', slug: payload.sys.fields.slug },
        //   query: gql`
        //     query Query($locale: String $slug: String) {
        //       arsits: objectsArtistCollection(locale: $locale, limit: 1, where: {slug: $slug}) {
        //         items {
        //           linkedFrom {
        //             objectsObjectCollection(locale: "nl") {
        //               items {
        //                 sys {
        //                   id
        //                 }
        //                 sellOnline
        //                 stock
        //                 priceOriginal
        //                 priceSale
        //                 variationsCollection(limit: 50) {
        //                   items {
        //                     sellOnline
        //                     stock
        //                     priceOriginal
        //                     priceSale
        //                   }
        //                 }
        //               }
        //             }
        //           }
        //         }
        //       }
        //     }
        //   `
        // })()
        // const artist = artists.artists.items[0]
        // let hasSellableObjects = false
        // for (const object of artist.linkedFrom.objectsObjectCollection.items) {
        //   await deletePerLocale(`/object/${object.sys.id}`)

        //   if (object.variationsCollection?.items.length) {
        //     if (
        //       object.variationsCollection.items.filter(
        //         variation =>
        //           variation &&
        //           variation.sellOnline &&
        //           (variation.stock ?? 0 > 0) &&
        //           (variation.priceOriginal || variation.priceSale || -1) > 0
        //       ).length
        //     ) {
        //       hasSellableObjects = true
        //     }
        //   } else {
        //     if (
        //       object.sellOnline &&
        //       (object.stock ?? 0 > 0) &&
        //       (object.priceOriginal || object.priceSale || -1) > 0
        //     ) {
        //       hasSellableObjects = true
        //     }
        //   }
        // }
        // if (hasSellableObjects) {
        //   const objects = await getSellableObjects({ params: { locale: 'nl' }, context })
        //   const shopPages = Math.round(objects.length / shopPerPage)
        //   for (let i = 1; i <= shopPages; i++) {
        //     await deletePerLocale(`/shop/page/${i}`)
        //   }
        // }
      }

      await deletePerLocale('')

      break
    case 'informationAboutTerra':
    case 'informationStaff':
      await deletePerLocale('/about-terra')
      break
    case 'informationReachTerra':
      await deletePerLocale('/reach-terra')
      break
  }

  return new Response('ok')
}