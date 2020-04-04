import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import Img from "gatsby-image"

import { ContextBag } from "../../layouts/contexts/bag"

const slugify = require("slugify")

const BagList = () => {
  const { state, dispatch } = useContext(ContextBag)
  const { i18n } = useTranslation()

  const onRemove = (e) => {
    dispatch({
      type: "remove",
      data: {
        contentful_id: e.target.value,
      },
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
                  <Img fluid={object.images[0].fluid} />
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
                    slugify(object.name[i18n.language], { lower: true })
                  }
                >
                  {object.name[i18n.language]}
                </Link>
                {object.type === "variation" && (
                  <>
                    <br />
                    {object.variation[i18n.language]}
                    <br />
                    {object.colour[i18n.language]}
                    <br />
                    {object.size[i18n.language]}
                    <br />
                  </>
                )}
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
