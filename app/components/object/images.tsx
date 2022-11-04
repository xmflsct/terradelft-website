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
      <div className='mb-4 relative'>
        <ContentfulImage image={images[0]} width={471} zoomable />
        {images[0]?.description && (
          <span className='absolute bottom-0 right-0 px-2 py-1 bg-background text-secondary text-sm font-semibold border border-secondary rounded rounded-br-none'>
            {images[0].description}
          </span>
        )}
      </div>
      <div className='columns-2 gap-4'>
        {images.map((image, index) => {
          if (index === 0) return

          return (
            <div key={index} className='mb-4 relative break-inside-avoid'>
              <ContentfulImage image={image} width={147} zoomable />
              {image?.description && (
                <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-secondary text-background text-sm font-semibold'>
                  {image.description}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ObjectImages
