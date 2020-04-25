import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap"
import Img from "gatsby-image"
import mediumZoom from "medium-zoom"

import { ContextVariationImage } from "../../templates/dynamic-object"

const ObjectImages = (images) => {
  const { state } = useContext(ContextVariationImage)

  if (typeof window !== "undefined") {
    mediumZoom(".image-zoom > picture > img", {
      margin: 50,
      background: "rgba(0, 0, 0, 0.88)",
      scrollOffset: 50,
      container: null,
      template: null,
      zIndex: 99999,
      excludedSelector: null,
    })
  }
  return (
    <Row>
      {state.image && (
        <Col xs={12} className='mb-3'>
          <Img className='image-zoom' fluid={state.image.fluid} />
        </Col>
      )}
      {images.images.map((image, index) => (
        <Col
          xs={!state.image && index === 0 ? 12 : 4}
          className='mb-3'
          key={index}
        >
          <Img className='image-zoom' fluid={image.fluid} />
        </Col>
      ))}
    </Row>
  )
}

export default ObjectImages
