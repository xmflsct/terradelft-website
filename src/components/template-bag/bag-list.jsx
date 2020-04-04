import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import Img from "gatsby-image"

import { ContextBag } from "../../layouts/contexts/bag"

const slugify = require("slugify")

const BagList = () => {
  const { i18n } = useTranslation("pageBag")
  const { state, dispatch } = useContext(ContextBag)

  const onRemove = e => {
    dispatch({
      type: "remove",
      data: {
        contentful_id: e.target.value
      }
    })
  }

  return (
    <>
      {state.bag.objects.length !== 0 ? (
        state.bag.objects.map((_, i) => {
          const object = state.bag.objects[i]
          return (
            <Row key={i}>
              <Col lg={4}>
                {object.image ? (
                  <Img fluid={object.image.fluid} />
                ) : (
                  <Img fluid={object.imagesParent[0].fluid} />
                )}
              </Col>
              <Col lg={8}>
                <Link
                  to={
                    "/" +
                    i18n.language +
                    "/" +
                    slugify(object.artist, { lower: true }) +
                    "/" +
                    slugify(object.name, { lower: true })
                  }
                >
                  {object.name}
                </Link>
                <br />
                {object.variation && object.variation.variation}
                <br />
                {object.colour && object.colour.colour}
                <br />
                {object.size && object.size.size}
                <br />
                {object.priceSale ? (
                  <>
                    {object.priceSale} {object.priceOriginal}
                  </>
                ) : (
                  object.priceOriginal
                )}
                <Button
                  variant='link'
                  value={object.contentful_id}
                  onClick={onRemove}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          )
        })
      ) : (
        <Row>Empty</Row>
      )}
    </>
  )
}

export default BagList
