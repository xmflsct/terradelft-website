import { SelectedImages, SelectedVariation } from '~/routes/$locale/object.$id'
import { CommonImage, ObjectsObject } from '~/utils/contentful'
import ContentfulImage from '../image'

type Props = {
  object?: Pick<ObjectsObject, 'imagesCollection'>
  selectedImages?: SelectedImages
  selectedVariation?: SelectedVariation
}

const ObjectImages: React.FC<Props> = ({ object, selectedImages, selectedVariation }) => {
  let images: (CommonImage | undefined | null)[] = []

  if (selectedImages?.length) {
    images.push(...selectedImages)
  } else if (selectedVariation) {
    images.push(selectedVariation.image)
  } else {
    if (object?.imagesCollection?.items) {
      images.push(...object.imagesCollection.items)
    }
  }

  images = images.filter(i => i)
  if (!images.length) {
    images = [object?.imagesCollection?.items[0]]
  }

  return (
    <div>
      <ContentfulImage image={images[0]} width={471} zoomable className='mb-4' />
      <div className='columns-2 gap-4'>
        {images.map((image, index) => {
          if (index === 0) return

          return (
            <ContentfulImage
              image={image}
              width={147}
              zoomable
              className='mb-4 break-inside-avoid'
            />
          )
        })}
      </div>
    </div>
  )
}

export default ObjectImages
