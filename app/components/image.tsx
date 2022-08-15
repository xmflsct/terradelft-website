import { DOMAttributes } from 'react'
import classNames from '~/utils/classNames'
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
  image: Pick<CommonImage, 'url' | 'title'> | undefined | null
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

const propsMap = {
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
    return (
      <div
        className='relative pb-100 bg-stone-200'
        children={
          <span
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-background text-3xl'
            children='Terra Delft'
          />
        }
      />
    )
  }

  const queries = [{}, {}, {}] // smaller, default, larger

  // should only allow ContentfulImage.Query props
  const addToQuery = (
    prop: Record<string, string>,
    qs: ('smaller' | 'default' | 'larger')[] = ['smaller', 'default', 'larger']
  ) => {
    const mapping = { smaller: 0, default: 1, larger: 2 }
    qs.forEach(q => {
      queries[mapping[q]] = { ...queries[mapping[q]], ...prop }
    })
  }

  if (quality) {
    addToQuery({ [propsMap['quality']]: quality.toString() })
  }

  if (width) {
    addToQuery({ [propsMap['width']]: (width / 2).toString() }, ['smaller'])
    addToQuery({ [propsMap['width']]: width.toString() }, ['default'])
    addToQuery({ [propsMap['width']]: (width * 2).toString() }, ['larger'])
  }

  if (height) {
    addToQuery({ [propsMap['height']]: (height / 2).toString() }, ['smaller'])
    addToQuery({ [propsMap['height']]: height.toString() }, ['default'])
    addToQuery({ [propsMap['height']]: (height * 2).toString() }, ['larger'])
  }

  if (behaviour) {
    addToQuery({ [propsMap['behaviour']]: behaviour.toString() })
  }

  if (focusArea) {
    addToQuery({ [propsMap['focusArea']]: focusArea.toString() })
  }

  if (radius) {
    addToQuery({ [propsMap['radius']]: radius.toString() })
  }

  if (quality) {
    addToQuery({ [propsMap['quality']]: quality.toString() })
  }

  if (backgroundColor) {
    addToQuery({ [propsMap['backgroundColor']]: backgroundColor.toString() })
  }

  const formatJPG = { fm: 'jpg', fl: 'progressive' }
  const formatWEBP = { fm: 'webp' }

  const transformSrc = `${image.url}?${new URLSearchParams({
    ...queries[1],
    ...formatJPG
  }).toString()}`
  const transformSrcSetJPG =
    `${image.url}?${new URLSearchParams({
      ...queries[0],
      ...formatJPG
    }).toString()} ${Math.round(width / 2)}w, ` +
    `${image.url}?${new URLSearchParams({
      ...queries[1],
      ...formatJPG
    }).toString()} ${Math.round(width)}w, ` +
    `${image.url}?${new URLSearchParams({
      ...queries[2],
      ...formatJPG
    }).toString()} ${Math.round(width * 2)}w, `
  const transformSrcSetWEBP =
    `${image.url}?${new URLSearchParams({
      ...queries[0],
      ...formatWEBP
    }).toString()} ${Math.round(width / 2)}w, ` +
    `${image.url}?${new URLSearchParams({
      ...queries[1],
      ...formatWEBP
    }).toString()} ${Math.round(width)}w, ` +
    `${image.url}?${new URLSearchParams({
      ...queries[2],
      ...formatWEBP
    }).toString()} ${Math.round(width * 2)}w, `

  return (
    <picture className={classNames('object-cover bg-stone-200', className)}>
      <source type='image/webp' srcSet={transformSrcSetWEBP} />
      <source type='image/jpeg' srcSet={transformSrcSetJPG} />
      <img
        width={width}
        height={height}
        src={transformSrc}
        srcSet={transformSrcSetJPG}
        alt={alt || image.title}
        decoding={decoding}
        loading={eager ? 'eager' : 'lazy'}
        className='w-full mx-auto'
      />
    </picture>
  )
}

export default ContentfulImage
