import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { shuffle, sortBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { H2 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import {
  cached,
  cacheQuery,
  getObjectsArtists,
  getObjectsObjects,
  ObjectsArtist,
  ObjectsObject
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const headers = () => {
  return {
    'X-Cached': cached
  }
}
export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const objectsObjects = shuffle(await getObjectsObjects(props)).slice(0, 6)
    const objectsArtists = await getObjectsArtists(props)
    return {
      objectsObjects,
      objectsArtists: sortBy(
        objectsArtists,
        ({ artist }) => artist.match(new RegExp(/\b(\w+)\W*$/))![0]
      )
    }
  })

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
  const data = useLoaderData<{
    objectsObjects: ObjectsObject[]
    objectsArtists: ObjectsArtist[]
  }>()

  return (
    <>
      <div className='section-online-shop mb-3'>
        <H2>{t('online-shop')}</H2>
        <GridObjectDefault
          objects={data.objectsObjects}
          // giftCard={data.giftCard}
        />
      </div>
      <div className='section-collection'>
        <H2>{t('collection')}</H2>
        <div className='grid grid-cols-6 gap-x-4 gap-y-8'>
          {data.objectsArtists.map(artist => (
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
