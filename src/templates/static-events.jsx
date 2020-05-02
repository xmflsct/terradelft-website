import React from "react"
import { Badge, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"

import Layout from "../layouts/layout"
import EventInformation from "../components/template-event/event-information"

const StaticEvents = ({ pageContext, data }) => {
  const { t } = useTranslation(["static-events", "constant"])

  return (
    <Layout
      SEOtitle={t("static-events:name")}
      SEOkeywords={[t("static-events:name"), "Terra Delft"]}
      containerName='static-events'
    >
      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 4, order: 1 }}>
          <h2>{t("static-events:content.heading.upcoming")}</h2>
          {data.eventsUpcoming.nodes.map((node) => (
            <Row className='events-upcoming' key={node.contentful_id}>
              <Col sm={12}>
                <Link
                  to={t("constant:slug.dynamic.event.slug", {
                    locale: pageContext.locale,
                    event: node.name,
                    id: node.contentful_id,
                  })}
                  className='upcoming-name'
                >
                  <h5>{node.name}</h5>
                </Link>
                <EventInformation event={node} type='upcoming' />
              </Col>
            </Row>
          ))}
        </Col>
        <Col xs={{ span: 12, order: 1 }} md={{ span: 8, order: 2 }}>
          <h2>{t("static-events:content.heading.current")}</h2>
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
                  to={t("constant:slug.dynamic.event.slug", {
                    locale: pageContext.locale,
                    event: node.name,
                    id: node.contentful_id,
                  })}
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
  query staticEvents($locale: String) {
    eventsUpcoming: allContentfulEventsEvent(
      filter: { isFuture: { eq: true }, node_locale: { eq: $locale } }
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
      filter: { isCurrent: { eq: true }, node_locale: { eq: $locale } }
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

export default StaticEvents
