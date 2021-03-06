import { findIndex } from 'lodash'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import ReactSelect from 'react-select'
import { Price } from '../utils/price'
import { bagAdd } from '../../state/slices/bag'

const SellMain = ({ object }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation('dynamic-object')
  const [amount, setAmount] = useState(1)
  const sellMain =
    object.nodes[
      findIndex(object.nodes, node => node.node_locale === i18n.language)
    ]

  const onSubmit = e => {
    e.preventDefault()
    dispatch(
      bagAdd({
        type: 'main',
        contentful_id: sellMain.contentful_id,
        contentful_id_url: sellMain.contentful_id,
        artist: sellMain.artist.artist,
        image: sellMain.images[0],
        priceOriginal: sellMain.priceOriginal,
        priceSale: sellMain.priceSale,
        stock: sellMain.stock,
        sku: sellMain.sku,
        amount: amount,
        // Locale dependent
        name: Object.fromEntries(
          object.nodes.map(node => [node.node_locale, node.name])
        )
      })
    )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} className='sell-main'>
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{t('component-object:amount')}</InputGroup.Text>
        </InputGroup.Prepend>
        <div className='form-selection'>
          <ReactSelect
            options={Array(sellMain.stock === 1 ? 1 : 99)
              .fill()
              .map((_, i) => ({ value: i + 1, label: i + 1 }))}
            defaultValue={{ value: 1, label: 1 }}
            onChange={e => setAmount(e.value)}
            isSearchable={false}
          />
        </div>
      </InputGroup>
      {Price(
        i18n.language,
        sellMain.priceSale * amount,
        sellMain.priceOriginal * amount
      )}
      <Button variant='primary' type='submit'>
        {t('dynamic-object:add-button.add-to-bag')}
      </Button>
    </Form>
  )
}

SellMain.propTypes = {
  object: PropTypes.object.isRequired
}

export default SellMain
