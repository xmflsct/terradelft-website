import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ReCAPTCHA from 'react-google-recaptcha'
import { forIn } from 'lodash'

import Layout from '../layouts/layout'
import sendEmail from '../api/email'

var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
countries.registerLocale(require('i18n-iso-countries/langs/nl.json'))

const StaticNewsletter = ({ pageContext }) => {
  const { t } = useTranslation('static-newsletter')
  const recaptchaRef = useRef()
  const { formState, handleSubmit, register } = useForm()
  const [sendStatus, setSendStatus] = useState(false)

  const countriesOptions = []
  forIn(countries.getNames(pageContext.locale), country => {
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
    const response = await sendEmail(t, data)
    if (response.success) {
      setSendStatus(true)
      return true
    } else {
      console.log(response.error)
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
                ref={register}
              />
            </Form.Group>

            <Form.Group controlId='formLastName'>
              <Form.Label>{t('content.form.last-name.label')}</Form.Label>
              <Form.Control
                name='lastName'
                type='input'
                required
                ref={register}
              />
            </Form.Group>

            <Form.Group controlId='formEmail'>
              <Form.Label>{t('content.form.email.label')}</Form.Label>
              <Form.Control name='email' type='email' required ref={register} />
            </Form.Group>

            <Form.Group controlId='formCountry'>
              <Form.Label>{t('content.form.country.label')}</Form.Label>
              <Form.Control
                name='country'
                as='select'
                defaultValue=''
                required
                ref={register}
              >
                <option value='' disabled />
                {countriesOptions.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId='formGDPR'>
              <Form.Check
                name='GDPR'
                type='checkbox'
                label={t('content.form.GDPR.label')}
                required
                ref={register}
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

            <div className='mt-3'>
              <ReCAPTCHA
                ref={recaptchaRef}
                size='invisible'
                badge='inline'
                sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
                onChange={value =>
                  handleSubmit(data => formSubmit(value, data))()
                }
                hl={pageContext.locale}
              />
            </div>
          </Form>
        </Col>
      </Row>
    </Layout>
  )
}

StaticNewsletter.propTypes = {
  pageContext: PropTypes.object.isRequired
}

export default StaticNewsletter
