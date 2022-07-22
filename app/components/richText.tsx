import {
  documentToReactComponents,
  Options
} from '@contentful/rich-text-react-renderer'
import { BLOCKS, Inline, INLINES } from '@contentful/rich-text-types'
import { CommonImage, CommonRichText } from '~/utils/contentful'
import getYouTubeID from 'get-youtube-id'
import ContentfulImage from './image'

const richTextOptions = ({
  links,
  assetWidth
}: {
  links: any
  assetWidth?: number
}): Options => {
  const assetMap = new Map()
  if (links?.assets?.block) {
    for (const asset of links.assets.block) {
      assetMap.set(asset.sys.id, asset)
    }
  }

  const entryMap = new Map()
  if (links?.entries?.block) {
    for (const entry of links.entries?.block) {
      entryMap.set(entry.sys.id, entry)
    }
  }
  if (links?.entries?.inline) {
    for (const entry of links.entries?.inline) {
      entryMap.set(entry.sys.id, entry)
    }
  }

  return {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: node => {
        const asset = assetMap.get(node.data.target.sys.id) as CommonImage

        return (
          <div>
            <ContentfulImage
              image={asset}
              width={assetWidth || 400}
              quality={85}
              className={asset.description ? 'mb-0' : ''}
            />
            {asset.description && (
              <figcaption className='mt-1'>{asset.description}</figcaption>
            )}
          </div>
        )
      },
      [INLINES.HYPERLINK]: node => {
        const youtubeId = getYouTubeID(node.data.uri)
        if (youtubeId) {
          return (
            <span>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title='Youtube Video'
                allow='accelerometer; encrypted-media; gyroscope; picture-in-picture'
                frameBorder='0'
                allowFullScreen
                width={assetWidth || 400}
                height={((assetWidth || 400) / 16) * 9}
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
}

type Props = {
  content?: CommonRichText
  className?: string
  assetWidth?: number
}

const RichText: React.FC<Props> = ({ content, className, assetWidth }) => {
  if (!content?.json) return null

  return (
    <article
      className={`prose prose-neutral ${className}`}
      children={documentToReactComponents(
        content.json,
        richTextOptions({ links: content.links, assetWidth })
      )}
    />
  )
}

export default RichText
