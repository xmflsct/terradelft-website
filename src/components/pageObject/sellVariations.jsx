import React, { useState } from "react"
import { Button, Form } from "react-bootstrap"
import Select from "react-select"
var array = require("lodash/array")
var lang = require("lodash/lang")

const SellVariations = ({ variations }) => {
  const variant = {
    variation: {},
    colour: {},
    size: {},
  }
  const options = {
    variation: [],
    colour: [],
    size: [],
  }
  const optionsChosen = {
    variation: [],
    colour: [],
    size: [],
  }

  // Create variations availability mapping
  variations.map((d, index) => {
    if (d.colour) {
      if (!(d.colour.colour in variant["colour"])) {
        variant["colour"][d.colour.colour] = []
      }
      variant["colour"][d.colour.colour].push(index)
    }
    if (d.size) {
      if (!(d.size.size in variant["size"])) {
        variant["size"][d.size.size] = []
      }
      variant["size"][d.size.size].push(index)
    }
    if (d.variation) {
      if (!(d.variation.variation in variant["variation"])) {
        variant["variation"][d.variation.variation] = []
      }
      variant["variation"][d.variation.variation].push(index)
    }
  })
  variant["variation"] &&
    Object.keys(variant["variation"]).forEach((k, i) => {
      options["variation"][i] = {
        allowed: variant["variation"][k],
        label: k,
        value: k,
        isDisabled: false,
      }
    })
  variant["colour"] &&
    Object.keys(variant["colour"]).forEach((k, i) => {
      options["colour"][i] = {
        allowed: variant["colour"][k],
        label: k,
        value: k,
        isDisabled: false,
      }
    })
  variant["size"] &&
    Object.keys(variant["size"]).forEach((k, i) => {
      options["size"][i] = {
        allowed: variant["size"][k],
        label: k,
        value: k,
        isDisabled: false,
      }
    })

  const handleChosen = (d, m) => {
    switch (m.action) {
      case "select-option":
        optionsChosen[m.name] = [...d.allowed]
        break
      case "clear":
        optionsChosen[m.name] = []
        break
    }

    const chosenOptions = Object.keys(optionsChosen).filter(
      k => optionsChosen[k].length > 0
    )
    const numChosen = chosenOptions.length
    switch (numChosen) {
      case 0:
        // All options are available
        Object.keys(options).forEach(k => {
          options[k].forEach((_, i) => (options[k][i]["isDisabled"] = false))
        })
        break
      case 1:
        // Check chosen options
        options[chosenOptions[0]].forEach(
          (_, i) => (options[chosenOptions[0]][i]["isDisabled"] = false)
        )
        // Check non-chosen options
        Object.keys(options)
          .filter(k => k !== chosenOptions[0])
          .forEach(k => {
            options[k].forEach((_, i) => {
              options[k][i]["isDisabled"] = lang.isEmpty(
                array.intersection(
                  options[k][i]["allowed"],
                  optionsChosen[chosenOptions[0]]
                )
              )
            })
          })
        break
      case 2:
        // Check chosen options
        options[chosenOptions[0]].forEach((_, i) => {
          options[chosenOptions[0]][i]["isDisabled"] = lang.isEmpty(
            array.intersection(
              options[chosenOptions[0]][i]["allowed"],
              optionsChosen[chosenOptions[1]]
            )
          )
        })
        options[chosenOptions[1]].forEach((_, i) => {
          options[chosenOptions[1]][i]["isDisabled"] = lang.isEmpty(
            array.intersection(
              options[chosenOptions[1]][i]["allowed"],
              optionsChosen[chosenOptions[0]]
            )
          )
        })
        // Check non-chosen options
        const allowedChosen = array.intersection(
          optionsChosen[chosenOptions[0]],
          optionsChosen[chosenOptions[1]]
        )
        Object.keys(options)
          .filter(k => k !== chosenOptions[0] && k !== chosenOptions[1])
          .forEach(k => {
            options[k].forEach((_, i) => {
              options[k][i]["isDisabled"] = lang.isEmpty(
                array.intersection(options[k][i]["allowed"], allowedChosen)
              )
            })
          })
        break
      case 3:
        break
    }
  }

  return (
    <Form>
      <Form.Group>
        {variant["variation"] && (
          <>
            <Form.Label>Variation</Form.Label>
            <Select
              name="variation"
              options={options["variation"]}
              isClearable
              onChange={handleChosen}
            />
          </>
        )}
        {variant["colour"] && (
          <>
            <Form.Label>Colour</Form.Label>
            <Select
              name="colour"
              options={options["colour"]}
              isClearable
              onChange={handleChosen}
            />
          </>
        )}
        {variant["size"] && (
          <>
            <Form.Label>Size</Form.Label>
            <Select
              name="size"
              options={options["size"]}
              isClearable
              onChange={handleChosen}
            />
          </>
        )}
      </Form.Group>
      <Button variant="primary" type="submit">
        Add to bag
      </Button>
    </Form>
  )
}

export default SellVariations
