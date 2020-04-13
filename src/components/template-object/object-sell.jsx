import React from "react"
import { useTranslation } from "react-i18next"
import { findIndex } from "lodash"

import SellVariations from "./sell-variations"
import SellMain from "./sell-main"
import { price } from "../utils/price"

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
          price(objectSell.priceSale, objectSell.priceOriginal)
        )
      ) : objectSell.stock > 0 ? (
        // Store with stock
        price(objectSell.priceSale, objectSell.priceOriginal)
      ) : (
        // Store without stock
        ""
      )}
    </div>
  )
}

export default ObjectSell
