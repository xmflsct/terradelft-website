import Layout from '@components/layout'
import BagCheckout from '@components/template-bag/bag-checkout'
import BagList from '@components/template-bag/bag-list'
import { graphql } from 'gatsby'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const PageBag = () => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      SEOdescription={t('content.heading')}
      containerName='static-bag'
    >
      <h1>{t('content.heading')}</h1>
      <Row>
        <Col lg={7} className='bag-list'>
          <BagList />
        </Col>
        <Col lg={5} className='bag-checkout'>
          <BagCheckout />
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query PageBag($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-bag", "component-object"] }
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
  }
`

export default PageBag
