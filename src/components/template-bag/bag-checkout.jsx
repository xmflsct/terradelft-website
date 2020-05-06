import React, { useContext, useState } from "react"
import { Button, Col, Form, FormCheck, Spinner } from "react-bootstrap"
import ReCAPTCHA from "react-google-recaptcha"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import ReactSelect from "react-select"
import { useStaticQuery, graphql } from "gatsby"
import { findIndex, forIn, includes, sumBy } from "lodash"
import { loadStripe } from "@stripe/stripe-js"

import { ContextBag } from "../../layouts/contexts/bag"
import { checkout } from "../../api/checkout"
import * as formatNumber from "../utils/format-number"

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
    setValue,
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
  if (selectedCountry) {
    let index = findIndex(rates[i18n.language].rates, (d) => {
      return includes(d.countryCode, selectedCountry.value)
    })
    // Needed when "other countries" which does not have a country code
    index = index !== -1 ? index : rates[i18n.language].rates.length - 1
    options.shipping = rates[i18n.language].rates[index].rates
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
        return (d.priceOriginal * 10 - d.priceSale * 10) / 10
      }
    }),
    shipping: null,
  }

  const selectedShipping = watch("selectedShipping")
  if (selectedShipping) {
    if (
      options.shipping[selectedShipping].freeForTotal &&
      pay.objects >= options.shipping[selectedShipping].freeForTotal
    ) {
      pay.shipping = 0
    } else {
      pay.shipping = options.shipping[selectedShipping].price
    }
  }

  const userVerified = (token) => {
    handleSubmit((data) => formSubmit(data, token))()
  }
  const formSubmit = async (d, token) => {
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
      url: {
        success: `${window.location.origin}/${t(
          "constant:slug.static.thank-you.slug",
          {
            locale: i18n.language,
          }
        )}`,
        cancel: `${window.location.origin}/${t(
          "constant:slug.static.bag.slug",
          {
            locale: i18n.language,
          }
        )}`,
      },
      locale: i18n.language,
    }
    const res = await checkout(token, data)
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
      console.log(res.error)
      return false
    }
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    formState.isSubmitted && (await recaptchaRef.current.reset())
    recaptchaRef.current.execute()
  }

  const handleCorrection = (d) => {
    setCorrections({
      required: true,
      subtotal: d.objects.length ? pay.objects : null,
      shipping: d.shipping ? pay.shipping : null,
      total: (pay.objects * 10 + pay.shipping * 10) / 10,
    })
    if (d.objects.length) {
      for (const object of d.objects) {
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
    if (d.shipping) {
      const tempShippingIndex = getValues().selectedShipping
      options.shipping[tempShippingIndex].price = d.shipping
    }
    if (d.subtotal) {
      console.log("subtotal wrong")
    }
  }

  return (
    <>
      {state.bag.objects.length > 0 && (
        <>
          <h2>{t("content.checkout.heading")}</h2>
          <Form onSubmit={(e) => onSubmit(e)}>
            <Form.Group className='checkout-country'>
              <Form.Label>{t("content.checkout.shipping.heading")}</Form.Label>
              <Controller
                as={<ReactSelect />}
                name='selectedCountry'
                options={options.countries}
                placeholder={t("content.checkout.shipping.selection")}
                defaultValue={null}
                isSearchable
                control={control}
                onChange={(e, i) => {
                  setValue("selectedShipping", null)
                  return e[0]
                }}
                rules={{ required: true }}
                isDisabled={formState.isSubmitting}
              />
            </Form.Group>
            {options.shipping?.map((d, i) => {
              return (
                <Form.Row className='checkout-shipping mb-2' key={i}>
                  <Col xs={9}>
                    <FormCheck>
                      <Controller
                        as={<FormCheck.Input />}
                        type='radio'
                        name='selectedShipping'
                        value={i}
                        valueName='id'
                        control={control}
                        required
                        disabled={formState.isSubmitting}
                      />
                      <FormCheck.Label>{d.method}</FormCheck.Label>
                      {d.description && <Form.Text>{d.description}</Form.Text>}
                      {d.freeForTotal && (
                        <Form.Text>
                          {`${t(
                            "content.checkout.shipping.free-for-total"
                          )} ${formatNumber.currency(
                            d.freeForTotal,
                            i18n.language
                          )}`}
                        </Form.Text>
                      )}
                    </FormCheck>
                  </Col>
                  <Col xs={3} className='text-right'>
                    {d.price === 0 ||
                    (d.freeForTotal && pay.objects >= d.freeForTotal) ? (
                      t("content.checkout.shipping.free-fee")
                    ) : (
                      <>{formatNumber.currency(d.price, i18n.language)}</>
                    )}
                  </Col>
                </Form.Row>
              )
            })}
            <Form.Row className='checkout-sum sum-subtotal'>
              <Form.Label column md='5'>
                {t("content.checkout.sum.subtotal")}
              </Form.Label>
              <Form.Label column md='7'>
                {corrections.subtotal && (
                  <strike>
                    {formatNumber.currency(corrections.subtotal, i18n.language)}
                  </strike>
                )}{" "}
                {formatNumber.currency(pay.objects, i18n.language)}
              </Form.Label>
            </Form.Row>
            {pay.discount > 0 && (
              <Form.Row className='checkout-sum sum-discount'>
                <Form.Label column md='5'>
                  {t("content.checkout.sum.discount")}
                </Form.Label>
                <Form.Label column md='7'>
                  {formatNumber.currency(pay.discount, i18n.language)}
                </Form.Label>
              </Form.Row>
            )}
            <Form.Row className='checkout-sum sum-shipping'>
              <Form.Label column md='5'>
                {t("content.checkout.sum.shipping")}
              </Form.Label>
              <Form.Label column md='7'>
                {(corrections.shipping > 0 && (
                  <strike>
                    {formatNumber.currency(corrections.shipping, i18n.language)}
                  </strike>
                )) ||
                  (corrections.shipping === 0 && (
                    <strike>{t("content.checkout.shipping.free-fee")}</strike>
                  ))}{" "}
                {(pay.shipping > 0 &&
                  formatNumber.currency(pay.shipping, i18n.language)) ||
                  (pay.shipping === 0 &&
                    t("content.checkout.shipping.free-fee"))}
              </Form.Label>
            </Form.Row>
            <Form.Row className='checkout-sum sum-total'>
              <Form.Label column md='5'>
                {t("content.checkout.sum.total")}
              </Form.Label>
              <Form.Label column md='7'>
                {corrections.required && (
                  <strike>
                    {formatNumber.currency(corrections.total, i18n.language)}
                  </strike>
                )}{" "}
                {pay.shipping !== null &&
                  formatNumber.currency(
                    (pay.objects * 10 + pay.shipping * 10) / 10,
                    i18n.language
                  )}
              </Form.Label>
            </Form.Row>
            <Button
              variant='primary'
              type='submit'
              className='mb-2'
              disabled={!selectedShipping || formState.isSubmitting}
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
                  {` ${t("content.checkout.button.wait")}`}
                </>
              )) ||
                (formState.submitCount !== 0 &&
                  t("content.checkout.button.retry")) ||
                t("content.checkout.button.submit")}
            </Button>
            {corrections.required ? (
              <p className='checkout-correction'>
                {t("content.checkout.correction")}
              </p>
            ) : (
              ""
            )}
            <div className='mt-3'>
              <ReCAPTCHA
                ref={recaptchaRef}
                size='invisible'
                badge='inline'
                sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
                onChange={userVerified}
                hl={i18n.language}
              />
            </div>
          </Form>
        </>
      )}
    </>
  )
}

export default BagCheckout
