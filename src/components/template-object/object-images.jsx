import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap"
import Img from "gatsby-image"
import Zoom from "react-medium-image-zoom"
import "react-medium-image-zoom/dist/styles.css"

import { ContextVariationImage } from "../../templates/dynamic-object"

const ObjectImages = (images) => {
  const { state } = useContext(ContextVariationImage)
  return (
    <Row>
      {state.image && (
        <Col xs={12} className='image-zoom mb-3'>
          <Zoom overlayBgColorEnd='rgba(0, 0, 0, 0.8)' zoomMargin={50}>
            <Img fluid={state.image.fluid} />
          </Zoom>
        </Col>
      )}
      {images.images.map((image, index) => (
        <Col xs={(!state.image && index === 0) ? 12 : 4} className='image-zoom mb-3' key={index}>
          <Zoom overlayBgColorEnd='rgba(0, 0, 0, 0.8)' zoomMargin={50}>
            <Img fluid={image.fluid} />
          </Zoom>
        </Col>
      ))}
    </Row>
  )
}

export default ObjectImages
