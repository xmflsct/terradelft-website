import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { data as loaderData, LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import { H1 } from '~/components/globals'
import ListNews from '~/components/list/news'
import Pagination from '~/components/pagination'
import cache from '~/utils/cache'
import { graphqlRequest, NewsNews } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const page = parseInt(args.params.page || '')
  if (page < 0) {
    throw loaderData(null, { status: 404 })
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
        query PageNewsPage($preview: Boolean, $locale: String, $limit: Int, $skip: Int) {
          news: newsNewsCollection(
            preview: $preview
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
                title
                width
                height
              }
            }
          }
        }
      `
    })
  })
  const meta = await loadMeta(args, {
    titleKey: 'pages.news',
    titleOptions: { context: 'page', page }
  })

  if (!data?.news?.items?.length) {
    throw loaderData(null, { status: 404 })
  }
  return {
    meta,
    data: {
      ...data,
      news: {
        ...data.news,
        page: { total: Math.round(data.news.total / perPage), current: page }
      }
    }
  }
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta && [
    ...linkHref(`news/page/${params.page}`, params.locale),
    { title: SEOTitle(data.meta.title) },
    { name: 'keywords', content: SEOKeywords([data.meta.title]) }
  ]
export let handle = { i18n: 'news' }

const PageNewsPage = () => {
  const {
    data: {
      news: { page, items }
    }
  } = useLoaderData<typeof loader>()
  const { t } = useTranslation('news')

  return (
    <>
      <H1>{t('common:pages.news', { context: 'page', page: page.current })}</H1>
      <ListNews news={items} />
      <Pagination basePath='/news/page' page={page.current} total={page.total} />
    </>
  )
}

export default PageNewsPage
