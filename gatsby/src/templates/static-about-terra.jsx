import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from "gatsby-plugin-image";
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import contentfulRichTextOptions from '../components/utils/contentfulRichTextOptions'
import Layout from '../layouts/layout'

const StaticAboutTerra = ({ data }) => {
  const { t } = useTranslation('static-about-terra')

  return (
    <Layout
      SEOtitle={t('static-about-terra:name')}
      SEOkeywords={[t('static-about-terra:name'), 'Terra Delft']}
      SEOdescription={documentToPlainTextString(
        JSON.parse(data.aboutTerra.columnLeft.raw)
      ).substring(0, 199)}
      containerName='static-about-terra'
    >
      <h1>{t('static-about-terra:name')}</h1>
      <Row>
        <Col sm={6}>
          {renderRichText(
            data.aboutTerra.columnLeft,
            contentfulRichTextOptions
          )}
        </Col>
        <Col sm={6}>
          {renderRichText(
            data.aboutTerra.columnRight,
            contentfulRichTextOptions
          )}
        </Col>
      </Row>
      <Row className='terra-staff'>
        <Col>
          <h2>{t('static-about-terra:content.staff')}</h2>
          {data.aboutTerra.staff.map(s => (
            <Row key={s.name} className='staff-member'>
              <Col xs={{ span: 6, offset: 3 }} sm={{ span: 2, offset: 0 }}>
                <GatsbyImage
                  image={s.avatar.gatsbyImageData}
                  className='mb-2'
                  backgroundColor='#e8e8e8' />
                <h4 className='text-center'>{s.name}</h4>
              </Col>
              <Col sm={10}>{renderRichText(s.biography)}</Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Layout>
  );
}

StaticAboutTerra.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticAboutTerra($locale: String) {
    aboutTerra: contentfulPageAboutTerra(node_locale: { eq: $locale }) {
      columnLeft {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            gatsbyImageData(layout: CONSTRAINED, quality: 85)
          }
        }
      }
      columnRight {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            gatsbyImageData(layout: CONSTRAINED, quality: 85)
          }
        }
      }
      staff {
        name
        avatar {
          gatsbyImageData(layout: CONSTRAINED, quality: 100)
        }
        biography {
          raw
        }
      }
    }
  }
`

export default StaticAboutTerra
