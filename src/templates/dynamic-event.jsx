import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import EventInformation from "../components/template-event/event-information"
import { imageFromRichText } from "../components/utils/image-from-rich-text"

const DynamicEvent = ({ data }) => {
  const { i18n } = useTranslation("static-events")

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
            <Img fluid={data.event.image.fluid} />
          </Col>
        )}
        <Col sm={data.event.image ? 8 : 12}>
          <EventInformation event={data.event} />
          {documentToReactComponents(
            data.event.description?.json,
            imageFromRichText(data.imagesFromRichText, i18n.language)
          )}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query dynamicEvent(
    $contentful_id: String
    $language: String
    $imagesFromRichText: [String!]!
  ) {
    event: contentfulEventsEvent(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $language }
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
        fluid(maxWidth: 800) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
      description {
        json
      }
    }
    imagesFromRichText: allContentfulAsset(
      filter: {
        contentful_id: { in: $imagesFromRichText }
        node_locale: { eq: $language }
      }
    ) {
      nodes {
        ...ImageFromRichText
      }
    }
  }
`

export default DynamicEvent
