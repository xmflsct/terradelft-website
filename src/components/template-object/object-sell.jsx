import React from "react"
import { Button, Form } from "react-bootstrap"

import SellVariations from "./sell-variations"

const ObjectSell = ({
  contentful_id,
  name,
  artist,
  images,
  priceOriginal,
  priceSale,
  sellOnline,
  sku,
  stock,
  variations
}) => {
  return (
    <div>
      {sellOnline ? (
        variations ? (
          // Online with variation
          <SellVariations
            variations={variations}
            name={name}
            artist={artist}
            imagesParent={images}
          />
        ) : stock && stock > 0 ? (
          // Online without variation with stock
          <Form>
            <Form.Group>
              <Form.Control as='select'>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </Form.Control>
              <Button variant='primary' type='submit'>
                Add to bag
              </Button>
            </Form.Group>
          </Form>
        ) : (
          // Online without variation without stock
          priceDisplay(priceOriginal, priceSale)
        )
      ) : stock && stock > 0 ? (
        // Store with stock
        priceDisplay(priceOriginal, priceSale)
      ) : (
        // Store without stock
        ""
      )}
    </div>
  )
}

function priceDisplay(priceOriginal, priceSale) {
  if (priceOriginal) {
    if (priceSale) {
      return (
        <p>
          <span>{priceSale}</span> - <span>{priceOriginal}</span>
        </p>
      )
    } else {
      return <span>{priceOriginal}</span>
    }
  } else return
}

export default ObjectSell