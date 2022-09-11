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
  images?: (CommonImage | null)[]
  selectedVariation?: SelectedVariation
}

const ObjectImages: React.FC<Props> = ({ images, selectedVariation }) => {
  return (
    <>
      <div className='grid grid-cols-3 gap-4'>
        {selectedVariation?.image && (
          <div className='col-span-3'>
            <ContentfulImage image={selectedVariation.image} width={471} zoomable />
            {/* <MouseZoom image={selectedVariation.image} /> */}
          </div>
        )}
        {images?.map((image, index) =>
          image ? (
            <div className={`${!selectedVariation && index === 0 ? 'col-span-3' : 'col-auto'}`}>
              <ContentfulImage
                image={image}
                width={!selectedVariation && index === 0 ? 471 : 147}
                zoomable
              />
              {/* <MouseZoom
              image={
                !selectedVariation.image && index === 0
                  ? image.mouseFluid.images.fallback.src
                  : image.mouseFluidThumbnail.images.fallback.src
              }
            /> */}
            </div>
          ) : null
        )}
      </div>
    </>
  )
}

export default ObjectImages
