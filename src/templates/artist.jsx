import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import { Col, Row } from "react-bootstrap"

import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import ObjectGrid from "../components/layout/object-grid"

const Artist = ({ data, location }) => (
  <Layout
    location={location}
    name={data.artist.artist}
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, "Terra Delft"]}
  >
    <h1>{data.artist.artist}</h1>
    <Row>
      <Col lg={4}>
        <Img fluid={data.image.image.fluid} />
      </Col>
      <Col lg={8}>
        {data.artist.biography
          ? documentToReactComponents(data.artist.biography.json)
          : ""}
      </Col>
    </Row>
    <ObjectGrid
      objects={data.objects.edges}
      type="object"
      location={location}
    />
  </Layout>
)

export const query = graphql`
  query Artist($id: String, $contentful_id: String) {
    artist: contentfulObjectsArtist(id: { eq: $id }) {
      id
      artist
      biography {
        json
      }
    }
    image: contentfulObjectsArtist(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: "nl" }
    ) {
      contentful_id
      image {
        fluid(maxWidth: 800) {
          ...GatsbyContentfulFluid
        }
      }
    }
    objects: allContentfulObjectsObject(
      filter: {
        artist: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: "nl" }
      }
    ) {
      edges {
        node {
          images {
            fluid(maxWidth: 800) {
              ...GatsbyContentfulFluid
            }
          }
          name
          slug
        }
      }
    }
  }
`

export default Artist
