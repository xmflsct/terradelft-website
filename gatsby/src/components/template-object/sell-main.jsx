import PropTypes from 'prop-types'
import React, { useContext, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { findIndex } from 'lodash'

import { ContextBag } from '../../layouts/contexts/bag'
import { Price } from '../utils/price'

const SellMain = ({ object }) => {
  const { t, i18n } = useTranslation('dynamic-object')
  const { dispatch } = useContext(ContextBag)
  const [amount, setAmount] = useState(1)
  const sellMain =
    object.nodes[
      findIndex(object.nodes, node => node.node_locale === i18n.language)
    ]

  const onSubmit = e => {
    e.preventDefault()
    dispatch({
      type: 'add',
      data: {
        type: 'main',
        contentful_id: sellMain.contentful_id,
        contentful_id_url: sellMain.contentful_id,
        artist: sellMain.artist.artist,
        image: sellMain.images[0],
        priceOriginal: sellMain.priceOriginal,
        priceSale: sellMain.priceSale,
        stock: sellMain.stock,
        amount: amount,
        // Locale dependent
        name: Object.fromEntries(
          object.nodes.map(node => [node.node_locale, node.name])
        )
      }
    })
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
