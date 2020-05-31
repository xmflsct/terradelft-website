import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { graphql, Link } from 'gatsby'
import Img from 'gatsby-image'
import { shuffle } from 'lodash'

const GridObjectDefault = ({ nodes, randomize, limit }) => {
  const { t } = useTranslation(['component-object', 'constant'])

  randomize && (nodes = shuffle(nodes))
  limit && (nodes = nodes.slice(0, limit))

  return (
    <Row className='component-grid grid-object-default'>
      {nodes.map(node => {
        return (
          <Col key={node.contentful_id} xs={4} md={2} className='grid-item'>
            <Link
              to={t('constant:slug.dynamic.object.slug', {
                locale: node.node_locale,
                artist: node.artist.artist,
                object: node.name,
                id: node.contentful_id
              })}
            >
              <div className='item-image'>
                <Img fluid={node.images[0].fluid} backgroundColor='#e8e8e8' />
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
      fluid(maxWidth: 140, quality: 85) {
        ...GatsbyContentfulFluid_withWebp_noBase64
      }
    }
    priceOriginal
    priceSale
    material {
      material
    }
  }
`

export default GridObjectDefault
