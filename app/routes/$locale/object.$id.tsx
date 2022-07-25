import { gql, QueryOptions } from '@apollo/client'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { max } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product, WithContext } from 'schema-dts'
import { H1, H2, H3 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import { Link } from '~/components/link'
import ObjectAttribute from '~/components/object/attribute'
import ObjectImages from '~/components/object/images'
import ObjectSell from '~/components/object/sell'
import RichText from '~/components/richText'
import {
  cacheQuery,
  CommonImage,
  ObjectsObjectVariation,
  ObjectsObject_NameLocalized,
  richTextLinks
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  object: ObjectsObject_NameLocalized
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string; id: string }> = {
    variables: { locale: props.params.locale!, id: props.params.id! },
    query: gql`
      query Exhibition($locale: String, $id: String!) {
        object: objectsObject (locale: $locale, id: $id) {
          sys {
            id
          }
          name_nl: name (locale: "nl")
          name_en: name (locale: "en")
          description {
            json
            ${richTextLinks}
          }
          imagesCollection {
            items {
              url
            }
          }
          artist {
            slug
            artist
            linkedFrom {
              objectsObjectCollection (locale: "nl") {
                items {
                  sys {
                    id
                  }
                  name (locale: $locale)
                  imagesCollection (limit: 1) {
                    items {
                      url
                    }
                  }
                  priceSale
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
              }
            }
          }
          year {
            year
          }
          techniqueCollection {
            items {
              technique
            }
          }
          materialCollection {
            items {
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
  }
  const data = await cacheQuery<Data>(query, 30, props)

  if (!data?.object) {
    throw json('Not Found', { status: 404 })
  }

  const tempObj = { ...data.object }
  tempObj.name = { nl: data.object.name_nl, en: data.object.name_en }
  delete tempObj.name_nl
  delete tempObj.name_en

  if (tempObj.variationsCollection) {
    tempObj.variationsCollection = {
      ...tempObj.variationsCollection,
      items: tempObj.variationsCollection.items.map(item => ({
        ...item,
        variant: item.variant
          ? { nl: item.variant.variant_nl, en: item.variant.variant_en }
          : undefined,
        colour: item.colour
          ? { nl: item.colour.colour_nl, en: item.colour.colour_en }
          : undefined,
        size: item.size
          ? { nl: item.size.size_nl, en: item.size.size_en }
          : undefined
      }))
    }
  }

  return json({ object: tempObj })
}

export const meta: MetaFunction = ({
  data,
  params: { locale }
}: {
  data: Data
  params: any
}) =>
  data?.object && {
    title: SEOTitle(data.object.name[locale!]),
    keywords: SEOKeywords([data.object.name[locale!]]),
    ...(data.object.description && {
      description: documentToPlainTextString(
        data.object.description.json
      ).substring(0, 199)
    })
  }
export const handle = {
  i18n: 'object',
  structuredData: (data: Data, { locale }: any): WithContext<Product> => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.object.name[locale],
    image: data.object.imagesCollection?.items[0].url,
    ...(data.object.description && {
      description: documentToPlainTextString(
        data.object.description.json
      ).substring(0, 199)
    }),
    offers: {
      '@type': 'Offer',
      price: data.object.variationsCollection?.items.length
        ? max(
            data.object.variationsCollection.items.map(
              item => item.priceOriginal
            )
          )
        : data.object.priceSale
        ? data.object.priceSale
        : data.object.priceOriginal,
      priceCurrency: 'EUR'
    },
    subjectOf: {
      '@type': 'CreativeWork',
      ...(data.object.description && {
        abstract: documentToPlainTextString(
          data.object.description.json
        ).substring(0, 199)
      }),
      author: { '@type': 'Person', name: data.object.artist.artist },
      ...(data.object.materialCollection?.items.length && {
        material: data.object.materialCollection.items.map(
          material => material.material
        )
      })
    },
    ...(data.object.dimensionDepth && {
      depth: { '@type': 'QuantitativeValue', value: data.object.dimensionDepth }
    }),
    ...(data.object.dimensionHeight && {
      height: {
        '@type': 'QuantitativeValue',
        value: data.object.dimensionHeight
      }
    }),
    ...(data.object.dimensionWidth && {
      width: { '@type': 'QuantitativeValue', value: data.object.dimensionWidth }
    }),
    ...(data.object.artist.linkedFrom.objectsObjectCollection.items.length && {
      isRelatedTo:
        data.object.artist.linkedFrom.objectsObjectCollection.items.map(
          item => ({
            '@context': 'http://schema.org',
            '@type': 'Product',
            url: `https://www.terra-delft.nl/object/${item.sys.id}`,
            name: item.name,
            image: item.imagesCollection?.items[0].url,
            offers: {
              '@type': 'Offer',
              price: item.variationsCollection?.items.length
                ? max(
                    item.variationsCollection.items.map(
                      item => item.priceOriginal
                    )
                  )
                : item.priceSale
                ? item.priceSale
                : item.priceOriginal,
              priceCurrency: 'EUR'
            },
            subjectOf: {
              '@type': 'CreativeWork',
              abstract:
                item.description &&
                documentToPlainTextString(item.description.json),
              author: { '@type': 'Person', name: data.object.artist.artist },
              ...(item.materialCollection?.items.length && {
                material: item.materialCollection.items.map(
                  material => material.material
                )
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
          })
        )
    })
  })
}

