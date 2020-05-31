import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import Layout from '../layouts/layout'
import EventInformation from '../components/template-event/event-information'
import { mediaFromRichText } from '../components/utils/media-from-rich-text'

const DynamicEvent = ({ pageContext, data }) => {
  return (
    <Layout
      SEOtitle={data.event.name}
      SEOkeywords={[data.event.name, 'Terra Delft']}
      SEOdescription={
        data.event.description &&
        documentToPlainTextString(data.event.description.json).substring(0, 199)
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
          documentToPlainTextString(data.event.description.json),
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
            documentToReactComponents(
              data.event.description.json,
              mediaFromRichText(data.imagesFromRichText, pageContext.locale)
            )}
        </Col>
      </Row>
    </Layout>
  )
}

DynamicEvent.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query dynamicEvent(
    $contentful_id: String
    $locale: String
    $imagesFromRichText: [String!]!
  ) {
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
      }
      image {
        fluid(maxWidth: 280, quality: 85) {
          ...GatsbyContentfulFluid_withWebp_noBase64
        }
      }
      description {
        json
      }
    }
    imagesFromRichText: allContentfulAsset(
      filter: {
        contentful_id: { in: $imagesFromRichText }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ImageFromRichText
      }
    }
  }
`

export default DynamicEvent
