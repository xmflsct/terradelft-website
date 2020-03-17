import React, { useState } from "react"
import { Button, Form } from "react-bootstrap"
import Select from "react-select"
import { intersection, isEmpty, keys } from "lodash"

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
  var finalIndex
  const [enableATB, updateEnableATB] = useState(false)

  // Create variations availability mapping
  variations.forEach((d, index) => {
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
  keys(variant).forEach(k => {
    keys(variant[k]).forEach((nk, i) => {
      options[k][i] = {
        allowed: variant[k][nk],
        label: nk,
        value: nk,
        isDisabled: false,
      }
    })
  })

  const handleChosen = (d, m) => {
    m.action === "select-option" && (optionsChosen[m.name] = [...d.allowed])
    m.action === "clear" && (optionsChosen[m.name] = [])
    updateEnableATB(false)

    const chosenKeys = keys(optionsChosen).filter(
      k => optionsChosen[k].length > 0
    )
    switch (chosenKeys.length) {
      case 0:
        // All options are available
        keys(options).forEach(k => {
          options[k].forEach((_, i) => (options[k][i]["isDisabled"] = false))
        })
        break
      case 1:
        // Check chosen options
        options[chosenKeys[0]].forEach(
          (_, i) => (options[chosenKeys[0]][i]["isDisabled"] = false)
        )
        // Check non-chosen options
        keys(options)
          .filter(k => k !== chosenKeys[0])
          .forEach(k => {
            options[k].forEach((_, i) => {
              updateOption(options[k][i], optionsChosen[chosenKeys[0]])
            })
          })

        finalIndex = optionsChosen[chosenKeys[0]]
        finalIndex.length === 1 && updateEnableATB(true)
        break
      case 2:
        // Check chosen options
        options[chosenKeys[0]].forEach((_, i) => {
          updateOption(options[chosenKeys[0]][i], optionsChosen[chosenKeys[1]])
        })
        options[chosenKeys[1]].forEach((_, i) => {
          updateOption(options[chosenKeys[1]][i], optionsChosen[chosenKeys[0]])
        })
        // Check non-chosen options
        checkMultiple(
          chosenKeys[0],
          chosenKeys[1],
          optionsChosen[chosenKeys[0]],
          optionsChosen[chosenKeys[1]]
        )

        finalIndex = intersection(
          optionsChosen[chosenKeys[0]],
          optionsChosen[chosenKeys[1]]
        )
        // console.log("chosen 2: " + finalIndex)
        if (finalIndex.length === 1) {
          updateEnableATB(true)
        }
        break
      case 3:
        chosenKeys.forEach(k => {
          const checkKeys = keys(options).filter(nk => nk !== k)
          checkMultiple(
            variant[checkKeys[0]],
            variant[checkKeys[1]],
            optionsChosen[variant[checkKeys[0]]],
            optionsChosen[variant[checkKeys[1]]]
          )
        })

        // finalIndex = intersection(
        //   intersection(
        //     optionsChosen[chosenKeys[0]],
        //     optionsChosen[chosenKeys[1]]
        //   ),
        //   optionsChosen[chosenKeys[2]]
        // )
        // console.log("chosen 3: " + finalIndex)
        // finalIndex.length === 1 && changeEnabled(true)
        break
      default:
        break
    }
  }

  const updateOption = (opt, ref) => {
    opt["isDisabled"] = isEmpty(intersection(opt["allowed"], ref))
  }
  const checkMultiple = (variantA, variantB, allowedA, allowedB) => {
    const allowed = intersection(allowedA, allowedB)
    keys(options)
      .filter(k => k !== variantA && k !== variantB)
      .forEach(k => {
        options[k].forEach((_, i) => {
          updateOption(options[k][i], allowed)
        })
      })
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
      <Button variant="primary" type="submit" disabled={!enableATB}>
        Add to bag
      </Button>
    </Form>
  )
}

export default SellVariations
