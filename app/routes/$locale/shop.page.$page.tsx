import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit } from '@remix-run/react'
import { gql } from 'graphql-request'
import { find, inRange, maxBy, sortBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { H4 } from '~/components/globals'
import ListObjects from '~/components/list/objects'
import Pagination from '~/components/pagination'
import i18next from '~/i18next.server'
import cache from '~/utils/cache'
import { GiftCard, graphqlRequest } from '~/utils/contentful'
import { currency } from '~/utils/formatNumber'
import { getSellableObjects, SellableObject } from '~/utils/kv'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

type Options = {
  prices: {
    label: string
    value: { min: number; max: number }
    isDisabled: boolean
  }[]
  artists: { label: string; value: string; isDisabled: boolean }[]
  variants: { label: string; value: string; isDisabled: boolean }[]
  colours: { label: string; value: string; isDisabled: boolean }[]
}

export const loader = async (args: LoaderArgs) => {
  const page = parseInt(args.params.page || '')
  if (page < 1) {
    throw json('Not Found', { status: 404 })
  }

  const meta = await loadMeta(args, {
    titleKey: 'pages.shop',
    titleOptions: { context: 'page', page }
  })

  const locale = await i18next.getLocale(args.request)
  const objects = await getSellableObjects(args)
  const options: Options = {
    prices: [
      {
        label: `< ${currency(50, locale)}`,
        value: { min: 0, max: 50 },
        isDisabled: false
      },
      {
        label: `${currency(50, locale)} - ${currency(100, locale)}`,
        value: { min: 50, max: 100 },
        isDisabled: false
      },
      {
        label: `${currency(100, locale)} - ${currency(200, locale)}`,
        value: { min: 100, max: 200 },
        isDisabled: false
      },
      {
        label: `${currency(200, locale)} - ${currency(300, locale)}`,
        value: { min: 200, max: 300 },
        isDisabled: false
      },
      {
        label: `${currency(300, locale)} - ${currency(500, locale)}`,
        value: { min: 300, max: 500 },
        isDisabled: false
      },
      {
        label: `> ${currency(500, locale)}`,
        value: { min: 500, max: 99999 },
        isDisabled: false
      }
    ],
    artists: [],
    variants: [],
    colours: []
  }

  const url = new URL(args.request.url)
  const searchParams = {
    price_min: url.searchParams.get('price[min]'),
    price_max: url.searchParams.get('price[max]'),
    artist: url.searchParams.get('artist'),
    variant: url.searchParams.get('variant'),
    colour: url.searchParams.get('colour')
  }

  const reducedObjects = objects.reduce(
    (reduced: SellableObject[], obj: SellableObject) => {
      // First push all options
      if (obj.artist?.artist) {
        find(options.artists, a => a.value === obj.artist.slug) ||
          options.artists.push({
            label: obj.artist.artist,
            value: obj.artist.slug,
            isDisabled: false
          })
      }
      obj.variationsCollection?.items?.forEach(item => {
        if (!item) return
        if (item.variant?.variant) {
          find(options.variants, v => v.value === item.variant?.sys.id) ||
            options.variants.push({
              label: item.variant.variant,
              value: item.variant.sys.id,
              isDisabled: false
            })
        }
        if (item.colour?.colour) {
          find(options.colours, c => c.value === item.colour?.sys.id) ||
            options.colours.push({
              label: item.colour.colour,
              value: item.colour.sys.id,
              isDisabled: false
            })
        }
      })

      if (
        (searchParams.price_min && searchParams.price_max) ||
        searchParams.artist ||
        searchParams.variant ||
        searchParams.colour
      ) {
        const matched: {
          price: boolean | null
          artist: boolean | null
          variant: boolean | null
          colour: boolean | null
        } = {
          price: null,
          artist: null,
          variant: null,
          colour: null
        }

        if (searchParams.price_min && searchParams.price_max) {
          if (obj.variationsCollection?.items?.length) {
            matched.price =
              (maxBy(
                obj.variationsCollection.items,
                item => item?.priceSale || -1
              ) || -1) >= parseInt(searchParams.price_min) &&
              (maxBy(
                obj.variationsCollection.items,
                item => item?.priceOriginal || -1
              ) || -1) <= parseInt(searchParams.price_max)
          } else {
            const objPrice = obj.priceSale || obj.priceOriginal || -1
            matched.price =
              objPrice >= parseInt(searchParams.price_min) &&
              objPrice <= parseInt(searchParams.price_max)
          }
        }

        if (searchParams.artist) {
          matched.artist = searchParams.artist === obj.artist?.slug
        }

        if (searchParams.variant) {
          matched.variant = obj.variationsCollection?.items?.length
            ? obj.variationsCollection.items.filter(
                item => item?.variant?.sys.id === searchParams.variant
              ).length > 0
            : false
        }

        if (searchParams.colour) {
          matched.colour = obj.variationsCollection?.items?.length
            ? obj.variationsCollection.items.filter(
                item => item?.colour?.sys.id === searchParams.colour
              ).length > 0
            : false
        }

        if (
          matched.price !== false &&
          matched.artist !== false &&
          matched.variant !== false &&
          matched.colour !== false
        ) {
          reduced.push(obj)
        }
      }

      return reduced
    },
    []
  )

  if (
    (searchParams.price_min && searchParams.price_max) ||
    searchParams.artist ||
    searchParams.variant ||
    searchParams.colour
  ) {
    const reducedOptions: {
      prices: { hasObject: boolean; value: { min: number; max: number } }[]
      artists: { value: string }[]
      variants: { value: string }[]
      colours: { value: string }[]
    } = {
      prices: [
        { hasObject: false, value: { min: 0, max: 50 } },
        { hasObject: false, value: { min: 50, max: 100 } },
        { hasObject: false, value: { min: 100, max: 200 } },
        { hasObject: false, value: { min: 200, max: 300 } },
        { hasObject: false, value: { min: 300, max: 500 } },
        { hasObject: false, value: { min: 500, max: 99999 } }
      ],
      artists: [],
      variants: [],
      colours: []
    }
    // Check for disabled options
    reducedObjects.forEach(obj => {
      if (!(searchParams.price_min || searchParams.price_max)) {
        reducedOptions.prices = reducedOptions.prices.map(price => {
          if (price.hasObject) {
            return price
          } else {
            if (
              (obj.priceRange.min &&
                inRange(
                  obj.priceRange.min,
                  price.value.min,
                  price.value.max
                )) ||
              (obj.priceRange.max &&
                inRange(obj.priceRange.max, price.value.min, price.value.max))
            ) {
              return { ...price, hasObject: true }
            } else {
              return price
            }
          }
        })
      }
      if (!searchParams.artist && obj.artist?.artist) {
        find(reducedOptions.artists, a => a.value === obj.artist.slug) ||
          reducedOptions.artists.push({ value: obj.artist.slug })
      }
      obj.variationsCollection?.items?.forEach(item => {
        if (!item) return
        if (!searchParams.variant && item.variant?.variant) {
          find(
            reducedOptions.variants,
            v => v.value === item.variant?.sys.id
          ) || reducedOptions.variants.push({ value: item.variant?.sys.id })
        }
        if (!searchParams.colour && item.colour?.colour) {
          find(reducedOptions.colours, c => c.value === item.colour?.sys.id) ||
            reducedOptions.colours.push({ value: item.colour?.sys.id })
        }
      })
    })

    // When an option is selected, keep all its options
    !(searchParams.price_min || searchParams.price_max) &&
      reducedOptions.prices.forEach((p, i) => {
        options.prices[i].isDisabled = !p.hasObject
      })
    !searchParams.artist &&
      (options.artists = options.artists.map(artist => ({
        ...artist,
        isDisabled:
          reducedOptions.artists.filter(a => a.value === artist.value)
            .length === 0
      })))
    !searchParams.variant &&
      (options.variants = options.variants.map(variant => ({
        ...variant,
        isDisabled:
          reducedOptions.variants.filter(v => v.value === variant.value)
            .length === 0
      })))
    !searchParams.colour &&
      (options.colours = options.colours.map(colour => ({
        ...colour,
        isDisabled:
          reducedOptions.colours.filter(c => c.value === colour.value)
            .length === 0
      })))

    options.artists = sortBy(
      options.artists,
      ({ label, isDisabled }) =>
        label.match(new RegExp(/\b(\w+)\W*$/))![0] && isDisabled
    )
    options.variants = sortBy(
      options.variants,
      ({ label, isDisabled }) => label && isDisabled
    )
    options.colours = sortBy(
      options.colours,
      ({ label, isDisabled }) => label && isDisabled
    )
    return json({
      meta,
      giftCard: null,
      data: { options, objects: reducedObjects, page: null }
    })
  }

  const { giftCard } = await cache<{ giftCard: GiftCard }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageIndex($locale: String!) {
          giftCard(locale: $locale, id: "owqoj0fTsXPwPeo6VMb2Z") {
            imagesCollection(limit: 1) {
              items {
                url
              }
            }
          }
        }
      `
    })
  })

  const perPage = 48
  options.artists = sortBy(
    options.artists,
    ({ label }) => label.match(new RegExp(/\b(\w+)\W*$/))![0]
  )
  options.variants = sortBy(options.variants, ({ label }) => label)
  options.colours = sortBy(options.colours, ({ label }) => label)
  return json({
    meta,
    giftCard,
    data: {
      options,
      objects: objects.slice(
        page === 1 ? 0 : perPage * page - perPage - 1,
        perPage * page - 1
      ),
      page: { total: Math.round(objects.length / perPage), current: page }
    }
  })
}

export const meta: MetaFunction = ({
  data: { meta }
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords([meta.title]),
  description: 'Terra Delft Website'
})
export let handle = { i18n: 'shop' }

const PageShopPage: React.FC = () => {
  const {
    giftCard,
    data: { options, objects, page }
  } = useLoaderData<typeof loader>()

  const { t } = useTranslation('shop')

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
    submit(searchParams, { method: 'get' })
  }, [selected])

  return (
    <>
      <H4>{t('filters')}</H4>
      <form className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
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
          isDisabled={
            !selected?.artist &&
            options.artists.filter(artist => !artist.isDisabled).length === 0
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
          isDisabled={
            !selected?.variant &&
            options.variants.filter(variant => !variant.isDisabled).length === 0
          }
        />
        <ReactSelect
          name='colour'
          isClearable
          isSearchable
          options={options.colours}
          placeholder={t('colours')}
          onChange={d =>
            setSelected({ ...selected, colour: d ? d.value : undefined })
          }
          isDisabled={
            !selected?.colour &&
            options.colours.filter(colour => !colour.isDisabled).length === 0
          }
        />
      </form>
      <ListObjects
        giftCard={page?.current === 1 ? giftCard : undefined}
        objects={objects}
      />
      {page && (
        <Pagination
          basePath='/shop/page'
          total={page.total}
          page={page.current}
        />
      )}
    </>
  )
}

export default PageShopPage
