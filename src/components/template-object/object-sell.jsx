import React from "react"
import { useTranslation } from "react-i18next"
import { findIndex } from "lodash"

import SellVariations from "./sell-variations"
import SellMain from "./sell-main"
import { Price } from "../utils/price"

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
        ) : objectSell.stock > 0 ? (
          // Online main with stock
          <SellMain object={object} />
        ) : (
          // Online main without stock
          "Out of stock online"
        )
      ) : objectSell.stock > 0 ? (
        // Store with stock
        Price(objectSell.priceSale, objectSell.priceOriginal, objectSell.kunstKoop)
      ) : (
        // Store without stock
        "Out of stock in store"
      )}
    </div>
  )
}

export default ObjectSell
