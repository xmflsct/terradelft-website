import React from "react"
import { Badge, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import slugify from "slugify"

import Layout from "../layouts/layout"
import EventInformation from "../components/template-event/event-information"

const StaticExhibition = ({ data }) => {
  const { t, i18n } = useTranslation("static-events")

  return (
    <Layout
      SEOtitle={t("name")}
      SEOkeywords={[t("name"), "Terra Delft"]}
      containerName='static-events'
    >
      <Row>
        <Col sm={4}>
          <h2>{t("content.heading.upcoming")}</h2>
          {data.eventsUpcoming.nodes.map((node) => (
            <Row className='events-upcoming' key={node.contentful_id}>
              <Col sm={12}>
                <Link
                  to={`/${i18n.language}/${t("url")}/${slugify(
                    `${node.name}-${node.contentful_id}`,
                    {
                      lower: true,
                    }
                  )}`}
                  className='upcoming-name'
                >
                  <h5>{node.name}</h5>
                </Link>
                <EventInformation event={node} type='upcoming' />
              </Col>
            </Row>
          ))}
        </Col>
        <Col sm={8}>
          <h2>{t("content.heading.current")}</h2>
          {data.eventsCurrent.nodes.map((node) => (
            <Row className='events-current' key={node.contentful_id}>
              {node.image && (
                <Col sm={6}>
                  <Img fluid={node.image.fluid} />
                </Col>
              )}
              <Col sm={6}>
                <div className='current-type'>
                  {node.type.map((t) => (
                    <Badge variant='info' key={t.name}>
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <Link
                  to={`/${i18n.language}/${t("url")}/${slugify(
                    `${node.name}-${node.contentful_id}`,
                    {
                      lower: true,
                    }
                  )}`}
                  className='current-name'
                >
                  <h3>{node.name}</h3>
                </Link>
                <EventInformation event={node} type='current' />
              </Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query staticExhibition($language: String) {
    eventsUpcoming: allContentfulEventsEvent(
      filter: { isFuture: { eq: true }, node_locale: { eq: $language } }
      sort: { order: ASC, fields: datetimeStart }
    ) {
      nodes {
        contentful_id
        name
        datetimeStart
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
      }
    }
    eventsCurrent: allContentfulEventsEvent(
      filter: { isCurrent: { eq: true }, node_locale: { eq: $language } }
      sort: { order: ASC, fields: datetimeEnd }
    ) {
      nodes {
        contentful_id
        image {
          fluid(maxWidth: 600) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        name
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
      }
    }
  }
`

export default StaticExhibition
