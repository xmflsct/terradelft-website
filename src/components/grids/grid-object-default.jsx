import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { shuffle } from 'lodash'

const GridObjectDefault = ({ nodes, randomize, limit }) => {
  const { t } = useTranslation(['component-object', 'constant'])

  randomize && (nodes = shuffle(nodes))
  limit && (nodes = nodes.slice(0, limit))

  return (
    <Row className='component-grid grid-object-default'>
      {nodes.map(node => {
        if (node.artist) {
          return (
            <Col key={node.contentful_id} xs={4} md={2} className='grid-item'>
              <Link to={node.gatsbyPath}>
                <div className='item-image'>
                  {node.images && node.images.length && (
                    <GatsbyImage
                      alt={node.name}
                      image={node.images[0].gatsbyImageData}
                    />
                  )}
                  {node.fields.object_sale && (
                    <span className='item-sale'>
                      {t('component-object:on-sale')}
                    </span>
                  )}
                </div>
                <p className='item-name'>{node.name}</p>
              </Link>
            </Col>
          )
        } else {
          return null
        }
      })}
    </Row>
  )
}

GridObjectDefault.propTypes = {
  nodes: PropTypes.array.isRequired,
  randomize: PropTypes.bool,
  limit: PropTypes.number
}

export const query = graphql`
  fragment ObjectDefault on ContentfulObject {
    gatsbyPath(filePath: "/object/{ContentfulObject.contentful_id}")
    fields {
      object_sale
      variations_price_range {
        highest
        lowest
      }
    }
    contentful_id
    node_locale
    name
    artist {
      artist
    }
    images {
      gatsbyImageData(width: 140, quality: 85)
    }
    priceOriginal
    priceSale
    material {
      material
    }
  }
`

export default GridObjectDefault
