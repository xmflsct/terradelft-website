import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import Grid from "../components/grid"
import ObjectImages from "../components/pageObject/objectImages"
import ObjectSell from "../components/pageObject/objectSell"
import ObjectAttributes from "../components/pageObject/objectAttributes"

const PageObject = ({ data }) => {
  const { t } = useTranslation("pageObject")
  const { object } = data

  return (
    <Layout
      SEOtitle={object.name}
      SEOkeywords={[object.name, "Terra Delft"]}
    >
      <Row>
        <Col lg={6}>
          <ObjectImages images={object.images} />
        </Col>
        <Col lg={6}>
          <h1>{object.name}</h1>
          <ObjectSell
            contentful_id={object.contentful_id}
            name={object.name}
            artist={object.artist.artist}
            images={object.images}
            priceOriginal={object.priceOriginal}
            priceSale={object.priceSale}
            sellOnline={object.sellOnline}
            sku={object.sku}
            stock={object.stock}
            variations={object.variations}
          />
          <p>
            {t("artist")}: {object.artist.artist}
          </p>
          <span>{documentToReactComponents(object?.description?.json)}</span>
          {object.year && (
            <ObjectAttributes title={t("year")} data={object.year} />
          )}
          {object.technique && (
            <ObjectAttributes title={t("technique")} data={object.technique} />
          )}
          {object.material && (
            <ObjectAttributes title={t("material")} data={object.material} />
          )}
          {object.design && (
            <ObjectAttributes title={t("design")} data={object.design} />
          )}
          {object.colour && (
            <ObjectAttributes title={t("colour")} data={object.colour} />
          )}
          {object.dimensionWidth && (
            <ObjectAttributes
              title={t("dimensionWidth")}
              data={object.dimensionWidth}
            />
          )}
          {object.dimensionLength && (
            <ObjectAttributes
              title={t("dimensionLength")}
              data={object.dimensionLength}
            />
          )}
          {object.dimensionHeight && (
            <ObjectAttributes
              title={t("dimensionHeight")}
              data={object.dimensionHeight}
            />
          )}
          {object.dimensionDiameter && (
            <ObjectAttributes
              title={t("dimensionDiameter")}
              data={object.dimensionDiameter}
            />
          )}
          {object.dimensionDepth && (
            <ObjectAttributes
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
  query pageTest(
    $contentful_id: String
    $artist_contentful_id: String
    $language: String
  ) {
    object: contentfulObjectsObjectMain(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $language }
    ) {
      contentful_id
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
