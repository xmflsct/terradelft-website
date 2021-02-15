import countries from 'i18n-iso-countries'
import React, { useCallback, useMemo } from 'react'
import { Form } from 'react-bootstrap'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  getDeliveryMethod,
  getDeliveryPhone,
  getDeliveryShippingCountry,
  updateDeliveryPhone
} from '../../../state/slices/bag'

const CheckoutPhone: React.FC = () => {
  const dispatch = useDispatch()
  const deliveryMethod = useSelector(getDeliveryMethod)
  const deliveryPhone = useSelector(getDeliveryPhone)
  const shippingCountry = useSelector(getDeliveryShippingCountry)
  const onChange = useCallback(
    value => dispatch(updateDeliveryPhone(value)),
    []
  )
  const defaultCcountry = useMemo(() => {
    if (!deliveryPhone) {
      switch (deliveryMethod) {
        case 'pickup':
          return 'NL'
        case 'shipment':
          if (shippingCountry?.value) {
            return countries.numericToAlpha2(shippingCountry.value)
          } else {
            return undefined
          }
      }
    }
  }, [deliveryMethod, deliveryPhone, shippingCountry?.value])

  return (
    <Form.Group className='px-3'>
      <Form.Label>Phone number</Form.Label>
      <PhoneInput
        placeholder='Enter phone number'
        value={deliveryPhone}
        displayInitialValueAsLocalNumber={false}
        useNationalFormatForDefaultCountryValue={false}
        international
        defaultCountry={defaultCcountry}
        onChange={onChange}
      />
    </Form.Group>
  )
}

export default CheckoutPhone
