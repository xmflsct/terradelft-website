import { gql, QueryOptions } from '@apollo/client'
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction
} from '@remix-run/cloudflare'
import { Form, useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import BagCheckout from '~/components/bag/checkout'
import BagList from '~/components/bag/list'
import { H1 } from '~/components/globals'
import checkout from '~/utils/checkout'
import { cacheQuery, ShippingRates } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const action: ActionFunction = async ({ context, request }) => {
  const formData = await request.formData()
  const json = formData.get('json')?.toString()

  if (!json) {
    return { error: 'No data was supplied' }
  }

  let parsedJson
  try {
    parsedJson = JSON.parse(json)
  } catch {
    return { error: 'Parsing json failed' }
  }

  const res = (await checkout({ context, content: parsedJson })) as any
  if (res?.id) {
    return res.id
  } else {
    return null
  }
}

export type BagData = {
  env: { STRIPE_KEY_PUBLIC: string }
  country: string
  rates: ShippingRates
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string }> = {
    variables: { locale: props.params.locale! },
    query: gql`
      query Index($locale: String) {
        shippingRates: shippingRatesCollection(
          locale: $locale
          limit: 1
          where: { year: "2022" }
        ) {
          items {
            rates
          }
        }
      }
    `
  }
  const data = await cacheQuery<{
    shippingRates: { items: { rates: ShippingRates }[] }
  }>(query, 30, props)
  const env = { STRIPE_KEY_PUBLIC: props.context.STRIPE_KEY_PUBLIC }
  // @ts-ignore
  const country = props.request.cf?.country || 'NL'

  return json({ env, country, rates: data.shippingRates.items[0].rates })
}

export const meta: MetaFunction = () => ({
  title: SEOTitle(),
  keywords: SEOKeywords(),
  description: 'Terra Delft Website'
})
export let handle = {
  i18n: ['bag', 'object']
}

const PageBag = () => {
  const data = useLoaderData<BagData>()
  const { t } = useTranslation('bag')

  return (
    <>
      <H1>{t('common:pages.bag')}</H1>
      <Form method='post' className='grid grid-cols-12 gap-4'>
        <div className='col-span-7'>
          <BagList />
        </div>
        <div className='col-span-5'>
          <BagCheckout {...data} />
        </div>
      </Form>
    </>
  )
}

export default PageBag
