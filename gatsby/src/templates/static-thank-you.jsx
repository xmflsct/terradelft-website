import React, { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import Layout from '../layouts/layout'
import { bagClear } from '../state/slices/bag'

const StaticThankYou = () => {
  const { t } = useTranslation('static-thank-you')
  const dispatch = useDispatch()
  let session_id =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('session_id')
      : ''
  useEffect(() => {
    dispatch(bagClear())
  }, [session_id, dispatch])

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      SEOdescription={t('name')}
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
