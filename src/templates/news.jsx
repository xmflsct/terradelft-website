import Layout from '@components/layout'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby-plugin-react-i18next'
import moment from 'moment'
import React from 'react'
import { Col, Pagination, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import 'moment/locale/nl'

const TemplateNews = ({ pageContext, data }) => {
  const { t } = useTranslation()
  moment.locale(data.language)

  const { numPages, currentPage } = pageContext

  return (
    <Layout
      SEOtitle={t('page-news:name')}
      SEOkeywords={[t('page-news:name'), 'Terra Delft']}
      SEOdescription={t('page-news:name')}
      containerName='static-news'
    >
      <Row>
        {data.news.nodes?.map(node => {
          if (!node.title) return null
          return (
            <Col sm={4} key={node.contentful_id} className='news-item'>
              <Link to={node.gatsbyPath}>
                {node.image && (
                  <GatsbyImage
                    alt={node.image.description}
                    image={node.image.gatsbyImageData}
                    className='news-image'
                  />
                )}
                <h4>{node.title}</h4>
              </Link>
              <p>
                {t('page-news:content.published', {
                  date: moment(node.date).format('ll')
                })}
              </p>
            </Col>
          )
        })}
      </Row>
      <Pagination>
        {Array.from({ length: numPages }).map((_, i) => (
          <Pagination.Item
            key={i}
            href={`/news/page/${i + 1}`}
            active={i === currentPage - 1}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </Layout>
  )
}

export const query = graphql`
  query TemplateNews($language: String, $limit: Int!, $skip: Int!) {
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
    news: allContentfulNews(
      filter: { node_locale: { eq: $language } }
      sort: { order: DESC, fields: date }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        gatsbyPath(filePath: "/news/{ContentfulNews.contentful_id}")
        contentful_id
        title
        date
        image {
          gatsbyImageData(width: 600, quality: 80)
        }
      }
    }
  }
`

export default TemplateNews
