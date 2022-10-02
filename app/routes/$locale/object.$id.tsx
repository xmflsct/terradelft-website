import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { max } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product, WithContext } from 'schema-dts'
import { H1, H2, H3 } from '~/components/globals'
import { Link } from '~/components/link'
import ListObjects, { LIST_OBJECT_DETAILS } from '~/components/list/objects'
import ObjectAttribute from '~/components/object/attribute'
import ObjectImages from '~/components/object/images'
import ObjectSell from '~/components/object/sell'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import {
  CommonImage,
  graphqlRequest,
  ObjectsObject,
  ObjectsObjectVariation,
  RICH_TEXT_LINKS
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'
import { ObjectContact } from './object.contact'

export const loader = async (args: LoaderArgs) => {
  const data = await cache<{
    object: Omit<ObjectsObject, 'name'> & { name_nl?: string; name_en?: string }
  }>({
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { id: args.params.id },
      query: gql`
        ${LIST_OBJECT_DETAILS}
        query PageObject($preview: Boolean, $locale: String, $id: String!) {
          object: objectsObject (preview: $preview, locale: $locale, id: $id) {
            sys {
              id
            }
            name_nl: name (locale: "nl")
            name_en: name (locale: "en")
            description {
              json
              ${RICH_TEXT_LINKS}
            }
            imagesCollection {
              items {
                url
                title
                width
                height
              }
            }
            artist {
              slug
              artist
              linkedFrom {
                objectsObjectCollection (locale: "nl") {
                  items {
                    ...ListObjectDetails
                  }
                }
              }
            }
            kunstKoop
            sellOnline
            priceOriginal
            priceSale
            sku
            stock
            variationsCollection {
              items {
                sys {
                  id
                }
                sku
                variant {
                  variant_nl: variant (locale: "nl")
                  variant_en: variant (locale: "en")
                }
                colour {
                  colour_nl: colour (locale: "nl")
                  colour_en: colour (locale: "en")
                }
                size {
                  size_nl: size (locale: "nl")
                  size_en: size (locale: "en")
                }
                priceOriginal
                priceSale
                sellOnline
                stock
                image {
                  url
                  title
                  width
                  height
                }
              }
            }
            year {
              year
            }
            techniqueCollection {
              items {
                sys {
                  id
                }
                technique
              }
            }
            materialCollection {
              items {
                sys {
                  id
                }
                material
              }
            }
            dimensionWidth
            dimensionLength
            dimensionHeight
            dimensionDiameter
            dimensionDepth
          }
        }
      `
    })
  })

  if (!data?.object) {
    throw json('Not Found', { status: 404 })
  }

  const tempObj = {
    ...data.object,
    name: { nl: data.object.name_nl, en: data.object.name_en }
  }
  delete tempObj.name_nl
  delete tempObj.name_en

  if (tempObj.variationsCollection) {
    tempObj.variationsCollection = {
      ...tempObj.variationsCollection,
      items: tempObj.variationsCollection.items.map(
        (
          item: Omit<ObjectsObjectVariation, 'variant'> & {
            variant?: { variant_nl?: string; variant_en?: string }
            colour?: { colour_nl?: string; colour_en?: string }
            size?: { size_nl?: string; size_en?: string }
          }
        ) => ({
          ...item,
          variant: item?.variant
            ? { nl: item.variant.variant_nl, en: item.variant.variant_en }
            : undefined,
          colour: item?.colour
            ? { nl: item.colour.colour_nl, en: item.colour.colour_en }
            : undefined,
          size: item?.size ? { nl: item.size.size_nl, en: item.size.size_en } : undefined
        })
      )
    }
  }

  return json(tempObj)
}

export const meta: MetaFunction = ({
  data: object,
  params: { locale }
}: {
  data: LoaderData<typeof loader>
  params: LoaderArgs['params']
}) =>
  object && {
    title: SEOTitle(object.name[locale]),
    keywords: SEOKeywords([object.name[locale] || '']),
    ...(object.description && {
      description: documentToPlainTextString(object.description.json).substring(0, 199)
    })
  }
