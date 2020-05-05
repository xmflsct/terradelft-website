import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import "moment/locale/nl"

import Layout from "../layouts/layout"

const StaticNews = ({ pageContext, data }) => {
  const { t } = useTranslation(["static-news", "constant"])
  moment.locale(pageContext.locale)

  return (
    <Layout
      SEOtitle={t("static-news:name")}
      SEOkeywords={[t("static-news:name"), "Terra Delft"]}
      containerName='static-news'
    >
      <Row>
        {data.news.nodes?.map((node) => (
          <Col sm={4} key={node.contentful_id} className='news-item'>
            <Link
              to={t("constant:slug.dynamic.news.slug", {
                locale: pageContext.locale,
                news: node.title,
                id: node.contentful_id,
              })}
            >
              {node.image && (
                <Img fluid={node.image.fluid} className='news-image' />
              )}
              <h4>{node.title}</h4>
            </Link>
            <p>
              {t("static-news:content.published", {
                date: moment(node.date).format("ll"),
              })}
            </p>
          </Col>
        ))}
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query staticNews($locale: String) {
    news: allContentfulNewsNews(
      filter: { node_locale: { eq: $locale } }
      sort: { order: DESC, fields: date }
    ) {
      nodes {
        contentful_id
        title
        date
        image {
          fluid(maxWidth: 600, quality: 80) {
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

export default StaticNews
