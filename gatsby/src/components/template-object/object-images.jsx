import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GatsbyImage } from 'gatsby-plugin-image'
import PropTypes from 'prop-types'
import React, { useContext, useRef, useState } from 'react'
import { Button, Carousel, Col, Modal, Row } from 'react-bootstrap'
import { ContextVariation } from './object-context'

const MouseZoom = ({ image }) => {
  const containerPosition = useRef(null)
  const [mousePosition, setMousePosition] = useState(null)

  return (
    <div
      className='mouse-zoom'
      onMouseMove={e => {
        setMousePosition({ x: e.pageX, y: e.pageY })
      }}
      onMouseLeave={() => {
        setMousePosition(null)
      }}
      role='presentation'
    >
      {mousePosition !== null && (
        <div
          ref={containerPosition}
          className='zoom-image'
          style={{
            backgroundImage: `url(${image})`,
            transform: 'scale(3)',
            transformOrigin: `${
              containerPosition.current
                ? ((mousePosition.x -
                    containerPosition.current.getBoundingClientRect().left) /
                    containerPosition.current.getBoundingClientRect().width) *
                  100
                : 0
            }% ${
              containerPosition.current
                ? ((mousePosition.y -
                    containerPosition.current.getBoundingClientRect().top) /
                    containerPosition.current.getBoundingClientRect().height) *
                  100
                : 0
            }%`
          }}
        />
      )}
    </div>
  )
}

const ObjectImages = ({ images }) => {
  const { stateVariation } = useContext(ContextVariation)
  const [zoomIndex, setZoomIndex] = useState(0)
  const handleCarousel = (selectedIndex, e) => {
    setZoomIndex(selectedIndex)
  }
  const [zoom, setZoom] = useState({ show: false })

  return (
    <>
      <Row>
        {stateVariation.image && (
          <Col
            xs={12}
            className='mb-3'
            onClick={() => {
              setZoomIndex(0)
              setZoom({ show: true, fluid: stateVariation.image.fluidZoom })
            }}
          >
            <GatsbyImage
              alt={stateVariation.image.description}
              image={stateVariation.image.gatsbyImageData}
            />
            <MouseZoom
              image={stateVariation.image.mouseFluid.images.fallback.src}
            />
          </Col>
        )}
        {images.map((image, index) => (
          <Col
            xs={!stateVariation.image && index === 0 ? 12 : 4}
            className='mb-3'
            style={{ overflow: 'hidden', position: 'relative' }}
            key={index}
            onClick={() => {
              setZoomIndex(stateVariation.image ? index + 1 : index)
              setZoom({ show: true, fluid: image.fluidZoom })
            }}
          >
            <GatsbyImage
              alt={image.description}
              image={
                !stateVariation.image && index === 0
                  ? image.gatsbyImageData
                  : image.fluidThumbnail
              }
              backgroundColor='#e8e8e8'
            />
            <MouseZoom
              image={
                !stateVariation.image && index === 0
                  ? image.mouseFluid.images.fallback.src
                  : image.mouseFluidThumbnail.images.fallback.src
              }
            />
          </Col>
        ))}
      </Row>
      <Modal
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
      </Modal>
    </>
  )
}

MouseZoom.propTypes = {
  image: PropTypes.string.isRequired
}

ObjectImages.propTypes = {
  images: PropTypes.array.isRequired
}

export default ObjectImages
