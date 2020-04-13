import React from "react"

import * as currency from "./currency"

export function price(priceSale, priceOriginal) {
  return priceSale ? (
    <>
      <p className='object-price'>
        <span className="price-discount">{currency.full(priceSale)}</span>{" "}
        <strike>{currency.full(priceOriginal)}</strike>
      </p>
    </>
  ) : (
    <p className='object-price'>{currency.full(priceOriginal)}</p>
  )
}
