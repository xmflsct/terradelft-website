import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import type { Person, WithContext } from 'schema-dts'
import EventInformation from '~/components/event/information'
import { H1, H2 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import ContentfulImage from '~/components/image'
import {
  EventsEvent,
  getEventsEvent,
  getObjectsArtist,
  ObjectsArtist
} from '~/utils/contentful'
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
// export const handle = {
//   structuredData: (data: ObjectsArtist): WithContext<Person> => ({
//     '@context': 'https://schema.org',
//     '@type': 'Person',
//     name: data.artist,
//     image: data.image.url,
//     ...(data.biography && {
//       description: documentToPlainTextString(data.biography.json)
//     })
//   })
// }

const PageExhibition = () => {
  const eventsEvent = useLoaderData<EventsEvent>()

  return (
    <>
      <H1>{eventsEvent.name}</H1>
      <div className='grid grid-cols-6 gap-4'>
        {eventsEvent.image && (
          <ContentfulImage
            alt={eventsEvent.name}
            image={eventsEvent.image}
            width={309}
            quality={80}
            className='col-span-2'
          />
        )}
        <div className={eventsEvent.image ? 'col-span-4' : 'col-span-6'}>
          <EventInformation event={eventsEvent} />
          <div className='mt-2'>
            {eventsEvent.description &&
              documentToReactComponents(eventsEvent.description.json)}
          </div>
        </div>
      </div>
    </>
  )
}

export default PageExhibition
