import Layout from '@components/layout'
import EventInformation from '@components/template-event/event-information'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import PropTypes from 'prop-types'
import React from 'react'
import { Badge, Col, Row } from 'react-bootstrap'

const PageTerraInChinaExhibitions = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={t('page-terra-in-china-exhibitions:name')}
      SEOkeywords={[t('page-terra-in-china-exhibitions:name'), 'Terra Delft']}
      SEOdescription={t('page-terra-in-china-exhibitions:name')}
      containerName='static-events'
    >
      <h1>{t('page-terra-in-china-exhibitions:content.heading')}</h1>
      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 4, order: 1 }}>
          <h2>{t('page-exhibitions:content.heading.upcoming')}</h2>
          {data.exhibitions.nodes
            .filter(node => new Date(node.datetimeStart) > new Date())
            .map(node => (
              <Row className='events-upcoming' key={node.contentful_id}>
                <Col sm={12}>
                  <Link to={node.gatsbyPath} className='upcoming-name'>
                    <h5>{node.name}</h5>
                  </Link>
                  <EventInformation event={node} type='upcoming' />
                </Col>
              </Row>
            ))}
        </Col>
        <Col xs={{ span: 12, order: 1 }} md={{ span: 8, order: 2 }}>
          <h2>{t('page-exhibitions:content.heading.current')}</h2>
          {data.exhibitions.nodes
            .filter(
              node =>
                new Date(node.datetimeEnd) >= new Date() &&
                new Date(node.datetimeStart) <= new Date()
            )
            .map(node => (
              <Row className='events-current' key={node.contentful_id}>
                {node.image && (
                  <Col sm={6}>
                    <GatsbyImage
                      alt={node.image.description}
                      image={node.image.gatsbyImageData}
                    />
                  </Col>
                )}
                <Col sm={6}>
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
        </Col>
      </Row>
    </Layout>
  )
}

PageTerraInChinaExhibitions.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageTerraInChinaExhibitions($language: String!) {
    locales: allLocale(
      filter: {
        ns: {
          in: [
            "translation"
            "page-terra-in-china-exhibitions"
            "page-exhibitions"
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
      filter: {
        isCurrentAndFuture: { eq: true }
        node_locale: { eq: $language }
        terraInChina: { eq: true }
      }
      sort: { order: ASC, fields: datetimeEnd }
    ) {
      nodes {
        gatsbyPath(filePath: "/exhibition/{ContentfulEvent.contentful_id}")
        contentful_id
        image {
          gatsbyImageData(width: 600, quality: 80)
        }
        name
        datetimeStart
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

export default PageTerraInChinaExhibitions
