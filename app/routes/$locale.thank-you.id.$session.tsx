import { json, LoaderArgs, V2_MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import { currency } from '~/utils/formatNumber'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  if (!args.params.session) {
    throw json('Not Found', { status: 404 })
  }

  const session = await (
    await fetch(`https://api.stripe.com/v1/checkout/sessions/${args.params.session}`, {
      headers: { Authorization: `Bearer ${args.context.STRIPE_KEY_PRIVATE}` }
    })
  ).json<{
    amount_total: number
    payment_status: 'paid' | 'unpaid'
    customer_details: { name: string }
    shipping_rate: string
    shipping_options: { shipping_rate: string; shipping_amount: number }[]
  }>()

  if (session.payment_status !== 'paid') {
    throw json('Not Paid', { status: 404 })
  }

  const line_items = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${args.params.session}/line_items?limit=100`,
      {
        headers: { Authorization: `Bearer ${args.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<{
    data: {
      id: string
      description: string
      quantity: number
      amount_total: number
    }[]
  }>()

  const meta = await loadMeta(args, { titleKey: 'pages.thank-you' })
  return json({ meta, session, line_items })
}

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && [
    {
      title: SEOTitle(data.meta.title),
      keywords: SEOKeywords([data.meta.title])
    }
  ]
export let handle = { i18n: 'thankYou' }

const PageThankYou: React.FC = () => {
  const { session, line_items } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation('thankYou')

  useEffect(() => {
    localStorage.setItem('objects', JSON.stringify([]))
  }, [])

  return (
    <>
      <H1>{t('heading')}</H1>
      <p>{t('content')}</p>
      <table className='w-full lg:max-w-3xl mt-4'>
        <tbody>
          <tr>
            <th className='p-1 text-left'>Item</th>
            <th className='p-1 text-center'>Quantity</th>
            <th className='p-1 text-right'>Price</th>
            <th className='p-1 text-right'>Amount</th>
          </tr>
          {line_items?.data?.map(item => (
            <tr
              key={item.id}
              className='border-t border-stone-300 hover:bg-stone-300 hover:cursor-pointer'
            >
              <td className='p-1'>{item.description}</td>
              <td className='p-1 text-center'>{item.quantity}</td>
              <td className='p-1 text-right'>
                {currency(item.amount_total / item.quantity / 10 / 10, i18n.language)}
              </td>
              <td className='p-1 text-right'>
                {currency(item.amount_total / 10 / 10, i18n.language)}
              </td>
            </tr>
          ))}
          {session.shipping_options.length > 1 &&
          session.shipping_options.filter(
            shipping => shipping.shipping_rate === session.shipping_rate
          ).length === 1 ? (
            <tr>
              <td colSpan={3} className='py-2 px-1 text-right'>
                Shipping
              </td>
              <td className='py-2 px-1 text-right'>
                {currency(
                  session.shipping_options.filter(
                    shipping => shipping.shipping_rate === session.shipping_rate
                  )[0].shipping_amount /
                    10 /
                    10,
                  i18n.language
                )}
              </td>
            </tr>
          ) : null}
          <tr>
            <td colSpan={3} className='py-2 px-1 font-bold text-right'>
              Total
            </td>
            <td className='py-2 px-1 font-bold text-right'>
              {currency(session.amount_total / 10 / 10, i18n.language)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default PageThankYou
