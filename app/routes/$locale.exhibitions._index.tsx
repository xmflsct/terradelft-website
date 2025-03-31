import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import ExhibitionInformation from '~/components/exhibition/information'
import { H2, H3 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import cache from '~/utils/cache'
import { EventsEvent, graphqlRequest } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const data = await cache<{
    exhibitions: { total: number; items: EventsEvent[] }
  }>({
    ttlMinutes: 10080,
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { datetimeEnd_gte: new Date().toISOString() },
      query: gql`
        query PageExhibitions($preview: Boolean, $locale: String!, $datetimeEnd_gte: DateTime) {
          exhibitions: eventsEventCollection(
            preview: $preview
            locale: $locale
            order: datetimeStart_ASC
            where: { datetimeEnd_gte: $datetimeEnd_gte }
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
  const meta = await loadMeta(args, { titleKey: 'pages.exhibitions' })
  return { meta, data }
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta
    ? [
        ...linkHref('exhibitions', params.locale),
        { title: SEOTitle(data.meta.title) },
        { name: 'keywords', content: SEOKeywords([data.meta.title]) },
        { name: 'description', content: data.meta.title }
      ]
    : []
export let handle = { i18n: 'exhibition' }

const PageExhibitions = () => {
  const {
    data: { exhibitions }
  } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation('exhibition')

  return (
    <>
      <div className='grid grid-cols-6 gap-4 mb-4'>
        <div className='col-span-6 lg:col-span-2 order-2 lg:order-1'>
          <H2>{t('upcoming')}</H2>
          {exhibitions.items
            .filter(exhibition => new Date(exhibition.datetimeStart) > new Date())
            .map(exhibition => (
              <div key={exhibition.sys.id} className='mb-4'>
                <div>
                  <Link to={`/exhibition/${exhibition.sys.id}`}>
                    <p className='text-lg'>{exhibition.name}</p>
                  </Link>
                  <ExhibitionInformation exhibition={exhibition} type='upcoming' />
                </div>
              </div>
            ))}
        </div>
        <div className='col-span-6 lg:col-span-4 order-1 lg:order-2'>
          <H2>{t('current')}</H2>
          <div className='flex flex-col gap-4 lg:gap-8'>
            {exhibitions.items
              .filter(
                exbhition =>
                  new Date(exbhition.datetimeEnd) >= new Date() &&
                  new Date(exbhition.datetimeStart) <= new Date()
              )
              .map(exhibition => {
                return (
                  <div key={exhibition.sys.id} className='flex flex-col lg:flex-row gap-4'>
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
                      <ExhibitionInformation exhibition={exhibition} type='current' />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
      <div>
        <Link to='/exhibitions/page/1'>{t('archive')}</Link>
      </div>
    </>
  )
}

export default PageExhibitions
