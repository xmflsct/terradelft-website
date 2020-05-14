import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import Layout from '../layouts/layout'
import { mediaFromRichText } from '../components/utils/media-from-rich-text'

const StaticAboutTerra = ({ pageContext, data }) => {
  const { t } = useTranslation('static-about-terra')

  return (
    <Layout
      SEOtitle={t('static-about-terra:name')}
      SEOkeywords={[t('static-about-terra:name'), 'Terra Delft']}
      containerName='static-about-terra'
    >
      <h1>{t('static-about-terra:name')}</h1>
      <Row>
        <Col sm={6}>
          {documentToReactComponents(
            data.aboutTerra.columnLeft.json,
            mediaFromRichText(data.imagesFromRichText, pageContext.locale)
          )}
        </Col>
        <Col sm={6}>
          {documentToReactComponents(
            data.aboutTerra.columnRight.json,
            mediaFromRichText(data.imagesFromRichText, pageContext.locale)
          )}
        </Col>
      </Row>
      <Row className='terra-staff'>
        <Col>
          <h2>{t('static-about-terra:content.staff')}</h2>
          {data.aboutTerra.staff.map(s => (
            <Row key={s.name} className='staff-member'>
              <Col xs={{ span: 6, offset: 3 }} sm={{ span: 2, offset: 0 }}>
                <Img
                  fluid={s.avatar.fluid}
                  className='mb-2'
                  backgroundColor='#e8e8e8'
                />
                <h4 className='text-center'>{s.name}</h4>
              </Col>
              <Col sm={10}>{documentToReactComponents(s.biography.json)}</Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Layout>
  )
}

StaticAboutTerra.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticAboutTerra($locale: String, $imagesFromRichText: [String!]!) {
    aboutTerra: contentfulPageAboutTerra(node_locale: { eq: $locale }) {
      columnLeft {
        json
      }
      columnRight {
        json
      }
      staff {
        name
        avatar {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
        }
        biography {
          json
        }
      }
    }
    imagesFromRichText: allContentfulAsset(
      filter: {
        contentful_id: { in: $imagesFromRichText }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ImageFromRichText
      }
    }
  }
`

export default StaticAboutTerra
