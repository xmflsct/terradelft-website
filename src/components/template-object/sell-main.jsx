import React, { useContext } from "react"
import { Button, Form } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { findIndex } from "lodash"

import { ContextBag } from "../../layouts/contexts/bag"
import { price } from "./price"

const SellVariations = ({ object }) => {
  const { i18n } = useTranslation("static-index")
  const { dispatch } = useContext(ContextBag)
  const { handleSubmit } = useForm()
  const sellMain =
    object.edges[
      findIndex(object.edges, (e) => e.node.node_locale === i18n.language)
    ].node

  const onSubmit = () => {
    const data = {
      type: "main",
      contentful_id: sellMain.contentful_id,
      artist: sellMain.artist.artist,
      images: sellMain.images,
      priceOriginal: sellMain.priceOriginal,
      priceSale: sellMain.priceSale,
      // Locale dependent
      name: {},
    }
    for (const o of object.edges) {
      data.name[o.node.node_locale] = o.node.name
    }
    dispatch({
      type: "add",
      data: data,
    })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        <Form.Control as='select' disabled>
          <option>1</option>
        </Form.Control>
      </Form.Group>
        {price(sellMain.priceSale, sellMain.priceOriginal)}
      <Button variant='primary' type='submit'>
        Add to bag
      </Button>
    </Form>
  )
}

export default SellVariations
