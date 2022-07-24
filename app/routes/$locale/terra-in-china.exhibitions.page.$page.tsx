import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import i18next from '~/i18next.server'
import { cacheQuery, EventsEvent, getEventsEvents } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'common')
    const meta = {
      title: t('pages.terra-in-china-exhibitions-page', {
        page: props.params.page
      })
    }

    const data = await getEventsEvents({
      ...props,
      params: { ...props.params, terraInChina: 'true' }
    })
    return { meta, data }
  })

export const meta: MetaFunction = ({ data: { meta } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: 'Terra in China exhibitions'
})
export let handle = {
  i18n: 'terraInChina'
}

const PageTerraInChinaExhibitions = () => {
  const {
    data: { total, items }
  } = useLoaderData<{
    data: { total: number; items: EventsEvent[] }
  }>()
  const { page } = useParams()
  const { t } = useTranslation()

  return (
    <>
      <H1>{t('common:pages.terra-in-china-exhibitions-page', { page })}</H1>
      <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
        {items?.map(event => {
          return (
            <div key={event.sys.id}>
              <Link to={`/exhibition/${event.sys.id}`}>
                <ContentfulImage
                  alt={event.name}
                  image={event.image}
                  width={309}
                  height={309}
                  quality={80}
                  behaviour='fill'
                  focusArea='faces'
                  className='mb-2'
                />
                <p className='text-lg truncate'>{event.name}</p>
              </Link>
              <ExhibitionInformation event={event} type='current' />
            </div>
          )
        })}
      </div>
      <Pagination
        basePath='/terra-in-china/exhibitions/page'
        page={page!}
        total={total}
      />
    </>
  )
}

export default PageTerraInChinaExhibitions
