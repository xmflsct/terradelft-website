import React from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "gatsby"
import Img from "gatsby-image"

const slugify = require("slugify")

const GridArtist = ({ data }) => (
  <Row className='component-grid grid-artist'>
    {data
      .map((d) => (
        <Col key={d.node.artist} lg={2} className='grid-item'>
          <Link
            to={
              "/" +
              d.node.node_locale +
              "/" +
              slugify(d.node.artist, { lower: true })
            }
          >
            <div className='item-image'>
              {d.node.image.fixed ? (
                <Img fluid={d.node.image.fixed} />
              ) : (
                <Img fluid={d.node.image.fluid} />
              )}
            </div>
            <p className='item-name'>{d.node.artist}</p>
          </Link>
        </Col>
      ))}
  </Row>
)

export default GridArtist
