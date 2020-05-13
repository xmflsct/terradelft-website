import React, { useContext, useState } from "react"
import { Button, Col, Modal, Row } from "react-bootstrap"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

import { ContextVariationImage } from "../../templates/dynamic-object"

const ObjectImages = ({ images }) => {
  const { state } = useContext(ContextVariationImage)
  const [zoom, setZoom] = useState({ show: false })

  return (
    <>
      <Row>
        {state.image && (
          <Col
            xs={12}
            className='mb-3'
            onClick={() =>
              setZoom({ show: true, fluid: state.image.fluidZoom })
            }
          >
            <Img fluid={state.image.fluid} />
          </Col>
        )}
        {images.map((image, index) => (
          <Col
            xs={!state.image && index === 0 ? 12 : 4}
            className='mb-3'
            key={index}
            onClick={() => setZoom({ show: true, fluid: image.fluidZoom })}
          >
            <Img
              fluid={
                !state.image && index === 0 ? image.fluid : image.fluidThumbnail
              }
              backgroundColor="#e8e8e8"
            />
          </Col>
        ))}
      </Row>
      <Modal
        size='xl'
        show={zoom.show}
        centered
        dialogClassName='test'
        onHide={() => setZoom({ show: false })}
        aria-labelledby='Image'
        animation={false}
      >
        <Img fluid={zoom.fluid} backgroundColor="#e8e8e8" />
        <Button
          className='modal-close'
          variant='link'
          onClick={() => setZoom({ show: false })}
        >
          <FontAwesomeIcon icon={faTimes} size='2x' inverse fixedWidth />
        </Button>
      </Modal>
    </>
  )
}

export default ObjectImages
