import React, { useContext, useEffect } from "react"
import { Button, Form, InputGroup } from "react-bootstrap"
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
import { ContextVariationImage } from "../../templates/dynamic-object"
import { price } from "../utils/price"
import * as currency from "../utils/currency"

const SellVariations = ({ object }) => {
  const { t, i18n } = useTranslation(["dynamic-object", "component-object"])
  const { dispatch } = useContext(ContextBag)
  const { updateImage } = useContext(ContextVariationImage)
  const { control, handleSubmit, watch } = useForm()
  const variationsMain =
    object.edges[
      findIndex(object.edges, (e) => e.node.node_locale === i18n.language)
    ].node
  const sellVariations = variationsMain.variations.filter(
    (v) => v.sellOnline && v.stock > 0
  )

  const options = {
    variant: [],
    colour: [],
    size: [],
  }

  // Create variations availability mapping
  sellVariations.forEach((d, i) => {
    keys(d)
      .filter((k) => ["variant", "colour", "size"].includes(k))
      .forEach((k) => {
        const option = d[k] ? d[k][k] : "Normal"
        const index = findIndex(options[k], ["label", option])
        index === -1
          ? options[k].push({
              label: option,
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

  let variantChosen = null
  let optionsCombined = intersection(
    ...map(pickBy(optionsChosen, identity), "value")
  )
  if (optionsCombined.length === 1) {
    variantChosen = sellVariations[optionsCombined[0]]
  } else {
    variantChosen = null
  }

  useEffect(() => {
    if (variantChosen) {
      updateImage({
        type: "update",
        image: variantChosen.image,
      })
    } else {
      updateImage({
        type: "clear",
      })
    }
  }, [variantChosen, updateImage])

  const onSubmit = () => {
    const data = {
      type: "variation",
      contentful_id: variantChosen.contentful_id,
      artist: object.edges[0].node.artist.artist,
      image: variantChosen.image || object.edges[0].node.images[0],
      priceOriginal: variantChosen.priceOriginal,
      priceSale: variantChosen.priceSale,
      // Locale dependent
      name: {},
      variant: {},
      colour: {},
      size: {},
    }
    for (const o of object.edges) {
      const l = o.node.node_locale
      const v = o.node.variations[optionsCombined[0]]
      data.name[l] = o.node.name
      v.variant && (data.variant[l] = v.variant.variant)
      v.colour && (data.colour[l] = v.colour.colour)
      v.size && (data.size[l] = v.size.size)
    }
    dispatch({
      type: "add",
      data: data,
    })
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {options.variant.length > 1 && (
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>{t("component-object:variant")}</InputGroup.Text>
            </InputGroup.Prepend>
            <div className='form-selection'>
              <Controller
                as={<ReactSelect />}
                name='variant'
                options={options.variant}
                defaultValue={null}
                isClearable
                control={control}
              />
            </div>
          </InputGroup>
        )}
        {options.colour.length > 1 && (
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>{t("component-object:colour")}</InputGroup.Text>
            </InputGroup.Prepend>
            <div className='form-selection'>
              <Controller
                as={<ReactSelect />}
                name='colour'
                options={options.colour}
                defaultValue={null}
                isClearable
                control={control}
              />
            </div>
          </InputGroup>
        )}
        {options.size.length > 1 && (
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>{t("component-object:size")}</InputGroup.Text>
            </InputGroup.Prepend>
            <div className='form-selection'>
              <Controller
                as={<ReactSelect />}
                name='size'
                options={options.size}
                defaultValue={null}
                isClearable
                control={control}
              />
            </div>
          </InputGroup>
        )}
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>{t("dynamic-object:amount")}</InputGroup.Text>
          </InputGroup.Prepend>
          <div className='form-selection'>
            <ReactSelect
              options={[{ value: 1, label: 1 }]}
              defaultValue={{ value: 1, label: 1 }}
              isDisabled
            />
          </div>
        </InputGroup>
        {variantChosen ? (
          price(variantChosen.priceSale, variantChosen.priceOriginal)
        ) : (
          <p className='object-price'>
            {`${currency.full(
              variationsMain.fields.variations_price_range.lowest
            )} - ${currency.full(
              variationsMain.fields.variations_price_range.highest
            )}`}
          </p>
        )}
        <Button
          variant='primary'
          type='submit'
          disabled={variantChosen === null}
        >
          {t("add-to-bag")}
        </Button>
      </Form>
    </>
  )
}

export default SellVariations
