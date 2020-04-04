import React from "react"

import * as currency from "../utils/currency"

export function price(priceSale, priceOriginal) {
  return priceSale ? (
    <>
      {currency.full(priceSale)} <strike>{currency.full(priceOriginal)}</strike>
    </>
  ) : (
    currency.full(priceOriginal)
  )
}
