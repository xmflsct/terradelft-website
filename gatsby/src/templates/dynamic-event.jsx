import React from "react"
import { Col, Row } from "react-bootstrap"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import EventInformation from "../components/template-event/event-information"
import { mediaFromRichText } from "../components/utils/media-from-rich-text"

const DynamicEvent = ({ pageContext, data }) => {
  return (
    <Layout
      SEOtitle={data.event.name}
      SEOkeywords={[data.event.name, "Terra Delft"]}
      containerName='dynamic-event'
    >
      <h1>{data.event.name}</h1>
      <Row>
        {data.event.image && (
          <Col sm={4}>
            <Img fluid={data.event.image.fluid} backgroundColor="#e8e8e8" />
          </Col>
        )}
        <Col sm={data.event.image ? 8 : 12}>
          <EventInformation event={data.event} />
          {documentToReactComponents(
            data.event.description?.json,
            mediaFromRichText(data.imagesFromRichText, pageContext.locale)
          )}
        </Col>
      </Row>
    </Layout>
  )
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
