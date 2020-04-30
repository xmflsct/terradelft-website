import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { findIndex } from "lodash"
import { BLOCKS, INLINES } from "@contentful/rich-text-types"

const NonStretchedImage = (props) => {
  let normalizedProps = props
  if (props.fluid && props.file.details.image.width) {
    normalizedProps = {
      ...props,
      style: {
        ...(props.style || {}),
        maxWidth: props.file.details.image.width,
        margin: "0 auto", // Used to center the image
      },
    }
  }

  return <Img {...normalizedProps} />
}

export const mediaFromRichText = (data, locale) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const contentful_id = node.data.target.sys.contentful_id
      const description = node.data.target.fields.description
      const imageIndex = findIndex(
        data.nodes,
        (node) => node.contentful_id === contentful_id
      )
      if (imageIndex !== -1) {
        return (
          <div className='image-rich-text'>
            <>
              {NonStretchedImage(data.nodes[imageIndex])}
              {description && <figcaption>{description[locale]}</figcaption>}
            </>
          </div>
        )
      }
    },
    [INLINES.HYPERLINK]: (node) => {
      if (node.data.uri.includes("youtube.com")) {
        const uri = node.data.uri.replace(
          "youtube.com/watch?v=",
          "youtube.com/embed/"
        )
        return (
          <div>
            <iframe
              title='Unique Title 002'
              src={uri}
              allow='accelerometer; encrypted-media; gyroscope; picture-in-picture'
              frameBorder='0'
              allowFullScreen
            ></iframe>
          </div>
        )
      }
    },
  },
})

export const query = graphql`
  fragment ImageFromRichText on ContentfulAsset {
    contentful_id
    file {
      details {
        image {
          width
        }
      }
    }
    fluid(maxWidth: 600, quality: 85) {
      ...GatsbyContentfulFluid_withWebp
    }
  }
`
