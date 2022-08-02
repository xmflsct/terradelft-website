import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import { cacheQuery, NewsNews } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const page = parseInt(args.params.page || '') - 1
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }

  const perPage = 9

  const data = await cacheQuery<{
    news: {
      total: number
      items: Pick<NewsNews, 'sys' | 'title' | 'date' | 'image'>[]
    }
  }>({
    ...args,
    variables: { limit: perPage, skip: perPage * page },
    query: gql`
      query PageTerraInChinaNewsPage($locale: String, $limit: Int, $skip: Int) {
        news: newsNewsCollection(
          locale: $locale
          order: date_DESC
          limit: $limit
          skip: $skip
          where: { terraInChina: true }
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
  })
  const meta = await loadMeta(args, {
    titleKey: 'pages.terra-in-china-news-page',
    titleOptions: { page: args.params.page }
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

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(data.meta.title),
  keywords: SEOKeywords([data.meta.title]),
  description: data.meta.title
})
export let handle = { i18n: 'news' }

const PageTerraInChinaNewsPage = () => {
  const {
    data: {
      news: { total, items }
    }
  } = useLoaderData<typeof loader>()
  const { page } = useParams()
  const { t, i18n } = useTranslation('news')

  return (
    <>
      <H1>{t('common:pages.terra-in-china-news-page', { page })}</H1>
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
      <Pagination
        basePath='/terra-in-china/news/page'
        page={page!}
        total={total}
      />
    </>
  )
}

export default PageTerraInChinaNewsPage
