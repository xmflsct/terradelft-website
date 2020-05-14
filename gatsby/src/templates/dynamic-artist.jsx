import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { mediaFromRichText } from '../components/utils/media-from-rich-text'

import Layout from '../layouts/layout'
import GridObjectDefault from '../components/grids/grid-object-default'

const DynamicArtist = ({ data }) => (
  <Layout
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, 'Terra Delft']}
    containerName='dynamic-artist'
  >
    <h1>{data.artist.artist}</h1>
    <Row className='artist-section'>
      <Col lg={4} className='mb-3'>
        <Img fluid={data.artist.image.fluid} backgroundColor='#e8e8e8' />
      </Col>
      <Col lg={8}>
        {data.artist.biography &&
          documentToReactComponents(
            data.artist.biography.json,
            mediaFromRichText()
          )}
      </Col>
    </Row>
    <h2>Objects by {data.artist.artist}</h2>
    <GridObjectDefault nodes={data.objects.nodes} />
  </Layout>
)

DynamicArtist.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query dynamicArtist($contentful_id: String, $locale: String) {
    artist: contentfulObjectArtist(
      contentful_id: { eq: $contentful_id }
      node_locale: { eq: $locale }
    ) {
      artist
      image {
        fluid(maxWidth: 280, quality: 85) {
          ...GatsbyContentfulFluid_withWebp_noBase64
        }
      }
      biography {
        json
      }
    }
    objects: allContentfulObject(
      filter: {
        artist: { contentful_id: { eq: $contentful_id } }
        node_locale: { eq: $locale }
      }
    ) {
      nodes {
        ...ObjectDefault
      }
    }
  }
`

export default DynamicArtist
