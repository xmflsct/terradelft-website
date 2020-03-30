import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import Img from "gatsby-image"

import { BagContext } from "../../layouts/bagContext"

const slugify = require("slugify")

const BagList = () => {
  const { i18n } = useTranslation("pageBag")
  const { state, dispatch } = useContext(BagContext)

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
      {state.bag.length !== 0 ? (
        state.bag.map((_, i) => (
          <Row key={i}>
            <Col lg={4}>
              {state.bag[i].image ? (
                <Img fluid={state.bag[i].image.fluid} />
              ) : (
                <Img fluid={state.bag[i].imagesParent[0].fluid} />
              )}
            </Col>
            <Col lg={8}>
              <Link
                to={
                  "/" +
                  i18n.language +
                  "/" +
                  slugify(state.bag[i].artist, { lower: true }) +
                  "/" +
                  slugify(state.bag[i].name, { lower: true })
                }
              >
                {state.bag[i].name}
              </Link>
              <br />
              {state.bag[i].variation && state.bag[i].variation.variation}
              <br />
              {state.bag[i].colour && state.bag[i].colour.colour}
              <br />
              {state.bag[i].size && state.bag[i].size.size}
              <br />
              {state.bag[i].priceSale ? (
                <>
                  {state.bag[i].priceSale} {state.bag[i].priceOriginal}
                </>
              ) : (
                state.bag[i].priceOriginal
              )}
              <Button
                variant='link'
                value={state.bag[i].contentful_id}
                onClick={onRemove}
              >
                Remove
              </Button>
            </Col>
          </Row>
        ))
      ) : (
        <Row>Empty</Row>
      )}
    </>
  )
}

export default BagList
