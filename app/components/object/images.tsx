import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useRef, useState } from 'react'
import { SelectedVariation } from '~/routes/$locale/object.$id'
import { CommonImage } from '~/utils/contentful'
import ContentfulImage from '../image'

// const MouseZoom: React.FC<{ image: CommonImage }> = ({ image }) => {
//   const containerPosition = useRef(null)
//   const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>()

//   return (
//     <div
//       className='mouse-zoom'
//       onMouseMove={e => setMousePosition({ x: e.pageX, y: e.pageY })}
//       onMouseLeave={() => setMousePosition(undefined)}
//       role='presentation'
//     >
//       {mousePosition !== null && (
//         <div
//           ref={containerPosition}
//           className='zoom-image'
//           style={{
//             backgroundImage: `url(${image})`,
//             transform: 'scale(3)',
//             transformOrigin: `${
//               containerPosition.current
//                 ? ((mousePosition.x -
//                     containerPosition.current.getBoundingClientRect().left) /
//                     containerPosition.current.getBoundingClientRect().width) *
//                   100
//                 : 0
//             }% ${
//               containerPosition.current
//                 ? ((mousePosition.y -
//                     containerPosition.current.getBoundingClientRect().top) /
//                     containerPosition.current.getBoundingClientRect().height) *
//                   100
//                 : 0
//             }%`
//           }}
//         />
//       )}
//     </div>
//   )
// }

type Props = {
  images?: CommonImage[]
  selectedVariation?: SelectedVariation
}

const ObjectImages: React.FC<Props> = ({ images, selectedVariation }) => {
  const [zoomIndex, setZoomIndex] = useState(0)
  // const handleCarousel = (selectedIndex, e) => {
  //   setZoomIndex(selectedIndex)
  // }
  const [zoom, setZoom] = useState<{ show: boolean; image?: CommonImage }>({
    show: false,
    image: undefined
  })

  return (
    <>
      <div className='grid grid-cols-3 gap-4'>
        {selectedVariation?.image && (
          <div
            className='col-span-3'
            onClick={() => {
              setZoomIndex(0)
              setZoom({ show: true, image: selectedVariation!.image })
            }}
          >
            <ContentfulImage image={selectedVariation.image} width={471} />
            {/* <MouseZoom image={selectedVariation.image} /> */}
          </div>
        )}
        {images?.map((image, index) => (
          <div
            key={index}
            className={`${
              !selectedVariation && index === 0 ? 'col-span-3' : 'col-auto'
            }`}
          >
            <ContentfulImage
              key={index}
              image={image}
              width={!selectedVariation && index === 0 ? 471 : 147}
              onClick={() => {
                setZoomIndex(selectedVariation ? index + 1 : index)
                setZoom({ show: true, image })
              }}
            />
            {/* <MouseZoom
              image={
                !selectedVariation.image && index === 0
                  ? image.mouseFluid.images.fallback.src
                  : image.mouseFluidThumbnail.images.fallback.src
              }
            /> */}
          </div>
        ))}
      </div>
      {/* <Modal
        show={zoom.show}
        centered
        dialogClassName='image-modal'
        onHide={() => setZoom({ show: false })}
        aria-labelledby='Image'
      >
        <Carousel
          activeIndex={zoomIndex}
          onSelect={handleCarousel}
          interval={null}
        >
          {stateVariation.image && (
            <Carousel.Item>
              <GatsbyImage alt='' image={stateVariation.image.fluidZoom} />
              <Carousel.Caption>
                <p className='h3'>{stateVariation.image.description}</p>
              </Carousel.Caption>
            </Carousel.Item>
          )}
          {images.map((image, index) => (
            <Carousel.Item key={index} style={{ maxHeight: '100vh' }}>
              <GatsbyImage
                alt=''
                image={image.fluidZoom}
                backgroundColor='rgba(100, 100, 100)'
                style={{ maxHeight: '100vh' }}
                imgStyle={{ objectFit: 'contain' }}
              />
              <Carousel.Caption>
                <p className='h3'>{image.description}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
        <Button
          className='modal-close'
          variant='link'
          style={{ zIndex: 999 }}
          onClick={() => setZoom({ show: false })}
        >
          <FontAwesomeIcon icon={faTimes} size='2x' inverse fixedWidth />
        </Button>
      </Modal> */}
    </>
  )
}

export default ObjectImages
