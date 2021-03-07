import PropTypes from 'prop-types'
import React from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from "gatsby-plugin-image";

import Layout from '../layouts/layout'
import EventInformation from '../components/template-event/event-information'

const StaticTerraInChinaEvents = ({ pageContext, data }) => {
  const { t } = useTranslation([
    'static-terra-in-china-events',
    'static-events',
    'constant'
  ])

  return (
    <Layout
      SEOtitle={t('static-terra-in-china-events:name')}
      SEOkeywords={[t('static-terra-in-china-events:name'), 'Terra Delft']}
      SEOdescription={t('static-terra-in-china-events:name')}
      containerName='static-events'
    >
      <h1>{t('static-terra-in-china-events:content.heading')}</h1>
      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 4, order: 1 }}>
          <h2>{t('static-events:content.heading.upcoming')}</h2>
          {data.events.nodes
            .filter(node => new Date(node.datetimeStart) > new Date())
            .map(node => (
              <Row className='events-upcoming' key={node.contentful_id}>
                <Col sm={12}>
                  <Link
                    to={t('constant:slug.dynamic.event.slug', {
                      locale: pageContext.locale,
                      event: node.name,
                      id: node.contentful_id
                    })}
                    className='upcoming-name'
                  >
                    <h5>{node.name}</h5>
                  </Link>
                  <EventInformation event={node} type='upcoming' />
                </Col>
              </Row>
            ))}
        </Col>
        <Col xs={{ span: 12, order: 1 }} md={{ span: 8, order: 2 }}>
          <h2>{t('static-events:content.heading.current')}</h2>
          {data.events.nodes
            .filter(
              node =>
                new Date(node.datetimeEnd) >= new Date() &&
                new Date(node.datetimeStart) <= new Date()
            )
            .map(node => (
              <Row className='events-current' key={node.contentful_id}>
                {node.image && (
                  <Col sm={6}>
                    <GatsbyImage image={node.image.gatsbyImageData} backgroundColor='#e8e8e8' />
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
                  <Link
                    to={t('constant:slug.dynamic.event.slug', {
                      locale: pageContext.locale,
                      event: node.name,
                      id: node.contentful_id
                    })}
                    className='current-name'
                  >
                    <h3>{node.name}</h3>
                  </Link>
                  <EventInformation event={node} type='current' />
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
    </Layout>
  );
}

StaticTerraInChinaEvents.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticTerraInChinaEvents($locale: String) {
    events: allContentfulEvent(
      filter: {
        isCurrentAndFuture: { eq: true }
        node_locale: { eq: $locale }
        terraInChina: { eq: true }
      }
      sort: { order: ASC, fields: datetimeEnd }
    ) {
      nodes {
        contentful_id
        image {
          gatsbyImageData(layout: CONSTRAINED, quality: 80)
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

export default StaticTerraInChinaEvents
