import { graphql } from 'gatsby'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import Layout from '../layouts/layout'

const StaticReachTerra = ({ data }) => {
  const { t } = useTranslation('static-reach-terra')

  return (
    <Layout
      SEOtitle={t('static-reach-terra:name')}
      SEOkeywords={[t('static-reach-terra:name'), 'Terra Delft']}
      SEOdescription={t('static-reach-terra:name')}
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

StaticReachTerra.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticReachTerra($locale: String) {
    reachTerra: contentfulPageReachTerra(node_locale: { eq: $locale }) {
      description {
        raw
      }
    }
  }
`

export default StaticReachTerra
