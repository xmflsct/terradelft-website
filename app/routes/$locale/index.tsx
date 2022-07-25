import { gql, QueryOptions } from '@apollo/client'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { shuffle } from 'lodash'
import { useTranslation } from 'react-i18next'
import { H2 } from '~/components/globals'
import GridObjectDefault, {
  objectsReduceSell
} from '~/components/grids/grid-object-default'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import { cacheQuery, ObjectsArtist, ObjectsObject } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import sortArtists from '~/utils/sortArtists'

type Data = {
  objects: {
    items: Pick<
      ObjectsObject,
      | 'sys'
      | 'name'
      | 'imagesCollection'
      | 'priceSale'
      | 'sellOnline'
      | 'stock'
      | 'variationsCollection'
    >[]
  }
  artists: { items: Pick<ObjectsArtist, 'slug' | 'artist' | 'image'>[] }
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string }> = {
    variables: { locale: props.params.locale! },
    query: gql`
      query Index($locale: String) {
        objects: objectsObjectCollection(locale: $locale, limit: 50) {
          items {
            sys {
              id
            }
            name
            imagesCollection(limit: 1) {
              items {
                url
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
        artists: objectsArtistCollection(locale: $locale) {
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
  }
  const data = await cacheQuery<Data>(query, 30, props)

  return json({
    objects: {
      ...data.objects,
      items: shuffle(data.objects.items.reduce(objectsReduceSell, [])).slice(
        0,
        6
      )
    },
    artists: sortArtists(data.artists)
  })
}

export const meta: MetaFunction = () => ({
  title: SEOTitle(),
  keywords: SEOKeywords(),
  description: 'Terra Delft Website'
})
export let handle = {
  i18n: 'index'
}

const PageIndex = () => {
  const { t } = useTranslation('index')
  const data = useLoaderData<Data>()

  return (
    <>
      <div className='section-online-shop mb-3'>
        <H2>{t('online-shop')}</H2>
        <GridObjectDefault
          objects={data.objects.items}
          // giftCard={data.giftCard}
        />
      </div>
      <div className='section-collection'>
        <H2>{t('collection')}</H2>
        <div className='grid grid-cols-6 gap-x-4 gap-y-8'>
          {data.artists.items.map(artist => (
            <div key={artist.artist} className='group cursor-pointer'>
              <Link to={`/artist/${artist.slug}`}>
                <ContentfulImage
                  alt={artist.artist}
                  image={artist.image}
                  width={148}
                  height={148}
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
