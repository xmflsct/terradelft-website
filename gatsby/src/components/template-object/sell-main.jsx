import React, { useContext } from "react"
import { Button, Form, InputGroup } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import ReactSelect from "react-select"
import { findIndex } from "lodash"

import { ContextBag } from "../../layouts/contexts/bag"
import { Price } from "../utils/price"

const SellMain = ({ object }) => {
  const { t, i18n } = useTranslation("dynamic-object")
  const { dispatch } = useContext(ContextBag)
  const { handleSubmit } = useForm()
  const sellMain =
    object.nodes[
      findIndex(object.nodes, (node) => node.node_locale === i18n.language)
    ]

  const onSubmit = () => {
    const data = {
      type: "main",
      contentful_id: sellMain.contentful_id,
      contentful_id_url: sellMain.contentful_id,
      artist: sellMain.artist.artist,
      image: sellMain.images[0],
      priceOriginal: sellMain.priceOriginal,
      priceSale: sellMain.priceSale,
      // Locale dependent
      name: {},
    }
    for (const node of object.nodes) {
      data.name[node.node_locale] = node.name
    }
    dispatch({
      type: "add",
      data: data,
    })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className='sell-main'>
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{t("amount")}</InputGroup.Text>
        </InputGroup.Prepend>
        <div className='form-selection'>
          <ReactSelect
            options={[{ value: 1, label: 1 }]}
            defaultValue={{ value: 1, label: 1 }}
            isDisabled
          />
        </div>
      </InputGroup>
      {Price(i18n.language, sellMain.priceSale, sellMain.priceOriginal)}
      <Button variant='primary' type='submit'>
        {t("add-button.add-to-bag")}
      </Button>
    </Form>
  )
}

export default SellMain
