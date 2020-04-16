import React from "react"
import { Col, Row } from "react-bootstrap"

const ObjectAttribute = ({ type, value, dimension }) => {
  return (
    <Row className='object-attribute'>
      <Col md={3} className='attribute-type'>
        {type}
      </Col>
      {!Array.isArray(value) ? (
        <Col md={9} className='attribute-value'>
          {typeof value === "object"
            ? value[Object.keys(value)[0]]
            : value + (dimension && " cm")}
        </Col>
      ) : (
        <Col md={9} className='attribute-value'>
          {value.map((d, i) => (
            <span key={i}>
              {Object.values(d)[0]}
              {i !== value.length - 1 && ", "}
            </span>
          ))}
        </Col>
      )}
    </Row>
  )
}

export default ObjectAttribute
