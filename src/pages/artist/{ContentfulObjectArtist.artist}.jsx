import GridObjectDefault from '@components/grids/grid-object-default'
import Layout from '@components/layout'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const PageArtist = ({ data }) => {
  return (
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
        image: data.artist.image?.gatsbyImageData.images.fallback.src,
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
            alt={data.artist.artist}
            image={data.artist.image?.gatsbyImageData}
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
}

export const query = graphql`
  query PageArtist($language: String!, $artist: String!) {
    locales: allLocale(
      filter: { ns: { in: ["translation"] }, language: { eq: $language } }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    artist: contentfulObjectArtist(
      node_locale: { eq: $language }
      artist: { eq: $artist }
    ) {
      artist
      image {
        gatsbyImageData(width: 280, quality: 85)
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

export default PageArtist
