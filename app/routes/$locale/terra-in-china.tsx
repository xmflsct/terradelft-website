import { gql, QueryOptions } from '@apollo/client'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H2 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import { cacheQuery, EventsEvent, NewsNews } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: {
    exhibitions: {
      items: Pick<
        EventsEvent,
        | 'sys'
        | 'image'
        | 'name'
        | 'datetimeStart'
        | 'datetimeEnd'
        | 'typeCollection'
      >[]
    }
    news: { items: Pick<NewsNews, 'sys' | 'image' | 'title' | 'date'>[] }
  }
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string }> = {
    variables: { locale: props.params.locale! },
    query: gql`
      query Index($locale: String) {
        exhibitions: eventsEventCollection(
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
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, { titleKey: 'pages.terra-in-china' })

  return json({ meta, data })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    description: data.meta.title
  }
export let handle = {
  i18n: ['terraInChina', 'news']
}

const PageTerraInChina = () => {
  const { data } = useLoaderData<Data>()
  const { t, i18n } = useTranslation('terraInChina')

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <H2>{t('heading.events')}</H2>
          {data.exhibitions.items.map(exhibition => (
            <div key={exhibition.sys.id} className='mb-8'>
              <div>
                <Link
                  to={`/exhibition/${exhibition.sys.id}`}
                  className='text-lg'
                >
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
                  {exhibition.name}
                </Link>
                <ExhibitionInformation exhibition={exhibition} type='current' />
              </div>
            </div>
          ))}
          <Link to='/terra-in-china/exhibitions/page/1'>
            {t('view-all.events')}
          </Link>
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
          <Link to='/terra-in-china/news/page/1'>{t('view-all.news')}</Link>
        </div>
      </div>
    </>
  )
}

export default PageTerraInChina
