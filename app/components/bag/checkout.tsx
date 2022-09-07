import { useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { loadStripe } from '@stripe/stripe-js'
import countries from 'i18n-iso-countries'
import { sumBy } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BagData } from '~/routes/$locale/bag'
import { BagContext } from '~/states/bag'
import { CheckoutContent } from '~/utils/checkout'
import Button from '../button'
import { H3 } from '../globals'
import CheckoutAmounts from './checkout/amounts'
import CheckoutDelivery from './checkout/delivery'
import CheckoutSuppliers from './checkout/suppliers'

const BagCheckout: React.FC<BagData> = ({ country, rates }) => {
  const { t, i18n } = useTranslation('bag')

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

  const subtotal = sumBy(objects, object => (object.priceOriginal * 10 * object.amount) / 10)
  const amounts = {
    subtotal,
    discount: sumBy(objects, object =>
      object.priceSale ? (object.priceOriginal * 10 - object.priceSale * 10) / 10 : 0
    )
  }

  const transition = useTransition()

  const checkoutContent: CheckoutContent = {
    objects,
    delivery:
      delivery.method === 'pickup'
        ? {
            method: 'pickup',
            name: t('pick-up')
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
      cancel: `${typeof window !== 'undefined' && window.location.origin}/${i18n.language}/bag`
    }
  }

  const { env } = useLoaderData<BagData>()
  const stripePromise = loadStripe(env.STRIPE_KEY_PUBLIC)
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
      <H3>{t('summary')}</H3>
      <CheckoutAmounts {...amounts} />
      <H3>{t('delivery-method')}</H3>
      <CheckoutDelivery
        country={country}
        subtotal={amounts.subtotal}
        isSubmitting={transition.state === 'submitting'}
        shipmentMethods={shipmentMethods}
      />

      <input type='hidden' name='json' value={JSON.stringify(checkoutContent)} />

      <Button type='submit' disabled={transition.state === 'submitting'} className='my-4 w-full'>
        {(transition.state === 'submitting' && t('button.wait')) ||
          (formState.submitCount !== 0 && t('button.retry')) ||
          t('button.submit')}
      </Button>
      <CheckoutSuppliers />
    </>
  ) : null
}

export default BagCheckout
