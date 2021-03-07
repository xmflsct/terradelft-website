import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'

const GridArtist = ({ data }) => {
  const { t } = useTranslation('constant')

  return (
    <Row className='component-grid grid-artist'>
      {data.map(d => (
        <Col key={d.artist} xs={4} md={2} className='grid-item'>
          <Link
            to={t('constant:slug.dynamic.artist.slug', {
              locale: d.node_locale,
              artist: d.artist
            })}
          >
            <div className='item-image'>
              <GatsbyImage
                image={d.image.gatsbyImageData}
                backgroundColor='#e8e8e8'
              />
            </div>
            <p className='item-name'>{d.artist}</p>
          </Link>
        </Col>
      ))}
    </Row>
  )
}

GridArtist.propTypes = {
  data: PropTypes.array.isRequired
}

export default GridArtist
