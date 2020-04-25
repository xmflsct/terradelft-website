import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import * as currency from "./currency"

export function Price(priceSale, priceOriginal, kunstKoop) {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "dynamic-object/kunstkoop.jpg" }) {
        childImageSharp {
          fixed(width: 70, quality: 90) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
    }
  `)
  return (
    <div className='object-price'>
      {priceSale ? (
        <p>
          <span className='price-sale'>{currency.full(priceSale)}</span>
          <span className='price-original'>
            <strike>{currency.full(priceOriginal)}</strike>
          </span>
        </p>
      ) : (
        <p>
          <span className='price-original'>{currency.full(priceOriginal)}</span>
        </p>
      )}
      {kunstKoop && (
        <a
          href='https://kunstkoop.nl/'
          className='object-kunstkoop'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Img fixed={image.file.childImageSharp.fixed} />
        </a>
      )}
    </div>
  )
}
