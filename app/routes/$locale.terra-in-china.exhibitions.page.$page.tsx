import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/cloudflare'
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

export const loader = async (args: LoaderArgs) => {
  const page = parseInt(args.params.page || '')
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }

  const perPage = 9

  const data = await cache<{
    exbhitions: {
      total: number
      items: EventsEvent[]
    }
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
        query PageTerraInChinaExhibitionsPage(
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
            where: { datetimeEnd_lt: $datetimeEnd_lt, terraInChina: true }
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
    titleKey: 'pages.terra-in-china-exhibitions-page',
    titleOptions: { page }
  })

  if (!data?.exbhitions?.items?.length) {
    throw json('Not Found', { status: 404 })
  }
  return json({
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
  })
}

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && [
    {
      title: SEOTitle(data.meta.title),
      keywords: SEOKeywords([data.meta.title])
    }
  ]

const PageTerraInChinaExhibitionsPage = () => {
  const {
    data: {
      exbhitions: { page, items }
    }
  } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <>
      <H1>{t('pages.terra-in-china-exhibitions-page', { page: page.current })}</H1>
      <ListExhibitions exhibitions={items} />
      <Pagination
        basePath='/terra-in-china/exhibitions/page'
        page={page.current}
        total={page.total}
      />
    </>
  )
}

export default PageTerraInChinaExhibitionsPage
