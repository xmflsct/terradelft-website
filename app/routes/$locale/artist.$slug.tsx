import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import type { Person, WithContext } from 'schema-dts'
import { H1, H2 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import ListObjects, { LIST_OBJECT_DETAILS } from '~/components/list/objects'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import {
  graphqlRequest,
  ObjectsArtist,
  RICH_TEXT_LINKS
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const data = await cache<{ artists: { items: ObjectsArtist[] } }>({
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { slug: args.params.slug! },
      query: gql`
        ${LIST_OBJECT_DETAILS}
        query PageArtist($locale: String, $slug: String) {
          artists: objectsArtistCollection (
            locale: $locale,
            limit: 1,
            where: {slug: $slug}
          ) {
            items {
              artist
              image {
                url
              }
              biography {
                json
                ${RICH_TEXT_LINKS}
              }
              linkedFrom {
                objectsObjectCollection(locale: "nl") {
                  items {
                    ...ListObjectDetails
                  }
                }
              }
            }
          }
        }
      `
    })
  })

  if (!data?.artists?.items?.length) {
    throw json('Not Found', { status: 404 })
  }
  return json(data.artists.items[0])
}

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(data.artist),
  keywords: SEOKeywords([data.artist]),
  ...(data.biography && {
    description: documentToPlainTextString(data.biography.json).substring(
      0,
      199
    )
  })
})
export const handle = {
  i18n: 'artist',
  structuredData: ({
    data
  }: {
    data: LoaderData<typeof loader>
  }): WithContext<Person> =>
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
  const artist = useLoaderData<typeof loader>()
  const { t } = useTranslation('artist')

  return (
    <>
      <H1>{artist.artist}</H1>
      <div className='flex flex-col lg:flex-row gap-4 mb-8'>
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
          <ListObjects
            objects={artist.linkedFrom.objectsObjectCollection.items}
          />
        </>
      ) : null}
    </>
  )
}

export default PageArtist
