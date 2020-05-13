import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { BLOCKS, INLINES } from "@contentful/rich-text-types"
import getYouTubeID from "get-youtube-id"
import { findIndex } from "lodash"

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

  return <Img {...normalizedProps} backgroundColor="#e8e8e8" />
}

export const mediaFromRichText = (images, locale) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const contentful_id = node.data.target.sys.contentful_id
      const description = node.data.target.fields.description
      const imageIndex = findIndex(
        images.nodes,
        (node) => node.contentful_id === contentful_id
      )
      if (imageIndex !== -1) {
        return (
          <div className='image-rich-text'>
            <>
              {NonStretchedImage(images.nodes[imageIndex])}
              {description && <figcaption>{description[locale]}</figcaption>}
            </>
          </div>
        )
      }
    },
    [INLINES.HYPERLINK]: (node) => {
      if (node.data.uri.includes("youtube.com")) {
        return (
          <div className='iframe-container youtube-video'>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeID(
                node.data.uri
              )}`}
              title='Youtube Video'
              allow='accelerometer; encrypted-media; gyroscope; picture-in-picture'
              frameBorder='0'
              allowFullScreen
            ></iframe>
          </div>
        )
      } else if (node.data.uri.includes("terra-delft.nl")) {
        return <a href={node.data.uri}>{node.content[0].value}</a>
      } else {
        return (
          <a href={node.data.uri} target='_blank' rel='noopener noreferrer'>
            {node.content[0].value}
          </a>
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
      ...GatsbyContentfulFluid_withWebp_noBase64
    }
  }
`
