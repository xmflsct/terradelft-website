import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H2 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import cache from '~/utils/cache'
import { EventsEvent, graphqlRequest, NewsNews } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const data = await cache<{
    exhibitions: { items: EventsEvent[] }
    news: { items: NewsNews[] }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageTerraInChina($preview: Boolean, $locale: String) {
          exhibitions: eventsEventCollection(
            preview: $preview
            locale: $locale
            where: { terraInChina: true }
            limit: 6
            order: datetimeEnd_DESC
          ) {
            items {
              sys {
                id
              }
              image {
                url
                title
                width
                height
              }
              name
              datetimeStart
              datetimeEnd
              typeCollection {
                items {
                  name
                }
              }
            }
          }
          news: newsNewsCollection(
            preview: $preview
            locale: $locale
            where: { terraInChina: true }
            limit: 6
            order: date_DESC
          ) {
            items {
              sys {
                id
              }
              image {
                url
              }
              title
              date
            }
          }
        }
      `
    })
  })
  const meta = await loadMeta(args, { titleKey: 'pages.terra-in-china' })

  return json({ meta, data })
}

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && [
    {
      title: SEOTitle(data.meta.title),
      keywords: SEOKeywords([data.meta.title])
    }
  ]
export let handle = { i18n: ['china', 'news'] }

const PageTerraInChina = () => {
  const { data } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation('china')

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <H2>{t('heading.events')}</H2>
          {data.exhibitions.items.map(exhibition => (
            <div key={exhibition.sys.id} className='mb-8'>
              <div>
                <Link to={`/exhibition/${exhibition.sys.id}`}>
                  {exhibition.image && (
                    <ContentfulImage
                      alt={exhibition.name}
                      image={exhibition.image}
                      width={471}
                      height={265}
                      quality={80}
                      behaviour='fill'
                    />
                  )}
                  <p className='text-lg truncate mt-1'>{exhibition.name}</p>
                </Link>
                <ExhibitionInformation exhibition={exhibition} />
              </div>
            </div>
          ))}
          <Link to='/terra-in-china/exhibitions/page/1'>{t('view-all.events')}</Link>
        </div>
        <div>
          <H2>{t('heading.news')}</H2>
          {data.news.items.map(news => (
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
                  <p className='text-lg truncate mt-1'>{news.title}</p>
                </Link>
                <p>
                  {t('news:published', {
                    date: new Date(news.date).toLocaleDateString(i18n.language, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  })}
                </p>
              </div>
            </div>
          ))}
          <Link to='/terra-in-china/news/page/1'>{t('view-all.news')}</Link>
        </div>
      </div>
    </>
  )
}

export default PageTerraInChina
