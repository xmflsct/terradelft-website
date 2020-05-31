import PropTypes from 'prop-types'
import React, { useReducer, useState } from 'react'
import { Button, Col, Collapse, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import { findIndex } from 'lodash'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import Layout from '../layouts/layout'
import GridObjectDefault from '../components/grids/grid-object-default'
import ObjectImages from '../components/template-object/object-images'
import ObjectSell from '../components/template-object/object-sell'
import ObjectAttribute from '../components/template-object/object-attribute'
import ObjectContact from '../components/template-object/object-contact'
import { mediaFromRichText } from '../components/utils/media-from-rich-text'

function reducer (state, action) {
  switch (action.type) {
    case 'update':
      return { ...state, image: action.image }
    case 'clear':
      return { ...state, image: null }
    default:
      throw new Error()
  }
}
const initContextVariationImage = { image: null }
export const ContextVariationImage = React.createContext(
  initContextVariationImage
)

const DynamicObject = ({ pageContext, data }) => {
  const { t } = useTranslation([
    'dynamic-object',
    'component-object',
    'constant'
  ])
  const [state, updateImage] = useReducer(reducer, initContextVariationImage)
  const [toggleContact, setToggleContact] = useState(false)
  const object =
    data.object.nodes[
      findIndex(
        data.object.nodes,
        node => node.node_locale === pageContext.locale
      )
    ]

  return (
    <Layout
      SEOtitle={object.name}
      SEOkeywords={[object.name, 'Terra Delft']}
      SEOdescription={
        object.description &&
        documentToPlainTextString(object.description.json).substring(0, 199)
      }
      SEOschema={{
        '@context': 'http://schema.org',
        '@type': 'Product',
        name: object.name,
        image: object.images[0].fluidZoom.src,
        description:
          object.description &&
          documentToPlainTextString(object.description.json),
        offers: {
          '@type': 'Offer',
          price: object.variations
            ? object.fields.variations_price_range.highest
            : object.priceSale
            ? object.priceSale
            : object.priceOriginal
        },
        subjectOf: {
          '@type': 'CreativeWork',
          abstract:
            object.description &&
            documentToPlainTextString(object.description.json),
          author: { '@type': 'Person', name: object.artist.artist },
          ...(object.material && {
            material: object.material.map(material => material.material)
          })
        },
        ...(object.dimensionDepth && { depth: object.dimensionDepth }),
        ...(object.dimensionHeight && { height: object.dimensionHeight }),
        ...(object.dimensionWidth && { width: object.dimensionWidth }),
        // Below for related objects
        ...(data.objects.nodes.length > 0 && {
          isRelatedTo: data.objects.nodes.map(node => ({
            '@context': 'http://schema.org',
            '@type': 'VisualArtwork',
            url:
              'https://terra-delft.nl' +
              t('constant:slug.dynamic.object.slug', {
                locale: node.node_locale,
                artist: node.artist.artist,
                object: node.name,
                id: node.contentful_id
              }),
            name: node.name,
            image: node.images[0].fluid.src,
            offers: {
              '@type': 'Offer',
              price: node.fields.variations_price_range
                ? node.fields.variations_price_range.highest
                : node.priceSale
                ? node.priceSale
                : node.priceOriginal
            },
            subjectOf: {
              '@type': 'CreativeWork',
              abstract:
                node.description &&
                documentToPlainTextString(node.description.json),
              author: { '@type': 'Person', name: node.artist.artist },
              ...(node.material && {
                material: node.material.map(material => material.material)
              })
            },
            ...(node.dimensionDepth && { depth: node.dimensionDepth }),
            ...(node.dimensionHeight && { height: node.dimensionHeight }),
            ...(node.dimensionWidth && { height: node.dimensionWidth })
          }))
        })
      }}
      containerName='dynamic-object'
      useMiniBag
    >
      <ContextVariationImage.Provider value={{ state, updateImage }}>
        <Row>
          <Col lg={6} className='object-images'>
            <ObjectImages images={object.images} />
          </Col>
          <Col lg={6} className='object-information'>
            <h1>{object.name}</h1>
            <h4>
              {t('component-object:artist')}{' '}
              <Link
                to={t('constant:slug.dynamic.artist.slug', {
                  locale: pageContext.locale,
                  artist: object.artist.artist
                })}
              >
                {object.artist.artist}
              </Link>
            </h4>
            <ObjectSell object={data.object} />
            {object.year && (
              <ObjectAttribute
                type={t('component-object:year')}
                value={object.year}
              />
            )}
            {object.technique && (
              <ObjectAttribute
                type={t('component-object:technique')}
                value={object.technique}
              />
            )}
            {object.material && (
              <ObjectAttribute
                type={t('component-object:material')}
                value={object.material}
              />
            )}
            {object.colour && (
              <ObjectAttribute
                type={t('component-object:colour')}
                value={object.colour}
              />
            )}
            {object.dimensionWidth && (
              <ObjectAttribute
                type={t('component-object:dimensionWidth')}
                value={object.dimensionWidth}
              />
            )}
            {object.dimensionLength && (
              <ObjectAttribute
                type={t('component-object:dimensionLength')}
                value={object.dimensionLength}
              />
            )}
            {object.dimensionHeight && (
              <ObjectAttribute
                type={t('component-object:dimensionHeight')}
                value={object.dimensionHeight}
              />
            )}
            {object.dimensionDiameter && (
              <ObjectAttribute
                type={t('component-object:dimensionDiameter')}
                value={object.dimensionDiameter}
              />
            )}
            {object.dimensionDepth && (
              <ObjectAttribute
                type={t('component-object:dimensionDepth')}
                value={object.dimensionDepth}
              />
            )}
            <div className='object-description'>
              {object.description &&
                documentToReactComponents(
                  object.description.json,
                  mediaFromRichText(data.imagesFromRichText, pageContext.locale)
                )}
            </div>
            <div className='object-contact'>
              <Button
                onClick={() => setToggleContact(!toggleContact)}
                aria-expanded={toggleContact}
                className={toggleContact ? 'd-none' : ''}
              >
                {t('dynamic-object:contact.button')}
              </Button>
              <Collapse in={toggleContact}>
                <div>
                  {toggleContact && (
                    <ObjectContact
                      object={{
                        name: object.name
                      }}
                    />
                  )}
                </div>
              </Collapse>
            </div>
          </Col>
        </Row>
        {data.objects.nodes.length > 0 && (
          <div className='related-objects'>
            <h2>
              {t('dynamic-object:related')}
              {object.artist.artist}
            </h2>
            <GridObjectDefault nodes={data.objects.nodes} />
          </div>
        )}
      </ContextVariationImage.Provider>
    </Layout>
  )
}

DynamicObject.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query dynamicObject(
    $contentful_id: String
    $artist_contentful_id: String
    $locale: String
    $imagesFromRichText: [String!]!
  ) {
    object: allContentfulObject(
      filter: { contentful_id: { eq: $contentful_id } }
    ) {
      nodes {
        fields {
          variations_price_range {
            highest
            lowest
          }
        }
        contentful_id
        node_locale
        name
        description {
          json
        }
        images {
          fluid(maxWidth: 427, quality: 80) {
            ...GatsbyContentfulFluid_withWebp
          }
          fluidThumbnail: fluid(maxWidth: 132, quality: 70) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
          fluidZoom: fluid(maxWidth: 1280, quality: 80) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
          mouseFluid: fluid(maxWidth: 1280, quality: 80) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
          mouseFluidThumbnail: fluid(maxWidth: 396, quality: 70) {
            ...GatsbyContentfulFluid_withWebp_noBase64
          }
        }
        artist {
          artist
        }
        kunstKoop
        priceOriginal
        priceSale
        sellOnline
        stock
        variations {
          contentful_id
          sku
          variant {
            variant
          }
          colour {
            colour
          }
          size {
            size
          }
          priceOriginal
          priceSale
          sellOnline
          stock
          image {
            fluid(maxWidth: 427, quality: 80) {
              ...GatsbyContentfulFluid_withWebp_noBase64
            }
            fluidZoom: fluid(maxWidth: 2000, quality: 80) {
              ...GatsbyContentfulFluid_withWebp_noBase64
            }
            mouseFluid: fluid(maxWidth: 1280, quality: 80) {
              ...GatsbyContentfulFluid_withWebp_noBase64
            }
          }
        }
        year {
          year
        }
        technique {
          technique
        }
        material {
          material
        }
        dimensionWidth
        dimensionLength
        dimensionHeight
        dimensionDiameter
        dimensionDepth
      }
    }
    imagesFromRichText: allContentfulAsset(
      filter: {
        contentful_id: { in: $imagesFromRichText }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ImageFromRichText
      }
    }
    objects: allContentfulObject(
      filter: {
        contentful_id: { ne: $contentful_id }
        artist: { contentful_id: { eq: $artist_contentful_id } }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ObjectDefault
      }
    }
  }
`

export default DynamicObject
