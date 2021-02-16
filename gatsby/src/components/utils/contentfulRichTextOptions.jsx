import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import Img from 'gatsby-image'
import getYouTubeID from 'get-youtube-id'
import React from 'react'

const contentfulRichTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      return (
        <div className='image-rich-text'>
          <Img fluid={node.data.target.fluid} />
          {node.data.target.description && (
            <figcaption>{node.data.target.description}</figcaption>
          )}
        </div>
      )
    },
    [INLINES.HYPERLINK]: node => {
      if (node.data.uri.includes('youtube.com')) {
        return (
          <span className='iframe-container youtube-video'>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeID(
                node.data.uri
              )}`}
              title='Youtube Video'
              allow='accelerometer; encrypted-media; gyroscope; picture-in-picture'
              frameBorder='0'
              allowFullScreen
            />
          </span>
        )
      } else if (node.data.uri.includes('terra-delft.nl')) {
        return <a href={node.data.uri}>{node.content[0].value}</a>
      } else {
        return (
          <a href={node.data.uri} target='_blank' rel='noopener noreferrer'>
            {node.content[0].value}
          </a>
        )
      }
    }
  }
}

export default contentfulRichTextOptions
