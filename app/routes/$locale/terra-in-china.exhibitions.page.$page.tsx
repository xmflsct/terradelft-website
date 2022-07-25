import { gql, QueryOptions } from '@apollo/client'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import { cacheQuery, EventsEvent } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: {
    exbhitions: {
      total: number
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
  }
}
export const loader: LoaderFunction = async props => {
  const page = parseInt(props.params.page || '') - 1
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }
  const perPage = 9

  const query: QueryOptions<{
    locale: string
    limit: number
    skip: number
    datetimeEnd_lt: string
  }> = {
    variables: {
      locale: props.params.locale!,
      limit: perPage,
      skip: perPage * page,
      datetimeEnd_lt: new Date().toISOString()
    },
    query: gql`
      query ExhibitionPage(
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
          where: { datetimeEnd_lt: $datetimeEnd_lt, terraInChina: true }
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
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, {
    titleKey: 'pages.terra-in-china-exhibitions-page',
    titleOptions: { page: props.params.page }
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

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    description: data.meta.title
  }

const PageTerraInChinaExhibitions = () => {
  const {
    data: {
      exbhitions: { total, items }
    }
  } = useLoaderData<Data>()
  const { page } = useParams()
  const { t } = useTranslation()

  return (
    <>
      <H1>{t('pages.terra-in-china-exhibitions-page', { page })}</H1>
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
      <Pagination
        basePath='/terra-in-china/exhibitions/page'
        page={page!}
        total={total}
      />
    </>
  )
}

export default PageTerraInChinaExhibitions
