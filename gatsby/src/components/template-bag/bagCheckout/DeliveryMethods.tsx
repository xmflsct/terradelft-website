import {
  getDeliveryMethod,
  getDeliveryShippingCountry,
  updateDeliveryMethod,
  updateDeliveryShippingCountry
} from '@state/slices/bag'
import { currency } from '@utils/formatNumber'
import axios from 'axios'
import countries from 'i18n-iso-countries'
import { forIn } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import ReactSelect from 'react-select'

export interface Props {
  subtotal: number
  isSubmitting: boolean
  shipmentMethods?: {
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
  const { t, i18n } = useTranslation()
  const shippingCountry = useSelector(getDeliveryShippingCountry)
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
    const tempCountries: { value: string; label: string }[] = []
    forIn(countries.getNames(i18n.language), (v, k) => {
      tempCountries.push({
        value: countries.alpha2ToNumeric(k),
        label: v
      })
    })
    setCountryNames(tempCountries)
  }, [i18n.language])

  useEffect(() => {
    const getLoc = async () => {
      let trace: any = []
      return await axios
        .get('/cdn-cgi/trace')
        .then(res => {
          console.log('res data', res.data)
          let lines: string[] = res.data.split('\n')
          let keyValue
          console.log('lines', lines)
          lines.forEach(line => {
            keyValue = line.split('=')
            trace[keyValue[0]] = decodeURIComponent(keyValue[1] || '')

            if (keyValue[0] === 'loc' && trace['loc'] !== 'XX') {
              alert(trace['loc'])
            }

            if (keyValue[0] === 'ip') {
              alert(trace['ip'])
            }
          })
          console.log('trace', trace)
          return trace
        })
        .catch(() => console.log('Fetch /cdn-cgi/trace failed'))
    }
    if (countryNames?.length && !shippingCountry) {
      getLoc().then(res =>
        console.log(
          'country label',
          countryNames.find(
            c => c.value === countries.alpha2ToNumeric(res['loc'])
          )
        )
      )
    }
  }, [countryNames?.length, shippingCountry])

  const deliveryMethod = useSelector(getDeliveryMethod)

  return (
    <Form.Group style={{ marginBottom: '1.5rem' }}>
      <Form.Check name='delivery'>
        <Form.Check.Input
          type='radio'
          onChange={() => dispatch(updateDeliveryMethod('pickup'))}
          checked={deliveryMethod === 'pickup'}
        />
        <Form.Check.Label>
          {t('content.checkout.delivery.pickup.heading')}
        </Form.Check.Label>
        <Form.Text style={{ display: 'block' }}>
          {t('content.checkout.delivery.free')}
        </Form.Text>
      </Form.Check>
      <Form.Check name='delivery'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Form.Check.Input
            style={{ marginTop: 0, marginRight: '0.5rem' }}
            type='radio'
            onChange={() => dispatch(updateDeliveryMethod('shipment'))}
            checked={deliveryMethod === 'shipment'}
          />
          <Form.Check.Label>
            {t('content.checkout.delivery.shipment.heading')}
          </Form.Check.Label>
          <div style={{ flex: '1', marginLeft: '0.5rem' }}>
            <ReactSelect
              name='optionCountries'
              options={countryNames}
              defaultValue={shippingCountry}
              placeholder={t('content.checkout.delivery.shipment.selection')}
              onChange={e => {
                // @ts-ignore
                dispatch(updateDeliveryShippingCountry(e))
              }}
              isSearchable
              isDisabled={deliveryMethod === 'pickup' || isSubmitting}
            />
          </div>
        </div>
        {deliveryMethod === 'shipment' &&
          shipmentMethods &&
          shipmentMethods.map((method, index) => {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ flex: '1', paddingLeft: '1.5rem' }}>
                  <div>{method.method}</div>
                  {method.description && (
                    <div style={{ fontSize: '0.875em', color: '#6c757d' }}>
                      {method.description}
                    </div>
                  )}
                  {method.freeForTotal && Number.isFinite(method.freeForTotal) && (
                    <div style={{ fontSize: '0.875em', color: '#6c757d' }}>
                      {t('content.checkout.delivery.shipment.free-for-total')}{' '}
                      {currency(method.freeForTotal, i18n.language)}
                    </div>
                  )}
                </div>
                <div>
                  {method.price === 0 ||
                    (method.freeForTotal &&
                    Number.isFinite(method.freeForTotal) &&
                    subtotal >= method.freeForTotal ? (
                      t('content.checkout.delivery.free')
                    ) : (
                      <>{currency(method.price, i18n.language)}</>
                    ))}
                </div>
              </div>
            )
          })}
      </Form.Check>
    </Form.Group>
  )
}

export default CheckoutDeliveryMethods
