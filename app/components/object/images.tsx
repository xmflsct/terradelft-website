import { SelectedVariation } from '~/routes/$locale/object.$id'
import { ObjectsObject } from '~/utils/contentful'
import ContentfulImage from '../image'

type Props = {
  object?: ObjectsObject
  selectedVariation?: SelectedVariation
}

const ObjectImages: React.FC<Props> = ({ object, selectedVariation }) => {
  const variationImages = object?.variationsCollection?.items.map(
    variation => variation.image || null
  )
  const allImages = variationImages
    ? object?.imagesCollection?.items.concat(variationImages)
    : object?.imagesCollection?.items
  return (
    <>
      <div className='grid grid-cols-3 gap-4'>
        {selectedVariation?.image && (
          <div className='col-span-3'>
            <ContentfulImage image={selectedVariation.image} width={471} zoomable />
          </div>
        )}
        {allImages?.map((image, index) =>
          image ? (
            <div
              key={index}
              className={`${!selectedVariation && index === 0 ? 'col-span-3' : 'col-auto'}`}
            >
              <ContentfulImage
                image={image}
                width={!selectedVariation && index === 0 ? 471 : 147}
                zoomable
              />
            </div>
          ) : null
        )}
      </div>
    </>
  )
}

export default ObjectImages
