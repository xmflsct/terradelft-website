import { minBy } from 'lodash'
import { DOMAttributes, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Zoom, { UncontrolledProps } from 'react-medium-image-zoom'
import classNames from '~/utils/classNames'
import { CommonImage } from '~/utils/contentful'
import useWindowDimensions from '~/utils/windowDimensions'

const ZoomContent: React.FC<
  Parameters<NonNullable<UncontrolledProps['ZoomContent']>>['0'] & {
    image: Pick<NonNullable<Props['image']>, 'width' | 'height'>
  }
> = ({ buttonUnzoom, modalState, img, image }) => {
  const { width, height } = useWindowDimensions()
  const imageRatio = image.width / image.height
  const windowRatio = width / height
  const [mouseHover, setMouseHover] = useState(false)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>(
    undefined
  )
  const zoomSize = 200
  const realWidth = imageRatio > windowRatio ? width : (image.width / image.height) * width
  const realHeight = imageRatio > windowRatio ? (image.height / image.width) * height : height
  const zoomLevel = minBy([image.width / width, image.height / height, 2]) || 2

  return (
    <>
      {modalState === 'LOADED' ? buttonUnzoom : null}
      <figure
        onMouseMove={e => setMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseEnter={() => setMouseHover(true)}
        onMouseLeave={() => setMouseHover(false)}
      >
        {img}
        {modalState === 'LOADED' && mouseHover && mousePosition ? (
          <div
            style={{
              position: 'absolute',
              border: '1px solid lightgray',
              left: mousePosition.x - zoomSize / 2,
              top: mousePosition.y - zoomSize / 2,
              width: zoomSize,
              height: zoomSize,
              backgroundImage: `url(${img?.props.src})`,
              backgroundSize: `${realWidth * zoomLevel}px ${realHeight * zoomLevel}px`,
              backgroundPositionX: `${-mousePosition.x * zoomLevel + zoomSize / 2}px`,
              backgroundPositionY: `${-mousePosition.y * zoomLevel + zoomSize / 2}px`
            }}
            role='presentation'
          />
        ) : null}
      </figure>
    </>
  )
}

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
  image: Pick<CommonImage, 'url' | 'width' | 'height' | 'title'> | undefined | null
  alt?: string
  width: number
  height?: number
  behaviour?: ContentfulImageTransform.Fit
  quality?: number
  backgroundColor?: string
  focusArea?: ContentfulImageTransform.FocusArea
  radius?: number
  decoding?: 'auto' | 'sync' | 'async'
  // Custom styling
  className?: string
  eager?: boolean
  zoomable?: boolean
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
  radius,
  decoding = 'async',
  className,
  eager = false,
  zoomable = false
}) => {
  const { t } = useTranslation('common')

  if (!image) {
    return (
      <div
        className='relative pb-100 bg-stone-300'
        children={
          <span
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-background text-2xl'
            children={t('no-image')}
          />
        }
      />
    )
  }

  const queries = [{}, {}, {}, {}] // smaller, default, larger, original

  // should only allow ContentfulImage.Query props
  const addToQuery = (
    prop: Record<string, string>,
    qs: ('smaller' | 'default' | 'larger' | 'original')[] = [
      'smaller',
      'default',
      'larger',
      'original'
    ]
  ) => {
    const mapping = { smaller: 0, default: 1, larger: 2, original: 3 }
    qs.forEach(q => {
      queries[mapping[q]] = { ...queries[mapping[q]], ...prop }
    })
  }

  if (quality) {
    addToQuery({ [propsMap['quality']]: quality.toString() })
  }

  addToQuery({ [propsMap['width']]: (width / 2).toString() }, ['smaller'])
  addToQuery({ [propsMap['width']]: width.toString() }, ['default'])
  addToQuery({ [propsMap['width']]: (width * 2).toString() }, ['larger'])

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
    }).toString()} ${Math.round(width * 2)}w`
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
    }).toString()} ${Math.round(width * 2)}w`

  const sizes = `${width}px`

  const theImage = () => (
    <picture className={classNames('object-cover bg-stone-200')}>
      <source type='image/webp' srcSet={transformSrcSetWEBP} sizes={sizes} />
      <source type='image/jpeg' srcSet={transformSrcSetJPG} sizes={sizes} />
      <img
        width={width}
        height={height}
        src={transformSrc}
        alt={alt || image.title}
        decoding={decoding}
        loading={eager ? 'eager' : 'lazy'}
        className='w-full mx-auto'
        sizes={sizes}
      />
    </picture>
  )

  if (zoomable) {
    return (
      <div className={className}>
        <Zoom
          zoomImg={{
            src: `${image.url}?${new URLSearchParams({
              ...queries[3],
              ...formatJPG
            }).toString()}`
          }}
          ZoomContent={props => <ZoomContent {...props} image={image} />}
        >
          {theImage()}
        </Zoom>
      </div>
    )
  } else {
    return <div className={className}>{theImage()}</div>
  }
}

export default ContentfulImage
