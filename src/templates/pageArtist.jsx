import React from "react"
import { Col, Row } from "react-bootstrap"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import Grid from "../components/grid"

const PageArtist = ({ data }) => (
  <Layout
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, "Terra Delft"]}
  >
    <h1>{data.artist.artist}</h1>
    <Row>
      <Col lg={4}>
        <Img fluid={data.artist.image.fluid} />
      </Col>
      <Col lg={8}>
        {documentToReactComponents(data.artist?.biography?.json)}
      </Col>
    </Row>
    <Grid items={data.objects.edges} type='object' />
  </Layout>
)

export const query = graphql`
  query pageArtist($contentful_id: String, $language: String) {
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

export default PageArtist
