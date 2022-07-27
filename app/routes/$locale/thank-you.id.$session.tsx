import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  session: {
    payment_status: 'paid' | 'unpaid'
    customer_details: { name: string }
  }
  line_items: { data: { price: { id: string } }[] }
}
export const loader: LoaderFunction = async props => {
  if (!props.params.session) {
    throw json('Not Found', { status: 404 })
  }

  const session = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}`,
      {
        headers: { Authorization: `Bearer ${props.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<Data['session']>()

  if (session.payment_status !== 'paid') {
    throw json('Not Paid', { status: 404 })
  }

  const line_items = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}/line_items?limit=100`,
      {
        headers: { Authorization: `Bearer ${props.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<Data['line_items']>()
  console.log(line_items.data)

  const meta = await loadMeta(props, { titleKey: 'pages.thank-you' })
  return json({ meta, session, line_items })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title])
  }
export let handle = {
  i18n: 'thankYou'
}

const PageThankYou: React.FC = () => {
  const { line_items } = useLoaderData<Data>()
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
