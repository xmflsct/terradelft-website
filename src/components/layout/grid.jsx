import React, { useContext } from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { Col, Row } from "react-bootstrap"

import { useTranslation } from "react-i18next"
import { slugify } from "../utils/slugify"

const Grid = ({ items, type }) => {
  const { i18n } = useTranslation("common")

  switch (type) {
    case "artist":
      return (
        <Row>
          {items.map(object => (
            <Col key={object.node.artist} lg={2} className="grid-item">
              <Link to={`/${i18n.language}/${slugify(object.node.artist)}`}>
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
          {items.map(object => (
            <Col key={object.node.name} lg={2} className="grid-item">
              <Link
                to={`/${i18n.language}/${slugify(
                  object.node.artist.artist
                )}/${slugify(object.node.name)}`}
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
