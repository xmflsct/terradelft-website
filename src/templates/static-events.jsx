import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import slugify from "slugify"
import moment from "moment"
import "moment/locale/nl"

import Layout from "../layouts/layout"

const StaticExhibition = ({ data }) => {
  const { t, i18n } = useTranslation("static-events")
  moment.locale("nl")

  return (
    <Layout
      SEOtitle={t("name")}
      SEOkeywords={[t("name"), "Terra Delft"]}
      containerName='static-events'
    >
      <Row>
        <Col sm={4}>
          <h2>{t("content.heading.upcoming")}</h2>
        </Col>
        <Col sm={8}>
          <h2>{t("content.heading.current")}</h2>
          {data.eventsCurrent.nodes.map((node) => (
            <Row className='events-current'>
              {node.image && (
                <Col sm={6}>
                  <Img fluid={node.image.fluid} />
                </Col>
              )}
              <Col sm={6}>
                <Link
                  to={`/${i18n.language}/${t("url")}/${slugify(
                    `${node.name}-${node.contentful_id}`,
                    {
                      lower: true,
                    }
                  )}`}
                >
                  <h3>{node.name}</h3>
                </Link>
                <div className='current-type'>
                  {node.type.map((t) => (
                    <span>{t.name}</span>
                  ))}
                </div>
                <div className='current-ends'>
                  {moment(node.datetimeEnd).fromNow()} (
                  {moment(node.datetimeEnd).format("LL")})
                </div>
                {node.organizer && (
                  <dl className='current-organizer'>
                    <dt>{t("organizer")}</dt>
                    {node.organizer.map((o) => (
                      <dd>{o.name}</dd>
                    ))}
                  </dl>
                )}
                {node.location && (
                  <dl className='current-location'>
                    <dt>{t("location")}</dt>
                    {node.location.map((o) => (
                      <dd>{o.name}</dd>
                    ))}
                  </dl>
                )}
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
    eventsCurrent: allContentfulEventsEvent(
      filter: { isCurrent: { eq: true }, node_locale: { eq: $language } }
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
