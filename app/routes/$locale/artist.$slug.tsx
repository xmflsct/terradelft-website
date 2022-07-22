import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import type { Person, WithContext } from 'schema-dts'
import { H1, H2 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { getObjectsArtist, ObjectsArtist } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props => {
  return await getObjectsArtist(props)
}

export const meta: MetaFunction = ({ data }: { data: ObjectsArtist }) => ({
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
  structuredData: (data: ObjectsArtist): WithContext<Person> => ({
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
  })
}

const PageArtist = () => {
  const objectsArtist = useLoaderData<ObjectsArtist>()

  return (
    <>
      <H1>{objectsArtist.artist}</H1>
      <div className='flex flex-row gap-4 mb-8'>
        <div className='flex-1'>
          <ContentfulImage
            alt={objectsArtist.artist}
            image={objectsArtist.image}
            width={400}
            quality={85}
          />
        </div>
        <RichText
          content={objectsArtist.biography}
          className='flex-2'
          assetWidth={628}
        />
      </div>
      {objectsArtist.linkedFrom.objectsObjectCollection.items.length ? (
        <>
          <H2>Objects by {objectsArtist.artist}</H2>
          <GridObjectDefault
            objects={objectsArtist.linkedFrom.objectsObjectCollection.items}
          />
        </>
      ) : null}
    </>
  )
}

export default PageArtist
