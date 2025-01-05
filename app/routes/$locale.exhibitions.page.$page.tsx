import { data as loaderData, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import ListExhibitions from '~/components/list/exhibitions'
import Pagination from '~/components/pagination'
import cache from '~/utils/cache'
import { EventsEvent, graphqlRequest } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderFunctionArgs) => {
  const page = parseInt(args.params.page || '')
  if (page < 0) {
    throw loaderData(null, { status: 404 })
  }

  const perPage = 12

  const data = await cache<{
    exbhitions: { total: number; items: EventsEvent[] }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      variables: {
        limit: perPage,
        skip: perPage * (page - 1),
        datetimeEnd_lt: new Date().toISOString()
      },
      query: gql`
        query PageExhibitionsPage(
          $preview: Boolean
          $locale: String
          $limit: Int
          $skip: Int
          $datetimeEnd_lt: DateTime
        ) {
          exbhitions: eventsEventCollection(
            preview: $preview
            locale: $locale
            order: datetimeStart_DESC
            limit: $limit
            skip: $skip
            where: { datetimeEnd_lt: $datetimeEnd_lt }
          ) {
            total
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
        }
      `
    })
  })
  const meta = await loadMeta(args, {
    titleKey: 'pages.exhibitions',
    titleOptions: { context: 'page', page }
  })

  if (!data?.exbhitions?.items?.length) {
    throw loaderData(null, { status: 404 })
  }
  return {
    meta,
    data: {
      ...data,
      exbhitions: {
        ...data.exbhitions,
        page: {
          total: Math.round(data.exbhitions.total / perPage),
          current: page
        }
      }
    }
  }
}

export const meta: MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && [
    { title: SEOTitle(data.meta.title) },
    { name: 'keywords', content: SEOKeywords([data.meta.title]) },
    { name: 'description', content: data.meta.title }
  ]
export let handle = { i18n: 'exhibition' }

const PageExhibitionsPage: React.FC = () => {
  const {
    data: {
      exbhitions: { page, items }
    }
  } = useLoaderData<typeof loader>()
  const { t } = useTranslation('exhibition')

  return (
    <>
      <H1>{t('common:pages.exhibitions', { context: 'page', page: page.current })}</H1>
      <ListExhibitions exhibitions={items} />
      <Pagination basePath='/exhibitions/page' page={page.current} total={page.total} />
    </>
  )
}

export default PageExhibitionsPage
