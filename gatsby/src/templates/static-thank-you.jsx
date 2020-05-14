import React, { useContext, useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import Layout from '../layouts/layout'
import { ContextBag } from '../layouts/contexts/bag'

const StaticThankYou = () => {
  const { t } = useTranslation('static-thank-you')
  const { dispatch } = useContext(ContextBag)
  let session_id =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('session_id')
      : ''
  useEffect(() => {
    dispatch({
      type: 'clear'
    })
  }, [session_id, dispatch])

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      containerName='static-thank-you'
    >
      {session_id && (
        <Row className='justify-content-md-center'>
          <Col md={6}>
            <h1>{t('content.heading')}</h1>
            <p>{t('content.content')}</p>
          </Col>
        </Row>
      )}
    </Layout>
  )
}

export default StaticThankYou
