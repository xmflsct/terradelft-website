import React from "react"
import { Col, Row } from "react-bootstrap"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import GridObjectDefault from "../components/grids/grid-object-default"

const PageArtist = ({ data }) => (
  <Layout
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, "Terra Delft"]}
    containerName='dynamic-artist'
  >
    <h1>{data.artist.artist}</h1>
    <Row className="artist-section">
      <Col lg={4}>
        <Img fluid={data.artist.image.fluid} />
      </Col>
      <Col lg={8}>
        {documentToReactComponents(data.artist?.biography?.json)}
      </Col>
    </Row>
    <h2>Objects by {data.artist.artist}</h2>
    <GridObjectDefault data={data.objects.edges} />
  </Layout>
)

export const query = graphql`
  query dynamicArtist($contentful_id: String, $language: String) {
    artist: contentfulObjectsArtist(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $language }
    ) {
      artist
      image {
        fluid(maxWidth: 800) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
      biography {
        json
      }
    }
    objects: allContentfulObjectsObjectMain(
      filter: {
        artist: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: $language }
      }
    ) {
      edges {
        node {
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

export default PageArtist
