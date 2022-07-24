import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import GridObjectOnlineShop from '~/components/grids/grid-object-online-shop'
import {
  cacheQuery,
  getObjectsObjects,
  ObjectsObject
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => await getObjectsObjects(props))

export const meta: MetaFunction = () => ({
  title: SEOTitle('Shop'),
  keywords: SEOKeywords(),
  description: 'Terra Delft Website'
})
export let handle = {
  i18n: 'shop'
}

const PageShop = () => {
  const data = useLoaderData<ObjectsObject[]>()

  return (
    <GridObjectOnlineShop
      objects={data}
      // giftCard={data.giftCard}
    />
  )
}

export default PageShop
