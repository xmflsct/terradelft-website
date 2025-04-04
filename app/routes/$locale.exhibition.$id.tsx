import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { gql } from 'graphql-request'
import { data as loaderData, LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import type { Event, WithContext } from 'schema-dts'
import ExhibitionInformation from '~/components/exhibition/information'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import { EventsEvent, graphqlRequest, RICH_TEXT_LINKS } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const data = await cache<{
    exhibition: Omit<EventsEvent, 'sys' | 'datetimeAllDay' | 'terraInChina'>
  }>({
    ttlMinutes: 10080,
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { id: args.params.id! },
      query: gql`
        query PageExhibition($preview: Boolean, $locale: String, $id: String!) {
          exhibition: eventsEvent(preview: $preview, locale: $locale, id: $id) {
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
              title
              width
              height
            }
            description {
              json
              ${RICH_TEXT_LINKS}
            }
          }
        }
      `
    })
  })

  if (!data?.exhibition) {
    throw loaderData(null, { status: 404 })
  }
  return data
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.exhibition
    ? [
        ...linkHref(`exhibition/${params.id}`, params.locale),
        {
          title: SEOTitle(data.exhibition.name)
        },
        {
          property: 'og:title',
          content: SEOTitle(data.exhibition.name)
        },
        ...(data.exhibition.image
          ? [
              {
                property: 'og:image',
                content: data.exhibition.image.url
              }
            ]
          : []),
        { name: 'keywords', content: SEOKeywords([data.exhibition.name]) },
        data.exhibition.description
          ? {
              name: 'description',
              content: documentToPlainTextString(data.exhibition.description.json).substring(0, 199)
            }
          : {}
      ]
    : []
export const handle = {
  structuredData: ({ exhibition }: LoaderData<typeof loader>): WithContext<Event> =>
    exhibition && {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: exhibition.name,
      startDate: exhibition.datetimeStart,
      endDate: exhibition.datetimeEnd,
      ...(exhibition.image && { image: exhibition.image.url }),
      description:
        exhibition.description &&
        documentToPlainTextString(exhibition.description.json).substring(0, 199),
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
      <H1 className={exhibition.image ? 'col-span-6' : 'col-span-6 lg:col-span-4 lg:col-start-2'}>
        {exhibition.name}
      </H1>
      {exhibition.image && (
        <ContentfulImage
          alt={exhibition.name}
          image={exhibition.image}
          width={309}
          quality={80}
          className='col-span-6 lg:col-span-2'
          zoomable
        />
      )}
      <div
        className={
          exhibition.image ? 'col-span-6 lg:col-span-4' : 'col-span-6 lg:col-span-4 lg:col-start-2'
        }
      >
        <ExhibitionInformation exhibition={exhibition} />
        <RichText content={exhibition.description} className='mt-2' assetWidth={634} />
      </div>
    </div>
  )
}

export default PageExhibition
