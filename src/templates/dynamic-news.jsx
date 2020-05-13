import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import moment from "moment"
import "moment/locale/nl"

import Layout from "../layouts/layout"
import { mediaFromRichText } from "../components/utils/media-from-rich-text"

const DynamicNews = ({ pageContext, data }) => {
  const { t } = useTranslation("static-news")

  return (
    <Layout
      SEOtitle={data.news.title}
      SEOkeywords={[data.news.title, "Terra Delft"]}
      containerName='dynamic-event'
    >
      <h1>{data.news.title}</h1>
      <Row>
        {data.news.image && (
          <Col sm={4} className="mb-3">
            <Img fluid={data.news.image.fluid} />
          </Col>
        )}
        <Col sm={data.news.image ? 8 : 12}>
          <p>
            {t("content.published", {
              date: moment(data.news.date).format("ll"),
            })}
          </p>
          {documentToReactComponents(
            data.news.content?.json,
            mediaFromRichText(data.imagesFromRichText, pageContext.locale)
          )}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query dynamicNews(
    $contentful_id: String
    $locale: String
    $imagesFromRichText: [String!]!
  ) {
    news: contentfulNews(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $locale }
    ) {
      title
      date
      image {
        fluid(maxWidth: 280, quality: 85) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
      content {
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

export default DynamicNews
