import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import { cacheQuery, EventsEvent } from '~/utils/contentful'
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
    exbhitions: { total: number; items: EventsEvent[] }
  }>({
    ...args,
    variables: {
      limit: perPage,
      skip: perPage * page,
      datetimeEnd_lt: new Date().toISOString()
    },
    query: gql`
      query PageExhibitionsPage(
        $locale: String
        $limit: Int
        $skip: Int
        $datetimeEnd_lt: DateTime
      ) {
        exbhitions: eventsEventCollection(
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
  const meta = await loadMeta(args, {
    titleKey: 'pages.exhibitions',
    titleOptions: { context: 'page', page: args.params.page }
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
        total: Math.round(data.exbhitions.total / perPage)
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
export let handle = { i18n: 'exhibition' }

const PageExhibitionsPage: React.FC = () => {
  const {
    data: {
      exbhitions: { total, items }
    }
  } = useLoaderData<typeof loader>()
  const { page } = useParams()
  const { t } = useTranslation('exhibition')

  return (
    <>
      <H1>{t('common:pages.exhibitions', { context: 'page', page })}</H1>
      <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
        {items?.map(exhibition => {
          return (
            <div key={exhibition.sys.id}>
              <Link to={`/exhibition/${exhibition.sys.id}`}>
                <ContentfulImage
                  alt={exhibition.name}
                  image={exhibition.image}
                  width={309}
                  height={309}
                  quality={80}
                  behaviour='fill'
                  focusArea='faces'
                  className='mb-2'
                />
                <p className='text-lg truncate'>{exhibition.name}</p>
              </Link>
              <ExhibitionInformation exhibition={exhibition} type='current' />
            </div>
          )
        })}
      </div>
      <Pagination basePath='/exhibitions/page' page={page!} total={total} />
    </>
  )
}

export default PageExhibitionsPage
