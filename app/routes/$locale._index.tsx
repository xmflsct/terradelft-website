import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { shuffle } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { H2, H3 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import ListObjects from '~/components/list/objects'
import { objectsReduceSell } from '~/components/list/objectsReduceSell'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import {
  Announcement,
  GiftCard,
  graphqlRequest,
  ObjectsArtist,
  ObjectsObject
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import sortArtists from '~/utils/sortArtists'

export const loader = async (args: LoaderFunctionArgs) => {
  const data = await cache<{
    announcements?: { items: Announcement[] }
    giftCard: GiftCard
    objects: { items: ObjectsObject[] }
    artists: { items: ObjectsArtist[] }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageIndex($preview: Boolean, $locale: String!) {
          announcements: announcementCollection(
            preview: $preview
            locale: $locale
            where: { enabled: true }
          ) {
            items {
              title
              content {
                json
              }
            }
          }
          giftCard(preview: $preview, locale: $locale, id: "owqoj0fTsXPwPeo6VMb2Z") {
            imagesCollection(limit: 1) {
              items {
                url
                width
                height
              }
            }
          }
          objects: objectsObjectCollection(preview: $preview, locale: $locale, limit: 50) {
            items {
              sys {
                id
              }
              name
              imagesCollection(limit: 1) {
                items {
                  url
                  title
                  width
                  height
                }
              }
              priceSale
              sellOnline
              stock
              variationsCollection(limit: 50) {
                items {
                  priceSale
                  sellOnline
                  stock
                }
              }
            }
          }
          artists: objectsArtistCollection(preview: $preview, locale: $locale) {
            items {
              slug
              artist
              image {
                url
                width
                height
              }
            }
          }
        }
      `
    })
  })

  return {
    announcements: data.announcements,
    giftCard: data.giftCard,
    objects: {
      items: shuffle(data.objects.items.reduce(objectsReduceSell<ObjectsObject>, [])).slice(0, 5)
    },
    artists: sortArtists(data.artists)
  }
}

export const meta: MetaFunction = () => [
  { title: SEOTitle() },
  { name: 'keywords', content: SEOKeywords() },
  { name: 'description', content: 'Terra Delft Website' }
]
export let handle = {
  i18n: 'index'
}

const PageIndex = () => {
  const { t } = useTranslation('index')
  const data = useLoaderData<typeof loader>()

  return (
    <>
      {data.announcements?.items.length ? (
        <div className='lg:grid lg:grid-cols-6 gap-4 mb-4'>
          {data.announcements.items.map((announcement, index) => (
            <div
              key={index}
              className='lg:col-start-2 lg:col-span-4 border-2 border-dotted border-secondary px-4 py-2 mb-2'
            >
              <H3 className='text-center font-bold'>{announcement.title}</H3>
              <RichText content={announcement.content} assetWidth={200} />
            </div>
          ))}
        </div>
      ) : null}
      <div className='section-online-shop mb-3'>
        <H2>{t('online-shop')}</H2>
        <ListObjects giftCard={data.giftCard} objects={data.objects.items} />
      </div>
      <div className='section-collection'>
        <H2>{t('collection')}</H2>
        <div className='grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-4 lg:gap-y-8'>
          {data.artists.items.map(artist => (
            <div key={artist.artist} className='group cursor-pointer'>
              <Link to={`/artist/${artist.slug}`}>
                <ContentfulImage
                  alt={artist.artist}
                  image={artist.image}
                  width={164}
                  height={164}
                  quality={80}
                  behaviour='fill'
                  focusArea='faces'
                  className='group-hover:opacity-50'
                />
                <p className='mt-2 text-secondary text-center group-hover:underline underline-offset-4'>
                  {artist.artist}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Link to='/newsletter'>
        <button className='fixed bottom-0 right-4 px-4 py-2 bg-secondary text-background '>
          {t('newsletter')}
        </button>
      </Link>
    </>
  )
}

export default PageIndex
