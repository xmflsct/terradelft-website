import React from 'react'

import * as formatNumber from './format-number'

export function Price (locale, priceSale, priceOriginal) {
  return (
    <>
      {!(priceSale > 0) && !(priceOriginal > 0) ? (
        ''
      ) : (
        <div className='object-price'>
          {priceSale ? (
            <p>
              <span className='price-sale'>
                {formatNumber.currency(priceSale, locale)}
              </span>
              <span className='price-original'>
                <strike>{formatNumber.currency(priceOriginal, locale)}</strike>
              </span>
            </p>
          ) : (
            <p>
              <span className='price-original'>
                {formatNumber.currency(priceOriginal, locale)}
              </span>
            </p>
          )}
        </div>
      )}
    </>
  )
}
