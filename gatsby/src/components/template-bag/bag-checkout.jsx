import React, { useContext, useLayoutEffect, useReducer, useState } from 'react'
import {
  Button,
  Col,
  Form,
  FormCheck,
  Row,
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { useStaticQuery, graphql } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faApplePay,
  faCcAmex,
  faGoogleWallet,
  faCcMastercard,
  faCcVisa,
  faIdeal
} from '@fortawesome/free-brands-svg-icons'
import { findIndex, forIn, includes, sumBy } from 'lodash'
import { loadStripe } from '@stripe/stripe-js'

import { ContextBag } from '../../layouts/contexts/bag'
import { checkout } from '../../api/checkout'
import * as formatNumber from '../utils/format-number'

function initBagCheckout ({ i18n, state, countries }) {
  const bagCheckout = {
    delivery: {
      shipment: {
        countries: { options: [], selectedCountryCode: null },
        methods: { options: [], selectedIndex: null }
      },
      selected: 'pickup'
    },
    amounts: {
      subtotal: sumBy(state.bag.objects, d => {
        // if (d.priceSale) {
        //   return d.priceSale
        // } else {
        return d.priceOriginal
        // }
      }),
      discount: sumBy(state.bag.objects, d => {
        if (d.priceSale) {
          return (d.priceOriginal * 10 - d.priceSale * 10) / 10
        }
      }),
      delivery: 0
    }
  }

  forIn(countries.getNames(i18n.language), (v, k) => {
    bagCheckout.delivery.shipment.countries.options.push({
      value: countries.alpha2ToNumeric(k),
      label: v
    })
  })

  return bagCheckout
}

