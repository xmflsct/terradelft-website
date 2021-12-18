import Layout from '@components/layout'
import { bagClear } from '@state/slices/bag'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import React, { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch } from 'react-redux'

const PageThankYou = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  let session_id =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('session_id')
      : ''
  useEffect(() => {
    session_id && dispatch(bagClear())
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

export const query = graphql`
  query PageThankYou($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-thank-you"] }
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

export default PageThankYou
