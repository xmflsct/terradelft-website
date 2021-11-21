import { StaticImage } from 'gatsby-plugin-image'
import { findIndex } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import SellMain from './sell-main'
import SellVariations from './sell-variations'
import { Price } from '../utils/price'

const ObjectSell = ({ object }) => {
  const { t, i18n } = useTranslation('component-object')
  const objectSell =
    object.nodes[
      findIndex(object.nodes, node => node.node_locale === i18n.language)
    ]

  return (
    <div className='object-sell'>
      {objectSell.variations ? (
        <SellVariations object={object} />
      ) : objectSell.stock > 0 ? (
        objectSell.sellOnline ? (
          <SellMain object={object} />
        ) : (
          Price(i18n.language, objectSell.priceSale, objectSell.priceOriginal)
        )
      ) : objectSell.stock === 0 ? (
        <div className='object-sold'>
          <span>{t('out-of-stock')}</span>
        </div>
      ) : (
        ''
      )}
      {objectSell.kunstKoop && (
        <a
          href='https://kunstkoop.nl/'
          className='object-kunstkoop'
          target='_blank'
          rel='noopener noreferrer'
        >
          <StaticImage
            src='../../images/dynamic-object/kunstkoop.png'
            width={60}
            layout='fixed'
          />
        </a>
      )}
    </div>
  )
}

ObjectSell.propTypes = {
  object: PropTypes.object.isRequired
}

export default ObjectSell
