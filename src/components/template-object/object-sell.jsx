import { Price } from '@components/price'
import { StaticImage } from 'gatsby-plugin-image'
import React from 'react'
import { useTranslation } from 'react-i18next'
import SellMain from './sell-main'
import SellVariations from './sell-variations'

const ObjectSell = ({ object }) => {
  const { t, i18n } = useTranslation('component-object')
  const objectSell =
    object.nodes[
      object.nodes.findIndex(node => node.node_locale === i18n.language)
    ]

  if (objectSell.variations) {
    if (
      objectSell.variations.filter(
        variation => variation.priceSale > 0 || variation.priceOriginal > 0
      ).length <= 0
    ) {
      return null
    }
  } else {
    if (!objectSell.priceSale && !objectSell.priceOriginal) {
      return null
    }
  }

  return (
    <div className='object-sell'>
      {objectSell.variations ? (
        <SellVariations object={object} />
      ) : objectSell.stock > 0 ? (
        objectSell.sellOnline ? (
          <SellMain object={object} />
        ) : (
          <Price
            priceSell={objectSell.priceSale}
            priceOriginal={objectSell.priceOriginal}
          />
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

export default ObjectSell
