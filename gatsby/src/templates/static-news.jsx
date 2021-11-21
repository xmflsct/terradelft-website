import PropTypes from 'prop-types'
import React from 'react'
import { Col, Pagination, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import moment from 'moment'
import 'moment/locale/nl'

import Layout from '../layouts/layout'

const StaticNews = ({ pageContext, data }) => {
  const { t } = useTranslation(['static-news', 'constant'])
  moment.locale(pageContext.locale)

  const { numPages, currentPage } = pageContext

  return (
    <Layout
      SEOtitle={t('static-news:name')}
      SEOkeywords={[t('static-news:name'), 'Terra Delft']}
      SEOdescription={t('static-news:name')}
      containerName='static-news'
    >
      <Row>
        {data.news.nodes?.map(node => {
          if (!node.title) return
          return (
            <Col sm={4} key={node.contentful_id} className='news-item'>
              <Link
                to={t('constant:slug.dynamic.news.slug', {
                  locale: pageContext.locale,
                  news: node.title,
                  id: node.contentful_id
                })}
              >
                {node.image && (
                  <GatsbyImage
                    image={node.image.gatsbyImageData}
                    className='news-image'
                    backgroundColor='#e8e8e8'
                  />
                )}
                <h4>{node.title}</h4>
              </Link>
              <p>
                {t('static-news:content.published', {
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
            href={
              t('static-news:slug', {
                locale: pageContext.locale
              }) + (i === 0 ? `` : `/page/${i + 1}`)
            }
            active={i === currentPage - 1}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </Layout>
  )
}

StaticNews.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticNews($locale: String, $limit: Int!, $skip: Int!) {
    news: allContentfulNews(
      filter: { node_locale: { eq: $locale } }
      sort: { order: DESC, fields: date }
      limit: $limit
      skip: $skip
    ) {
      nodes {
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

export default StaticNews
