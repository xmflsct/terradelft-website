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
import { Price } from "../utils/price"
import * as currency from "../utils/currency"

const SellVariations = ({ object }) => {
  const { t, i18n } = useTranslation(["dynamic-object", "component-object"])
  const { dispatch } = useContext(ContextBag)
  const { updateImage } = useContext(ContextVariationImage)
  const { control, handleSubmit, watch } = useForm()
  const variationsMain =
    object.nodes[
      findIndex(object.nodes, (node) => node.node_locale === i18n.language)
    ]
  const sellVariations = variationsMain.variations.filter((v) => v.sellOnline)

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
        const option = d[k] ? d[k][k] : t("component-object:option-default")
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

  for (const type in options) {
    if (
      options[type].length === 1 &&
      options[type][0].label === t("component-object:option-default")
    ) {
      delete options[type]
    }
  }

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
      artist: object.nodes[0].artist.artist,
      image: variantChosen.image || object.nodes[0].images[0],
      priceOriginal: variantChosen.priceOriginal,
      priceSale: variantChosen.priceSale,
      // Locale dependent
      name: {},
    }
    for (const type in options) {
      data[type] = {}
    }

    for (const node of object.nodes) {
      const l = node.node_locale
      const v = node.variations[optionsCombined[0]]
      data.name[l] = node.name
      for (const type in options) {
        data[type][l] = v[type]
          ? v[type][type]
          : t("component-object:option-default")
      }
    }
    dispatch({
      type: "add",
      data: data,
    })
  }

  return (
    <>
      {Object.keys(options).length > 0 && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          {Object.keys(options).map((type) => (
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  {t(`component-object:${type}`)}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <div className='form-selection'>
                <Controller
                  as={<ReactSelect />}
                  name={type}
                  options={options[type]}
                  defaultValue={null}
                  isClearable
                  control={control}
                />
              </div>
            </InputGroup>
          ))}
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
            Price(variantChosen.priceSale, variantChosen.priceOriginal)
          ) : (
            <p className='object-price'>
              {variationsMain.fields.variations_price_range.lowest ===
              variationsMain.fields.variations_price_range.highest
                ? currency.full(
                    variationsMain.fields.variations_price_range.highest
                  )
                : `${currency.full(
                    variationsMain.fields.variations_price_range.lowest
                  )} - ${currency.full(
                    variationsMain.fields.variations_price_range.highest
                  )}`}
            </p>
          )}
          <Button
            variant='primary'
            type='submit'
            disabled={variantChosen === null || !(variantChosen.stock > 0)}
          >
            {variantChosen
              ? variantChosen.stock > 0
                ? t("add-button.add-to-bag")
                : t("add-button.out-of-stock")
              : t("add-button.select-variation")}
          </Button>
        </Form>
      )}
    </>
  )
}

export default SellVariations
