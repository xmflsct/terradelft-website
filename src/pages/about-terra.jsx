import contentfulRichTextOptions from '@components/contentfulRichTextOptions'
import Layout from '@components/layout'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const PageAboutTerra = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={t('page-about-terra:name')}
      SEOkeywords={[t('page-about-terra:name'), 'Terra Delft']}
      SEOdescription={documentToPlainTextString(
        JSON.parse(data.aboutTerra.columnLeft.raw)
      ).substring(0, 199)}
      containerName='static-about-terra'
    >
      <h1>{t('page-about-terra:name')}</h1>
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
          <h2>{t('page-about-terra:content.staff')}</h2>
          {data.aboutTerra.staff.map(s => (
            <Row key={s.name} className='staff-member'>
              <Col xs={{ span: 6, offset: 3 }} sm={{ span: 2, offset: 0 }}>
                <GatsbyImage
                  alt={s.name}
                  image={s.avatar.gatsbyImageData}
                  className='mb-2'
                  backgroundColor='#e8e8e8'
                />
                <h4 className='text-center'>{s.name}</h4>
              </Col>
              <Col sm={10}>{renderRichText(s.biography)}</Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Layout>
  )
}

PageAboutTerra.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageAboutTerra($language: String) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-about-terra"] }
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
    aboutTerra: contentfulPageAboutTerra(node_locale: { eq: $language }) {
      columnLeft {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            description
            gatsbyImageData(width: 430, quality: 85)
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
            gatsbyImageData(width: 430, quality: 85)
          }
        }
      }
      staff {
        name
        avatar {
          gatsbyImageData(width: 200)
        }
        biography {
          raw
        }
      }
    }
  }
`

export default PageAboutTerra
