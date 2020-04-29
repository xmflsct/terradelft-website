import React from "react"
import { Container } from "react-bootstrap"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { findIndex } from "lodash"
import { BLOCKS } from "@contentful/rich-text-types"

export const imageFromRichText = (data, locale) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const contentful_id = node.data.target.sys.contentful_id
      const description = node.data.target.fields.description
      const imageIndex = findIndex(
        data.nodes,
        (node) => node.contentful_id === contentful_id
      )
      return (
        <Container className='image-rich-text'>
          {imageIndex !== -1 && (
            <>
              <Img fluid={data.nodes[imageIndex].fluid} />
              {description && <figcaption>{description[locale]}</figcaption>}
            </>
          )}
        </Container>
      )
    },
  },
})

export const query = graphql`
  fragment ImageFromRichText on ContentfulAsset {
    contentful_id
    fluid(maxWidth: 600, quality: 85) {
      ...GatsbyContentfulFluid_withWebp
    }
  }
`
