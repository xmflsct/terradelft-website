import contentfulRichTextOptions from '@components/contentfulRichTextOptions'
import GridObjectDefault from '@components/grids/grid-object-default'
import Layout from '@components/layout'
import ObjectAttribute from '@components/template-object/object-attribute'
import ObjectContact from '@components/template-object/object-contact'
import {
  ContextVariation,
  initContextVariation
} from '@components/template-object/object-context'
import ObjectImages from '@components/template-object/object-images'
import ObjectSell from '@components/template-object/object-sell'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import { findIndex } from 'lodash'
import PropTypes from 'prop-types'
import React, { useReducer, useState } from 'react'
import { Button, Col, Collapse, Row } from 'react-bootstrap'

function reducer(_, action) {
  switch (action.type) {
    case 'update':
      return { ...action.data }
    case 'clear':
      return {}
    default:
      throw new Error()
  }
}

const PageObject = ({ pageContext, data }) => {
  console.log(data)
  const { t } = useTranslation()
  const [stateVariation, updateVariation] = useReducer(
    reducer,
    initContextVariation
  )
  const [toggleContact, setToggleContact] = useState(false)
  const object =
    data.object.nodes[
      findIndex(
        data.object.nodes,
        node => node.node_locale === pageContext.language
      )
    ]

  return (
    <Layout
      SEOtitle={object.name}
      SEOkeywords={[object.name, 'Terra Delft']}
      SEOdescription={
        object.description
          ? documentToPlainTextString(
              JSON.parse(object.description.raw)
            ).substring(0, 199)
          : object.name
      }
      SEOschema={{
        '@context': 'http://schema.org',
        '@type': 'Product',
        name: object.name,
        image: object.images[0].gatsbyImageData.images.fallback.src,
        description:
          object.description &&
          documentToPlainTextString(JSON.parse(object.description.raw)),
        offers: {
          '@type': 'Offer',
          price: object.variations
            ? object.fields.variations_price_range.highest
            : object.priceSale
            ? object.priceSale
            : object.priceOriginal,
          priceCurrency: 'EUR'
        },
        subjectOf: {
          '@type': 'CreativeWork',
          abstract:
            object.description &&
            documentToPlainTextString(JSON.parse(object.description.raw)),
          author: { '@type': 'Person', name: object.artist.artist },
          ...(object.material && {
            material: object.material.map(material => material.material)
          })
        },
        ...(object.dimensionDepth && { depth: object.dimensionDepth }),
        ...(object.dimensionHeight && { height: object.dimensionHeight }),
        ...(object.dimensionWidth && { width: object.dimensionWidth }),
        // Below for related objects
        ...(object.artist.object.length > 0 && {
          isRelatedTo: object.artist.object.map(node => ({
            '@context': 'http://schema.org',
            '@type': 'VisualArtwork',
            url:
              'https://terra-delft.nl' +
              t('translation:slug.dynamic.object.slug', {
                locale: node.node_locale,
                artist: node.artist.artist,
                object: node.name,
                id: node.contentful_id
              }),
            name: node.name,
            image: node.images[0].gatsbyImageData.images.fallback.src,
            offers: {
              '@type': 'Offer',
              price: node.fields.variations_price_range
                ? node.fields.variations_price_range.highest
                : node.priceSale
                ? node.priceSale
                : node.priceOriginal,
              priceCurrency: 'EUR'
            },
            subjectOf: {
              '@type': 'CreativeWork',
              abstract:
                node.description &&
                documentToPlainTextString(JSON.parse(node.description.raw)),
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
    >
      <ContextVariation.Provider value={{ stateVariation, updateVariation }}>
        <Row>
          <Col lg={6} className='object-images'>
            <ObjectImages images={object.images} />
          </Col>
          <Col lg={6} className='object-information'>
            <h1>{object.name}</h1>
            <h4>
              {t('component-object:artist')}{' '}
              <Link
                to={t('translation:slug.dynamic.artist.slug', {
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
                renderRichText(object.description, contentfulRichTextOptions)}
            </div>
            <div className='object-contact'>
              <Button
                onClick={() => setToggleContact(!toggleContact)}
                aria-expanded={toggleContact}
                className={toggleContact ? 'd-none' : ''}
              >
                {t('contact.button')}
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
        {object.artist.object.length > 0 && (
          <div className='related-objects'>
            <h2>
              {t('related')}
              {object.artist.artist}
            </h2>
            <GridObjectDefault
              nodes={object.artist.object.filter(f => f.name !== object.name)}
            />
          </div>
        )}
      </ContextVariation.Provider>
    </Layout>
  )
}

PageObject.propTypes = {
  pageContext: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageObject($language: String!, $contentful_id: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-object", "component-object"] }
        language: { eq: $language }
      }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    object: allContentfulObject(
      filter: { contentful_id: { eq: $contentful_id } }
    ) {
      nodes {
        gatsbyPath(filePath: "/object/{ContentfulObject.contentful_id}")
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
          raw
          references {
            ... on ContentfulAsset {
              contentful_id
              __typename
              description
              gatsbyImageData(width: 600, quality: 85)
            }
          }
        }
        images {
          gatsbyImageData(width: 427, quality: 80)
          fluidThumbnail: gatsbyImageData(width: 200, quality: 80)
          fluidZoom: gatsbyImageData(width: 1280, quality: 80)
          mouseFluid: gatsbyImageData(width: 1280, quality: 80)
          mouseFluidThumbnail: gatsbyImageData(width: 396, quality: 60)
          description
        }
        artist {
          gatsbyPath(filePath: "/artist/{ContentfulObjectArtist.artist}")
          artist
          object {
            ...ObjectDefault
          }
        }
        kunstKoop
        priceOriginal
        priceSale
        sellOnline
        sku
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
            gatsbyImageData(width: 427, quality: 80)
            fluidZoom: gatsbyImageData(width: 2000, quality: 80)
            mouseFluid: gatsbyImageData(width: 1280, quality: 80)
            description
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
  }
`

export default PageObject
