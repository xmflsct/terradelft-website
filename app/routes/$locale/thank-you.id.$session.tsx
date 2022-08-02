import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  if (!args.params.session) {
    throw json('Not Found', { status: 404 })
  }

  const session = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${args.params.session}`,
      {
        headers: { Authorization: `Bearer ${args.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<{
    payment_status: 'paid' | 'unpaid'
    customer_details: { name: string }
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
  ).json<{ data: { price: { id: string } }[] }>()

  const meta = await loadMeta(args, { titleKey: 'pages.thank-you' })
  return json({ meta, session, line_items })
}

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(data.meta.title),
  keywords: SEOKeywords([data.meta.title])
})
export let handle = { i18n: 'thankYou' }

const PageThankYou: React.FC = () => {
  const { line_items } = useLoaderData<typeof loader>()
  const { t } = useTranslation('thankYou')

  return (
    <>
      <H1>{t('heading')}</H1>
      <p>{t('content')}</p>
      {line_items?.data?.map(item => (
        <div key={item.price.id}>{item.price.id}</div>
      ))}
      {}
    </>
  )
}

export default PageThankYou
