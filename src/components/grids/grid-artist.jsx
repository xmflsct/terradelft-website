import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const GridArtist = ({ data }) => {
  return (
    <Row className='component-grid grid-artist'>
      {data.map(d => (
        <Col key={d.artist} xs={4} md={2} className='grid-item'>
          <Link to={d.gatsbyPath}>
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
