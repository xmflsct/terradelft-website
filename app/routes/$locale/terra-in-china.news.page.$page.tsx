import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import ListNews from '~/components/list/news'
import Pagination from '~/components/pagination'
import cache from '~/utils/cache'
import { graphqlRequest, NewsNews } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const page = parseInt(args.params.page || '')
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }

  const perPage = 12

  const data = await cache<{
    news: {
      total: number
      items: Pick<NewsNews, 'sys' | 'title' | 'date' | 'image'>[]
    }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { limit: perPage, skip: perPage * (page - 1) },
      query: gql`
        query PageTerraInChinaNewsPage(
          $preview: Boolean
          $locale: String
          $limit: Int
          $skip: Int
        ) {
          news: newsNewsCollection(
            preview: $preview
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
  })
  const meta = await loadMeta(args, {
    titleKey: 'pages.terra-in-china-news-page',
    titleOptions: { page }
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
        page: { total: Math.round(data.news.total / perPage), current: page }
      }
    }
  })
}

export const meta: MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title])
  }
export let handle = { i18n: 'news' }

const PageTerraInChinaNewsPage = () => {
  const {
    data: {
      news: { page, items }
    }
  } = useLoaderData<typeof loader>()
  const { t } = useTranslation('news')

  return (
    <>
      <H1>{t('common:pages.terra-in-china-news-page', { page: page.current })}</H1>
      <ListNews news={items} />
      <Pagination basePath='/terra-in-china/news/page' page={page.current} total={page.total} />
    </>
  )
}

export default PageTerraInChinaNewsPage
