import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import EventInformation from '../components/template-event/event-information'
import contentfulRichTextOptions from '../components/utils/contentfulRichTextOptions'
import Layout from '../layouts/layout'

const DynamicEvent = ({ data }) => {
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
        ...(data.event.image && { image: data.event.image.fluid.src }),
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
            <Img fluid={data.event.image.fluid} backgroundColor='#e8e8e8' />
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

DynamicEvent.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query dynamicEvent($contentful_id: String, $locale: String) {
    event: contentfulEvent(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $locale }
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
        fluid(maxWidth: 280, quality: 85) {
          ...GatsbyContentfulFluid_withWebp_noBase64
        }
      }
      description {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            fluid(maxWidth: 600, quality: 85) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
        }
      }
    }
  }
`

export default DynamicEvent
