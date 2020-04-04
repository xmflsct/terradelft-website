import React from "react"
import Img from "gatsby-image"

const ObjectImages = images => (
  <div>
    {images.images.map((image, index) => (
      <Img fluid={image.fluid} key={index} />
    ))}
  </div>
)

export default ObjectImages
