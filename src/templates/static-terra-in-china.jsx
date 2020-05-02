import React from "react"
import { Badge, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import "moment/locale/nl"

import Layout from "../layouts/layout"
import EventInformation from "../components/template-event/event-information"

const StaticTerraInChina = ({ pageContext, data }) => {
  const { t } = useTranslation([
    "static-terra-in-china",
    "static-events",
    "static-news",
    "constant",
  ])
  moment.locale(pageContext.locale)

  return (
    <Layout
      SEOtitle={t("static-terra-in-china:name")}
      SEOkeywords={[t("static-terra-in-china:name"), "Terra Delft"]}
      containerName='static-terra-in-china'
    >
      <Row>
        <Col sm={6} className="mb-3">
          <h2>{t("static-terra-in-china:content.heading.events")}</h2>
          {data.events.nodes.map((node) => (
            <Row className='mb-3' key={node.contentful_id}>
              <Col>
                {node.image && <Img fluid={node.image.fluid} />}
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
          <Link
            to={t("constant:slug.static.terra-in-china-events.slug", {
              locale: pageContext.locale,
            })}
          >
            {t("static-terra-in-china:content.view-all.events")}
          </Link>
        </Col>
        <Col sm={6}>
          <h2>{t("static-terra-in-china:content.heading.news")}</h2>
          {data.news.nodes?.map((node) => (
            <Row key={node.contentful_id} className='news-item'>
              <Col>
                <Link
                  to={t("constant:slug.dynamic.news.slug", {
                    locale: pageContext.locale,
                    news: node.title,
                    id: node.contentful_id,
                  })}
                >
                  {node.image && (
                    <Img fluid={node.image.fluid} className='news-image mb-2' />
                  )}
                  <h4>{node.title}</h4>
                </Link>
                <p>
                  {t("static-news:content.published", {
                    date: moment(node.date).format("ll"),
                  })}
                </p>
              </Col>
            </Row>
          ))}
          <Link
            to={t("constant:slug.static.terra-in-china-news.slug", {
              locale: pageContext.locale,
            })}
          >
            {t("static-terra-in-china:content.view-all.news")}
          </Link>
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query staticTerraInChina($locale: String) {
    events: allContentfulEventsEvent(
      filter: { node_locale: { eq: $locale }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: datetimeEnd }
      limit: 8
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
    news: allContentfulNewsNews(
      filter: { node_locale: { eq: $locale }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: date }
      limit: 8
    ) {
      nodes {
        contentful_id
        title
        date
        image {
          fluid(maxWidth: 600) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        content {
          json
        }
      }
    }
  }
`

export default StaticTerraInChina
