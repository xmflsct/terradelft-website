import { gql, QueryOptions } from '@apollo/client'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams, useSubmit } from '@remix-run/react'
import { sortBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { H4 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import Pagination from '~/components/pagination'
import {
  cacheQuery,
  ObjectsArtist,
  ObjectsColour,
  ObjectsObject,
  ObjectsVariation
} from '~/utils/contentful'
import { currency } from '~/utils/formatNumber'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import sortArtists from '~/utils/sortArtists'

type Data = {
  meta: { title: string }
  data: {
    objects: {
      total: number
      items: Pick<
        ObjectsObject,
        | 'sys'
        | 'name'
        | 'imagesCollection'
        | 'priceSale'
        | 'sellOnline'
        | 'stock'
        | 'variationsCollection'
      >[]
    }
    objectsVariations: { items: ObjectsVariation[] }
    objectsColours: { items: ObjectsColour[] }
    artists: { items: Pick<ObjectsArtist, 'sys' | 'slug' | 'artist'>[] }
  }
}
export const loader: LoaderFunction = async props => {
  const page = parseInt(props.params.page || '') - 1
  if (page < 0) {
    throw json('Not Found', { status: 404 })
  }
  const perPage = 66

  const query: QueryOptions<{ locale: string; limit: number; skip: number }> = {
    variables: {
      locale: props.params.locale!,
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
            priceSale
            sellOnline
            stock
            variationsCollection(limit: 50) {
              items {
                priceSale
                sellOnline
                stock
              }
            }
          }
        }
        objectsVariations: objectsVariationCollection(locale: $locale) {
          items {
            sys {
              id
            }
            variant
          }
        }
        objectsColours: objectsColourCollection(locale: $locale) {
          items {
            sys {
              id
            }
            colour
          }
        }
        artists: objectsArtistCollection(locale: $locale) {
          items {
            sys {
              id
            }
            slug
            artist
          }
        }
      }
    `
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, {
    titleKey: 'pages.shop',
    titleOptions: { context: 'page', page: props.params.page }
  })

  return json({
    meta,
    data: {
      ...data,
      objects: {
        ...data.objects,
        total: Math.round(data.objects.total / perPage)
      },
      objectsVariations: {
        ...data.objectsVariations,
        items: sortBy(data.objectsVariations.items)
      },
      objectsColours: {
        ...data.objectsColours,
        items: sortBy(data.objectsColours.items)
      },
      artists: sortArtists(data.artists)
    }
  })
}

export const meta: MetaFunction = ({ data: { meta } }: { data: Data }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords([meta.title]),
  description: 'Terra Delft Website'
})
export let handle = {
  i18n: 'shop'
}

const PageShopPage: React.FC = () => {
  const {
    data: {
      objects: { total, items: objects },
      objectsVariations,
      objectsColours,
      artists
    }
  } = useLoaderData<Data>()
  const { page } = useParams()

  const {
    t,
    i18n: { language }
  } = useTranslation('shop')

  const options = {
    prices: [
      {
        label: `< ${currency(50, language)}`,
        value: { min: 0, max: 50 }
      },
      {
        label: `${currency(50, language)} - ${currency(100, language)}`,
        value: { min: 50, max: 100 }
      },
      {
        label: `${currency(100, language)} - ${currency(200, language)}`,
        value: { min: 100, max: 200 }
      },
      {
        label: `${currency(200, language)} - ${currency(300, language)}`,
        value: { min: 200, max: 300 }
      },
      {
        label: `${currency(300, language)} - ${currency(500, language)}`,
        value: { min: 300, max: 500 }
      },
      {
        label: `> ${currency(500, language)}`,
        value: { min: 500, max: 99999 }
      }
    ],
    artists: artists.items.map(artist => ({
      label: artist.artist,
      value: artist.slug
    })),
    variants: objectsVariations.items.map(variant => ({
      label: variant.variant,
      value: variant.sys.id
    })),
    colours: objectsColours.items.map(colour => ({
      label: colour.colour,
      value: colour.sys.id
    }))
  }
  const [selected, setSelected] = useState<{
    price?: { min: number; max: number }
    artist?: string
    variant?: string
    colour?: string
  }>()

  const submit = useSubmit()
  useEffect(() => {
    const searchParams = new URLSearchParams()
    if (selected?.price) {
      searchParams.append('price[min]', selected.price.min.toString())
      searchParams.append('price[max]', selected.price.max.toString())
    }
    if (selected?.artist) {
      searchParams.append('artist', selected.artist)
    }
    if (selected?.variant) {
      searchParams.append('variant', selected.variant)
    }
    if (selected?.colour) {
      searchParams.append('colour', selected.colour)
    }
    // submit(searchParams, { method: 'get', action: `/${language}/shop` })
  }, [selected])

  return (
    <>
      <H4>{t('filters')}</H4>
      <form className='grid grid-cols-4 gap-4 mb-8'>
        <ReactSelect
          name='price'
          isClearable
          options={options.prices}
          placeholder={t('prices')}
          onChange={d =>
            setSelected({ ...selected, price: d ? d.value : undefined })
          }
        />
        <ReactSelect
          name='artist'
          isClearable
          isSearchable
          options={options.artists}
          placeholder={t('artists')}
          onChange={d =>
            setSelected({ ...selected, artist: d ? d.value : undefined })
          }
        />
        <ReactSelect
          name='variant'
          isClearable
          isSearchable
          options={options.variants}
          placeholder={t('variants')}
          onChange={d =>
            setSelected({ ...selected, variant: d ? d.value : undefined })
          }
        />
        <ReactSelect
          name='colour'
          isClearable
          isSearchable
          options={options.colours}
          placeholder={t('colours')}
          onChange={d =>
            setSelected({ ...selected, variant: d ? d.value : undefined })
          }
        />
      </form>
      <GridObjectDefault objects={objects} />
      <Pagination basePath='/shop/page' total={total} page={page!} />
    </>
  )
}

export default PageShopPage
