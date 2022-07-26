import { gql } from '@apollo/client'
import { DataFunctionArgs, json } from '@remix-run/cloudflare'
import { max, min } from 'lodash'
import {
  apolloClient,
  ObjectsObject,
  ObjectsObjectVariation
} from './contentful'

export type SellableObject = Pick<
  ObjectsObject,
  | 'sys'
  | 'name'
  | 'imagesCollection'
  | 'artist'
  | 'priceOriginal'
  | 'priceSale'
  | 'sellOnline'
  | 'stock'
  | 'variationsCollection'
> & {
  variationsCollection: Pick<
    ObjectsObjectVariation,
    | 'priceOriginal'
    | 'priceSale'
    | 'sellOnline'
    | 'stock'
    | 'variant'
    | 'colour'
  >[]
  priceRange: { min?: number; max?: number }
}

const getSellableObjects = async (
  props: DataFunctionArgs
): Promise<SellableObject[]> => {
  if (!props.params.locale) {
    throw json('Locale missing', { status: 400 })
  }

  let objects: SellableObject[] | null =
    await props.context.TERRADELFT_WEBSITE.get(
      `objects_${props.params.locale}`,
      { type: 'json' }
    )

  if (objects === null) {
    objects = []
    const perPage = 60
    let total: number | undefined = undefined
    for (
      let page = 0;
      total === undefined || page <= Math.round(total / perPage);
      page++
    ) {
      const { data } = await apolloClient(props)
        .query<{ objects: { total: number; items: SellableObject[] } }>({
          variables: {
            locale: props.params.locale,
            limit: perPage,
            skip: perPage * page
          },
          query: gql`
            query Shop($locale: String, $limit: Int, $skip: Int) {
              objects: objectsObjectCollection(
                locale: $locale
                limit: $limit
                skip: $skip
              ) {
                total
                items {
                  sys {
                    id
                  }
                  name
                  imagesCollection(limit: 1) {
                    items {
                      url
                    }
                  }
                  artist {
                    slug
                    artist
                  }
                  priceOriginal
                  priceSale
                  sellOnline
                  stock
                  variationsCollection(limit: 50) {
                    items {
                      priceOriginal
                      priceSale
                      sellOnline
                      stock
                      variant {
                        sys {
                          id
                        }
                        variant
                      }
                      colour {
                        sys {
                          id
                        }
                        colour
                      }
                    }
                  }
                }
              }
            }
          `
        })
        .catch(err => {
          throw json(err, { status: 500 })
        })
      if (total === undefined) {
        total = data.objects.total
      }
      objects.push(...data.objects.items)
    }

    objects = objects.reduce(
      (filtered: SellableObject[], item: SellableObject) => {
        if (item.variationsCollection?.items.length) {
          // Count only variations
          if (
            item.variationsCollection.items.filter(
              variation =>
                variation &&
                variation.sellOnline &&
                (variation.stock ?? 0 > 0) &&
                (variation.priceOriginal || variation.priceSale || -1) > 0
            ).length
          ) {
            filtered.push({
              ...item,
              priceRange: {
                min: min(
                  item.variationsCollection.items.map(
                    item => item?.priceSale || item?.priceOriginal
                  )
                ),
                max: max(
                  item.variationsCollection.items.map(
                    item => item?.priceOriginal
                  )
                )
              }
            })
          }
        } else {
          // Count only root object
          if (
            item.sellOnline &&
            (item.stock ?? 0 > 0) &&
            (item.priceOriginal || item.priceSale || -1) > 0
          ) {
            filtered.push({
              ...item,
              priceRange: { min: item.priceSale || item.priceOriginal }
            })
          }
        }

        return filtered
      },
      []
    )

    await props.context.TERRADELFT_WEBSITE.put(
      `objects_${props.params.locale}`,
      JSON.stringify(objects),
      { expirationTtl: 60 * 10 }
    )
  }

  return objects
}

export { getSellableObjects }
