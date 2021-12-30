import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby-plugin-react-i18next'
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
                alt={d.artist}
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

export default GridArtist
