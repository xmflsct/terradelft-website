import {
  documentToReactComponents,
  Options
} from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, Text } from '@contentful/rich-text-types'
import {
  faCalendarDays,
  faNewspaper,
  faPalette,
  faUser
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import getYouTubeID from 'get-youtube-id'
import { CommonImage, CommonRichText } from '~/utils/contentful'
import ContentfulImage from './image'
import { Link } from './link'

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
  if (links?.entries?.hyperlink) {
    for (const entry of links.entries?.hyperlink) {
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
        if (!asset) return

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
      [BLOCKS.EMBEDDED_ENTRY]: node => {
        // Same as inline entry, maybe with widgets?
        return null
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
          return <a href={node.data.uri}>{(node.content[0] as Text).value}</a>
        } else {
          return (
            <a href={node.data.uri} target='_blank' rel='noopener noreferrer'>
              {(node.content[0] as Text).value}
            </a>
          )
        }
      },
      [INLINES.ENTRY_HYPERLINK]: node => {
        const entry = entryMap.get(node.data.target.sys.id)
        if (!entry) return null

        switch (entry.__typename) {
          case 'EventsEvent':
            return (
              <Link to={`/exhibition/${entry.sys.id}`}>
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className='mr-1'
                  size='sm'
                />
                {(node.content[0] as Text).value}
              </Link>
            )
          case 'NewsNews':
            return (
              <Link to={`/news/${entry.sys.id}`}>
                <FontAwesomeIcon
                  icon={faNewspaper}
                  className='mr-1'
                  size='sm'
                />
                {(node.content[0] as Text).value}
              </Link>
            )
          case 'ObjectsArtist':
            return (
              <Link to={`/artist/${entry.slug}`}>
                <FontAwesomeIcon icon={faUser} className='mr-1' size='sm' />
                {(node.content[0] as Text).value}
              </Link>
            )
          case 'ObjectsObject':
            return (
              <Link to={`/object/${entry.sys.id}`}>
                <FontAwesomeIcon icon={faPalette} className='mr-1' size='sm' />
                {(node.content[0] as Text).value}
              </Link>
            )
          default:
            return null
        }
      },
      [INLINES.EMBEDDED_ENTRY]: node => {
        const entry = entryMap.get(node.data.target.sys.id)
        if (!entry) return null

        switch (entry.__typename) {
          case 'EventsEvent':
            return (
              <Link to={`/exhibition/${entry.sys.id}`}>
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className='mr-1'
                  size='sm'
                />
                {entry.name}
              </Link>
            )
          case 'NewsNews':
            return (
              <Link to={`/news/${entry.sys.id}`}>
                <FontAwesomeIcon
                  icon={faNewspaper}
                  className='mr-1'
                  size='sm'
                />
                {entry.title}
              </Link>
            )
          case 'ObjectsArtist':
            return (
              <Link to={`/artist/${entry.slug}`}>
                <FontAwesomeIcon icon={faUser} className='mr-1' size='sm' />
                {entry.artist}
              </Link>
            )
          case 'ObjectsObject':
            return (
              <Link to={`/object/${entry.sys.id}`}>
                <FontAwesomeIcon icon={faPalette} className='mr-1' size='sm' />
                {entry.name}
              </Link>
            )
          default:
            return null
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
      className={`prose prose-neutral max-w-none ${className}`}
      children={documentToReactComponents(
        content.json,
        richTextOptions({ links: content.links, assetWidth })
      )}
    />
  )
}

export default RichText
