import React from "react"
import { graphql } from "gatsby"
import { useTranslation } from "react-i18next"

import Layout from "../layouts/layout"
import GridObjectDefault from "../components/grids/grid-object-default"

const DynamicObjectAttribute = ({ pageContext, data }) => {
  const { t } = useTranslation("component-object")
  const attributeType =
    (pageContext.byYear && "year") ||
    (pageContext.byTechnique && "technique") ||
    (pageContext.byMaterial && "material")
  const headline = `Objects of ${t(attributeType)} in ${
    pageContext.attributeValue
  }`

  return (
    <Layout
      SEOtitle={headline}
      SEOkeywords={[headline, "Terra Delft"]}
      containerName='dynamic-object-attribute'
    >
      <h1>{headline}</h1>
      <GridObjectDefault nodes={data[`${attributeType}Objects`].nodes} />
    </Layout>
  )
}

export const query = graphql`
  query dynamicObjectAttribute(
    $byYear: Boolean!
    $byTechnique: Boolean!
    $byMaterial: Boolean!
    $contentful_id: String
    $locale: String
  ) {
    ...ObjectsByYear @include(if: $byYear)
    ...ObjectsByTechnique @include(if: $byTechnique)
    ...ObjectsByMaterial @include(if: $byMaterial)
  }
  fragment ObjectsByYear on Query {
    yearObjects: allContentfulObjectsObjectMain(
      filter: {
        year: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ObjectDefault
      }
    }
  }
  fragment ObjectsByTechnique on Query {
    techniqueObjects: allContentfulObjectsObjectMain(
      filter: {
        technique: { elemMatch: { contentful_id: { eq: $contentful_id } } }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ObjectDefault
      }
    }
  }
  fragment ObjectsByMaterial on Query {
    materialObjects: allContentfulObjectsObjectMain(
      filter: {
        material: { elemMatch: { contentful_id: { eq: $contentful_id } } }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ObjectDefault
      }
    }
  }
`

export default DynamicObjectAttribute
