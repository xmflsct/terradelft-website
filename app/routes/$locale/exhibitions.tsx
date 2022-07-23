import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import EventInformation from '~/components/event/information'
import { H2, H3 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import i18next from '~/i18next.server'
import { cacheQuery, EventsEvent, getEventsEvents } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'pageExhibitions')
    const meta = { title: t('name') }

    const data = await getEventsEvents(props)
    return { meta, data }
  })

export const meta: MetaFunction = ({ data: { meta } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: 'Exhibitions'
})
export let handle = {
  i18n: 'pageExhibitions'
}

const PageExhibitions = () => {
  const {
    data: { items }
  } = useLoaderData<{ data: { items: EventsEvent[] } }>()
  const { t, i18n } = useTranslation('pageExhibitions')

  return (
    <>
      <div className='grid grid-cols-6 gap-4 mb-4'>
        <div className='col-span-2'>
          <H2>{t('content.heading.upcoming')}</H2>
          {items
            .filter(event => new Date(event.datetimeStart) > new Date())
            .map(event => (
              <div key={event.sys.id} className='mb-4'>
                <div>
                  <Link to={`/exhibition/${event.sys.id}`}>
                    <p className='text-lg'>{event.name}</p>
                  </Link>
                  <EventInformation event={event} type='upcoming' />
                </div>
              </div>
            ))}
        </div>
        <div className='col-span-4'>
          <H2>{t('content.heading.current')}</H2>
          {items
            .filter(
              event =>
                new Date(event.datetimeEnd) >= new Date() &&
                new Date(event.datetimeStart) <= new Date()
            )
            .map(event => {
              return (
                <div key={event.sys.id} className='flex flex-row gap-4'>
                  {event.image && (
                    <ContentfulImage
                      alt={event.name}
                      image={event.image}
                      width={309}
                      quality={80}
                      className='flex-1'
                    />
                  )}
                  <div className='flex-1'>
                    <div className='current-type'>
                      {/* {node.type.map(t => (
                        <Badge variant='info' key={t.name}>
                          {t.name}
                        </Badge>
                      ))} */}
                    </div>
                    <Link to={`/exhibition/${event.sys.id}`}>
                      <H3>{event.name}</H3>
                    </Link>
                    <EventInformation event={event} type='current' />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <div>
        <Link to='/exhibitions/page/1'>{t('content.view-all')}</Link>
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
          {t('content.archive-wordpress')}{' '}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </a>
      </div>
    </>
  )
}

export default PageExhibitions
