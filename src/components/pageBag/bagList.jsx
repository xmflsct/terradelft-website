import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import Img from "gatsby-image"

import { BagObjects } from "../layout"

const BagList = () => {
  const { state, dispatch } = useContext(BagObjects)

  const onRemove = e => {
    dispatch({
      type: "remove",
      data: {
        sku: e.target.value
      }
    })
  }

  return (
    <>
      {state.length !== 0 ? (
        state.map((_, i) => (
          <Row key={i}>
            <Col lg={4}>
              {state[i].image ? (
                <Img fluid={state[i].image.fluid} />
              ) : (
                <Img fluid={state[i].imagesParent[0].fluid} />
              )}
            </Col>
            <Col lg={8}>
              {state[i].name}
              <br />
              {state[i].variation && state[i].variation.variation}
              <br />
              {state[i].colour && state[i].colour.colour}
              <br />
              {state[i].size && state[i].size.size}
              <br />
              {state[i].priceSale
                ? state[i].priceSale + state[i].priceOriginal
                : state[i].priceOriginal}
              <Button
                variant='link'
                value={state[i].sku}
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
