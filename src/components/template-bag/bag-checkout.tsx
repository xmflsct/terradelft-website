import {
  BagState,
  getBag,
  getDeliveryMethod,
  getDeliveryShippingCountry
} from '@state/slices/bag'
import { loadStripe } from '@stripe/stripe-js'
import checkout from '@utils/checkout'
import { graphql, useStaticQuery } from 'gatsby'
import countries from 'i18n-iso-countries'
import { findIndex, sumBy } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CheckoutAmounts from './bagCheckout/Amounts'
import CheckoutDeliveryMethods from './bagCheckout/DeliveryMethods'
import CheckoutSuppliers from './bagCheckout/Suppliers'

const BagCheckout = () => {
  const { t, i18n } = useTranslation()
  const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY!)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const bagObjects = useSelector(getBag)
  const deliveryMethod = useSelector(getDeliveryMethod)
  const shippingCountry = useSelector(getDeliveryShippingCountry)

  const rates = useStaticQuery(graphql`
    {
      nl: contentfulShippingRates(
        contentful_id: { eq: "4PqNb8jwgZrWgqXFzafrI5" }
        node_locale: { eq: "nl" }
      ) {
        rates {
          countryCode
          type
          rates {
            method
            price
            freeForTotal
            description
          }
        }
      }
      en: contentfulShippingRates(
        contentful_id: { eq: "4PqNb8jwgZrWgqXFzafrI5" }
        node_locale: { eq: "en" }
      ) {
        rates {
          countryCode
          type
          rates {
            method
            price
            freeForTotal
            description
          }
        }
      }
    }
  `)
  const [shipmentMethods, setShipmentMethods] = useState<
    {
      method: string
      price: number
      freeForTotal?: number
      description?: string
    }[]
  >()
  useEffect(() => {
    const foundIndex = findIndex(rates[i18n.language].rates, rate =>
      // @ts-ignore
      rate.countryCode.includes(shippingCountry?.value)
    )
    if (foundIndex !== -1) {
      setShipmentMethods(rates[i18n.language].rates[foundIndex].rates)
    } else if (shippingCountry) {
      setShipmentMethods(
        rates[i18n.language].rates[rates[i18n.language].rates.length - 1].rates
      )
    }
  }, [shippingCountry, i18n.language])

  const subtotal = sumBy(
    bagObjects,
    object => (object.priceOriginal * 10 * object.amount) / 10
  )
  const amounts = {
    subtotal,
    discount: sumBy(bagObjects, object =>
      object.priceSale
        ? (object.priceOriginal * 10 - object.priceSale * 10) / 10
        : 0
    )
  }

  const { formState, handleSubmit } = useForm()

  const userVerified = (token: string) => {
    handleSubmit(() => formSubmit(token))()
  }
  const formSubmit = async (token: string) => {
    let delivery
    switch (deliveryMethod) {
      case 'pickup':
        delivery = {
          method: 'pickup',
          name: t('content.checkout.delivery.pickup.heading')
        }
        break
      case 'shipment':
        delivery = {
          method: 'shipment',
          countryCode: shippingCountry!.value,
          countryA2: countries.numericToAlpha2(shippingCountry!.value)
        }
        break
    }

    const res = await checkout({
      token,
      objects: bagObjects,
      // @ts-ignore
      delivery,
      amounts,
      locale: i18n.language,
      urls: {
        success: `${window.location.origin}/thank-you`,
        cancel: `${window.location.origin}/bag`
      }
    })
    console.log('res', res)
    if (res.sessionId) {
      const stripe = await stripePromise
      const result = await stripe?.redirectToCheckout({
        sessionId: res.sessionId
      })
      if (result && result.error) {
        return false
      }
    } else {
      return false
    }
  }
  const onSubmit = useCallback(
    async e => {
      e.preventDefault()
      formState.isSubmitted && (await recaptchaRef.current?.reset())
      recaptchaRef.current?.execute()
    },
    [formState.isSubmitted, recaptchaRef.current]
  )

  return bagObjects.length > 0 ? (
    <Form className='mt-3' onSubmit={e => onSubmit(e)}>
      <h3>{t('content.checkout.heading.summary')}</h3>
      <CheckoutAmounts {...amounts} />
      <h3>{t('content.checkout.heading.delivery')}</h3>
      <CheckoutDeliveryMethods
        subtotal={amounts.subtotal}
        isSubmitting={formState.isSubmitting}
        shipmentMethods={shipmentMethods}
      />
      <Button
        style={{ marginBottom: '1rem', width: '100%' }}
        variant='primary'
        type='submit'
        disabled={formState.isSubmitting}
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
            {` ${t('content.checkout.button.wait')}`}
          </>
        )) ||
          (formState.submitCount !== 0 && t('content.checkout.button.retry')) ||
          t('content.checkout.button.submit')}
      </Button>
      <CheckoutSuppliers />
      <div className='mt-3' style={{ opacity: 0, height: '1px' }}>
        <ReCAPTCHA
          ref={recaptchaRef}
          size='invisible'
          badge='inline'
          // @ts-ignore
          sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
          onChange={userVerified}
          hl={i18n.language}
        />
      </div>
    </Form>
  ) : null
}

export default BagCheckout
