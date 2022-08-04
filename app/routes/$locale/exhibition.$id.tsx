import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import type { Event, WithContext } from 'schema-dts'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { cacheQuery, EventsEvent, RICH_TEXT_LINKS } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const data = await cacheQuery<{
    exhibition: Omit<EventsEvent, 'sys' | 'datetimeAllDay' | 'terraInChina'>
  }>({
    ...args,
    variables: { id: args.params.id! },
    query: gql`
      query PageExhibition($locale: String, $id: String!) {
        exhibition: eventsEvent (locale: $locale, id: $id) {
          name
          datetimeStart
          datetimeEnd
          typeCollection {
            items {
              name
            }
          }
          organizerCollection {
            items {
              name
            }
          }
          locationCollection {
            items {
              name
              address
              location {
                lat
                lon
              }
            }
          }
          image {
            url
          }
          description {
            json
            ${RICH_TEXT_LINKS}
          }
        }
      }
    `
  })

  if (!data?.exhibition) {
    throw json('Not Found', { status: 404 })
  }
  return json(data)
}

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(data.exhibition.name),
  keywords: SEOKeywords([data.exhibition.name]),
  ...(data.exhibition.description && {
    description: documentToPlainTextString(
      data.exhibition.description.json
    ).substring(0, 199)
  })
})
export const handle = {
  structuredData: ({
    exhibition
  }: LoaderData<typeof loader>): WithContext<Event> =>
    exhibition && {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: exhibition.name,
      startDate: exhibition.datetimeStart,
      endDate: exhibition.datetimeEnd,
      ...(exhibition.image && { image: exhibition.image.url }),
      description:
        exhibition.description &&
        documentToPlainTextString(exhibition.description.json).substring(
          0,
          199
        ),
      ...(exhibition.organizerCollection?.items.length && {
        organizer: exhibition.organizerCollection.items.map(organizer => ({
          '@type': 'Organization',
          name: organizer.name
        }))
      }),
      ...(exhibition.locationCollection?.items.length && {
        location: exhibition.locationCollection.items.map(location => ({
          '@type': 'Place',
          name: location.name,
          address: location.address,
          latitude: location.location.lat,
          longitude: location.location.lon
        }))
      })
    }
}

const PageExhibition = () => {
  const { exhibition } = useLoaderData<typeof loader>()

  return (
    <div className='grid grid-cols-6 gap-4 items-start'>
      <H1
        className={exhibition.image ? 'col-span-6' : 'col-span-6 lg:col-span-4 lg:col-start-2'}
      >
        {exhibition.name}
      </H1>
      {exhibition.image && (
        <ContentfulImage
          alt={exhibition.name}
          image={exhibition.image}
          width={309}
          quality={80}
          className='col-span-6 lg:col-span-2'
        />
      )}
      <div
        className={exhibition.image ? 'col-span-6 lg:col-span-4' : 'col-span-6 lg:col-span-4 lg:col-start-2'}
      >
        <ExhibitionInformation exhibition={exhibition} />
        <RichText
          content={exhibition.description}
          className='mt-2'
          assetWidth={634}
        />
      </div>
    </div>
  )
}

export default PageExhibition
