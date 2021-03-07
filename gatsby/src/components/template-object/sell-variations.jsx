import PropTypes from 'prop-types'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import ReactSelect from 'react-select'
import { difference, findIndex, intersection, reduce, union } from 'lodash'

import { ContextVariation } from '../../templates/dynamic-object/context'
import { Price } from '../utils/price'
import { currency } from '../utils/formatNumber'
import { bagAdd } from '../../state/slices/bag'

function initOptions ({ variations, t }) {
  const d = {
    types: {
      variant: { options: [], selectedIndex: null },
      colour: { options: [], selectedIndex: null },
      size: { options: [], selectedIndex: null }
    },
    selectedSKUs: []
  }

  let variationsRange = []
  // Fill options from data source
  for (const [index, variation] of variations.entries()) {
    variationsRange.push(index)
    for (const type of Object.keys(d.types)) {
      if (variation[type]) {
        const matchIndex = findIndex(d.types[type].options, [
          'label',
          variation[type][type]
        ])
        if (matchIndex === -1) {
          d.types[type].options.push({
            label: variation[type][type],
            value: [index],
            index: d.types[type].options.length,
            isDisabled: false
          })
        } else {
          d.types[type].options[matchIndex].value.push(index)
        }
      }
    }
  }

  // Fill "empty" fields and option type, delete empty options
  for (const type of Object.keys(d.types)) {
    const dValue = union(...d.types[type].options.map(m => m.value))
    if (dValue.length === 0) {
      delete d.types[type]
    } else if (dValue.length < variations.length) {
      d.types[type].options.push({
        label: t('component-object:option-default'),
        value: difference(variationsRange, dValue),
        index: d.types[type].options.length,
        isDisabled: false
      })
    }
  }

  return d
}

function reducer (options, action) {
  options.types[action.type].selectedIndex = action.index

  // Calculate selected and unselected options, as well as total selected SKUs
  let optionsSelected = {}
  let optionsUnselected = {}
  let selectedRange = []
  for (const type of Object.keys(options.types)) {
    if (options.types[type].selectedIndex !== null) {
      optionsSelected[type] =
        options.types[type].options[options.types[type].selectedIndex].value
      selectedRange.push(optionsSelected[type])
    } else {
      optionsUnselected[type] = []
    }
  }
  selectedRange = intersection(...selectedRange)
  options.selectedSKUs = selectedRange
  // console.log('已选项：' + JSON.stringify(optionsSelected))
  // console.log('未选项：' + JSON.stringify(optionsUnselected))
  // console.log('已选SKU：' + options.selectedSKUs.toString())

  // Match selected options against each other
  for (const optionSelected in optionsSelected) {
    const optionsOthers = reduce(
      optionsSelected,
      (result, _, key) => {
        return optionSelected === key ? result : result.concat(key)
      },
      []
    )
    let selectedRangeOthers = []
    if (optionsOthers.length > 0) {
      for (const type of optionsOthers) {
        selectedRangeOthers.push(
          options.types[type].options[options.types[type].selectedIndex].value
        )
      }
      selectedRangeOthers = intersection(...selectedRangeOthers)
    }
    options.types[optionSelected].options = options.types[
      optionSelected
    ].options.map(option => ({
      ...option,
      isDisabled:
        optionsOthers.length > 0
          ? intersection(option.value, selectedRangeOthers).length === 0
          : false
    }))
  }

  // Match all unselected against all selected
  for (const optionUnselected in optionsUnselected) {
    options.types[optionUnselected].options = options.types[
      optionUnselected
    ].options.map(option => ({
      ...option,
      isDisabled:
        options.selectedSKUs.length === 0
          ? false
          : intersection(option.value, options.selectedSKUs).length === 0
    }))
  }

  return { ...options }
}