export const handle = {
  i18n: 'object',
  structuredData: (
    object: LoaderData<typeof loader>,
    { locale }: { locale: 'en' | 'nl' }
  ): WithContext<Product> => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: object.name[locale],
    image: object.imagesCollection?.items[0]?.url,
    ...(object.description && {
      description: documentToPlainTextString(object.description.json).substring(0, 199)
    }),
    offers: {
      '@type': 'Offer',
      price: object.variationsCollection?.items.length
        ? max(object.variationsCollection.items.map(item => item.priceOriginal))
        : object.priceSale
        ? object.priceSale
        : object.priceOriginal,
      priceCurrency: 'EUR'
    },
    subjectOf: {
      '@type': 'CreativeWork',
      ...(object.description && {
        abstract: documentToPlainTextString(object.description.json).substring(0, 199)
      }),
      author: { '@type': 'Person', name: object.artist.artist },
      ...(object.materialCollection?.items.length && {
        material: object.materialCollection.items.map(material => material.material)
      })
    },
    ...(object.dimensionDepth && {
      depth: { '@type': 'QuantitativeValue', value: object.dimensionDepth }
    }),
    ...(object.dimensionHeight && {
      height: {
        '@type': 'QuantitativeValue',
        value: object.dimensionHeight
      }
    }),
    ...(object.dimensionWidth && {
      width: { '@type': 'QuantitativeValue', value: object.dimensionWidth }
    }),
    ...(object.artist.linkedFrom.objectsObjectCollection.items.length && {
      isRelatedTo: object.artist.linkedFrom.objectsObjectCollection.items.map(item => ({
        '@context': 'http://schema.org',
        '@type': 'Product',
        url: `https://www.terra-delft.nl/object/${item.sys.id}`,
        name: item.name,
        image: item.imagesCollection?.items[0]?.url,
        offers: {
          '@type': 'Offer',
          price: item.variationsCollection?.items.length
            ? max(item.variationsCollection.items.map(item => item.priceOriginal))
            : item.priceSale
            ? item.priceSale
            : item.priceOriginal,
          priceCurrency: 'EUR'
        },
        subjectOf: {
          '@type': 'CreativeWork',
          abstract: item.description && documentToPlainTextString(item.description.json),
          author: { '@type': 'Person', name: object.artist.artist },
          ...(item.materialCollection?.items.length && {
            material: item.materialCollection.items.map(material => material.material)
          })
        },
        ...(item.dimensionDepth && {
          depth: {
            '@type': 'QuantitativeValue',
            value: item.dimensionDepth
          }
        }),
        ...(item.dimensionHeight && {
          height: {
            '@type': 'QuantitativeValue',
            value: item.dimensionHeight
          }
        }),
        ...(item.dimensionWidth && {
          height: {
            '@type': 'QuantitativeValue',
            value: item.dimensionWidth
          }
        })
      }))
    })
  })
}

export type SelectedImages = (CommonImage | undefined)[]

export type SelectedVariation = {
  sku: ObjectsObjectVariation['sku']
  image?: CommonImage
  variant?: string
  colour?: string
  size?: string
} | null

const PageObject = () => {
  const object = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation('object')

  const [selectedImages, setSelectedImages] = useState<SelectedImages>([])
  const [selectedVariation, setSelectedVariation] = useState<SelectedVariation>(null)

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-start'>
        <ObjectImages
          object={object}
          selectedImages={selectedImages}
          selectedVariation={selectedVariation}
        />
        <div>
          <H1>{typeof object.name !== 'string' && object.name[i18n.language]}</H1>
          <H3>
            {t('artist')} <Link to={`/artist/${object.artist.slug}`}>{object.artist.artist}</Link>
          </H3>
          <ObjectSell
            object={object}
            setSelectedImages={setSelectedImages}
            setSelectedVariation={setSelectedVariation}
          />
          <table className='table-auto mb-4'>
            <tbody>
              {object.year && <ObjectAttribute type={t('year')} value={object.year} />}
              {object.techniqueCollection && (
                <ObjectAttribute
                  type={t('technique')}
                  value={object.techniqueCollection.items.map(item => ({
                    id: item.sys.id,
                    value: item.technique
                  }))}
                />
              )}
              {object.materialCollection && (
                <ObjectAttribute
                  type={t('material')}
                  value={object.materialCollection.items.map(item => ({
                    id: item.sys.id,
                    value: item.material
                  }))}
                />
              )}
              {object.dimensionWidth && (
                <ObjectAttribute type={t('dimensionWidth')} value={object.dimensionWidth} />
              )}
              {object.dimensionLength && (
                <ObjectAttribute type={t('dimensionLength')} value={object.dimensionLength} />
              )}
              {object.dimensionHeight && (
                <ObjectAttribute type={t('dimensionHeight')} value={object.dimensionHeight} />
              )}
              {object.dimensionDiameter && (
                <ObjectAttribute type={t('dimensionDiameter')} value={object.dimensionDiameter} />
              )}
              {object.dimensionDepth && (
                <ObjectAttribute type={t('dimensionDepth')} value={object.dimensionDepth} />
              )}
            </tbody>
          </table>
          <RichText content={object.description} className='my-2' assetWidth={634} />
          <ObjectContact object={object} selectedVariation={selectedVariation} />
        </div>
      </div>
      {object.artist.linkedFrom.objectsObjectCollection.items.length > 1 && (
        <div className='mt-8'>
          <H2>{t('related', { artist: object.artist.artist })}</H2>
          <ListObjects
            objects={object.artist.linkedFrom.objectsObjectCollection.items.filter(
              o => o.sys.id !== object.sys.id
            )}
          />
        </div>
      )}
    </>
  )
}

export default PageObject
