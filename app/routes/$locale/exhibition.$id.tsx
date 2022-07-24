import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import type { Event, WithContext } from 'schema-dts'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { EventsEvent, getEventsEvent } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props => {
  return await getEventsEvent(props)
}

export const meta: MetaFunction = ({ data }: { data: EventsEvent }) => ({
  title: SEOTitle(data.name),
  keywords: SEOKeywords([data.name]),
  ...(data.description && {
    description: documentToPlainTextString(data.description.json).substring(
      0,
      199
    )
  })
})
export const handle = {
  structuredData: (data: EventsEvent): WithContext<Event> => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    startDate: data.datetimeStart,
    endDate: data.datetimeEnd,
    ...(data.image && { image: data.image.url }),
    description:
      data.description &&
      documentToPlainTextString(data.description.json).substring(0, 199),
    ...(data.organizerCollection?.items.length && {
      organizer: data.organizerCollection.items.map(organizer => ({
        '@type': 'Organization',
        name: organizer.name
      }))
    }),
    ...(data.locationCollection?.items.length && {
      location: data.locationCollection.items.map(location => ({
        '@type': 'Place',
        name: location.name,
        address: location.address,
        latitude: location.location.lat,
        longitude: location.location.lon
      }))
    })
  })
}

const PageExhibition = () => {
  const eventsEvent = useLoaderData<EventsEvent>()

  return (
    <div className='grid grid-cols-6 gap-4'>
      <H1
        className={eventsEvent.image ? 'col-span-6' : 'col-span-4 col-start-2'}
      >
        {eventsEvent.name}
      </H1>
      {eventsEvent.image && (
        <ContentfulImage
          alt={eventsEvent.name}
          image={eventsEvent.image}
          width={309}
          quality={80}
          className='col-span-2'
        />
      )}
      <div
        className={eventsEvent.image ? 'col-span-4' : 'col-span-4 col-start-2'}
      >
        <ExhibitionInformation event={eventsEvent} />
        <RichText
          content={eventsEvent.description}
          className='mt-2'
          assetWidth={634}
        />
      </div>
    </div>
  )
}

export default PageExhibition
