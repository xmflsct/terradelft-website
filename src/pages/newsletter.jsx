import Layout from '@components/layout'
import api from '@utils/api'
import { graphql } from 'gatsby'
import { forIn } from 'lodash'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
countries.registerLocale(require('i18n-iso-countries/langs/nl.json'))

const PageNewsletter = ({ pageContext }) => {
  const { t } = useTranslation()
  const recaptchaRef = useRef()
  const { formState, handleSubmit, register } = useForm()
  const [sendStatus, setSendStatus] = useState(false)

  const countriesOptions = []
  forIn(countries.getNames(pageContext.language), country => {
    countriesOptions.push(country)
  })

  const formSubmit = async (t, d) => {
    const data = {
      name: d.firstName + ' ' + d.lastName,
      email: d.email,
      type: '[Subscribe to newsletter]',
      subject: `from ${d.firstName} ${d.lastName}`,
      html: `<p>First name: ${d.firstName}</p>
      <p>Last name: ${d.lastName}</p>
      <p>Email: ${d.email}</p>
      <p>Country: ${d.country}</p>
      <p>GDPR: ${d.GDPR.toString()}</p>`
    }

    const response = await api('email', { token: t, ...data })
    if (response.success) {
      setSendStatus(true)
      return true
    } else {
      return false
    }
  }
  const onSubmit = async e => {
    e.preventDefault()
    formState.isSubmitted && (await recaptchaRef.current.reset())
    recaptchaRef.current.execute()
  }

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra', 'Delft', 'Terra Delft']}
      SEOdescription={t('name')}
      containerName='static-newsletter'
    >
      <h1>{t('content.heading')}</h1>
      <Row className='justify-content-md-center'>
        <Col md={6}>
          <p>{t('content.description')}</p>
          <Form onSubmit={e => onSubmit(e)}>
            <Form.Group controlId='formFirstName'>
              <Form.Label>{t('content.form.first-name.label')}</Form.Label>
              <Form.Control
                name='firstName'
                type='input'
                required
                {...register('firstName', { required: true })}
              />
            </Form.Group>

            <Form.Group controlId='formLastName'>
              <Form.Label>{t('content.form.last-name.label')}</Form.Label>
              <Form.Control
                name='lastName'
                type='input'
                required
                {...register('lastName', { required: true })}
              />
            </Form.Group>

            <Form.Group controlId='formEmail'>
              <Form.Label>{t('content.form.email.label')}</Form.Label>
              <Form.Control
                name='email'
                type='email'
                required
                {...register('email', { required: true })}
              />
            </Form.Group>

            <Form.Group controlId='formCountry'>
              <Form.Label>{t('content.form.country.label')}</Form.Label>
              <Form.Control
                name='country'
                as='select'
                defaultValue=''
                required
                {...register('country', { required: true })}
              >
                <option aria-label='Placeholder' value='' disabled />
                {countriesOptions.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group
              controlId='formGDPR'
              style={{ marginTop: '1rem', marginBottom: '1rem' }}
            >
              <Form.Check
                name='GDPR'
                type='checkbox'
                label={t('content.form.GDPR.label')}
                required
                {...register('GDPR', { required: true })}
              />
            </Form.Group>

            <Button
              variant='primary'
              type='submit'
              disabled={formState.isSubmitting || sendStatus}
            >
              {(formState.isSubmitting && (
                <>
                  <Spinner
                    as='span'
                    animation='border'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                  {` ${t('content.form.button.submitting')}`}
                </>
              )) ||
                (formState.submitCount !== 0 &&
                  (sendStatus
                    ? t('content.form.button.success')
                    : t('content.form.button.fail'))) ||
                t('content.form.button.default')}
            </Button>

            <div style={{ opacity: 0, height: '1px' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                size='invisible'
                badge='inline'
                sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
                onChange={value =>
                  handleSubmit(data => formSubmit(value, data))()
                }
                hl={pageContext.language}
              />
            </div>
          </Form>
        </Col>
      </Row>
    </Layout>
  )
}

PageNewsletter.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageNewsletter($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-newsletter"] }
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

export default PageNewsletter
