import { gql, QueryOptions } from '@apollo/client'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import { cacheQuery, NewsNews } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: {
    news: {
      total: number
      items: Pick<NewsNews, 'sys' | 'title' | 'date' | 'image'>[]
    }
  }
}
export const loader: LoaderFunction = async props => {
  const page = parseInt(props.params.page || '') - 1
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }
  const perPage = 9

  const query: QueryOptions<{ locale: string; limit: number; skip: number }> = {
    variables: {
      locale: props.params.locale!,
      limit: perPage,
      skip: perPage * page
    },
    query: gql`
      query NewsPage($locale: String, $limit: Int, $skip: Int) {
        news: newsNewsCollection(
          locale: $locale
          order: date_DESC
          limit: $limit
          skip: $skip
        ) {
          total
          items {
            sys {
              id
            }
            title
            date
            image {
              url
            }
          }
        }
      }
    `
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, {
    titleKey: 'pages.news',
    titleOptions: { context: 'page', page: props.params.page }
  })

  if (!data?.news?.items?.length) {
    throw json('Not Found', { status: 404 })
  }
  return json({
    meta,
    data: {
      ...data,
      news: {
        ...data.news,
        total: Math.round(data.news.total / perPage)
      }
    }
  })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    description: 'News'
  }
export let handle = {
  i18n: 'news'
}

const PageNews = () => {
  const {
    data: {
      news: { total, items }
    }
  } = useLoaderData<Data>()
  const { page } = useParams()
  const { t, i18n } = useTranslation('news')

  return (
    <>
      <H1>{t('common:pages.news', { context: 'page', page })}</H1>
      <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
        {items?.map(news => {
          return (
            <div key={news.sys.id}>
              <Link to={`/news/${news.sys.id}`}>
                <ContentfulImage
                  alt={news.title}
                  image={news.image}
                  width={309}
                  height={309}
                  quality={80}
                  behaviour='fill'
                  focusArea='faces'
                  className='mb-2'
                />
                <p className='text-lg truncate'>{news.title}</p>
              </Link>
              <p>
                {t('published', {
                  date: new Date(news.date).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                })}
              </p>
            </div>
          )
        })}
      </div>
      <Pagination basePath='/news/page' page={page!} total={total} />
    </>
  )
}

export default PageNews
