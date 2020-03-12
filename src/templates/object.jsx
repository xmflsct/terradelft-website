import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { Button, Col, Container, Row } from "react-bootstrap"
import Layout from "../components/layout"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

const Object = ({ data, alternateLinks }) => (
  <Layout
    alternateLink={alternateLinks}
    name={data.object.name}
    SEOtitle={data.object.name}
    SEOkeywords={[data.object.name, "Terra Delft"]}
  >
    <h1>{data.object.name}</h1>
  </Layout>
)

export const query = graphql`
  query pageObject($contentful_id: String, $language: String) {
    object: contentfulObjectsObject(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $language }
    ) {
      name
    }
  }
`

export default Object
