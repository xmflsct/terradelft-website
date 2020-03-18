import React, { useState } from "react"
import { Button, Form } from "react-bootstrap"
import { useForm, Controller } from "react-hook-form"
import ReactSelect from "react-select"
import { findIndex, intersection, isEmpty, keys } from "lodash"

const SellVariations = ({ variations }) => {
  const cache = {
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
  variations.forEach((d, i) => {
    keys(d)
      .filter(k => ["variation", "colour", "size"].includes(k) && d[k] !== null)
      .forEach(k => {
        const index = findIndex(cache[k], ["label", d[k][k]])
        index === -1
          ? cache[k].push({
              label: d[k][k],
              value: [i],
              isDisabled: false,
            })
          : cache[k][index].value.push(i)
      })
  })

  const { handleSubmit, register, control } = useForm({ mode: "onChange" })
  const [options] = useState(cache)
  const [enableATB, setEnableATB] = useState(false)

  const handleChange = d => {
    d[1].action === "select-option" && (optionsChosen[d[1].name] = [...d[0].value])
    d[1].action === "clear" && (optionsChosen[d[1].name] = [])
    setEnableATB(false)

    const chosenKeys = keys(optionsChosen).filter(
      k => optionsChosen[k].length > 0
    )
    switch (chosenKeys.length) {
      case 0:
        // All options are available
        keys(options).forEach(k => {
          options[k].forEach((_, i) => (options[k][i].isDisabled = false))
        })
        break
      case 1:
        // Check chosen options
        options[chosenKeys[0]].forEach(
          (_, i) => (options[chosenKeys[0]][i].isDisabled = false)
        )
        // Check non-chosen options
        keys(options)
          .filter(k => k !== chosenKeys[0])
          .forEach(k => {
            options[k].forEach((_, i) => {
              updateOption(options[k][i], optionsChosen[chosenKeys[0]])
            })
          })

        optionsChosen[chosenKeys[0]].length === 1 && setEnableATB(true)
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

        intersection(optionsChosen[chosenKeys[0]], optionsChosen[chosenKeys[1]])
          .length === 1 && setEnableATB(true)
        break
      case 3:
        chosenKeys.forEach(k => {
          const checkKeys = keys(options).filter(nk => nk !== k)
          checkMultiple(
            checkKeys[0],
            checkKeys[1],
            optionsChosen[checkKeys[0]],
            optionsChosen[checkKeys[1]]
          )
        })

        intersection(
          intersection(
            optionsChosen[chosenKeys[0]],
            optionsChosen[chosenKeys[1]]
          ),
          optionsChosen[chosenKeys[2]]
        ).length === 1 && setEnableATB(true)
        break
      default:
        break
    }
  }

  const updateOption = (opt, ref) => {
    opt.isDisabled = isEmpty(intersection(opt.value, ref))
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
        {options.variation && (
          <>
            <Form.Label>Variation</Form.Label>
            <Controller
              as={<ReactSelect />}
              name="variation"
              options={options.variation}
              isClearable
              onChange={handleChange}
              control={control}
            />
          </>
        )}
        {options.colour && (
          <>
            <Form.Label>Colour</Form.Label>
            <Controller
              as={<ReactSelect />}
              name="colour"
              options={options.colour}
              isClearable
              onChange={handleChange}
              control={control}
            />
          </>
        )}
        {options.size && (
          <>
            <Form.Label>Size</Form.Label>
            <Controller
              as={<ReactSelect />}
              name="size"
              options={options.size}
              isClearable
              onChange={handleChange}
              control={control}
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
