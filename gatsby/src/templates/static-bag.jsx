import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import Layout from '../layouts/layout'
import BagList from '../components/template-bag/bag-list'
import BagCheckout from '../components/template-bag/bag-checkout'

const StaticBag = () => {
  const { t } = useTranslation('static-bag')

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      SEOdescription={t('content.heading')}
      containerName='static-bag'
    >
      <h1>{t('content.heading')}</h1>
      <Row>
        <Col lg={8} className='bag-list'>
          <BagList />
        </Col>
        <Col lg={4} className='bag-checkout'>
          <BagCheckout />
        </Col>
      </Row>
    </Layout>
  )
}

export default StaticBag
