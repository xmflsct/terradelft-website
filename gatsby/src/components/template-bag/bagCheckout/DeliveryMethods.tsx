import countries from 'i18n-iso-countries'
import { forIn } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Col, Form, FormCheck, Row, Tab, Tabs } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import ReactSelect from 'react-select'
import {
  getDeliveryMethod,
  getDeliveryShippingCountry,
  getDeliveryShippingMethod,
  updateDeliveryMethod,
  updateDeliveryShippingCountry,
  updateDeliveryShippingMethod
} from '../../../state/slices/bag'
import { currency } from '../../utils/formatNumber'

export interface Props {
  subtotal: number
  isSubmitting: boolean
  shipmentMethods: {
    method: string
    price: number
    freeForTotal?: number
    description?: string
  }[]
}

const CheckoutDeliveryMethods: React.FC<Props> = ({
  subtotal,
  isSubmitting,
  shipmentMethods
}) => {
  const { t, i18n } = useTranslation('static-bag')
  const shippingCountry = useSelector(getDeliveryShippingCountry)
  const shippingMethod = useSelector(getDeliveryShippingMethod)
  const dispatch = useDispatch()

  const [countryNames, setCountryNames] = useState<
    {
      value: string
      label: string
    }[]
  >()
  useEffect(() => {
    countries.registerLocale(
      // @ts-ignore
      require(`i18n-iso-countries/langs/${i18n.language}.json`)
    )
    const tempCountries = []
    forIn(countries.getNames(i18n.language), (v, k) => {
      tempCountries.push({
        value: countries.alpha2ToNumeric(k),
        label: v
      })
    })
    setCountryNames(tempCountries)
  }, [i18n.language])

  return (
    <Tabs
      id='delivery-methods'
      activeKey={useSelector(getDeliveryMethod)}
      variant='pills'
      fill
      // @ts-ignore
      onSelect={e => {
        switch (e) {
          case 'pickup':
            dispatch(updateDeliveryMethod(e))
            break
          case 'shipment':
            dispatch(updateDeliveryMethod(e))
            break
        }
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
                disabled={isSubmitting}
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
          options={countryNames}
          defaultValue={shippingCountry}
          placeholder={t('content.checkout.delivery.shipment.selection')}
          onChange={e => {
            dispatch(updateDeliveryShippingCountry(e))
          }}
          isSearchable
          isDisabled={isSubmitting}
        />
        {shipmentMethods &&
          shipmentMethods.map((method, index) => {
            return (
              <Row className='checkout-shipping mb-2' key={index}>
                <Col xs={9}>
                  <FormCheck>
                    <FormCheck.Input
                      type='radio'
                      checked={shippingMethod == index}
                      value={index}
                      onChange={() =>
                        dispatch(updateDeliveryShippingMethod(index))
                      }
                      required
                      disabled={isSubmitting}
                    />
                    <FormCheck.Label>{method.method}</FormCheck.Label>
                    {method.description && (
                      <Form.Text>{method.description}</Form.Text>
                    )}
                    {Number.isFinite(method.freeForTotal) && (
                      <Form.Text>
                        {t('content.checkout.delivery.shipment.free-for-total')}{' '}
                        {currency(method.freeForTotal, i18n.language)}
                      </Form.Text>
                    )}
                  </FormCheck>
                </Col>
                <Col xs={3} className='text-right'>
                  {method.price === 0 ||
                    (Number.isFinite(method.freeForTotal) &&
                    subtotal >= method.freeForTotal ? (
                      t('content.checkout.delivery.free')
                    ) : (
                      <>{currency(method.price, i18n.language)}</>
                    ))}
                </Col>
              </Row>
            )
          })}
      </Tab>
    </Tabs>
  )
}

export default CheckoutDeliveryMethods
