import Layout from '@components/layout'
import EventInformation from '@components/template-event/event-information'
import contentfulRichTextOptions from '@components/contentfulRichTextOptions'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const PageExhibition = ({ data }) => {
  return (
    <Layout
      SEOtitle={data.event.name}
      SEOkeywords={[data.event.name, 'Terra Delft']}
      SEOdescription={
        data.event.description &&
        documentToPlainTextString(
          JSON.parse(data.event.description.raw)
        ).substring(0, 199)
      }
      SEOschema={{
        '@context': 'http://schema.org',
        '@type': 'Event',
        name: data.event.name,
        startDate: data.event.datetimeStart,
        endDate: data.event.datetimeEnd,
        ...(data.event.image && {
          image: data.event.image.gatsbyImageData.images.fallback.src
        }),
        description:
          data.event.description &&
          documentToPlainTextString(JSON.parse(data.event.description.raw)),
        ...(data.event.organizer && {
          organizer: [
            data.event.organizer.map(organizer => ({
              '@type': 'Organization',
              name: organizer.name
            }))
          ]
        }),
        ...(data.event.location && {
          location: [
            data.event.location.map(location => ({
              '@type': 'Place',
              name: location.name,
              address: location.address,
              latitude: location.location.lat,
              longitude: location.location.lon
            }))
          ]
        })
      }}
      containerName='dynamic-event'
    >
      <h1>{data.event.name}</h1>
      <Row>
        {data.event.image && (
          <Col sm={4}>
            <GatsbyImage
              alt={data.event.name}
              image={data.event.image.gatsbyImageData}
            />
          </Col>
        )}
        <Col sm={data.event.image ? 8 : 12}>
          <EventInformation event={data.event} />
          {data.event.description &&
            renderRichText(data.event.description, contentfulRichTextOptions)}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query PageExhibition($language: String!, $contentful_id: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "component-exhibition"] }
        language: { eq: $language }
      }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    event: contentfulEvent(
      node_locale: { eq: $language }
      contentful_id: { eq: $contentful_id }
    ) {
      name
      datetimeStart
      datetimeEnd
      datetimeAllDay
      type {
        name
      }
      organizer {
        contentful_id
        name
      }
      location {
        contentful_id
        name
        location {
          lat
          lon
        }
        address
      }
      image {
        gatsbyImageData(width: 280, quality: 85)
      }
      description {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            gatsbyImageData(width: 600, quality: 85)
          }
        }
      }
    }
  }
`

export default PageExhibition
