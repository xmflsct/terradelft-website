import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import slugify from "slugify"
import moment from "moment"
import "moment/locale/nl"

import Layout from "../layouts/layout"

const StaticNews = ({ data }) => {
  const { t, i18n } = useTranslation("static-news")
  moment.locale(i18n.language)

  return (
    <Layout
      SEOtitle={t("name")}
      SEOkeywords={[t("name"), "Terra Delft"]}
      containerName='static-news'
    >
      <Row>
        {data.news.nodes?.map((node) => (
          <Col sm={4} key={node.contentful_id} className='news-item'>
            {node.image && (
              <Img fluid={node.image.fluid} className='news-image' />
            )}
            <Link
              to={`${i18n.language}/${t("url")}/${slugify(
                `${node.title}-${node.contentful_id}`,
                {
                  lower: true,
                }
              )}`}
            >
              <h4>{node.title}</h4>
            </Link>
            <p>
              {t("content.published", { date: moment(node.date).format("ll") })}
            </p>
          </Col>
        ))}
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query staticNews($language: String) {
    news: allContentfulNewsNews(
      filter: { node_locale: { eq: $language } }
      sort: { order: DESC, fields: date }
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

export default StaticNews
