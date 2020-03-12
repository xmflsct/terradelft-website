import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { Col, Row } from "react-bootstrap"

import { slugify } from "../utils/slugify"

const ObjectGrid = ({ objects, location, type }) => {
  switch (type) {
    case "artist":
      return (
        <Row>
          {objects.map(object => (
            <Col key={object.node.artist} lg={2} className="grid-item">
              <Link
                to={
                  location.pathname.substring(0, 3) +
                  "/" +
                  slugify(object.node.artist)
                }
              >
                <Img fluid={object.node.image.fluid} />
                <p>{object.node.artist}</p>
              </Link>
            </Col>
          ))}
        </Row>
      )
    case "object":
      return (
        <Row>
          {objects.map(object => (
            <Col key={object.node.name} lg={2} className="grid-item">
              <Link
                to={
                  location.pathname.substring(0, 3) +
                  "/" +
                  slugify(object.node.slug)
                }
              >
                <Img fluid={object.node.images[0].fluid} />
                <p>{object.node.name}</p>
              </Link>
            </Col>
          ))}
        </Row>
      )
    default:
      return
  }
}

export default ObjectGrid
