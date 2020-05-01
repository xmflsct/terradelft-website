import React, { useState } from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import { find, includes } from "lodash"

import * as currency from "../utils/currency"

const GridObjectOnlineShop = ({ nodes }) => {
  const { t } = useTranslation([
    "static-online-shop",
    "component-object",
    "constant",
  ])

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
  nodes.forEach((node) => {
    find(options.artists, ["label", node.artist.artist]) ||
      options.artists.push({
        label: node.artist.artist,
        value: node.artist.artist,
      })

    node.fields.object_variants &&
      node.fields.object_variants.forEach((v) => {
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
        {nodes
          .filter((node) => {
            let objectMatch = {
              prices: null,
              artists: null,
              variants: null,
            }
            for (const match in selected) {
              const selectedValue = selected[match]
              if (!selectedValue) {
                continue
              }
              switch (match) {
                case "price":
                  objectMatch.prices = node.fields.object_variants
                    ? !(
                        node.fields.variations_price_range.highest <
                          selectedValue.minimum ||
                        node.fields.variations_price_range.lowest >
                          selectedValue.maximum
                      )
                    : !(
                        node.priceSale ||
                        node.priceOriginal < selectedValue.minimum ||
                        node.priceSale ||
                        node.priceOriginal > selectedValue.maximum
                      )
                  break
                case "artist":
                  objectMatch.artists = selectedValue === node.artist.artist
                  break
                case "variant":
                  objectMatch.variants = node.fields.object_variants
                    ? includes(node.fields.object_variants, selectedValue)
                    : false
                  break
                default:
                  break
              }
            }

            return (
              objectMatch.prices !== false &&
              objectMatch.artists !== false &&
              objectMatch.variants !== false
            )
          })
          .map((node) => {
            return (
              <Col key={node.contentful_id} xs={4} md={2} className='grid-item'>
                <Link
                  to={t("constant:slug.dynamic.object.slug", {
                    locale: node.node_locale,
                    artist: node.artist.artist,
                    object: node.name,
                    id: node.contentful_id,
                  })}
                >
                  <div className='item-image'>
                    <Img fluid={node.images[0].fluid} />
                  </div>
                  <p className='item-name'>{node.name}</p>
                </Link>
                <span className='item-sale'>
                  {node.fields.object_sale && t("component-object:on-sale")}
                </span>
              </Col>
            )
          })}
      </Row>
    </>
  )
}

export const query = graphql`
  fragment ObjectOnlineShop on ContentfulObjectsObjectMain {
    contentful_id
    node_locale
    name
    artist {
      artist
    }
    images {
      fluid(maxWidth: 800) {
        ...GatsbyContentfulFluid_withWebp
      }
    }
    priceOriginal
    priceSale
    fields {
      object_sale
      object_variants
      variations_price_range {
        highest
        lowest
      }
    }
  }
`

export default GridObjectOnlineShop
