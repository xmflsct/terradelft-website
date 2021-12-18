import { currency } from '@utils/formatNumber'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import React from 'react'

interface Props {
  priceSale: number
  priceOriginal: number
  showZero?: boolean
}

const Price: React.FC<Props> = ({
  priceSale,
  priceOriginal,
  showZero = false
}) => {
  const { i18n } = useTranslation()

  return (
    <>
      {!showZero && !(priceSale > 0) && !(priceOriginal > 0) ? (
        ''
      ) : (
        <div className='object-price'>
          {priceSale ? (
            <p>
              <span className='price-sale'>
                {currency(priceSale, i18n.language)}
              </span>
              <span className='price-original'>
                {
                  //@ts-ignore
                  <strike>{currency(priceOriginal, locale)}</strike>
                }
              </span>
            </p>
          ) : (
            <p>
              <span className='price-original'>
                {currency(priceOriginal, i18n.language)}
              </span>
            </p>
          )}
        </div>
      )}
    </>
  )
}

export { Price }
