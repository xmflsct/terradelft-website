import React, { useState } from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { find, includes } from "lodash"

import * as currency from "../utils/currency"

const slugify = require("slugify")

const GridObjectOnlineShop = ({ data }) => {
  const { t } = useTranslation(["static-online-shop", "component-object"])

  const [selected, setSelected] = useState({
    price: null,
    artist: null,
    variant: null,
  })
  const options = {
    prices: [
      { label: `< ${currency.full(50)}`, value: { minimum: 0, maximum: 50 } },
      {
        label: `${currency.full(50)} - ${currency.full(100)}`,
        value: { minimum: 50, maximum: 100 },
      },
      {
        label: `${currency.full(100)} - ${currency.full(200)}`,
        value: { minimum: 100, maximum: 200 },
      },
      {
        label: `${currency.full(200)} - ${currency.full(300)}`,
        value: { minimum: 200, maximum: 300 },
      },
      {
        label: `${currency.full(300)} - ${currency.full(500)}`,
        value: { minimum: 300, maximum: 500 },
      },
      {
        label: `> ${currency.full(500)}`,
        value: { minimum: 500, maximum: 99999 },
      },
    ],
    artists: [],
    variants: [],
  }
  data
    .filter((d) => d.node.name !== "PLACEHOLDER")
    .forEach((d) => {
      find(options.artists, ["label", d.node.artist.artist]) ||
        options.artists.push({
          label: d.node.artist.artist,
          value: d.node.artist.artist,
        })

      d.node.fields.object_variants &&
        d.node.fields.object_variants.forEach((v) => {
          find(options.variants, ["label", v]) ||
            options.variants.push({
              label: v,
              value: v,
            })
        })
    })

  return (
    <>
    <h4>{t("static-online-shop:content.filters.heading")}</h4>
      <Row className='filter-grid mb-3'>
        <Col md={4}>
          <Select
            name='prices'
            isClearable
            isSearchable
            options={options.prices}
            placeholder={t("static-online-shop:content.filters.prices")}
            onChange={(d) =>
              setSelected({ ...selected, price: d ? d.value : null })
            }
          />
        </Col>
        <Col md={4}>
          <Select
            name='artists'
            isClearable
            isSearchable
            options={options.artists}
            placeholder={t("static-online-shop:content.filters.artists")}
            onChange={(d) =>
              setSelected({ ...selected, artist: d ? d.value : null })
            }
          />
        </Col>
        <Col md={4}>
          <Select
            name='variants'
            isClearable
            isSearchable
            options={options.variants}
            placeholder={t("static-online-shop:content.filters.variants")}
            onChange={(d) =>
              setSelected({ ...selected, variant: d ? d.value : null })
            }
          />
        </Col>
      </Row>
      <Row className='component-grid grid-object'>
        {data
          .filter((d) => {
            let objectMatch = true
            for (const match in selected) {
              const selectedValue = selected[match]
              if (!selectedValue) {
                continue
              }
              switch (match) {
                case "price":
                  if (d.node.fields.object_variants) {
                    if (
                      d.node.fields.variations_price_range.highest <
                        selectedValue.minimum ||
                      d.node.fields.variations_price_range.lowest >
                        selectedValue.maximum
                    ) {
                      objectMatch = false
                    }
                  } else {
                    const priceTemp = d.node.priceSale || d.node.priceOriginal
                    if (
                      priceTemp < selectedValue.minimum ||
                      priceTemp > selectedValue.maximum
                    ) {
                      objectMatch = false
                    }
                  }
                  break
                case "artist":
                  objectMatch = selectedValue === d.node.artist.artist
                  break
                case "variant":
                  d.node.fields.object_variants
                    ? includes(d.node.fields.object_variants, selectedValue) &&
                      (objectMatch = false)
                    : (objectMatch = false)
                  break
                default:
                  break
              }
            }
            !selected.price &&
              !selected.artist &&
              !selected.variant &&
              (objectMatch = true)

            return d.node.name !== "PLACEHOLDER" && objectMatch
          })
          .map((d) => {
            return (
              <Col key={d.node.name} lg={2} className='grid-item'>
                <Link
                  to={
                    "/" +
                    d.node.node_locale +
                    "/" +
                    slugify(d.node.artist.artist, { lower: true }) +
                    "/" +
                    slugify(d.node.name, { lower: true })
                  }
                >
                  <div className='item-image'>
                    <Img fluid={d.node.images[0].fluid} />
                  </div>
                  <p className='item-name'>{d.node.name}</p>
                </Link>
                <span className='item-sale'>
                  {d.node.fields.object_sale && t("component-object:on-sale")}
                </span>
              </Col>
            )
          })}
      </Row>
    </>
  )
}

export default GridObjectOnlineShop
