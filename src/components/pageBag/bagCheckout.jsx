import React, { useContext, useState } from "react"
import { Button, Col, Form } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Controller, useForm } from "react-hook-form"
import ReactSelect from "react-select"
import { useStaticQuery, graphql } from "gatsby"
import { findIndex, forIn, includes, sumBy } from "lodash"
import Reaptcha from "reaptcha"

import { BagObjects } from "../layout"
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
  const { state, dispatch } = useContext(BagObjects)
  const { t, i18n } = useTranslation("pageBag")
  const {
    control,
    formState,
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm({
    mode: "onChange"
  })

  const options = {
    countries: [],
    shipping: []
  }
  const pay = {
    objects: sumBy(state, d => {
      if (d.priceSale) {
        return d.priceSale
      } else {
        return d.priceOriginal
      }
    }),
    discount: sumBy(state, d => {
      if (d.priceSale) {
        return d.priceOriginal - d.priceSale
      }
    })
  }

  forIn(countries.getNames(i18n.language), (v, k) => {
    options.countries.push({
      value: countries.alpha2ToNumeric(k),
      label: v
    })
  })

  const selectedCountry = watch("selectedCountry")
  if (selectedCountry) {
    options.shipping =
      rates[i18n.language].rates[
        findIndex(rates[i18n.language].rates, d => {
          return includes(d.countryCode, selectedCountry.value)
        })
      ].rates
  }

  const [correction, setCorrection] = useState(false)
  const [recaptcha, setRecaptcha] = useState(null)
  const onVerify = () => {
    handleSubmit(formSubmit)()
  }
  const formSubmit = async d => {
    setCorrection(false)
    const data = {
      objects: state,
      shipping: {
        country: d.selectedCountry.value,
        method: d.selectedShipping
      },
      pay: {
        objects: pay.objects,
        shipping: d.payShipping,
        total: d.payTotal
      }
    }
    const res = await checkout(await recaptcha.getResponse(), data)
    if (res.sessionId) {
      // const stripe = await stripePromise
      // const { error } = await stripe.redirectToCheckout({
      //   sessionId: res.sessionId
      // })
      // if (error) {
      //   return false
      // }
    } else if (res.error) {
      setCorrection(true)
      handleCorrection(res.error)
      return false
    } else {
      return false
    }
  }
  const onSubmit = async e => {
    e.preventDefault()
    formState.isSubmitted && (await recaptcha.reset())
    recaptcha.execute()
  }

  const handleCorrection = corrections => {
    for (const correction of corrections) {
      console.log(correction)
      correction.stock === 0
        ? dispatch({
            type: "remove",
            data: correction
          })
        : dispatch({
            type: "add",
            data: correction
          })
    }
  }

  return (
    <>
      {t("summary")}
      {state.length !== 0 && (
        <Form onSubmit={e => onSubmit(e)}>
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
                  value={d.method}
                  // label={d.price}
                  required
                  onChange={() => {
                    setValue(
                      "payShipping",
                      d.freeForTotal && pay.objects >= d.freeForTotal
                        ? 0
                        : d.price
                    )
                    setValue(
                      "payTotal",
                      d.freeForTotal && pay.objects >= d.freeForTotal
                        ? pay.objects
                        : d.price + pay.objects
                    )
                  }}
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
            <Col sm='8'>{pay.objects}</Col>
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
              <Controller
                as={<Form.Control />}
                name='payShipping'
                plaintext
                readOnly
                defaultValue={""}
                control={control}
              />
            </Col>
          </Form.Row>
          <Form.Row>
            <Form.Label column lg='4'>
              Total
            </Form.Label>
            <Col sm='8'>
              <Controller
                as={<Form.Control />}
                name='payTotal'
                plaintext
                readOnly
                defaultValue={""}
                control={control}
              />
            </Col>
          </Form.Row>
          <Button
            variant='primary'
            type='submit'
            disabled={!formState.isValid || formState.isSubmitting}
          >
            {(formState.isSubmitting && "Connecting") ||
              (formState.submitCount !== 0 && "Retry") ||
              t("checkout")}
          </Button>
          {correction ? "Correction needed" : ""}
          <Reaptcha
            ref={e => setRecaptcha(e)}
            onVerify={onVerify}
            sitekey='6Ld1ruIUAAAAAJyq6JSxAT04pza_Zom9k7hyl1Vb'
            size='invisible'
            badge='inline'
            hl={i18n.language}
          />
        </Form>
      )}
    </>
  )
}

export default BagCheckout
