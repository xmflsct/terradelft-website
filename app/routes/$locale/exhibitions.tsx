import { gql, QueryOptions } from '@apollo/client'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ExhibitionInformation from '~/components/exhibition/information'
import { H2, H3 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import { cacheQuery, EventsEvent } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: {
    exhibitions: {
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
  const query: QueryOptions<{ locale: string; datetimeEnd_gte: string }> = {
    variables: {
      locale: props.params.locale!,
      datetimeEnd_gte: new Date().toISOString()
    },
    query: gql`
      query Index($locale: String, $datetimeEnd_gte: DateTime) {
        exhibitions: eventsEventCollection(
          locale: $locale
          order: datetimeStart_DESC
          where: { datetimeEnd_gte: $datetimeEnd_gte }
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
  const meta = await loadMeta(props, { titleKey: 'pages.exhibitions' })

  return json({ meta, data })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    description: data.meta.title
  }
export let handle = {
  i18n: 'exhibition'
}

const PageExhibitions = () => {
  const {
    data: { exhibitions }
  } = useLoaderData<Data>()
  const { t, i18n } = useTranslation('exhibition')

  return (
    <>
      <div className='grid grid-cols-6 gap-4 mb-4'>
        <div className='col-span-2'>
          <H2>{t('upcoming')}</H2>
          {exhibitions.items
            .filter(
              exhibition => new Date(exhibition.datetimeStart) > new Date()
            )
            .map(exhibition => (
              <div key={exhibition.sys.id} className='mb-4'>
                <div>
                  <Link to={`/exhibition/${exhibition.sys.id}`}>
                    <p className='text-lg'>{exhibition.name}</p>
                  </Link>
                  <ExhibitionInformation
                    exhibition={exhibition}
                    type='upcoming'
                  />
                </div>
              </div>
            ))}
        </div>
        <div className='col-span-4'>
          <H2>{t('current')}</H2>
          {exhibitions.items
            .filter(
              exbhition =>
                new Date(exbhition.datetimeEnd) >= new Date() &&
                new Date(exbhition.datetimeStart) <= new Date()
            )
            .map(exhibition => {
              return (
                <div key={exhibition.sys.id} className='flex flex-row gap-4'>
                  {exhibition.image && (
                    <ContentfulImage
                      alt={exhibition.name}
                      image={exhibition.image}
                      width={309}
                      quality={80}
                      className='flex-1'
                    />
                  )}
                  <div className='flex-1'>
                    <Link to={`/exhibition/${exhibition.sys.id}`}>
                      <H3>{exhibition.name}</H3>
                    </Link>
                    <ExhibitionInformation
                      exhibition={exhibition}
                      type='current'
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <div>
        <Link to='/exhibitions/page/1'>{t('archive')}</Link>
      </div>
      <div>
        <a
          href={
            i18n.language.startsWith('en')
              ? 'https://archive2.terra-delft.nl/exhibition/archive/'
              : 'https://archive2.terra-delft.nl/nl/expositie/archief/'
          }
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('archive', { context: 'wordpress' })}{' '}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </a>
      </div>
    </>
  )
}

export default PageExhibitions
