import React from "react"
import { graphql } from "gatsby"

import Layout from "../layouts/layout"
import GridObjectDefault from "../components/grids/grid-object-default"

const DynamicObjectAttribute = ({ data }) => {
  // console.log(data)
  return (
    <Layout
      SEOtitle="test"
      SEOkeywords={["test", "Terra Delft"]}
      containerName='dynamic-artist'
    >
      <h1>year</h1>
      <h2>Objects by</h2>
      <GridObjectDefault data={data.objects.edges} />
    </Layout>
  )
}

export const query = graphql`
  query dynamicObjectAttribute($contentful_id: String, $language: String) {
    objects: allContentfulObjectsObjectMain(
      filter: {
        year: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: $language }
      }
    ) {
      edges {
        node {
          contentful_id
          node_locale
          images {
            fluid(maxWidth: 140) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          name
          artist {
            artist
          }
          fields {
            object_sale
          }
        }
      }
    }
  }
`

export default DynamicObjectAttribute
