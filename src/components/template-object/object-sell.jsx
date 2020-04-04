import React from "react"
import { useTranslation } from "react-i18next"
import { findIndex } from "lodash"

import SellVariations from "./sell-variations"
import SellMain from "./sell-main"

const ObjectSell = ({ object }) => {
  const { i18n } = useTranslation("static-index")
  const objectSell =
    object.edges[
      findIndex(object.edges, (e) => e.node.node_locale === i18n.language)
    ].node

  return (
    <div>
      {objectSell.sellOnline ? (
        objectSell.variations ? (
          // Online variations with stock
          <SellVariations object={object} />
        ) : objectSell.stock && objectSell.stock > 0 ? (
          // Online main with stock
          <SellMain object={object} />
        ) : (
          // Online main without stock
          priceDisplay(objectSell.priceOriginal, objectSell.priceSale)
        )
      ) : objectSell.stock && objectSell.stock > 0 ? (
        // Store with stock
        priceDisplay(objectSell.priceOriginal, objectSell.priceSale)
      ) : (
        // Store without stock
        ""
      )}
    </div>
  )
}

function priceDisplay(priceOriginal, priceSale) {
  if (priceOriginal) {
    if (priceSale) {
      return (
        <p>
          <span>{priceSale}</span> - <span>{priceOriginal}</span>
        </p>
      )
    } else {
      return <span>{priceOriginal}</span>
    }
  } else return
}

export default ObjectSell
