import Layout from '@components/layout'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import moment from 'moment'
import 'moment/locale/nl'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const PageTerraInChinaNews = ({ data }) => {
  const { t } = useTranslation()
  moment.locale(data.language)

  return (
    <Layout
      SEOtitle={t('page-terra-in-china-news:name')}
      SEOkeywords={[t('page-terra-in-china-news:name'), 'Terra Delft']}
      SEOdescription={t('page-terra-in-china-news:name')}
      containerName='static-news'
    >
      <h1>{t('page-terra-in-china-news:content.heading')}</h1>
      <Row>
        {data.news.nodes.map(node => (
          <Col sm={4} key={node.contentful_id} className='news-item'>
            <Link to={node.gatsbyPath}>
              {node.image && (
                <GatsbyImage
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
        ))}
      </Row>
    </Layout>
  )
}

PageTerraInChinaNews.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageTerraInChinaNews($language: String) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-terra-in-china-news", "page-news"] }
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
      filter: { node_locale: { eq: $language }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: date }
    ) {
      nodes {
        gatsbyPath(filePath: "/news/{ContentfulNews.contentful_id}")
        contentful_id
        title
        date
        image {
          gatsbyImageData(width: 280, quality: 80)
        }
      }
    }
  }
`

export default PageTerraInChinaNews
