import React, { useContext } from "react"
import { Button, Form } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import ReactSelect from "react-select"
import {
  findIndex,
  identity,
  intersection,
  isEmpty,
  keys,
  map,
  pickBy,
} from "lodash"

import { ContextBag } from "../../layouts/contexts/bag"
import { price } from "./price"
import * as currency from "../utils/currency"

const SellVariations = ({ object }) => {
  const { i18n } = useTranslation("static-index")
  const { dispatch } = useContext(ContextBag)
  const { control, handleSubmit, watch } = useForm()
  const sellVariations =
    object.edges[
      findIndex(object.edges, (e) => e.node.node_locale === i18n.language)
    ].node.variations

  const options = {
    variation: [],
    colour: [],
    size: [],
  }

  const priceRange = {
    lowest: 99999,
    highest: 0,
  }

  // Create variations availability mapping
  sellVariations.forEach((d, i) => {
    const priceTemp = d.priceSale || d.priceOriginal
    priceTemp < priceRange.lowest && (priceRange.lowest = priceTemp)
    priceTemp > priceRange.highest && (priceRange.highest = priceTemp)
    keys(d)
      .filter(
        (k) => ["variation", "colour", "size"].includes(k) && d[k] !== null
      )
      .forEach((k) => {
        const index = findIndex(options[k], ["label", d[k][k]])
        index === -1
          ? options[k].push({
              label: d[k][k],
              value: [i],
              isDisabled: false,
            })
          : options[k][index].value.push(i)
      })
  })

  const optionsChosen = watch()
  // Disable not available option
  keys(optionsChosen).forEach((k) => {
    options[k].forEach((_, i) => {
      const optionsCheck = keys(optionsChosen).filter(
        (fk) => fk !== k && optionsChosen[fk] !== null
      )
      switch (optionsCheck.length) {
        case 0:
          options[k][i].isDisabled = false
          break
        case 1:
          options[k][i].isDisabled = isEmpty(
            intersection(
              options[k][i].value,
              optionsChosen[optionsCheck[0]].value
            )
          )
          break
        case 2:
          const newIntersection = intersection(
            optionsChosen[optionsCheck[0]].value,
            optionsChosen[optionsCheck[1]].value
          )
          options[k][i].isDisabled = isEmpty(
            intersection(options[k][i].value, newIntersection)
          )
          break
        default:
          return
      }
    })
  })

  var variant = null
  const optionsCombined = intersection(
    ...map(pickBy(optionsChosen, identity), "value")
  )
  if (optionsCombined.length === 1) {
    variant = sellVariations[optionsCombined[0]]
  } else {
    variant = null
  }

  const onSubmit = () => {
    const data = {
      type: "variation",
      contentful_id: variant.contentful_id,
      artist: object.edges[0].node.artist.artist,
      images: object.edges[0].node.images,
      image: variant.image,
      priceOriginal: variant.priceOriginal,
      priceSale: variant.priceSale,
      // Locale dependent
      name: {},
      variation: {},
      colour: {},
      size: {},
    }
    for (const o of object.edges) {
      const l = o.node.node_locale
      const v = o.node.variations[optionsCombined[0]]
      data.name[l] = o.node.name
      v.variation && (data.variation[l] = v.variation.variation)
      v.colour && (data.colour[l] = v.colour.colour)
      v.size && (data.size[l] = v.size.size)
    }
    dispatch({
      type: "add",
      data: data,
    })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        {options.variation && (
          <>
            <Form.Label>Variation</Form.Label>
            <Controller
              as={<ReactSelect />}
              name='variation'
              options={options.variation}
              defaultValue={null}
              isClearable
              control={control}
            />
          </>
        )}
        {options.colour && (
          <>
            <Form.Label>Colour</Form.Label>
            <Controller
              as={<ReactSelect />}
              name='colour'
              options={options.colour}
              defaultValue={null}
              isClearable
              control={control}
            />
          </>
        )}
        {options.size && (
          <>
            <Form.Label>Size</Form.Label>
            <Controller
              as={<ReactSelect />}
              name='size'
              options={options.size}
              defaultValue={null}
              isClearable
              control={control}
            />
          </>
        )}
      </Form.Group>
      {variant ? (
        price(variant.priceSale, variant.priceOriginal)
      ) : (
        <>
          {currency.full(priceRange.lowest)} -{" "}
          {currency.full(priceRange.highest)}
        </>
      )}
      <Button variant='primary' type='submit' disabled={variant === null}>
        Add to bag
      </Button>
    </Form>
  )
}

export default SellVariations
