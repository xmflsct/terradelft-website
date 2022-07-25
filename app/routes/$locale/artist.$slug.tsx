import { gql, QueryOptions } from '@apollo/client'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import type { Person, WithContext } from 'schema-dts'
import { H1, H2 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { cacheQuery, ObjectsArtist, richTextLinks } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Artist = Pick<
  ObjectsArtist,
  'artist' | 'image' | 'biography' | 'linkedFrom'
>
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string; slug: string }> = {
    variables: { locale: props.params.locale!, slug: props.params.slug! },
    query: gql`
      query Artist($locale: String, $slug: String) {
        artists: objectsArtistCollection (locale: $locale, limit: 1, where: {slug: $slug}) {
          items {
            artist
            image {
              url
            }
            biography {
              json
              ${richTextLinks}
            }
            linkedFrom {
              objectsObjectCollection (locale: "nl") {
                items {
                  sys {
                    id
                  }
                  name (locale: $locale)
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
  }
  const data = await cacheQuery<{
    artists: { items: Artist[] }
  }>(query, 30, props)

  if (!data?.artists?.items?.length) {
    throw json('Not Found', { status: 404 })
  }
  return json({
    data: data.artists.items[0]
  })
}

export const meta: MetaFunction = ({ data }: { data: Artist }) =>
  data && {
    title: SEOTitle(data.artist),
    keywords: SEOKeywords([data.artist]),
    ...(data.biography && {
      description: documentToPlainTextString(data.biography.json).substring(
        0,
        199
      )
    })
  }
export const handle = {
  i18n: 'artist',
  structuredData: ({ data }: { data: Artist }): WithContext<Person> =>
    data && {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.artist,
      image: data.image.url,
      ...(data.biography && {
        description: documentToPlainTextString(data.biography.json).substring(
          0,
          199
        )
      })
    }
}

const PageArtist = () => {
  const { data: artist } = useLoaderData<{ data: Artist }>()
  const { t } = useTranslation('artist')

  return (
    <>
      <H1>{artist.artist}</H1>
      <div className='flex flex-row gap-4 mb-8'>
        <div className='flex-1'>
          <ContentfulImage
            alt={artist.artist}
            image={artist.image}
            width={400}
            quality={85}
          />
        </div>
        <RichText
          content={artist.biography}
          className='flex-2'
          assetWidth={628}
        />
      </div>
      {artist.linkedFrom.objectsObjectCollection.items.length ? (
        <>
          <H2>{t('objects-by', { artist: artist.artist })}</H2>
          <GridObjectDefault
            objects={artist.linkedFrom.objectsObjectCollection.items}
          />
        </>
      ) : null}
    </>
  )
}

export default PageArtist
