import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import GridObjectDefault from '../components/grids/grid-object-default'
import Layout from '../layouts/layout'

const DynamicArtist = ({ data }) => (
  <Layout
    SEOtitle={data.artist.artist}
    SEOkeywords={[data.artist.artist, 'Terra Delft']}
    SEOdescription={
      data.artist.biography &&
      documentToPlainTextString(
        JSON.parse(data.artist.biography.raw)
      ).substring(0, 199)
    }
    SEOschema={{
      '@context': 'http://schema.org',
      '@type': 'Person',
      name: data.artist.artist,
      image: data.artist.image.file.url,
      description:
        data.artist.biography &&
        documentToPlainTextString(JSON.parse(data.artist.biography.raw))
    }}
    containerName='dynamic-artist'
  >
    <h1>{data.artist.artist}</h1>
    <Row className='artist-section'>
      <Col lg={4} className='mb-3'>
        <GatsbyImage
          image={data.artist.image.gatsbyImageData}
          backgroundColor='#e8e8e8'
        />
      </Col>
      <Col lg={8}>
        {data.artist.biography && renderRichText(data.artist.biography)}
      </Col>
    </Row>
    {data.artist.object && (
      <>
        <h2>Objects by {data.artist.artist}</h2>
        <GridObjectDefault nodes={data.artist.object} />
      </>
    )}
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
        file {
          url
        }
        gatsbyImageData(layout: CONSTRAINED, quality: 85)
      }
      biography {
        raw
      }
      object {
        ...ObjectDefault
      }
    }
  }
`

export default DynamicArtist
