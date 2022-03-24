import Layout from '@components/layout'
import EventInformation from '@components/template-event/event-information'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby-plugin-react-i18next'
import React from 'react'
import { Badge, Col, Pagination, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const TemplateExhibitions = ({ pageContext, data }) => {
  const { t } = useTranslation()

  const { numPages, currentPage } = pageContext

  return (
    <Layout
      SEOtitle={t('page-exhibitions:name')}
      SEOkeywords={[t('page-exhibitions:name'), 'Terra Delft']}
      SEOdescription={t('page-exhibitions:name')}
      containerName='static-exhibitions'
    >
      <Row>
        {data.exhibitions.nodes
          .filter(node => new Date(node.datetimeEnd) < new Date())
          .map(node => (
            <Col sm={4} key={node.contentful_id}>
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
              <EventInformation event={node} />
            </Col>
          ))}
      </Row>
      <Pagination>
        {Array.from({ length: numPages }).map((_, i) => (
          <Pagination.Item
            key={i}
            href={`/exhibitions/page/${i + 1}`}
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
  query TemplateExhibitions($language: String, $limit: Int!, $skip: Int!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-exhibitions"] }
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
        node_locale: { eq: $language }
        type: { elemMatch: { contentful_id: { ne: "htJrQs69zz39hTCtUKiP0" } } }
      }
      sort: { order: DESC, fields: datetimeStart }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        gatsbyPath(filePath: "/exhibition/{ContentfulEvent.contentful_id}")
        contentful_id
        image {
          gatsbyImageData(width: 280, quality: 80)
        }
        name
        datetimeStart
        datetimeEnd
        datetimeAllDay
        type {
          contentful_id
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

export default TemplateExhibitions
