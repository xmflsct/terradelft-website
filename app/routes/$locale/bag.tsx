import {
  ActionFunction,
  LoaderFunction,
  MetaFunction
} from '@remix-run/cloudflare'
import { Form, useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import BagCheckout from '~/components/bag/checkout'
import BagList from '~/components/bag/list'
import { H1 } from '~/components/globals'
import checkout from '~/utils/checkout'
import { cacheQuery, getShippingRates, ShippingRates } from '~/utils/contentful'
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

export const loader: LoaderFunction = async props => {
  return {
    env: { STRIPE_KEY_PUBLIC: props.context.STRIPE_KEY_PUBLIC },
    // @ts-ignore
    country: props.request.cf?.country || 'NL',
    rates: await cacheQuery(
      300,
      props,
      async () => await getShippingRates(props)
    )
  }
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
  const data = useLoaderData<{
    country: string
    rates: ShippingRates
  }>()
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
