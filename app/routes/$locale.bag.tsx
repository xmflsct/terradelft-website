import { gql } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { ActionFunctionArgs, Form, LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router';
import BagCheckout from '~/components/bag/checkout';
import BagList from '~/components/bag/list';
import { H1 } from '~/components/globals';
import cache from '~/utils/cache';
import checkout from '~/utils/checkout';
import { graphqlRequest, ShippingRates } from '~/utils/contentful';
import { SEOKeywords, SEOTitle } from '~/utils/seo';

export const action = async (args: ActionFunctionArgs) => {
  const formData = await args.request.formData()
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

  const res = (await checkout({ args, content: parsedJson })) as any
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
export const loader = async (args: LoaderFunctionArgs) => {
  const data = await cache<{
    shippingRates: { items: { rates: ShippingRates }[] }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageBag($preview: Boolean, $locale: String) {
          shippingRates: shippingRatesCollection(
            preview: $preview
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
    })
  })
  const env = { STRIPE_KEY_PUBLIC: args.context.cloudflare.env.STRIPE_KEY_PUBLIC as string }
  // @ts-ignore
  const country: string = args.request.cf?.country || 'NL'

  return { env, country, rates: data.shippingRates.items[0].rates }
}

export const meta: MetaFunction = () => [
  { title: SEOTitle() },
  { name: 'keywords', content: SEOKeywords() },
  { name: 'description', content: 'Terra Delft Website' }
]
export let handle = { i18n: ['bag', 'object'] }

const PageBag = () => {
  const data = useLoaderData<typeof loader>()
  const { t } = useTranslation('bag')

  return (
    <>
      <H1>{t('common:pages.bag')}</H1>
      <Form method='post' className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-7'>
          <BagList />
        </div>
        <div className='col-span-12 lg:col-span-5'>
          <BagCheckout {...data} />
        </div>
      </Form>
    </>
  )
}

export default PageBag
