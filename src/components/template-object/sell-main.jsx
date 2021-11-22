import { Price } from '@components/price'
import { bagAdd } from '@state/slices/bag'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import ReactSelect from 'react-select'

const SellMain = ({ object }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const [amount, setAmount] = useState(1)

  const sellMain =
    object.nodes[
      object.nodes.findIndex(node => node.node_locale === i18n.language)
    ]

  const onSubmit = e => {
    e.preventDefault()
    dispatch(
      bagAdd({
        type: 'main',
        gatsbyPath: sellMain.gatsbyPath,
        contentful_id: sellMain.contentful_id,
        contentful_id_url: sellMain.contentful_id,
        artist: {
          gatsbyPath: sellMain.artist.gatsbyPath,
          name: sellMain.artist.artist
        },
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
  console.log(sellMain)

  return (
    <Form onSubmit={e => onSubmit(e)} className='sell-main'>
      <InputGroup>
        <InputGroup.Text>{t('amount')}</InputGroup.Text>
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
        {t('add-button.add-to-bag')}
      </Button>
    </Form>
  )
}

SellMain.propTypes = {
  object: PropTypes.object.isRequired
}

export default SellMain
