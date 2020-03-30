import React from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "gatsby"
import Img from "gatsby-image"

const slugify = require("slugify")

const Grid = ({ items, type }) => {
  switch (type) {
    case "artist":
      return (
        <Row>
          {items
            .filter(placeholder => placeholder.node.artist !== "PLACEHOLDER")
            .map(artist => (
              <Col key={artist.node.artist} lg={2} className='grid-item'>
                <Link
                  to={
                    "/" +
                    artist.node.node_locale +
                    "/" +
                    slugify(artist.node.artist, { lower: true })
                  }
                >
                  <Img fluid={artist.node.image.fluid} />
                  <p>{artist.node.artist}</p>
                </Link>
              </Col>
            ))}
        </Row>
      )
    case "object":
      return (
        <Row>
          {items
            .filter(placeholder => placeholder.node.name !== "PLACEHOLDER")
            .map(object => (
              <Col key={object.node.name} lg={2} className='grid-item'>
                <Link
                  to={
                    "/" +
                    object.node.node_locale +
                    "/" +
                    slugify(object.node.artist.artist, { lower: true }) +
                    "/" +
                    slugify(object.node.name, { lower: true })
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
      return <></>
  }
}

export default Grid
