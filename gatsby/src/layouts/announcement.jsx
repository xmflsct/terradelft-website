import { useStaticQuery, graphql } from 'gatsby'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const Announcement = () => {
  const data = useStaticQuery(graphql`
    {
      nl: contentfulAnnouncement(node_locale: { eq: "nl" }) {
        enabled
        title
        content {
          raw
        }
      }
      en: contentfulAnnouncement(node_locale: { eq: "en" }) {
        enabled
        title
        content {
          raw
        }
      }
    }
  `)
  const { i18n } = useTranslation('constant')

  return (
    <>
      {data[i18n.language].enabled && (
        <Row className='justify-content-md-center mt-3 announcement'>
          <Col xs lg='8'>
            <h4 className='text-center'>{data[i18n.language].title}</h4>
            {renderRichText(data[i18n.language].content)}
          </Col>
        </Row>
      )}
    </>
  )
}

export default Announcement
