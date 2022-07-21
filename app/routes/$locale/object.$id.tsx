import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction
} from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { createElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Person, WithContext } from 'schema-dts'
import { H1, H2, H3, H4 } from '~/components/globals'
import GridObjectDefault from '~/components/grids/grid-object-default'
import { Link } from '~/components/link'
import ObjectAttribute from '~/components/object/attribute'
import ObjectImages from '~/components/object/images'
import ObjectSell from '~/components/object/sell'
import { cookieBag } from '~/cookies'
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

export const meta: MetaFunction = ({
  data
}: {
  data: ObjectsObject_NameLocalized
}) => ({
  // title: SEOTitle(data.artist),
  // keywords: SEOKeywords([data.artist]),
  // ...(data.biography && {
  //   description: documentToPlainTextString(data.biography.json).substring(
  //     0,
  //     199
  //   )
  // })
})
export const handle = {
  i18n: 'pageObject'
  // structuredData: (data: ObjectsArtist): WithContext<Person> => ({
  //   '@context': 'https://schema.org',
  //   '@type': 'Person',
  //   name: data.artist,
  //   image: data.image.url,
  //   ...(data.biography && {
  //     description: documentToPlainTextString(data.biography.json)
  //   })
  // })
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
          <div className='object-description'>
            {objectsObject.description &&
              documentToReactComponents(objectsObject.description.json)}
          </div>
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
