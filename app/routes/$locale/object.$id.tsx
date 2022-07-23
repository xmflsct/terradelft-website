import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
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
  getObjectsObject,
  ObjectsObjectVariation,
  ObjectsObject_NameLocalized
} from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => await getObjectsObject(props))

export const meta: MetaFunction = ({ data, params: { locale } }) => ({
  title: SEOTitle(data.name[locale!]),
  keywords: SEOKeywords([data.name[locale!]]),
  ...(data.description && {
    description: documentToPlainTextString(data.description.json).substring(
      0,
      199
    )
  })
})
export const handle = {
  i18n: 'pageObject',
  structuredData: (
    data: ObjectsObject_NameLocalized,
    { locale }: any
  ): WithContext<Product> => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name[locale],
    image: data.imagesCollection?.items[0].url,
    description:
      data.description &&
      documentToPlainTextString(data.description.json).substring(0, 199),
    offers: {
      '@type': 'Offer',
      price: data.variationsCollection?.items.length
        ? max(data.variationsCollection.items.map(item => item.priceOriginal))
        : data.priceSale
        ? data.priceSale
        : data.priceOriginal,
      priceCurrency: 'EUR'
    },
    subjectOf: {
      '@type': 'CreativeWork',
      abstract:
        data.description &&
        documentToPlainTextString(data.description.json).substring(0, 199),
      author: { '@type': 'Person', name: data.artist.artist },
      ...(data.materialCollection?.items.length && {
        material: data.materialCollection.items.map(
          material => material.material
        )
      })
    },
    ...(data.dimensionDepth && {
      depth: { '@type': 'QuantitativeValue', value: data.dimensionDepth }
    }),
    ...(data.dimensionHeight && {
      height: { '@type': 'QuantitativeValue', value: data.dimensionHeight }
    }),
    ...(data.dimensionWidth && {
      width: { '@type': 'QuantitativeValue', value: data.dimensionWidth }
    }),
    ...(data.artist.linkedFrom.objectsObjectCollection.items.length && {
      isRelatedTo: data.artist.linkedFrom.objectsObjectCollection.items.map(
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
            author: { '@type': 'Person', name: data.artist.artist },
            ...(item.materialCollection?.items.length && {
              material: item.materialCollection.items.map(
                material => material.material
              )
            })
          },
          ...(item.dimensionDepth && {
            depth: { '@type': 'QuantitativeValue', value: item.dimensionDepth }
          }),
          ...(item.dimensionHeight && {
            height: {
              '@type': 'QuantitativeValue',
              value: item.dimensionHeight
            }
          }),
          ...(item.dimensionWidth && {
            height: { '@type': 'QuantitativeValue', value: item.dimensionWidth }
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
  const { t, i18n } = useTranslation('pageObject')
  const objectsObject = useLoaderData<ObjectsObject_NameLocalized>()

  const [selectedVariation, setSelectedVariation] =
    useState<SelectedVariation>()

  const [toggleContact, setToggleContact] = useState(false)

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <ObjectImages
          images={objectsObject.imagesCollection?.items}
          selectedVariation={selectedVariation}
        />
        <div>
          <H1>
            {typeof objectsObject.name !== 'string' &&
              objectsObject.name[i18n.language]}
          </H1>
          <H3>
            {t('artist')}{' '}
            <Link to={objectsObject.artist.slug}>
              {objectsObject.artist.artist}
            </Link>
          </H3>
          <ObjectSell
            object={objectsObject}
            setSelectedVariation={setSelectedVariation}
          />
          <table className='table-auto mb-4'>
            <tbody>
              {objectsObject.year && (
                <ObjectAttribute
                  type={t('year')}
                  value={objectsObject.year.year}
                />
              )}
              {objectsObject.techniqueCollection && (
                <ObjectAttribute
                  type={t('technique')}
                  value={objectsObject.techniqueCollection.items.map(
                    item => item.technique
                  )}
                />
              )}
              {objectsObject.materialCollection && (
                <ObjectAttribute
                  type={t('material')}
                  value={objectsObject.materialCollection.items.map(
                    item => item.material
                  )}
                />
              )}
              {objectsObject.dimensionWidth && (
                <ObjectAttribute
                  type={t('dimensionWidth')}
                  value={objectsObject.dimensionWidth}
                />
              )}
              {objectsObject.dimensionLength && (
                <ObjectAttribute
                  type={t('dimensionLength')}
                  value={objectsObject.dimensionLength}
                />
              )}
              {objectsObject.dimensionHeight && (
                <ObjectAttribute
                  type={t('dimensionHeight')}
                  value={objectsObject.dimensionHeight}
                />
              )}
              {objectsObject.dimensionDiameter && (
                <ObjectAttribute
                  type={t('dimensionDiameter')}
                  value={objectsObject.dimensionDiameter}
                />
              )}
              {objectsObject.dimensionDepth && (
                <ObjectAttribute
                  type={t('dimensionDepth')}
                  value={objectsObject.dimensionDepth}
                />
              )}
            </tbody>
          </table>
          <RichText
            content={objectsObject.description}
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
      {objectsObject.artist.linkedFrom.objectsObjectCollection.items.length >
        0 && (
        <div className='mt-8'>
          <H2>{t('related', { artist: objectsObject.artist.artist })}</H2>
          <GridObjectDefault
            objects={objectsObject.artist.linkedFrom.objectsObjectCollection.items.filter(
              o => o.sys.id !== objectsObject.sys.id
            )}
          />
        </div>
      )}
    </>
  )
}

export default PageObject