const SellVariations = ({ object }) => {
  const { t, i18n } = useTranslation(['dynamic-object', 'component-object'])
  const dispatch = useDispatch()
  const { updateVariation } = useContext(ContextVariation)
  const variationsMain =
    object.nodes[
      findIndex(object.nodes, node => node.node_locale === i18n.language)
    ]
  const sellVariations = variationsMain.variations.filter(v => v.sellOnline)
  const [options, updateOptions] = useReducer(
    reducer,
    { variations: sellVariations, t, i18n },
    initOptions
  )
  const [amount, setAmount] = useState(undefined)

  useEffect(() => {
    if (options.selectedSKUs.length === 1) {
      updateVariation({
        type: 'update',
        data: {
          image: sellVariations[options.selectedSKUs[0]].image,
          sku: sellVariations[options.selectedSKUs[0]].sku,
          ...(sellVariations[options.selectedSKUs[0]].variant && {
            variant: sellVariations[options.selectedSKUs[0]].variant.variant
          }),
          ...(sellVariations[options.selectedSKUs[0]].colour && {
            colour: sellVariations[options.selectedSKUs[0]].colour.colour
          }),
          ...(sellVariations[options.selectedSKUs[0]].size && {
            size: sellVariations[options.selectedSKUs[0]].size.size
          })
        }
      })
      setAmount({ value: 1, label: 1 })
    } else {
      updateVariation({
        type: 'clear'
      })
      setAmount(undefined)
    }
  }, [options])

  const onSubmit = e => {
    e.preventDefault()
    const data = {
      type: 'variation',
      contentful_id: sellVariations[options.selectedSKUs[0]].contentful_id,
      contentful_id_url: object.nodes[0].contentful_id,
      artist: object.nodes[0].artist.artist,
      image:
        sellVariations[options.selectedSKUs[0]].image ||
        object.nodes[0].images[0],
      priceOriginal: sellVariations[options.selectedSKUs[0]].priceOriginal,
      priceSale: sellVariations[options.selectedSKUs[0]].priceSale,
      stock: sellVariations[options.selectedSKUs[0]].stock,
      sku: sellVariations[options.selectedSKUs[0]].sku,
      amount: amount.value,
      // Locale dependent
      name: {}
    }
    for (const type in options.types) {
      data[type] = {}
    }

    for (const node of object.nodes) {
      const l = node.node_locale
      const v = node.variations[options.selectedSKUs[0]]
      data.name[l] = node.name
      for (const type in options.types) {
        data[type][l] = v[type]
          ? v[type][type]
          : t('component-object:option-default')
      }
    }
    dispatch(bagAdd(data))
  }

  return (
    <div className='sell-variations'>
      {Object.keys(options.types).length > 0 && (
        <Form onSubmit={e => onSubmit(e)}>
          {Object.keys(options.types).map(type => (
            <InputGroup key={type}>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  {t(`component-object:${type}`)}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <div className='form-selection'>
                <ReactSelect
                  name={type}
                  options={options.types[type].options}
                  defaultValue={null}
                  onChange={e => {
                    updateOptions({
                      type: type,
                      index: e ? e.index : null
                    })
                  }}
                  isClearable
                  isSearchable={false}
                />
              </div>
            </InputGroup>
          ))}
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>{t('component-object:amount')}</InputGroup.Text>
            </InputGroup.Prepend>
            <div className='form-selection'>
              <ReactSelect
                options={Array(
                  options.selectedSKUs.length === 1
                    ? sellVariations[options.selectedSKUs[0]].stock === 1
                      ? 1
                      : 99
                    : 0
                )
                  .fill()
                  .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                value={amount}
                onChange={e => setAmount(e)}
                isSearchable={false}
              />
            </div>
          </InputGroup>
          {options.selectedSKUs.length === 1
            ? Price(
                i18n.language,
                sellVariations[options.selectedSKUs[0]].priceSale *
                  (amount ? amount.value : 1),
                sellVariations[options.selectedSKUs[0]].priceOriginal *
                  (amount ? amount.value : 1)
              )
            : variationsMain.fields.variations_price_range.highest !== 0 && (
                <p className='object-price'>
                  {variationsMain.fields.variations_price_range.lowest ===
                  variationsMain.fields.variations_price_range.highest
                    ? currency(
                        variationsMain.fields.variations_price_range.highest,
                        i18n.language
                      )
                    : `${currency(
                        variationsMain.fields.variations_price_range.lowest,
                        i18n.language
                      )} - ${currency(
                        variationsMain.fields.variations_price_range.highest,
                        i18n.language
                      )}`}
                </p>
              )}
          <Button
            variant='primary'
            type='submit'
            disabled={
              options.selectedSKUs.length !== 1
                ? true
                : !(sellVariations[options.selectedSKUs[0]].stock > 0)
                ? true
                : false
            }
          >
            {options.selectedSKUs.length === 1
              ? sellVariations[options.selectedSKUs[0]].stock > 0
                ? t('dynamic-object:add-button.add-to-bag')
                : t('dynamic-object:add-button.out-of-stock')
              : t('dynamic-object:add-button.select-variation')}
          </Button>
        </Form>
      )}
    </div>
  )
}

SellVariations.propTypes = {
  object: PropTypes.object.isRequired
}

export default SellVariations
