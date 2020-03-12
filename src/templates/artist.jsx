import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { Col, Row } from "react-bootstrap"
import Grid from "../components/layout/grid"
import Layout from "../components/layout"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

const Artist = ({ data, alternateLinks }) => (
  <Layout
    alternateLink={alternateLinks}
    name={data.artist.artist}
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, "Terra Delft"]}
  >
    <h1>{data.artist.artist}</h1>
    <Row>
      <Col lg={4}>
        <Img fluid={data.artist.image.fluid} />
      </Col>
      <Col lg={8}>
        {data.artist.biography
          ? documentToReactComponents(data.artist.biography.json)
          : ""}
      </Col>
    </Row>
    <Grid items={data.objects.edges} type="object" />
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
    objects: allContentfulObjectsObject(
      filter: {
        artist: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: $language }
      }
    ) {
      edges {
        node {
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

export default Artist
