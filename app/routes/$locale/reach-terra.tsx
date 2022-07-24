import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import RichText from '~/components/richText'
import i18next from '~/i18next.server'
import { cacheQuery, getReachTerra, ReachTerra } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'common')
    const meta = { title: t('pages.reach-terra') }

    return { meta, data: await getReachTerra(props) }
  })

export const meta: MetaFunction = ({ data: { meta, data } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: documentToPlainTextString(data.description.json).substring(
    0,
    199
  )
})

const PageReachTerra = () => {
  const { data } = useLoaderData<{ data: ReachTerra }>()

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <div>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2455.7534580179854!2d4.354894416068296!3d52.01137027972119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b5c3951554ed%3A0x4210dea3a13c91b5!2sGalerie%20Terra%20Delft!5e0!3m2!1sen!2sse!4v1588255098658!5m2!1sen!2sse'
              title='Google Maps'
              frameBorder='0'
              allowFullScreen
              className='w-full'
            />
          </div>
        </div>
        <div>
          <RichText content={data.description} assetWidth={471} />
        </div>
      </div>
    </>
  )
}

export default PageReachTerra
