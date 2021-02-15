import React from 'react'

import { currency } from './formatNumber'

export function Price (locale, priceSale, priceOriginal) {
  return (
    <>
      {!(priceSale > 0) && !(priceOriginal > 0) ? (
        ''
      ) : (
        <div className='object-price'>
          {priceSale ? (
            <p>
              <span className='price-sale'>{currency(priceSale, locale)}</span>
              <span className='price-original'>
                <strike>{currency(priceOriginal, locale)}</strike>
              </span>
            </p>
          ) : (
            <p>
              <span className='price-original'>
                {currency(priceOriginal, locale)}
              </span>
            </p>
          )}
        </div>
      )}
    </>
  )
}
