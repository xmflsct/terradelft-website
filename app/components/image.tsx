import { Entry } from 'contentful'
import { DOMAttributes } from 'react'
import { CommonImage } from '~/utils/contentful'

declare namespace ContentfulImageTransform {
  type FocusArea =
    | 'center'
    | 'top'
    | 'right'
    | 'left'
    | 'bottom'
    | 'top_right'
    | 'top_left'
    | 'bottom_right'
    | 'bottom_left'
    | 'face'
    | 'faces'
  type Format = 'jpg' | 'progressive' | 'gif' | 'png' | '8bit' | 'webp' | 'avif'
  type Fit = 'pad' | 'fill' | 'scale' | 'crop' | 'thumb'
}

type Props = {
  image?: CommonImage
  alt?: string
  width: number
  height?: number
  behaviour?: ContentfulImageTransform.Fit
  quality?: number
  backgroundColor?: string
  format?: ContentfulImageTransform.Format
  focusArea?: ContentfulImageTransform.FocusArea
  radius?: number
  decoding?: 'auto' | 'sync' | 'async'
  // Custom styling
  className?: string
  eager?: boolean
} & Pick<DOMAttributes<HTMLDivElement>, 'onClick'>

const imagePropsMap = {
  width: 'w',
  height: 'h',
  behaviour: 'fit',
  quality: 'q',
  backgroundColor: 'bg',
  focusArea: 'f',
  radius: 'r',
  format: 'fm'
}

const ContentfulImage: React.FC<Props> = ({
  image,
  alt,
  quality,
  backgroundColor,
  behaviour,
  height,
  width,
  focusArea,
  format,
  radius,
  decoding = 'async',
  className,
  eager = false
}) => {
  if (!image) {
    return <div className='pb-100 bg-placeholder' />
  }

  let mimeType = image.contentType // extract mimeType from image.url
  const query = { smaller: {}, default: {}, larger: {} }

  // should only allow ContentfulImage.Query props
  function addToQuery(queries: string[], prop: Record<string, string>) {
    queries.forEach(q => {
      // @ts-ignore
      query[q] = { ...query[q], ...prop }
    })
  }

  if (quality) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['quality']]: quality.toString()
    })
  }

  if (width) {
    addToQuery(['smaller'], {
      [imagePropsMap['width']]: (width / 2).toString()
    })
    addToQuery(['default'], {
      [imagePropsMap['width']]: width.toString()
    })
    addToQuery(['larger'], {
      [imagePropsMap['width']]: (width * 2).toString()
    })
  }

  if (height) {
    addToQuery(['smaller'], {
      [imagePropsMap['height']]: (height / 2).toString()
    })
    addToQuery(['default'], {
      [imagePropsMap['height']]: height.toString()
    })
    addToQuery(['larger'], {
      [imagePropsMap['height']]: (height * 2).toString()
    })
  }

  if (behaviour) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['behaviour']]: behaviour.toString()
    })
  }

  if (focusArea) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['focusArea']]: focusArea.toString()
    })
  }

  if (radius) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['radius']]: radius.toString()
    })
  }

  if (format) {
    if (format === '8bit') {
      addToQuery(Object.keys(query), { fm: 'png' })
      addToQuery(Object.keys(query), { fl: 'png8' })
      mimeType = 'image/png'
    } else if (format === 'progressive') {
      addToQuery(Object.keys(query), { fm: 'jpg' })
      addToQuery(Object.keys(query), {
        fl: 'progressive'
      })
      mimeType = 'image/jpg'
    } else {
      addToQuery(Object.keys(query), {
        [imagePropsMap['format']]: format.toString()
      })
      mimeType = `image/${format}`
    }
  }

  if (quality) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['quality']]: quality.toString()
    })
  }

  if (backgroundColor) {
    addToQuery(Object.keys(query), {
      [imagePropsMap['backgroundColor']]: backgroundColor.toString()
    })
  }

  const transformSrc = `${image.url}?${new URLSearchParams(
    query.default
  ).toString()}`
  const transformSrcSet =
    `${image.url}?${new URLSearchParams(query.smaller).toString()} ${Math.round(
      width / 2
    )}w, ` +
    `${image.url}?${new URLSearchParams(query.default).toString()} ${Math.round(
      width
    )}w, ` +
    `${image.url}?${new URLSearchParams(query.larger).toString()} ${Math.round(
      width * 2
    )}w, `

  return (
    <img
      className={className + ' object-cover bg-placeholder'}
      width={width}
      height={height}
      src={transformSrc}
      srcSet={transformSrcSet}
      alt={alt || image.title}
      decoding={decoding}
      loading={eager ? 'eager' : 'lazy'}
    />
  )
}

export default ContentfulImage
