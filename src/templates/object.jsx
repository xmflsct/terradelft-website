import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import { Button, Col, Container, Row } from "react-bootstrap"

const Object = ({ data, location }) => (
  <Layout
    location={location}
    name="our-story"
    SEOtitle="Our Story"
    SEOkeywords={["Story", "Rotterdam"]}
  >
    <Button>{data.contentfulObjectsObject.id}</Button>
  </Layout>
)

export const query = graphql`
  query Object($id: String) {
    contentfulObjectsObject(id: { eq: $id }) {
      id
      name
    }
  }
`

export default Object
