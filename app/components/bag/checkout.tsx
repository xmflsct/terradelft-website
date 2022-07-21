import { useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { loadStripe } from '@stripe/stripe-js'
import countries from 'i18n-iso-countries'
import { sumBy } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BagContext } from '~/states/bag'
import { CheckoutContent } from '~/utils/checkout'
import { ShippingRates } from '~/utils/contentful'
import Button from '../button'
import { H3 } from '../globals'
import CheckoutAmounts from './checkout/amounts'
import CheckoutDelivery from './checkout/delivery'
import CheckoutSuppliers from './checkout/suppliers'

type Props = {
  country: string
  rates: ShippingRates
}

const BagCheckout: React.FC<Props> = ({ country, rates }) => {
  const { t, i18n } = useTranslation('pageBag')

  const [formState, setFormState] = useState<{
    hasSubmitted: boolean
    submitCount: number
  }>({ hasSubmitted: false, submitCount: 0 })

  const { delivery, objects } = useContext(BagContext)

  const [shipmentMethods, setShipmentMethods] = useState<
    {
      method: string
      price: number
      freeForTotal?: number
      description?: string
    }[]
  >()
  useEffect(() => {
    const foundIndex = rates.findIndex(rate =>
      rate.countryCode.includes(delivery.shipment?.value || '')
    )
    if (foundIndex !== -1) {
      setShipmentMethods(rates[foundIndex].rates)
    } else if (delivery.shipment) {
      setShipmentMethods(rates[rates.length - 1].rates)
    }
  }, [delivery.shipment])

  const subtotal = sumBy(
    objects,
    object => (object.priceOriginal * 10 * object.amount) / 10
  )
  const amounts = {
    subtotal,
    discount: sumBy(objects, object =>
      object.priceSale
        ? (object.priceOriginal * 10 - object.priceSale * 10) / 10
        : 0
    )
  }

  const transition = useTransition()

  const checkoutContent: CheckoutContent = {
    objects,
    delivery:
      delivery.method === 'pickup'
        ? {
            method: 'pickup',
            name: t('content.checkout.delivery.pickup.heading')
          }
        : {
            method: 'shipment',
            countryCode: delivery.shipment.value,
            countryA2: countries.numericToAlpha2(delivery.shipment.value)
          },
    amounts,
    locale: i18n.language,
    urls: {
      success: `${typeof window !== 'undefined' && window.location.origin}/${
        i18n.language
      }/thank-you`,
      cancel: `${typeof window !== 'undefined' && window.location.origin}/${
        i18n.language
      }/bag`
    }
  }

  const data = useLoaderData()
  const stripePromise = loadStripe(data.env.STRIPE_KEY_PUBLIC)
  const actionData = useActionData()
  useEffect(() => {
    const redirect = async (id: string) => {
      const stripe = await stripePromise
      return await stripe?.redirectToCheckout({ sessionId: id })
    }
    if (actionData) {
      redirect(actionData)
    }
  }, [actionData])

  return objects.length ? (
    <>
      <H3>{t('content.checkout.heading.summary')}</H3>
      <CheckoutAmounts {...amounts} />
      <H3>{t('content.checkout.heading.delivery')}</H3>
      <CheckoutDelivery
        country={country}
        subtotal={amounts.subtotal}
        isSubmitting={transition.state === 'submitting'}
        shipmentMethods={shipmentMethods}
      />

      <input
        type='hidden'
        name='json'
        value={JSON.stringify(checkoutContent)}
      />

      <Button type='submit' disabled={transition.state === 'submitting'}>
        {(transition.state === 'submitting' &&
          t('content.checkout.button.wait')) ||
          (formState.submitCount !== 0 && t('content.checkout.button.retry')) ||
          t('content.checkout.button.submit')}
      </Button>
      <CheckoutSuppliers />
    </>
  ) : null
}

export default BagCheckout
