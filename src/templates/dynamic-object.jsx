import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import { findIndex } from "lodash"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import Grid from "../components/grid"
import ObjectImages from "../components/template-object/object-images"
import ObjectSell from "../components/template-object/object-sell"
import ObjectAttribute from "../components/template-object/object-attribute"

const slugify = require("slugify")

const PageObject = ({ data }) => {
  const { t, i18n } = useTranslation("dynamic-object")
  const object =
    data.object.edges[
      findIndex(data.object.edges, (e) => e.node.node_locale === i18n.language)
    ].node

  return (
    <Layout SEOtitle={object.name} SEOkeywords={[object.name, "Terra Delft"]}>
      <Row>
        <Col lg={6}>
          <ObjectImages images={object.images} />
        </Col>
        <Col lg={6}>
          <h1>{object.name}</h1>
          <p>
            {t("artist")}:{" "}
            <Link
              to={`/${i18n.language}/${slugify(object.artist.artist, {
                lower: true,
              })}`}
            >
              {object.artist.artist}
            </Link>
          </p>
          <ObjectSell object={data.object} />
          <span>{documentToReactComponents(object?.description?.json)}</span>
          {object.year && (
            <ObjectAttribute title={t("year")} data={object.year} />
          )}
          {object.technique && (
            <ObjectAttribute title={t("technique")} data={object.technique} />
          )}
          {object.material && (
            <ObjectAttribute title={t("material")} data={object.material} />
          )}
          {object.design && (
            <ObjectAttribute title={t("design")} data={object.design} />
          )}
          {object.colour && (
            <ObjectAttribute title={t("colour")} data={object.colour} />
          )}
          {object.dimensionWidth && (
            <ObjectAttribute
              title={t("dimensionWidth")}
              data={object.dimensionWidth}
            />
          )}
          {object.dimensionLength && (
            <ObjectAttribute
              title={t("dimensionLength")}
              data={object.dimensionLength}
            />
          )}
          {object.dimensionHeight && (
            <ObjectAttribute
              title={t("dimensionHeight")}
              data={object.dimensionHeight}
            />
          )}
          {object.dimensionDiameter && (
            <ObjectAttribute
              title={t("dimensionDiameter")}
              data={object.dimensionDiameter}
            />
          )}
          {object.dimensionDepth && (
            <ObjectAttribute
              title={t("dimensionDepth")}
              data={object.dimensionDepth}
            />
          )}
        </Col>
      </Row>
      {data.objects.edges.length > 1 && (
        <>
          <h2>
            {t("related")}
            {object.artist.artist}
          </h2>
          <Grid items={data.objects.edges} type='object' />
        </>
      )}
    </Layout>
  )
}

export const query = graphql`
  query dynamicObject(
    $contentful_id: String
    $artist_contentful_id: String
    $language: String
  ) {
    object: allContentfulObjectsObjectMain(
      filter: { contentful_id: { eq: $contentful_id } }
    ) {
      edges {
        node {
          contentful_id
          node_locale
          name
          description {
            json
          }
          images {
            fluid(maxWidth: 420) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          artist {
            artist
          }
          priceOriginal
          priceSale
          sellOnline
          sku
          stock
          variations {
            contentful_id
            sku
            variation {
              variation
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
              fluid {
                src
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
          design {
            design
          }
          dimensionWidth
          dimensionLength
          dimensionHeight
          dimensionDiameter
          dimensionDepth
        }
      }
    }
    objects: allContentfulObjectsObjectMain(
      filter: {
        contentful_id: { ne: $contentful_id }
        artist: { contentful_id: { eq: $artist_contentful_id } }
        node_locale: { eq: $language }
      }
    ) {
      edges {
        node {
          node_locale
          images {
            fluid(maxWidth: 800) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          name
          artist {
            artist
          }
        }
      }
    }
  }
`

export default PageObject
