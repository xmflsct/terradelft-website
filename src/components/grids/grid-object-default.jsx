import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { shuffle } from "lodash"

const slugify = require("slugify")

const GridObjectDefault = ({ data, randomize, limit }) => {
  const { t } = useTranslation("component-object")

  data.filter((d) => d.node.name !== "PLACEHOLDER")
  randomize && (data = shuffle(data))
  limit && (data = data.slice(0, limit))

  return (
    <Row className='component-grid grid-object-default'>
      {data.map((d) => {
        return (
          <Col key={d.node.name} lg={2} className='grid-item'>
            <Link
              to={
                "/" +
                d.node.node_locale +
                "/" +
                slugify(d.node.artist.artist, { lower: true }) +
                "/" +
                slugify(d.node.name, { lower: true })
              }
            >
              <div className='item-image'>
                <Img fluid={d.node.images[0].fluid} />
              </div>
              <p className='item-name'>{d.node.name}</p>
            </Link>
            <span className='item-sale'>
              {d.node.fields.object_sale && t("on-sale")}
            </span>
          </Col>
        )
      })}
    </Row>
  )
}

export default GridObjectDefault
