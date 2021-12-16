import Layout from '@components/layout'
import EventInformation from '@components/template-event/event-information'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import moment from 'moment'
import 'moment/locale/nl'
import PropTypes from 'prop-types'
import React from 'react'
import { Badge, Col, Row } from 'react-bootstrap'

const PageTerraInChina = ({ data }) => {
  const { t } = useTranslation()
  moment.locale(data.language)

  return (
    <Layout
      SEOtitle={t('page-terra-in-china:name')}
      SEOkeywords={[t('page-terra-in-china:name'), 'Terra Delft']}
      SEOdescription={t('page-terra-in-china:name')}
      containerName='page-terra-in-china'
    >
      <Row>
        <Col sm={6} className='mb-3'>
          <h2>{t('page-terra-in-china:content.heading.events')}</h2>
          {data.exhibitions.nodes.map(node => (
            <Row className='mb-3' key={node.contentful_id}>
              <Col>
                {node.image && (
                  <GatsbyImage
                    alt={node.image.description}
                    image={node.image.gatsbyImageData}
                  />
                )}
                <div className='current-type'>
                  {node.type.map(t => (
                    <Badge variant='info' key={t.name}>
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <Link to={node.gatsbyPath} className='current-name'>
                  <h3>{node.name}</h3>
                </Link>
                <EventInformation event={node} type='current' />
              </Col>
            </Row>
          ))}
          <Link to='/terra-in-china/exhibitions'>
            {t('page-terra-in-china:content.view-all.events')}
          </Link>
        </Col>
        <Col sm={6}>
          <h2>{t('page-terra-in-china:content.heading.news')}</h2>
          {data.news.nodes.map(node => (
            <Row key={node.contentful_id} className='news-item'>
              <Col>
                <Link to={node.gatsbyPath}>
                  {node.image && (
                    <GatsbyImage
                      alt={node.image.description}
                      image={node.image.gatsbyImageData}
                      className='news-image mb-2'
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
            </Row>
          ))}
          <Link to='/terra-in-china/news'>
            {t('page-terra-in-china:content.view-all.news')}
          </Link>
        </Col>
      </Row>
    </Layout>
  )
}

PageTerraInChina.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageTerraInChina($language: String!) {
    locales: allLocale(
      filter: {
        ns: {
          in: [
            "translation"
            "page-terra-in-china"
            "page-exhibitions"
            "page-news"
            "component-exhibition"
          ]
        }
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
    exhibitions: allContentfulEvent(
      filter: { node_locale: { eq: $language }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: datetimeEnd }
      limit: 8
    ) {
      nodes {
        gatsbyPath(filePath: "/exhibition/{ContentfulEvent.contentful_id}")
        contentful_id
        image {
          gatsbyImageData(width: 427, quality: 80)
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
    news: allContentfulNews(
      filter: { node_locale: { eq: $language }, terraInChina: { eq: true } }
      sort: { order: DESC, fields: date }
      limit: 8
    ) {
      nodes {
        gatsbyPath(filePath: "/news/{ContentfulNews.contentful_id}")
        contentful_id
        title
        date
        image {
          gatsbyImageData(width: 427, quality: 80)
        }
      }
    }
  }
`

export default PageTerraInChina
