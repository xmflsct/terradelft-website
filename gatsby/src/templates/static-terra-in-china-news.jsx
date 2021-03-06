import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import Img from 'gatsby-image'
import moment from 'moment'
import 'moment/locale/nl'

import Layout from '../layouts/layout'

const StaticTerraInChinaNews = ({ pageContext, data }) => {
  const { t } = useTranslation([
    'static-terra-in-china-news',
    'static-news',
    'constant'
  ])
  moment.locale(pageContext.locale)

  return (
    <Layout
      SEOtitle={t('static-terra-in-china-news:name')}
      SEOkeywords={[t('static-terra-in-china-news:name'), 'Terra Delft']}
      SEOdescription={t('static-terra-in-china-news:name')}
      containerName='static-news'
    >
      <h1>{t('static-terra-in-china-news:content.heading')}</h1>
      <Row>
        {data.news.nodes.map(node => (
          <Col sm={4} key={node.contentful_id} className='news-item'>
            <Link
              to={t('constant:slug.dynamic.news.slug', {
                locale: pageContext.locale,
                news: node.title,
                id: node.contentful_id
              })}
            >
              {node.image && (
                <Img
                  fluid={node.image.fluid}
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
        ))}
      </Row>
    </Layout>
  )
}

StaticTerraInChinaNews.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticTerraInChinaNews($locale: String) {
    news: allContentfulNews(
      filter: { node_locale: { eq: $locale }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: date }
    ) {
      nodes {
        contentful_id
        title
        date
        image {
          fluid(maxWidth: 280, quality: 80) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
        }
      }
    }
  }
`

export default StaticTerraInChinaNews
