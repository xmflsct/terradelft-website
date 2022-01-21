import Layout from '@components/layout'
import contentfulRichTextOptions from '@components/contentfulRichTextOptions'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import moment from 'moment'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import 'moment/locale/nl'

const PageNews = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={data.news.title}
      SEOkeywords={[data.news.title, 'Terra Delft']}
      SEOdescription={
        data.news.content &&
        documentToPlainTextString(JSON.parse(data.news.content.raw)).substring(
          0,
          199
        )
      }
      SEOschema={{
        '@context': 'http://schema.org',
        '@type': 'Article',
        name: data.news.title,
        datePublished: data.news.date,
        ...(data.news.image && {
          image: data.news.image.gatsbyImageData.images.fallback.src
        }),
        articleBody:
          data.news.content &&
          documentToPlainTextString(JSON.parse(data.news.content.raw))
      }}
      containerName='dynamic-event'
    >
      <h1>{data.news.title}</h1>
      <Row>
        {data.news.image && (
          <Col sm={4} className='mb-3'>
            <GatsbyImage
              alt={data.news.title}
              image={data.news.image.gatsbyImageData}
            />
          </Col>
        )}
        <Col sm={data.news.image ? 8 : 12}>
          <p>
            {t('content.published', {
              date: moment(data.news.date).format('ll')
            })}
          </p>
          {data.news.content &&
            renderRichText(data.news.content, contentfulRichTextOptions)}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query PageNews($language: String!, $contentful_id: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-news"] }
        language: { eq: $language }
      }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    news: contentfulNews(
      node_locale: { eq: $language }
      contentful_id: { eq: $contentful_id }
    ) {
      title
      date
      image {
        gatsbyImageData(width: 280, quality: 85)
      }
      content {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            gatsbyImageData(width: 600, quality: 85)
          }
        }
      }
    }
  }
`

export default PageNews