function reducerBagCheckout (bagCheckout, action) {
  switch (action.type) {
    case 'pickup':
      bagCheckout.delivery.selected = action.data
      if (action.data === 'pickup') {
        bagCheckout.amounts.delivery = 0
      } else {
        bagCheckout.delivery.shipment.methods.selectedIndex = null
        bagCheckout.amounts.delivery = null
      }
      break
    case 'country':
      bagCheckout.delivery.shipment.methods.selectedIndex = null
      bagCheckout.amounts.delivery = null
      bagCheckout.delivery.shipment.countries.selectedCountryCode =
        action.data.countryCode
      let rateIndex = findIndex(action.data.rates, d => {
        return includes(d.countryCode, action.data.countryCode)
      })
      // Needed when "other countries" which does not have a country code
      rateIndex = rateIndex !== -1 ? rateIndex : action.data.rates.length - 1
      bagCheckout.delivery.shipment.methods.options =
        action.data.rates[rateIndex].rates
      break
    case 'method':
      bagCheckout.delivery.shipment.methods.selectedIndex = action.data
      if (
        Number.isFinite(
          bagCheckout.delivery.shipment.methods.options[action.data]
            .freeForTotal
        ) &&
        bagCheckout.amounts.subtotal >=
          bagCheckout.delivery.shipment.methods.options[action.data]
            .freeForTotal
      ) {
        bagCheckout.amounts.delivery = 0
      } else {
        bagCheckout.amounts.delivery =
          bagCheckout.delivery.shipment.methods.options[action.data].price
      }
      break
    case 'reset':
      bagCheckout = initBagCheckout({
        i18n: action.data.i18n,
        state: action.data.state,
        countries: action.data.countries
      })
      break
  }

  return { ...bagCheckout }
}

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
  const { t, i18n } = useTranslation('static-bag')
  var countries = require('i18n-iso-countries')
  countries.registerLocale(
    require(`i18n-iso-countries/langs/${i18n.language}.json`)
  )
  const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY)
  const { state, dispatch } = useContext(ContextBag)
  const recaptchaRef = React.createRef()
  const [bagCheckout, updateBagCheckout] = useReducer(
    reducerBagCheckout,
    { i18n, state, countries },
    initBagCheckout
  )
  useLayoutEffect(() => {
    updateBagCheckout({
      type: 'reset',
      data: {
        i18n: i18n,
        state: state,
        countries: countries
      }
    })
  }, [state])
  const [corrections, setCorrections] = useState({ required: false })
  const { formState, handleSubmit } = useForm()

  const userVerified = token => {
    handleSubmit(() => formSubmit(token))()
  }
  const formSubmit = async token => {
    const data = {
      objects: state.bag.objects,
      delivery: {
        type: bagCheckout.delivery.selected,
        name:
          bagCheckout.delivery.selected === 'pickup'
            ? `${t('content.checkout.delivery.pickup.heading')} ${t(
                'content.checkout.delivery.pickup.name'
              )}`
            : bagCheckout.delivery.shipment.methods.options[
                bagCheckout.delivery.shipment.methods.selectedIndex
              ].method,
        ...(bagCheckout.delivery.selected === 'shipment' && {
          countryCode:
            bagCheckout.delivery.shipment.countries.selectedCountryCode,
          countryA2: countries.numericToAlpha2(
            bagCheckout.delivery.shipment.countries.selectedCountryCode
          ),
          methodIndex: bagCheckout.delivery.shipment.methods.selectedIndex
        })
      },
      amounts: {
        subtotal: bagCheckout.amounts.subtotal,
        delivery: bagCheckout.amounts.delivery
      },
      url: {
        success: `${window.location.origin}${t(
          'constant:slug.static.thank-you.slug',
          {
            locale: i18n.language
          }
        )}`,
        cancel: `${window.location.origin}${t('constant:slug.static.bag.slug', {
          locale: i18n.language
        })}`
      },
      locale: i18n.language
    }
    const res = await checkout(token, data)
    if (res.sessionId) {
      const stripe = await stripePromise
      setCorrections({ required: false })
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.sessionId
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
  const onSubmit = async e => {
    e.preventDefault()
    formState.isSubmitted && (await recaptchaRef.current.reset())
    recaptchaRef.current.execute()
  }

  const handleCorrection = d => {
    console.log(d)
    setCorrections({
      required: true,
      subtotal: d.objects.length ? bagCheckout.amounts.subtotal : null,
      delivery: d.shipping ? bagCheckout.amounts.delivery : null,
      total:
        (bagCheckout.amounts.subtotal * 10 +
          bagCheckout.amounts.delivery * 10) /
        10
    })
    if (d.objects.length) {
      for (const object of d.objects) {
        object.stock === 0
          ? dispatch({
              // Remove out of stock
              type: 'remove',
              data: object
            })
          : dispatch({
              // Update prices
              type: 'update',
              data: object
            })
      }
    }
    if (d.delivery) {
      console.error('shipping wrong')
    }
    if (d.subtotal) {
      console.error('subtotal wrong')
    }
  }

  return (
    <>
      {state.bag.objects.length > 0 && (
        <>
          <h3>{t('content.checkout.heading.delivery')}</h3>
          <Tabs
            id='delivery-methods'
            activeKey={bagCheckout.delivery.selected}
            variant='pills'
            fill
            onSelect={e => {
              updateBagCheckout({
                type: 'pickup',
                data: e
              })
            }}
          >
            <Tab
              eventKey='pickup'
              title={t('content.checkout.delivery.pickup.heading')}
              className='p-3'
            >
              <Row className='checkout-shipping'>
                <Col xs={9}>
                  <FormCheck>
                    <FormCheck.Input
                      type='radio'
                      defaultChecked
                      disabled={formState.isSubmitting}
                    />
                    <FormCheck.Label>
                      {t('content.checkout.delivery.pickup.name')}
                    </FormCheck.Label>
                    <Form.Text>
                      {t('content.checkout.delivery.pickup.address')}
                    </Form.Text>
                  </FormCheck>
                </Col>
                <Col xs={3} className='text-right'>
                  {t('content.checkout.delivery.free')}
                </Col>
              </Row>
            </Tab>
            <Tab
              eventKey='shipment'
              title={t('content.checkout.delivery.shipment.heading')}
              className='p-3'
            >
              <ReactSelect
                name='optionCountries'
                className='mb-3'
                options={bagCheckout.delivery.shipment.countries.options}
                placeholder={t('content.checkout.delivery.shipment.selection')}
                onChange={e => {
                  updateBagCheckout({
                    type: 'country',
                    data: {
                      countryCode: e.value,
                      rates: rates[i18n.language].rates
                    }
                  })
                }}
                isSearchable
                isDisabled={formState.isSubmitting}
              />
              {bagCheckout.delivery.shipment.methods.options.map((d, i) => {
                return (
                  <Row className='checkout-shipping mb-2' key={i}>
                    <Col xs={9}>
                      <FormCheck>
                        <FormCheck.Input
                          type='radio'
                          checked={
                            bagCheckout.delivery.shipment.methods
                              .selectedIndex == i
                              ? true
                              : false
                          }
                          value={i}
                          onChange={e => {
                            updateBagCheckout({
                              type: 'method',
                              data: e.target.value
                            })
                          }}
                          required
                          disabled={formState.isSubmitting}
                        />
                        <FormCheck.Label>{d.method}</FormCheck.Label>
                        {d.description && (
                          <Form.Text>{d.description}</Form.Text>
                        )}
                        {Number.isFinite(d.freeForTotal) && (
                          <Form.Text>
                            {t(
                              'content.checkout.delivery.shipment.free-for-total'
                            )}{' '}
                            {formatNumber.currency(
                              d.freeForTotal,
                              i18n.language
                            )}
                          </Form.Text>
                        )}
                      </FormCheck>
                    </Col>
                    <Col xs={3} className='text-right'>
                      {d.price === 0 ||
                        (Number.isFinite(d.freeForTotal) &&
                        bagCheckout.amounts.subtotal >= d.freeForTotal ? (
                          t('content.checkout.delivery.free')
                        ) : (
                          <>{formatNumber.currency(d.price, i18n.language)}</>
                        ))}
                    </Col>
                  </Row>
                )
              })}
            </Tab>
          </Tabs>
          <hr />
          <h3>{t('content.checkout.heading.summary')}</h3>
          <Row className='checkout-sum sum-subtotal'>
            <Col md='5'>
              <strong>{t('content.checkout.summary.subtotal')}</strong>
            </Col>
            <Col md='7'>
              {corrections.subtotal && (
                <strike>
                  {formatNumber.currency(corrections.subtotal, i18n.language)}
                </strike>
              )}{' '}
              {formatNumber.currency(
                bagCheckout.amounts.subtotal,
                i18n.language
              )}
            </Col>
          </Row>
          {bagCheckout.amounts.discount > 0 && (
            <Row className='checkout-sum sum-discount'>
              <Col md='5'>
                <strong>{t('content.checkout.summary.discount')}</strong>
              </Col>
              <Col md='7'>
                -{' '}
                {formatNumber.currency(
                  bagCheckout.amounts.discount,
                  i18n.language
                )}
              </Col>
            </Row>
          )}
          <Row className='checkout-sum sum-shipping mb-2'>
            <Col md='5'>
              <strong>{t('content.checkout.summary.delivery')}</strong>
            </Col>
            <Col md='7'>
              {(corrections.shipping > 0 && (
                <strike>
                  {formatNumber.currency(corrections.shipping, i18n.language)}
                </strike>
              )) ||
                (corrections.shipping === 0 && (
                  <strike>{t('content.checkout.delivery.free')}</strike>
                ))}{' '}
              {(bagCheckout.amounts.delivery > 0 &&
                formatNumber.currency(
                  bagCheckout.amounts.delivery,
                  i18n.language
                )) ||
                (bagCheckout.amounts.delivery === 0 &&
                  t('content.checkout.delivery.free'))}
            </Col>
          </Row>
          <Row className='checkout-sum sum-total'>
            <Col md='5'>
              <strong>{t('content.checkout.summary.total')}</strong>
            </Col>
            <Col md='7'>
              {corrections.required && (
                <strike>
                  {formatNumber.currency(corrections.total, i18n.language)}
                </strike>
              )}{' '}
              {bagCheckout.amounts.delivery !== null &&
                formatNumber.currency(
                  (bagCheckout.amounts.subtotal * 10 -
                    (bagCheckout.amounts.discount || 0) * 10 +
                    bagCheckout.amounts.delivery * 10) /
                    10,
                  i18n.language
                )}
            </Col>
          </Row>
          <Form className='mt-3' onSubmit={e => onSubmit(e)}>
            <Button
              variant='primary'
              type='submit'
              className='mb-2'
              disabled={
                !Number.isFinite(bagCheckout.amounts.delivery) ||
                formState.isSubmitting
              }
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
                (formState.submitCount !== 0 &&
                  t('content.checkout.button.retry')) ||
                t('content.checkout.button.submit')}
            </Button>
            {corrections.required ? (
              <p className='checkout-correction'>
                {t('content.checkout.correction')}
              </p>
            ) : (
              ''
            )}
            <div className='mt-3'>
              <FontAwesomeIcon icon={faIdeal} size='2x' />{' '}
              <FontAwesomeIcon icon={faApplePay} size='2x' />{' '}
              <FontAwesomeIcon icon={faGoogleWallet} size='2x' />{' '}
              <FontAwesomeIcon icon={faCcVisa} size='2x' />{' '}
              <FontAwesomeIcon icon={faCcMastercard} size='2x' />{' '}
              <FontAwesomeIcon icon={faCcAmex} size='2x' />
            </div>
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
