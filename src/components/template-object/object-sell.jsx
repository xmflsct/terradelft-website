import React from "react"
import { useTranslation } from "react-i18next"
import { findIndex } from "lodash"

import SellVariations from "./sell-variations"
import SellMain from "./sell-main"
import { Price } from "../utils/price"

const ObjectSell = ({ object }) => {
  const { t, i18n } = useTranslation("component-object")
  const objectSell =
    object.nodes[
      findIndex(object.nodes, (node) => node.node_locale === i18n.language)
    ]

  return (
    <div className='object-sell'>
      {objectSell.variations ? (
        <SellVariations object={object} />
      ) : objectSell.stock > 0 ? (
        objectSell.sellOnline ? (
          <SellMain object={object} />
        ) : (
          Price(
            objectSell.priceSale,
            objectSell.priceOriginal,
            objectSell.kunstKoop
          )
        )
      ) : (
        <div className='object-sold'>
          <span>{t("out-of-stock")}</span>
        </div>
      )}
    </div>
  )
}

export default ObjectSell
