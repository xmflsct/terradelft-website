import Layout from '@components/layout'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const PageReachTerra = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={t('page-reach-terra:name')}
      SEOkeywords={[t('page-reach-terra:name'), 'Terra Delft']}
      SEOdescription={t('page-reach-terra:name')}
      containerName='static-reach-terra'
    >
      <Row>
        <Col sm={6}>
          <div className='iframe-container google-maps'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2455.7534580179854!2d4.354894416068296!3d52.01137027972119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b5c3951554ed%3A0x4210dea3a13c91b5!2sGalerie%20Terra%20Delft!5e0!3m2!1sen!2sse!4v1588255098658!5m2!1sen!2sse'
              title='Google Maps'
              frameBorder='0'
              allowFullScreen
            />
          </div>
        </Col>
        <Col sm={6}>{renderRichText(data.reachTerra.description)}</Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query PageReachTerra($language: String) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-reach-terra"] }
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
    reachTerra: contentfulPageReachTerra(node_locale: { eq: $language }) {
      description {
        raw
      }
    }
  }
`

export default PageReachTerra
