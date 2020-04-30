import React, { useReducer } from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import { findIndex } from "lodash"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import GridObjectDefault from "../components/grids/grid-object-default"
import ObjectImages from "../components/template-object/object-images"
import ObjectSell from "../components/template-object/object-sell"
import ObjectAttribute from "../components/template-object/object-attribute"
import { imageFromRichText } from "../components/utils/image-from-rich-text"

function reducer(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, image: action.image }
    case "clear":
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
    "dynamic-object",
    "component-object",
    "constant",
  ])
  const [state, updateImage] = useReducer(reducer, initContextVariationImage)
  const object =
    data.object.nodes[
      findIndex(data.object.nodes, (node) => node.node_locale === pageContext.locale)
    ]

  return (
    <Layout
      SEOtitle={object.name}
      SEOkeywords={[object.name, "Terra Delft"]}
      containerName='dynamic-object'
    >
      <ContextVariationImage.Provider value={{ state, updateImage }}>
        <Row>
          <Col lg={6} className='object-images'>
            <ObjectImages images={object.images} />
          </Col>
          <Col lg={6} className='object-information'>
            <h1>{object.name}</h1>
            <h4>
              {t("component-object:artist")}:{" "}
              <Link
                to={t("constant:slug.dynamic.artist.slug", {
                  locale: pageContext.locale,
                  artist: object.artist.artist,
                })}
              >
                {object.artist.artist}
              </Link>
            </h4>
            <ObjectSell object={data.object} />
            {object.year && (
              <ObjectAttribute
                type={t("component-object:year")}
                value={object.year}
              />
            )}
            {object.technique && (
              <ObjectAttribute
                type={t("component-object:technique")}
                value={object.technique}
              />
            )}
            {object.material && (
              <ObjectAttribute
                type={t("component-object:material")}
                value={object.material}
              />
            )}
            {object.colour && (
              <ObjectAttribute
                type={t("component-object:colour")}
                value={object.colour}
              />
            )}
            {object.dimensionWidth && (
              <ObjectAttribute
                type={t("component-object:dimensionWidth")}
                value={object.dimensionWidth}
                dimension
              />
            )}
            {object.dimensionLength && (
              <ObjectAttribute
                type={t("component-object:dimensionLength")}
                value={object.dimensionLength}
                dimension
              />
            )}
            {object.dimensionHeight && (
              <ObjectAttribute
                type={t("component-object:dimensionHeight")}
                value={object.dimensionHeight}
                dimension
              />
            )}
            {object.dimensionDiameter && (
              <ObjectAttribute
                type={t("component-object:dimensionDiameter")}
                value={object.dimensionDiameter}
                dimension
              />
            )}
            {object.dimensionDepth && (
              <ObjectAttribute
                type={t("component-object:dimensionDepth")}
                value={object.dimensionDepth}
                dimension
              />
            )}
            <div className='object-description'>
              {documentToReactComponents(
                object.description?.json,
                imageFromRichText(data.imagesFromRichText, pageContext.locale)
              )}
            </div>
          </Col>
        </Row>
        {data.objects.nodes.length > 0 && (
          <div className='related-objects'>
            <h2>
              {t("dynamic-object:related")}
              {object.artist.artist}
            </h2>
            <GridObjectDefault nodes={data.objects.nodes} />
          </div>
        )}
      </ContextVariationImage.Provider>
    </Layout>
  )
}

export const query = graphql`
  query dynamicObject(
    $contentful_id: String
    $artist_contentful_id: String
    $locale: String
    $imagesFromRichText: [String!]!
  ) {
    object: allContentfulObjectsObjectMain(
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
          fluid(maxWidth: 1600, quality: 80) {
            ...GatsbyContentfulFluid_withWebp
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
            fluid(quality: 80) {
              ...GatsbyContentfulFluid_withWebp
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
    objects: allContentfulObjectsObjectMain(
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
