import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'gatsby'
import Img from 'gatsby-image'

const GridArtist = ({ data }) => {
  const { t } = useTranslation('constant')

  return (
    <Row className='component-grid grid-artist'>
      {data.map(d => (
        <Col key={d.node.artist} xs={4} md={2} className='grid-item'>
          <Link
            to={t('constant:slug.dynamic.artist.slug', {
              locale: d.node.node_locale,
              artist: d.node.artist
            })}
          >
            <div className='item-image'>
              <Img fluid={d.node.image.fluid} backgroundColor='#e8e8e8' />
            </div>
            <p className='item-name'>{d.node.artist}</p>
          </Link>
        </Col>
      ))}
    </Row>
  )
}

GridArtist.propTypes = {
  data: PropTypes.object.isRequired
}

export default GridArtist