export type SelectedVariation = {
  sku: ObjectsObjectVariation['sku']
  image?: CommonImage
  variant?: string
  colour?: string
  size?: string
} | null

const PageObject = () => {
  const { object } = useLoaderData<Data>()
  const { t, i18n } = useTranslation('object')

  const [selectedVariation, setSelectedVariation] =
    useState<SelectedVariation>()

  const [toggleContact, setToggleContact] = useState(false)

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <ObjectImages
          images={object.imagesCollection?.items}
          selectedVariation={selectedVariation}
        />
        <div>
          <H1>
            {typeof object.name !== 'string' && object.name[i18n.language]}
          </H1>
          <H3>
            {t('artist')}{' '}
            <Link to={object.artist.slug}>{object.artist.artist}</Link>
          </H3>
          <ObjectSell
            object={object}
            setSelectedVariation={setSelectedVariation}
          />
          <table className='table-auto mb-4'>
            <tbody>
              {object.year && (
                <ObjectAttribute type={t('year')} value={object.year.year} />
              )}
              {object.techniqueCollection && (
                <ObjectAttribute
                  type={t('technique')}
                  value={object.techniqueCollection.items.map(
                    item => item.technique
                  )}
                />
              )}
              {object.materialCollection && (
                <ObjectAttribute
                  type={t('material')}
                  value={object.materialCollection.items.map(
                    item => item.material
                  )}
                />
              )}
              {object.dimensionWidth && (
                <ObjectAttribute
                  type={t('dimensionWidth')}
                  value={object.dimensionWidth}
                />
              )}
              {object.dimensionLength && (
                <ObjectAttribute
                  type={t('dimensionLength')}
                  value={object.dimensionLength}
                />
              )}
              {object.dimensionHeight && (
                <ObjectAttribute
                  type={t('dimensionHeight')}
                  value={object.dimensionHeight}
                />
              )}
              {object.dimensionDiameter && (
                <ObjectAttribute
                  type={t('dimensionDiameter')}
                  value={object.dimensionDiameter}
                />
              )}
              {object.dimensionDepth && (
                <ObjectAttribute
                  type={t('dimensionDepth')}
                  value={object.dimensionDepth}
                />
              )}
            </tbody>
          </table>
          <RichText
            content={object.description}
            className='mt-2'
            assetWidth={634}
          />
          <div className='object-contact'>
            {/* <button
              onClick={() => setToggleContact(!toggleContact)}
              aria-expanded={toggleContact}
              className={toggleContact ? 'd-none' : ''}
            >
              {t('contact.button')}
            </button> */}
            {/* <Collapse in={toggleContact}>
              <div>
                {toggleContact && (
                  <ObjectContact
                    object={{
                      name: object.name
                    }}
                  />
                )}
              </div>
            </Collapse> */}
          </div>
        </div>
      </div>
      {object.artist.linkedFrom.objectsObjectCollection.items.length > 0 && (
        <div className='mt-8'>
          <H2>{t('related', { artist: object.artist.artist })}</H2>
          <GridObjectDefault
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
