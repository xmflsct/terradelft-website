import sendEmail from '@utils/email'
import PropTypes from 'prop-types'
import React, { useContext, useRef, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ContextVariation } from './object-context'

const ObjectContact = ({ object }) => {
  const { t, i18n } = useTranslation()
  const { stateVariation } = useContext(ContextVariation)
  const recaptchaRef = useRef()
  const { formState, handleSubmit, register } = useForm()
  const [sendStatus, setSendStatus] = useState(false)

  const formSubmit = async (token, d) => {
    const data = {
      name: d.name,
      email: d.email,
      type: '[Object inquiry]',
      subject: t('contact.form.subject.value', {
        name: object.name
      }),
      html: `<p><a href="${window.location.href}" target="_blank">${
        window.location.href
      }</a></p>
      ${
        stateVariation.sku
          ? `<p>${t('contact.form.sku.label')}: ${stateVariation.sku}</p>`
          : ''
      }
      ${
        stateVariation.variant
          ? `<p>${t('contact.form.variant.label')}: ${
              stateVariation.variant
            }</p>`
          : ''
      }
      ${
        stateVariation.colour
          ? `<p>${t('contact.form.colour.label')}: ${stateVariation.colour}</p>`
          : ''
      }
      ${
        stateVariation.size
          ? `<p>${t('contact.form.size.label')}: ${stateVariation.size}</p>`
          : ''
      }
      <p>${t('contact.form.name.label')}: ${d.name}</p>
      <p>${t('contact.form.email.label')}: ${d.email}</p>
      <p>${t('contact.form.question.label')}:<br />${d.question.replace(
        /\r?\n/g,
        '<br />'
      )}</p>
      <p>GDPR: ${d.GDPR.toString()}</p>`
    }
    const response = await sendEmail(token, data)
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
    <div className='object-contact'>
      <h4>{t('contact.heading')}</h4>
      <Form onSubmit={e => onSubmit(e)}>
        <Form.Group controlId='formSubject'>
          <Form.Label>{t('contact.form.subject.label')}</Form.Label>
          <Form.Control
            readOnly
            defaultValue={t('contact.form.subject.value', {
              name: object.name
            })}
          />
        </Form.Group>

        <Form.Group controlId='formName'>
          <Form.Label>{t('contact.form.name.label')}</Form.Label>
          <Form.Control name='name' type='input' ref={register} />
        </Form.Group>

        <Form.Group controlId='formEmail'>
          <Form.Label>{t('contact.form.email.label')}</Form.Label>
          <Form.Control name='email' type='email' required ref={register} />
        </Form.Group>

        <Form.Group controlId='formQuestion'>
          <Form.Label>{t('contact.form.question.label')}</Form.Label>
          <Form.Control
            name='question'
            as='textarea'
            rows={5}
            required
            ref={register}
          />
        </Form.Group>

        <Form.Group controlId='formGDPR'>
          <Form.Check
            name='GDPR'
            type='checkbox'
            label={t('contact.form.GDPR.label')}
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
              {` ${t('contact.form.button.submitting')}`}
            </>
          )) ||
            (formState.submitCount !== 0 &&
              (sendStatus
                ? t('contact.form.button.success')
                : t('contact.form.button.fail'))) ||
            t('contact.form.button.default')}
        </Button>

        <div className='mt-3'>
          <ReCAPTCHA
            ref={recaptchaRef}
            size='invisible'
            badge='inline'
            sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
            onChange={value => handleSubmit(data => formSubmit(value, data))()}
            hl={i18n.language}
          />
        </div>
      </Form>
    </div>
  )
}

ObjectContact.propTypes = {
  object: PropTypes.object.isRequired
}

export default ObjectContact
