import React, { useContext } from "react"
import { Button, Form } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"
import ReactSelect from "react-select"
import {
  findIndex,
  identity,
  intersection,
  isEmpty,
  keys,
  map,
  pickBy
} from "lodash"

import { BagContext } from "../../layouts/bagContext"

const SellVariations = ({ variations, name, artist, imagesParent }) => {
  const { dispatch } = useContext(BagContext)
  const { control, handleSubmit, watch } = useForm()

  const options = {
    variation: [],
    colour: [],
    size: []
  }

  // Create variations availability mapping
  variations.forEach((d, i) => {
    keys(d)
      .filter(k => ["variation", "colour", "size"].includes(k) && d[k] !== null)
      .forEach(k => {
        const index = findIndex(options[k], ["label", d[k][k]])
        index === -1
          ? options[k].push({
              label: d[k][k],
              value: [i],
              isDisabled: false
            })
          : options[k][index].value.push(i)
      })
  })

  const optionsChosen = watch()
  // Disable not available option
  keys(optionsChosen).forEach(k => {
    options[k].forEach((_, i) => {
      const optionsCheck = keys(optionsChosen).filter(
        fk => fk !== k && optionsChosen[fk] !== null
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

  var sku = null
  const optionsCombined = intersection(
    ...map(pickBy(optionsChosen, identity), "value")
  )
  if (optionsCombined.length === 1) {
    sku = variations[optionsCombined[0]]
  } else {
    sku = null
  }

  const onSubmit = () => {
    dispatch({
      type: "add",
      data: {
        type: "variation",
        contentful_id: sku.contentful_id,
        name: name,
        artist: artist,
        imagesParent: imagesParent,
        sku: sku.sku,
        image: sku.image,
        priceOriginal: sku.priceOriginal,
        priceSale: sku.priceSale,
        variation: sku.variation,
        colour: sku.colour,
        size: sku.size
      }
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
      <Button variant='primary' type='submit' disabled={sku === null}>
        Add to bag
      </Button>
    </Form>
  )
}

export default SellVariations
