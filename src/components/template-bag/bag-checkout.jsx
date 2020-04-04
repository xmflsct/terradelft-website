import React, { useContext, useState } from "react"
import { Button, Col, Form } from "react-bootstrap"
import ReCAPTCHA from "react-google-recaptcha"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import ReactSelect from "react-select"
import { useStaticQuery, graphql } from "gatsby"
import { findIndex, forIn, includes, sumBy } from "lodash"
import { loadStripe } from "@stripe/stripe-js"

import { ContextBag } from "../../layouts/contexts/bag"
import { checkout } from "../../api/checkout"

var countries = require("i18n-iso-countries")
countries.registerLocale(require("i18n-iso-countries/langs/en.json"))
countries.registerLocale(require("i18n-iso-countries/langs/nl.json"))

const BagCheckout = () => {
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
  const { t, i18n } = useTranslation("static-bag")
  const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY)
  const { state, dispatch } = useContext(ContextBag)
  const recaptchaRef = React.createRef()
  const [corrections, setCorrections] = useState({ required: false })
  const {
    control,
    formState,
    getValues,
    handleSubmit,
    register,
    watch,
  } = useForm({
    mode: "onChange",
  })

  const options = {
    countries: [],
    shipping: [],
  }
  forIn(countries.getNames(i18n.language), (v, k) => {
    options.countries.push({
      value: countries.alpha2ToNumeric(k),
      label: v,
    })
  })
  const selectedCountry = watch("selectedCountry")
  // ! Rest of the world
  if (selectedCountry) {
    options.shipping =
      rates[i18n.language].rates[
        findIndex(rates[i18n.language].rates, (d) => {
          return includes(d.countryCode, selectedCountry.value)
        })
      ].rates
  }

  const pay = {
    objects: sumBy(state.bag.objects, (d) => {
      if (d.priceSale) {
        return d.priceSale
      } else {
        return d.priceOriginal
      }
    }),
    discount: sumBy(state.bag.objects, (d) => {
      if (d.priceSale) {
        return d.priceOriginal - d.priceSale
      }
    }),
    shipping:
      options.shipping.length && watch("selectedShipping")
        ? options.shipping[watch("selectedShipping")].price
        : null,
  }

  const userVerified = (token) => {
    handleSubmit((data) => formSubmit(data, token))()
  }
  const formSubmit = async (d, t) => {
    const data = {
      objects: state.bag.objects,
      shipping: {
        countryCode: d.selectedCountry.value,
        countryA2: countries.numericToAlpha2(d.selectedCountry.value),
        methodIndex: d.selectedShipping,
      },
      pay: {
        subtotal: pay.objects,
        shipping: pay.shipping,
      },
      locale: i18n.language,
    }
    const res = await checkout(t, data)
    if (res.sessionId) {
      const stripe = await stripePromise
      setCorrections({ required: false })
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.sessionId,
      })
      if (error) {
        return false
      }
    } else if (res.corrections) {
      handleCorrection(res.corrections)
      return false
    } else {
      console.log(res)
      return false
    }
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    formState.isSubmitted && (await recaptchaRef.current.reset())
    recaptchaRef.current.execute()
  }

  const handleCorrection = (corrections) => {
    setCorrections({
      required: true,
      subtotal: corrections.objects.length ? pay.objects : null,
      shipping: corrections.shipping ? pay.shipping : null,
      total: pay.objects + pay.shipping,
    })
    if (corrections.objects.length) {
      for (const object of corrections.objects) {
        object.stock === 0
          ? dispatch({
              // Remove out of stock
              type: "remove",
              data: object,
            })
          : dispatch({
              // Update prices
              type: "update",
              data: object,
            })
      }
    }
    if (corrections.shipping) {
      options.shipping[getValues().selectedShipping].price =
        corrections.shipping
    }
    if (corrections.subtotal) {
      console.log("subtotal wrong")
    }
  }

  return (
    <>
      {t("summary")}
      {state.bag.objects.length !== 0 && (
        <Form onSubmit={(e) => onSubmit(e)}>
          <Form.Group>
            <Controller
              as={<ReactSelect />}
              name='selectedCountry'
              options={options.countries}
              defaultValue={null}
              isSearchable
              control={control}
              rules={{ required: true }}
            />
          </Form.Group>
          {options.shipping &&
            options.shipping.map((d, i) => (
              <Form.Row key={i}>
                <input
                  type='radio'
                  name='selectedShipping'
                  value={i}
                  required
                  ref={register({ required: true })}
                />
                {d.method}{" "}
                {d.price === 0 ||
                (d.freeForTotal && pay.objects >= d.freeForTotal) ? (
                  "Free"
                ) : (
                  <>€ {d.price}</>
                )}
                {d.description && (
                  <>
                    <br />
                    {d.description}
                  </>
                )}
              </Form.Row>
            ))}
          <Form.Row>
            <Form.Label column lg='4'>
              Subtotal
            </Form.Label>
            <Col sm='8'>
              {corrections.subtotal && <strike>{corrections.subtotal}</strike>}{" "}
              {pay.objects}
            </Col>
          </Form.Row>
          {pay.discount > 0 && (
            <Form.Row>
              <Form.Label column lg='4'>
                Discount
              </Form.Label>
              <Col sm='8'>{pay.discount}</Col>
            </Form.Row>
          )}
          <Form.Row>
            <Form.Label column lg='4'>
              Shipping
            </Form.Label>
            <Col sm='8'>
              {corrections.shipping && <strike>{corrections.shipping}</strike>}{" "}
              {pay.shipping}
            </Col>
          </Form.Row>
          <Form.Row>
            <Form.Label column lg='4'>
              Total
            </Form.Label>
            <Col sm='8'>
              {corrections.required && <strike>{corrections.total}</strike>}{" "}
              {pay.objects && pay.shipping && pay.objects + pay.shipping}
            </Col>
          </Form.Row>
          <Button
            variant='primary'
            type='submit'
            disabled={formState.isSubmitting}
          >
            {(formState.isSubmitting && "Connecting") ||
              (formState.submitCount !== 0 && "Retry") ||
              t("checkout")}
          </Button>
          {corrections.required ? "Correction needed" : ""}
          <ReCAPTCHA
            ref={recaptchaRef}
            size='invisible'
            badge='inline'
            sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
            onChange={userVerified}
            hl={i18n.language}
          />
        </Form>
      )}
    </>
  )
}

export default BagCheckout
