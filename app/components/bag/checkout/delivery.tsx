import countries from 'i18n-iso-countries'
import { forIn } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { BagContext } from '~/states/bag'
import { currency } from '~/utils/formatNumber'

type Props = {
  country: string
  subtotal: number
  isSubmitting: boolean
  shipmentMethods?: {
    method: string
    price: number
    freeForTotal?: number
    description?: string
  }[]
}

const CheckoutDelivery: React.FC<Props> = ({
  country,
  subtotal,
  isSubmitting,
  shipmentMethods
}) => {
  const { t, i18n } = useTranslation('bag')
  const {
    delivery,
    objects,
    updateDeliveryMethod,
    updateDeliveryShipmentCountry
  } = useContext(BagContext)

  const [countryNames, setCountryNames] = useState<
    {
      value: string
      label: string
    }[]
  >()
  useEffect(() => {
    countries.registerLocale(require(`i18n-iso-countries/langs/en.json`))
    const tempCountries: { value: string; label: string }[] = []
    forIn(countries.getNames(i18n.language), (v, k) => {
      tempCountries.push({
        value: countries.alpha2ToNumeric(k),
        label: v
      })
    })
    const defaultCountry = tempCountries.find(
      c => c.value === countries.alpha2ToNumeric(country)
    )
    if (defaultCountry) {
      updateDeliveryShipmentCountry(defaultCountry)
    }
    setCountryNames(tempCountries)
  }, [i18n.language])

  return (
    <div
      onChange={e =>
        // @ts-ignore
        e.target.name === 'delivery' && updateDeliveryMethod(e.target.value)
      }
    >
      <div>
        <input
          type='radio'
          name='delivery'
          value='pickup'
          checked={delivery.method === 'pickup'}
          onChange={() => {}}
          className='mr-2'
        />
        {t('pick-up')}
        {t('free')}
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <input
            type='radio'
            name='delivery'
            value='shipment'
            checked={delivery.method === 'shipment'}
            onChange={() => {}}
            className='mr-2'
          />
          {t('shipping')}
          <div style={{ flex: '1', marginLeft: '0.5rem' }}>
            <ReactSelect
              name='country'
              options={countryNames}
              value={delivery.shipment}
              placeholder={t('select-country')}
              onChange={e => updateDeliveryShipmentCountry(e)}
              isSearchable
              isDisabled={delivery.method === 'pickup' || isSubmitting}
            />
          </div>
        </div>
        {delivery.method === 'shipment' &&
          shipmentMethods &&
          shipmentMethods.map((method, index) => {
            return (
              <div
                key={index}
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
                      {t('free-for-above', {
                        amount: currency(method.freeForTotal, i18n.language)
                      })}
                    </div>
                  )}
                </div>
                <div>
                  {method.price === 0 ||
                    (method.freeForTotal &&
                    Number.isFinite(method.freeForTotal) &&
                    subtotal >= method.freeForTotal
                      ? t('free')
                      : objects.filter(object => object.type !== 'giftcard')
                          .length === 0 &&
                        countries.alpha2ToNumeric('NL') ===
                          delivery.shipment.value
                      ? currency(2, i18n.language)
                      : currency(method.price, i18n.language))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default CheckoutDelivery
