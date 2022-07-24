import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H2 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import i18next from '~/i18next.server'
import {
  cacheQuery,
  EventsEvent,
  getTerraInChina,
  NewsNews
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'common')
    const meta = { title: t('pages.terra-in-china') }

    return { meta, data: await getTerraInChina(props) }
  })

export const meta: MetaFunction = ({ data: { meta } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: 'Terra Delft Website'
})
export let handle = {
  i18n: ['terraInChina', 'news']
}

const PageTerraInChina = () => {
  const { data } = useLoaderData<{
    data: {
      eventsEventCollection: { items: EventsEvent[] }
      newsNewsCollection: { items: NewsNews[] }
    }
  }>()
  const { t, i18n } = useTranslation('terraInChina')

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <H2>{t('heading.events')}</H2>
          {data.eventsEventCollection.items.map(event => (
            <div key={event.sys.id} className='mb-8'>
              <div>
                <Link to={`/exhibition/${event.sys.id}`} className='text-lg'>
                  {event.image && (
                    <ContentfulImage
                      alt={event.name}
                      image={event.image}
                      width={471}
                      height={265}
                      quality={80}
                      behaviour='fill'
                    />
                  )}
                  {event.name}
                </Link>
                <div className='current-type'>
                  {/* {node.type.map(t => (
                    <Badge variant='info' key={t.name}>
                      {t.name}
                    </Badge>
                  ))} */}
                </div>
                <ExhibitionInformation event={event} type='current' />
              </div>
            </div>
          ))}
          <Link to='/terra-in-china/exhibitions/page/1'>
            {t('view-all.events')}
          </Link>
        </div>
        <div>
          <H2>{t('heading.news')}</H2>
          {data.newsNewsCollection.items.map(news => (
            <div key={news.sys.id} className='mb-8'>
              <div>
                <Link to={`/news/${news.sys.id}`} className='text-lg'>
                  {news.image && (
                    <ContentfulImage
                      alt={news.title}
                      image={news.image}
                      width={471}
                      height={265}
                      quality={80}
                      behaviour='fill'
                    />
                  )}
                  {news.title}
                </Link>
                <p>
                  {t('news:published', {
                    date: new Date(news.date).toLocaleDateString(
                      i18n.language,
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }
                    )
                  })}
                </p>
              </div>
            </div>
          ))}
          <Link to='/terra-in-china/news/page/1'>
            {t('view-all.news')}
          </Link>
        </div>
      </div>
    </>
  )
}

export default PageTerraInChina
