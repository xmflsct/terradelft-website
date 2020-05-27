import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { findIndex } from 'lodash'

import SellVariations from './sell-variations'
import SellMain from './sell-main'
import { Price } from '../utils/price'

const ObjectSell = ({ object }) => {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "dynamic-object/kunstkoop.png" }) {
        childImageSharp {
          fixed(width: 70) {
            ...GatsbyImageSharpFixed_noBase64
          }
        }
      }
    }
  `)
  const { t, i18n } = useTranslation('component-object')
  const objectSell =
    object.nodes[
      findIndex(object.nodes, node => node.node_locale === i18n.language)
    ]

  return (
    <div className='object-sell'>
      {objectSell.variations ? (
        <SellVariations object={object} />
      ) : objectSell.stock > 0 ? (
        objectSell.sellOnline ? (
          <SellMain object={object} />
        ) : (
          Price(i18n.language, objectSell.priceSale, objectSell.priceOriginal)
        )
      ) : objectSell.stock === 0 ? (
        <div className='object-sold'>
          <span>{t('out-of-stock')}</span>
        </div>
      ) : (
        ''
      )}
      {objectSell.kunstKoop && (
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

ObjectSell.propTypes = {
  object: PropTypes.object.isRequired
}

export default ObjectSell
